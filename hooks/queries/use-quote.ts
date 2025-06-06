import { useQuery } from '@tanstack/react-query';
import { getQuote } from '@/utils/chain-client/txs/create_trade';
import { useWalletClient } from 'wagmi';
import { ethers } from 'ethers';

interface UseQuoteParams {
  assetIn: string;
  assetOut: string;
  amount: number;
  enabled?: boolean;
}

export const useQuote = ({ assetIn, assetOut, amount, enabled = true }: UseQuoteParams) => {
  const { data: wallet } = useWalletClient();

  return useQuery({
    queryKey: ['quote', assetIn, assetOut, amount],
    queryFn: async () => {
      if (!wallet) return 0;
      const quote = await getQuote({
        wallet,
        assetIn,
        assetOut,
        amount,
      });
      return Number(ethers.utils.formatUnits(quote, 18));
    },
    enabled: enabled && !!wallet && !!assetIn && !!assetOut && amount > 0,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 30, // 30 seconds
  });
};
