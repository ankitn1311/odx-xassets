import { useQuery } from '@tanstack/react-query';
import { ethers } from 'ethers';
import { WalletClient } from 'viem';
import { useWalletClient } from 'wagmi';
import SwapAbi from '@/utils/chain-client/abis/SwapAbi.json';
import { DEX_ADDRESS } from '@/lib/constants';
import { useSearchParams } from 'next/navigation';

const fetchRecentTrades = async (
  walletClient: WalletClient,
  tokenAddress: string | null,
  type: 'token' | 'user'
) => {
  const provider = new ethers.providers.Web3Provider(walletClient.transport);
  const odxDexContract = new ethers.Contract(DEX_ADDRESS, SwapAbi, provider);

  const userAddress = walletClient?.account?.address;

  // Create filters based on token address if provided
  const filters = tokenAddress
    ? [
        odxDexContract.filters.Swap(type === 'token' ? null : userAddress, tokenAddress, null), // tokenIn matches
        odxDexContract.filters.Swap(type === 'token' ? null : userAddress, null, tokenAddress), // tokenOut matches
      ]
    : [odxDexContract.filters.Swap(type === 'token' ? null : userAddress, null, null)];

  const currentBlock = await provider.getBlockNumber();
  const from = currentBlock - 400; // 12 minutes

  // Query all filters and combine results
  const events = (
    await Promise.all(filters.map(filter => odxDexContract.queryFilter(filter, from, 'latest')))
  ).flat();

  const recentTrades = await Promise.all(
    events.map(async event => {
      const block = await event.getBlock();
      return {
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber,
        timestamp: block.timestamp * 1000,
        user: event.args?.user,
        tokenIn: event.args?.tokenIn,
        tokenOut: event.args?.tokenOut,
        amountIn: ethers.utils.formatUnits(event.args?.amountIn, 18),
        amountOut: ethers.utils.formatUnits(event.args?.amountOut, 18),
      };
    })
  );
  return recentTrades.slice(0, 100);
};

export const useRecentTrades = (type: 'token' | 'user', tokenAddressOverride?: string | null) => {
  const { data: walletClient } = useWalletClient();
  const searchParams = useSearchParams();
  const tokenAddress = tokenAddressOverride ?? searchParams.get('token');

  return useQuery({
    queryKey: ['recent-trades', type, tokenAddress],
    queryFn: () => fetchRecentTrades(walletClient as any, tokenAddress, type),
    enabled: !!walletClient,
  });
};
