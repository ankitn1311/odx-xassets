import React, { createContext, useContext, useEffect, useCallback, useMemo, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import useWebSocket, { ReadyState } from 'react-use-websocket';

export interface TradeData {
  currency: string;
  usdAmount: string;
  quantity: string;
  txHash: string;
  side: string;
}

export interface WebSocketMessage {
  currency: string;
  usdAmount: string;
  quantity: string;
  txHash: string;
  side: string;
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
      };

      // Add to local ref for immediate access
      tradesRef.current = [trade, ...tradesRef.current.slice(0, 999)]; // Keep last 1000 trades

      // Update React Query cache
      queryClient.setQueryData(['trades'], (oldData: TradeData[] = []) => {
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
