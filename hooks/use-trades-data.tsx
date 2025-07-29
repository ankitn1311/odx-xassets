import { useQuery } from '@tanstack/react-query';
import { TradeData } from '@/providers/trades-provider';
import axios from 'axios';
import { useAccount } from 'wagmi';
import { SwapperData } from './queries/use-wallet-profile';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const getTradesData = async (type?: 'user' | 'explorer', address?: string) => {
  if (!address) throw new Error('Wallet address is required');
  const response = await axios.get<SwapperData>(`${BASE_URL}/swapper/${address}`);

  if (type === 'user') {
    return response.data.userTrades;
  }
  return response.data.recentTrades;
};

export const useTradesData = (type?: 'user' | 'explorer') => {
  const { address } = useAccount();

  return useQuery<TradeData[]>({
    queryKey: ['trades', type],
    queryFn: () => getTradesData(type, address),
    // staleTime: 0, // Always consider data stale to get real-time updates
    staleTime: Infinity,
    refetchInterval: false, // Don't refetch automatically
  });
};
