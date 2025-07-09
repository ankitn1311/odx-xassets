import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { useTokenSwapStore } from '@/stores/token-swap-store';

interface PriceUpdate {
  type: string;
  pair: string;
  base_to_quote: string;
  quote_to_base: string;
  price_changes: {
    '15m': number;
    '1h': number;
    '4h': number;
    '24h': number;
  };
}

export type TokenData = {
  pair: string;
  quoteToBase: string;
  baseToQuote: string;
  lastUpdated: string;
  priceChanges: {
    '15m': number;
    '1h': number;
    '4h': number;
    '24h': number;
  };
  type: string;
};

interface TokenPriceFeedContextType {
  readyState: ReadyState;
}

const TokenPriceFeedContext = createContext<TokenPriceFeedContextType | undefined>(undefined);

export const useTokenPriceFeed = () => {
  const context = useContext(TokenPriceFeedContext);
  if (!context) {
    throw new Error('useTokenPriceFeed must be used within a TokenPriceFeedProvider');
  }
  return context;
};

interface TokenPriceFeedProviderProps {
  children: React.ReactNode;
}

export const TokenPriceFeedProvider: React.FC<TokenPriceFeedProviderProps> = ({ children }) => {
  const queryClient = useQueryClient();
  const cleanupRef = useRef(false);
  const { allTokens } = useTokenSwapStore();

  const { readyState, sendJsonMessage, lastJsonMessage } = useWebSocket('wss://pf.od.exchange/ws', {
    onOpen: () => {
      console.log('ws price open - creating new connection or reusing existing');
      // Re-subscribe to all previously subscribed pairs
      const subscribedPairs = queryClient.getQueryData<string[]>(['subscribedPairs']) || [];
      subscribedPairs.forEach((pair: string) => {
        if (!subscribedPairs.includes(pair)) {
          sendJsonMessage({
            type: 'subscribe',
            pair: pair,
          });
          queryClient.setQueryData(['subscribedPairs'], (oldPairs: string[] = []) => {
            if (!oldPairs?.includes(pair)) {
              return [...oldPairs, pair];
            }
            return oldPairs;
          });
        }
      });
    },
    onError: error => {
      console.error('ws price error:', error);
    },
    onClose: () => {
      console.log('ws price disconnected');
    },
    reconnectAttempts: 5,
    reconnectInterval: 1000,
    shouldReconnect: () => true,
    share: true,
    retryOnError: true,
  });

  // Handle automatic subscription based on all tokens
  useEffect(() => {
    if (allTokens && readyState === ReadyState.OPEN) {
      allTokens.forEach(token => {
        const pair = `${token.TokenA.Name}/${token.TokenB.Name}`;
        const subscribedPairs = queryClient.getQueryData<string[]>(['subscribedPairs']);
        if (!subscribedPairs?.includes(pair)) {
          console.log('Subscribing to pair:', pair);
          sendJsonMessage({
            type: 'subscribe',
            pair: pair,
          });
          queryClient.setQueryData(['subscribedPairs'], (oldPairs: string[] = []) => {
            if (!oldPairs?.includes(pair)) {
              return [...oldPairs, pair];
            }
            return oldPairs;
          });
        }
      });
    }

    return () => {
      if (allTokens) {
        allTokens.forEach(token => {
          const pair = `${token.TokenA.Name}/${token.TokenB.Name}`;
          const subscribedPairs = queryClient.getQueryData<string[]>(['subscribedPairs']);
          if (subscribedPairs?.includes(pair)) {
            console.log('Unsubscribing from pair:', pair);
            sendJsonMessage({
              type: 'unsubscribe',
              pair: pair,
            });
            queryClient.setQueryData(['subscribedPairs'], (oldPairs: string[] = []) => {
              return oldPairs.filter(p => p !== pair);
            });
          }
        });
      }
    };
  }, [allTokens, readyState, sendJsonMessage, queryClient]);

  useEffect(() => {
    if (lastJsonMessage) {
      const data = lastJsonMessage as PriceUpdate;

      if (data.type === 'price_update') {
        // Update individual price query
        queryClient.setQueryData<TokenData>(['price', data.pair], {
          pair: data.pair,
          baseToQuote: data.base_to_quote,
          quoteToBase: data.quote_to_base,
          lastUpdated: new Date().toLocaleTimeString(),
          priceChanges: data.price_changes,
          type: data.type,
        });

        // Update the list of all active prices
        queryClient.setQueryData<TokenData[]>(['prices'], (oldData: TokenData[] = []) => {
          const existingIndex = oldData.findIndex(item => item.pair === data.pair);
          if (existingIndex >= 0) {
            const newData = [...oldData];
            newData[existingIndex] = {
              pair: data.pair,
              baseToQuote: data.base_to_quote,
              quoteToBase: data.quote_to_base,
              lastUpdated: new Date().toLocaleTimeString(),
              priceChanges: data.price_changes,
              type: data.type,
            };
            return newData;
          } else {
            return [
              ...oldData,
              {
                pair: data.pair,
                baseToQuote: data.base_to_quote,
                quoteToBase: data.quote_to_base,
                lastUpdated: new Date().toLocaleTimeString(),
                priceChanges: data.price_changes,
                type: data.type,
              },
            ];
          }
        });
      }
    }
  }, [lastJsonMessage, queryClient]);

  // Add cleanup effect to handle component unmount
  useEffect(() => {
    return () => {
      if (cleanupRef.current) return;
      cleanupRef.current = true;

      console.log('ws price cleanup');

      // Unsubscribe from all pairs before closing
      const subscribedPairs = queryClient.getQueryData<string[]>(['subscribedPairs']) || [];
      subscribedPairs.forEach(pair => {
        sendJsonMessage({
          type: 'unsubscribe',
          pair: pair,
        });
      });

      // Clear subscribed pairs from cache
      queryClient.setQueryData(['subscribedPairs'], []);
    };
  }, []); // Remove dependencies to ensure cleanup only runs on unmount

  const value = {
    readyState,
  };

  return <TokenPriceFeedContext.Provider value={value}>{children}</TokenPriceFeedContext.Provider>;
};
