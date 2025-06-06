import React, { createContext, useContext, useEffect, useCallback, useMemo, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { EventType, Trade } from '@/hooks/queries/use-trades';
import { useSelectedToken } from '@/hooks/queries/use-selected-token';
import { toast } from 'sonner';
import { useWalletStore } from '@/stores/wallet-store';

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

type TradeContextType = {
  readyState: ReadyState;
  sendJsonMessage: (message: any) => void;
  lastJsonMessage: WebSocketMessage | null;
};

interface TradeProviderProps {
  children: React.ReactNode;
}

const TradeContext = createContext<TradeContextType | null>(null);

// Utility function to transform WebSocket message to Trade
const transformToTrade = (data: WebSocketMessage['payload']): Trade => ({
  PKID: 0,
  ID: data.id,
  UserAddress: data.user_address,
  AssetA: data.asset_a,
  AssetB: data.asset_b,
  AmountUSD: data.amount_a,
  LastTxHash: data.tx_hash,
  FinalTxIndex: 0,
  Chain: data.chain,
  Timestamp: new Date().toISOString(),
  CreatedAt: new Date().toISOString(),
  UpdatedAt: new Date().toISOString(),
  DeletedAt: null,
  EventType: data.event_type,
  ValidatorAddress: data.validator_address,
  Fee: data.fee,
  AmountA: data.amount_a,
  AmountB: data.amount_b,
  FirstTxHash: data.first_tx_hash,
  SwapTxHash: data.swap_tx_hash,
});

export const TradeProvider: React.FC<TradeProviderProps> = ({ children }) => {
  const queryClient = useQueryClient();
  const { data: selectedToken } = useSelectedToken();
  const { connectedWallet } = useWalletStore();
  const connectionIdRef = useRef<string>(crypto.randomUUID());
  const activeSubscriptionsRef = useRef<Set<string>>(new Set());
  const previousTokenRef = useRef<string | null>(null);

  // WebSocket configuration
  const { readyState, sendJsonMessage, lastJsonMessage, getWebSocket } = useWebSocket('test', {
    reconnectAttempts: 5,
    reconnectInterval: 1000,
    shouldReconnect: () => true,
    share: true,
    retryOnError: true,
    onOpen: () => {
      console.log(
        'ws trade connected',
        getWebSocket()?.url,
        'connectionId:',
        connectionIdRef.current
      );

      // Re-subscribe to user trades if wallet is connected
      if (connectedWallet) {
        const userTopic = `trades:user:${connectedWallet}`;
        sendJsonMessage({
          action: 'subscribe',
          topic: userTopic,
          connectionId: connectionIdRef.current,
        });
        activeSubscriptionsRef.current.add(userTopic);
      }

      // Re-subscribe to current token if selected
      if (selectedToken?.TokenA.Address) {
        const tokenTopic = `trades:token:${selectedToken.TokenA.Address}`;
        sendJsonMessage({
          action: 'subscribe',
          topic: tokenTopic,
          connectionId: connectionIdRef.current,
        });
        activeSubscriptionsRef.current.add(tokenTopic);
        previousTokenRef.current = selectedToken.TokenA.Address;
      }
    },
    onError: error => {
      console.error('ws trade error', error);
      console.error('WebSocket URL:', 'test');
      console.error('Connection ID:', connectionIdRef.current);
    },
    onClose: () => {
      console.log('ws trade disconnected', 'connectionId:', connectionIdRef.current);
      activeSubscriptionsRef.current.clear();
      previousTokenRef.current = null;
    },
  });

  // Handle token subscription changes
  useEffect(() => {
    if (!selectedToken?.TokenA.Address || readyState !== ReadyState.OPEN) return;

    const currentToken = selectedToken.TokenA.Address;
    const tokenTopic = `trades:token:${currentToken}`;

    // Only unsubscribe from previous token if it's different from current
    if (previousTokenRef.current && previousTokenRef.current !== currentToken) {
      const previousTopic = `trades:token:${previousTokenRef.current}`;
      if (activeSubscriptionsRef.current.has(previousTopic)) {
        sendJsonMessage({
          action: 'unsubscribe',
          topic: previousTopic,
          connectionId: connectionIdRef.current,
        });
        activeSubscriptionsRef.current.delete(previousTopic);
      }
    }

    // Subscribe to new token if not already subscribed
    if (!activeSubscriptionsRef.current.has(tokenTopic)) {
      sendJsonMessage({
        action: 'subscribe',
        topic: tokenTopic,
        connectionId: connectionIdRef.current,
      });
      activeSubscriptionsRef.current.add(tokenTopic);
      previousTokenRef.current = currentToken;
    }
  }, [selectedToken?.TokenA.Address, readyState, sendJsonMessage]);

  // Handle user subscription changes
  useEffect(() => {
    if (!connectedWallet || readyState !== ReadyState.OPEN) return;

    const userTopic = `trades:user:${connectedWallet}`;

    // Only subscribe if not already subscribed
    if (!activeSubscriptionsRef.current.has(userTopic)) {
      sendJsonMessage({
        action: 'subscribe',
        topic: userTopic,
        connectionId: connectionIdRef.current,
      });
      activeSubscriptionsRef.current.add(userTopic);
    }
  }, [connectedWallet, readyState, sendJsonMessage]);

  // Handle incoming messages
  const handleMessage = useCallback(
    (message: WebSocketMessage) => {
      const data = message.payload;
      if (
        data?.event_type === 'XASSET_MINT_COMPLETE' ||
        data?.event_type === 'WITHDRAWAL_COMPLETE'
      ) {
        // Show success toast for user's trades
        if (data.user_address === connectedWallet && message.topic.includes('trades:user:')) {
          toast.success(
            <div className="flex flex-col gap-1">
              <span>Trade successful!</span>
              <a
                href={`https://testnet.sonicscan.org/tx/${data.tx_hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:text-primary/80"
              >
                View transaction
              </a>
            </div>,
            {
              id: data.tx_hash,
            }
          );
        }

        const trade = transformToTrade(data);

        // Update React Query cache for subscribed tokens
        if (message.topic.includes('trades:token:')) {
          const token = message.topic.split(':')[2];
          queryClient.setQueryData<Record<string, Trade>>(
            ['trades-token', token],
            (oldTrades = {}) => ({ [trade.ID]: trade, ...oldTrades })
          );
        }

        // Update React Query cache for user trades
        if (message.topic.includes('trades:user:') && connectedWallet === data.user_address) {
          queryClient.setQueryData<Record<string, Trade>>(
            ['trades-user', data.user_address],
            (oldTrades = {}) => ({ ...oldTrades, [trade.ID]: trade })
          );
        }
      }
    },
    [queryClient, connectedWallet]
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
        previousTokenRef.current = null;
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

  return <TradeContext.Provider value={value}>{children}</TradeContext.Provider>;
};

export const useTrade = () => {
  const context = useContext(TradeContext);
  if (!context) {
    throw new Error('useTrade must be used within a TradeProvider');
  }
  return context;
};
