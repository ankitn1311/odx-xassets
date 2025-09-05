import { removeTrailingZeros } from '@/lib/utils';
import { sonicBalance } from '@/utils/chain-client/txs/create_trade';
import { useQuery } from '@tanstack/react-query';
import { ethers } from 'ethers';
import { useWalletClient, useAccount } from 'wagmi';

export const useSonicBalance = () => {
  const { data: wallet } = useWalletClient();
  const { address } = useAccount();

  const { data, isLoading } = useQuery({
    queryKey: ['sonic-balance', address],
    queryFn: () => sonicBalance(wallet),
    enabled: !!address,
  });

  const balance = data ? removeTrailingZeros(ethers.utils.formatEther(data).toString(), 6) : '0';

  return {
    data: balance,
    isLoading,
  };
};
