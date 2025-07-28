import { useQuery } from '@tanstack/react-query';
import { TradeData } from '@/providers/trades-provider';

export const useTradesData = () => {
  return useQuery<TradeData[]>({
    queryKey: ['trades'],
    queryFn: () => [],
    // staleTime: 0, // Always consider data stale to get real-time updates
    staleTime: Infinity,
    refetchInterval: false, // Don't refetch automatically
  });
};
