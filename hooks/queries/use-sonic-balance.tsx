import { truncateToFixed } from '@/lib/utils';
import { useWalletStore } from '@/stores/wallet-store';
import { sonicBalance } from '@/utils/chain-client/txs/create_trade';
import { useQuery } from '@tanstack/react-query';
import { ethers } from 'ethers';
import { useWalletClient } from 'wagmi';

export const useSonicBalance = () => {
  const { data: wallet } = useWalletClient();
  const { connectedWallet: address } = useWalletStore();

  const { data, isLoading } = useQuery({
    queryKey: ['sonic-balance', address],
    queryFn: () => sonicBalance(wallet),
    enabled: !!address,
  });

  const balance = data ? truncateToFixed(parseFloat(ethers.utils.formatEther(data)), 4) : '0';

  return {
    data: balance,
    isLoading,
  };
};
