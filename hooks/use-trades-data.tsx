import { useQuery } from '@tanstack/react-query';
import { TradeData } from '@/providers/trades-provider';
import axios from 'axios';
import { useAccount } from 'wagmi';
import { SwapperData } from './queries/use-wallet-profile';
import { BASE_URL } from '@/lib/utils';

export const getTradesData = async (type?: 'user' | 'explorer', address?: string) => {
  if (!address) throw new Error('Wallet address is required');
  const response = await axios.get<SwapperData>(`${BASE_URL}/swapper/${address}`);

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

export const useTradesData = (type?: 'user' | 'explorer') => {
  const { address } = useAccount();

  return useQuery<TradeData[]>({
    queryKey: ['trades', type],
    queryFn: () => getTradesData(type, address || ''),
    // staleTime: 0, // Always consider data stale to get real-time updates
    staleTime: Infinity,
    refetchInterval: false, // Don't refetch automatically
    enabled: !!address,
    refetchOnMount: 'always',
  });
};
