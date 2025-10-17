import { removeTrailingZeros } from '@/lib/utils';
import { getSonicBalanceWithProvider } from '@/utils/chain-client/txs/create_trade';
import { useQuery } from '@tanstack/react-query';
import { ethers } from 'ethers';
import { useAccount } from 'wagmi';

const TESTNET_CHAIN_ID = 57054;

export const useSonicBalanceByAddress = (address: string) => {
  const { chainId } = useAccount();
  const isTestnet = chainId === TESTNET_CHAIN_ID;

  const { data, isLoading, error } = useQuery({
    queryKey: ['sonic-balance-by-address', address, isTestnet ? 'testnet' : 'mainnet'],
    queryFn: () => getSonicBalanceWithProvider(address),
    enabled: !!address,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const balance = data ? removeTrailingZeros(ethers.utils.formatEther(data).toString(), 6) : '0';

  return {
    data: balance,
    isLoading,
    error,
  };
};
