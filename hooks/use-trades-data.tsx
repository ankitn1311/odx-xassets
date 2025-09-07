import { useQuery } from '@tanstack/react-query';
import { TradeData } from '@/providers/trades-provider';
import axios from 'axios';
import { SwapperData } from './queries/use-wallet-profile';
import { getCurrentBaseUrl } from '@/lib/utils';

export const getTradesData = async (type?: 'user' | 'explorer', address?: string) => {
  if (!address) throw new Error('Wallet address is required');
  const response = await axios.get<SwapperData>(`${getCurrentBaseUrl()}/swapper/${address}`);

  if (type === 'user') {
    return response.data.userTrades.map(trade => ({
      ...trade,
      timestamp: Number(new Date(trade.timestamp as string)),
    }));
  }
  return response.data.recentTrades.map(trade => ({
    ...trade,
    timestamp: Number(new Date(trade.timestamp as string)),
  }));
};

export const useTradesData = (
  type?: 'user' | 'explorer',
  address: string = '0x0000000000000000000000000000000000000000'
) => {
  return useQuery<TradeData[]>({
    queryKey: ['trades', type, address],
    queryFn: () => getTradesData(type, address),
    staleTime: 1000 * 60 * 2, // 2 minutes cache
    gcTime: 1000 * 60 * 5, // 5 minutes in memory (renamed from cacheTime)
    refetchInterval: false, // Don't refetch automatically
    enabled: !!address && address !== '0x0000000000000000000000000000000000000000',
    refetchOnMount: false, // Don't refetch on mount since we have WebSocket updates
    retry: 1, // Retry once on failure
    retryDelay: 2000, // 2 second delay
  });
};
