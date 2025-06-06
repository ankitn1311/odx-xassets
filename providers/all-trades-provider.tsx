import React, { createContext, useContext, useEffect, useCallback, useMemo, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { EventType, Trade } from '@/hooks/queries/use-trades';

export interface WebSocketMessage {
  payload: {
    id: string;
    user_address: string;
    validator_address: string;
    event_type: EventType;
    asset_a: string;
    asset_b: string;
    amount_a: string;
    amount_b: string;
    tx_hash: string;
    chain: string;
    fee: string;
    first_tx_hash: string;
    swap_tx_hash: string;
  };
  topic: string;
}

type AllTradesContextType = {
  readyState: ReadyState;
  sendJsonMessage: (message: any) => void;
  lastJsonMessage: WebSocketMessage | null;
};

interface AllTradesProviderProps {
  children: React.ReactNode;
}

const AllTradesContext = createContext<AllTradesContextType | null>(null);

// Utility function to transform WebSocket message to Trade
const transformToTrade = (data: WebSocketMessage['payload']): Trade => ({
  PKID: 0,
  ID: data?.id,
  UserAddress: data?.user_address,
  AssetA: data?.asset_a,
  AssetB: data?.asset_b,
  AmountUSD: data?.amount_a,
  LastTxHash: data?.tx_hash,
  FinalTxIndex: 0,
  Chain: data?.chain,
  Timestamp: new Date().toISOString(),
  CreatedAt: new Date().toISOString(),
  UpdatedAt: new Date().toISOString(),
  DeletedAt: null,
  EventType: data?.event_type,
  ValidatorAddress: data?.validator_address,
  Fee: data?.fee,
  AmountA: data?.amount_a,
  AmountB: data?.amount_b,
  FirstTxHash: data?.first_tx_hash,
  SwapTxHash: data?.swap_tx_hash,
});

// Mock data generator
const generateMockTrade = (): WebSocketMessage['payload'] => {
  const id = crypto.randomUUID();
  const eventTypes: EventType[] = ['XASSET_MINT_COMPLETE', 'WITHDRAWAL_COMPLETE'];
  const assets = ['USDT.x', 'RIFT.x', 'CULT.x', 'NADE.x', 'NOVA.x', 'WISH.x'];
  const chains = ['ethereum', 'sui', 'solana'];

  return {
    id,
    user_address: `0x${crypto.randomUUID().replace(/-/g, '').slice(0, 40)}`,
    validator_address: `0x${crypto.randomUUID().replace(/-/g, '').slice(0, 40)}`,
    event_type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
    asset_a: assets[Math.floor(Math.random() * assets.length)],
    asset_b: assets[Math.floor(Math.random() * assets.length)],
    amount_a: (Math.random() * 1000).toFixed(2),
    amount_b: (Math.random() * 1000).toFixed(2),
    tx_hash: `0x${crypto.randomUUID().replace(/-/g, '').slice(0, 64)}`,
    chain: chains[Math.floor(Math.random() * chains.length)],
    fee: (Math.random() * 10).toFixed(4),
    first_tx_hash: `0x${crypto.randomUUID().replace(/-/g, '').slice(0, 64)}`,
    swap_tx_hash: `0x${crypto.randomUUID().replace(/-/g, '').slice(0, 64)}`,
  };
};

export const AllTradesProvider: React.FC<AllTradesProviderProps> = ({ children }) => {
  const queryClient = useQueryClient();
  const connectionIdRef = useRef<string>(crypto.randomUUID());
  const activeSubscriptionsRef = useRef<Set<string>>(new Set());
  const mockIntervalRef = useRef<NodeJS.Timeout>();

  // WebSocket configuration
  const { readyState, sendJsonMessage, lastJsonMessage, getWebSocket } = useWebSocket('test', {
    reconnectAttempts: 5,
    reconnectInterval: 1000,
    shouldReconnect: () => true,
    share: true,
    retryOnError: true,
    onOpen: () => {
      console.log(
        'ws all trades connected',
        getWebSocket()?.url,
        'connectionId:',
        connectionIdRef.current
      );

      // Subscribe to all trades
      const allTradesTopic = 'trades:*';
      sendJsonMessage({
        action: 'subscribe',
        topic: allTradesTopic,
        connectionId: connectionIdRef.current,
      });
      activeSubscriptionsRef.current.add(allTradesTopic);
    },
    onError: error => {
      console.error('ws all trades error', error);
      console.error('WebSocket URL:', 'test');
      console.error('Connection ID:', connectionIdRef.current);

      // Start sending mock data when WebSocket fails
      if (!mockIntervalRef.current) {
        mockIntervalRef.current = setInterval(() => {
          const mockMessage: WebSocketMessage = {
            payload: generateMockTrade(),
            topic: 'trades:*',
          };
          handleMessage(mockMessage);
        }, 300); // Send mock data every 300ms
      }
    },
    onClose: () => {
      console.log('ws all trades disconnected', 'connectionId:', connectionIdRef.current);
      activeSubscriptionsRef.current.clear();

      // Start sending mock data when WebSocket closes
      if (!mockIntervalRef.current) {
        mockIntervalRef.current = setInterval(() => {
          const mockMessage: WebSocketMessage = {
            payload: generateMockTrade(),
            topic: 'trades:*',
          };
          handleMessage(mockMessage);
        }, 2000);
      }
    },
  });

  // Handle incoming messages
  const handleMessage = useCallback(
    (message: WebSocketMessage) => {
      const data = message.payload;
      const trade = transformToTrade(data);

      // Update React Query cache for all trades
      queryClient.setQueryData<Record<string, Trade>>(['all-trades'], (oldTrades = {}) => ({
        [trade.ID]: trade,
        ...oldTrades,
      }));
    },
    [queryClient]
  );

  useEffect(() => {
    if (lastJsonMessage) {
      handleMessage(lastJsonMessage as WebSocketMessage);
    }
  }, [lastJsonMessage, handleMessage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (readyState === ReadyState.OPEN) {
        // Unsubscribe from all active subscriptions
        activeSubscriptionsRef.current.forEach(topic => {
          sendJsonMessage({
            action: 'unsubscribe',
            topic,
            connectionId: connectionIdRef.current,
          });
        });
        activeSubscriptionsRef.current.clear();
      }

      // Clear mock data interval
      if (mockIntervalRef.current) {
        clearInterval(mockIntervalRef.current);
      }
    };
  }, []); // Empty dependency array to ensure cleanup only runs on unmount

  const value = useMemo(
    () => ({
      readyState,
      sendJsonMessage,
      lastJsonMessage: lastJsonMessage as WebSocketMessage | null,
    }),
    [readyState, sendJsonMessage, lastJsonMessage]
  );

  return <AllTradesContext.Provider value={value}>{children}</AllTradesContext.Provider>;
};

export const useAllTrades = () => {
  const context = useContext(AllTradesContext);
  if (!context) {
    throw new Error('useAllTrades must be used within an AllTradesProvider');
  }
  return context;
};
