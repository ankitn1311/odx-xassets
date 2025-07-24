import { useQuery } from '@tanstack/react-query';
import { ethers } from 'ethers';
import { erc20Abi } from 'viem';
import { useTradeQuote } from '@/hooks/mutations/use-trade-quote';
import { useWalletClient } from 'wagmi';
import { TokenInfo } from './use-all-tokens';

const getTokenSupply = async (tokenAddress: string | undefined, decimals: number, wallet: any) => {
  if (!tokenAddress) return '0';

  try {
    const provider = new ethers.providers.Web3Provider(wallet as any);
    const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, provider);
    const totalSupply = await tokenContract.totalSupply();
    return ethers.utils.formatUnits(totalSupply, decimals);
  } catch (error) {
    console.error('Error getting token supply:', error);
    return '0';
  }
};

// Input Token - USDC
// Output Token - x1SOL | x1PEPE | x1SUI | x1DOGE | x1ADA | x1XRP | x1BTC etc
export const useTokenSupply = (inputToken?: TokenInfo, outputToken?: TokenInfo) => {
  const { getQuote } = useTradeQuote();
  const { data: wallet } = useWalletClient();

  return useQuery({
    queryKey: ['token-supply', inputToken?.Address, outputToken?.Address, wallet?.account.address],
    queryFn: async () => {
      if (!inputToken || !outputToken) {
        return {
          totalSupply: '0',
          totalSupplyUSD: '0',
        };
      }
      const supply = await getTokenSupply(outputToken.Address, outputToken.Decimals, wallet);

      if (outputToken.Address) {
        const quote = await getQuote({
          outputToken: inputToken,
          inputToken: outputToken,
          inputAmount: '1',
        });

        const reverseQuote = quote;

        const marketCap = reverseQuote * parseFloat(supply);
        const totalSupplyInUSD = marketCap.toFixed(2);

        return {
          totalSupply: supply,
          totalSupplyUSD: totalSupplyInUSD,
        };
      }

      return {
        totalSupply: supply,
        totalSupplyUSD: '0',
      };
    },
    enabled: !!outputToken?.Address && !!inputToken?.Address,
    staleTime: 1000 * 60 * 10,
  });
};
