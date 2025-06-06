import { sonicBalance } from '@/utils/chain-client/txs/create_trade';
import { useQuery } from '@tanstack/react-query';
import { ethers } from 'ethers';
import { useAccount } from 'wagmi';
import { useWalletClient } from 'wagmi';

export const useSonicBalance = () => {
  const { data: wallet } = useWalletClient();
  const { address } = useAccount();

  const { data, isLoading } = useQuery({
    queryKey: ['sonic-balance', address],
    queryFn: () => sonicBalance(wallet),
    enabled: !!address,
  });

  const balance = data ? parseFloat(ethers.utils.formatEther(data)).toFixed(4) : '0';

  return {
    data: balance,
    isLoading,
  };
};
