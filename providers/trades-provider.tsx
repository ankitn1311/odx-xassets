import React, { createContext, useContext, useEffect, useCallback, useMemo, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { useAccount } from 'wagmi';

export interface TradeData {
  quantity: string;
  executionName: string;
  currency: string;
  userAddress: string;
  swapper?: string;
  txHash: string;
  timestamp: string;
  usdAmount: number;
  side: string;
  tradeId: string;
}

export interface WebSocketMessage {
  quantity: string;
  executionName: string;
  currency: string;
  userAddress: string;
  txHash: string;
  timestamp: string;
  usdAmount: number;
  side: string;
  tradeId: string;
}

type TradesContextType = {
  readyState: ReadyState;
  sendJsonMessage: (message: any) => void;
  lastJsonMessage: WebSocketMessage | null;
  trades: TradeData[];
};

interface TradesProviderProps {
  children: React.ReactNode;
}

const TradesContext = createContext<TradesContextType | null>(null);

const WEB_SOCKET_URL = 'wss://y3mnua6ij2.execute-api.ap-northeast-1.amazonaws.com/devo';
export const TradesProvider: React.FC<TradesProviderProps> = ({ children }) => {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const connectionIdRef = useRef<string>(crypto.randomUUID());
  const tradesRef = useRef<TradeData[]>([]);

  // WebSocket configuration
  const { readyState, sendJsonMessage, lastJsonMessage, getWebSocket } = useWebSocket(
    WEB_SOCKET_URL,
    {
      reconnectAttempts: 5,
      reconnectInterval: 1000,
      shouldReconnect: () => true,
      share: true,
      retryOnError: true,
      onOpen: () => {
        console.log(
          'ws trades connected',
          getWebSocket()?.url,
          'connectionId:',
          connectionIdRef.current
        );
      },
      onError: error => {
        console.error('ws trades error', error);
        console.error('WebSocket URL:', WEB_SOCKET_URL);
        console.error('Connection ID:', connectionIdRef.current);
      },
      onClose: () => {
        console.log('ws trades disconnected', 'connectionId:', connectionIdRef.current);
      },
    }
  );

  // Handle incoming messages
  const handleMessage = useCallback(
    (message: WebSocketMessage) => {
      const trade: TradeData = {
        currency: message.currency,
        usdAmount: message.usdAmount,
        quantity: message.quantity,
        txHash: message.txHash,
        side: message.side,
        executionName: message.executionName,
        userAddress: message.userAddress,
        timestamp: message.timestamp,
        tradeId: message.tradeId,
      };

      // Add to local ref for immediate access
      tradesRef.current = [trade, ...tradesRef.current.slice(0, 999)]; // Keep last 1000 trades

      const userAddress = trade.userAddress || trade.swapper;

      if (userAddress === address) {
        queryClient.setQueryData(['trades', 'user'], (oldData: TradeData[] = []) => {
          const newData = [trade, ...oldData];
          return newData.slice(0, 1000); // Keep last 1000 trades
        });
      }

      // Update React Query cache
      queryClient.setQueryData(['trades', 'explorer'], (oldData: TradeData[] = []) => {
        const newData = [trade, ...oldData];
        return newData.slice(0, 1000); // Keep last 1000 trades
      });
    },
    [queryClient]
  );

  useEffect(() => {
    if (lastJsonMessage) {
      try {
        // Parse the string message if it comes as a string
        const message =
          typeof lastJsonMessage === 'string' ? JSON.parse(lastJsonMessage) : lastJsonMessage;

        handleMessage(message as WebSocketMessage);
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    }
  }, [lastJsonMessage, handleMessage]);

  const value = useMemo(
    () => ({
      readyState,
      sendJsonMessage,
      lastJsonMessage: lastJsonMessage as WebSocketMessage | null,
      trades: tradesRef.current,
    }),
    [readyState, sendJsonMessage, lastJsonMessage]
  );

  return <TradesContext.Provider value={value}>{children}</TradesContext.Provider>;
};

export const useTrades = () => {
  const context = useContext(TradesContext);
  if (!context) {
    throw new Error('useTrades must be used within a TradesProvider');
  }
  return context;
};
