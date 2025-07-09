import { useQuery } from '@tanstack/react-query';
import { ethers } from 'ethers';
import { erc20Abi } from 'viem';
import { useTradeQuote } from '@/hooks/mutations/use-trade-quote';
import { useWalletClient } from 'wagmi';
import { useTokenSwapStore } from '@/stores/token-swap-store';

const getTokenSupply = async (tokenAddress: string | undefined, decimals: number, wallet: any) => {
  if (!tokenAddress) return '0';

  try {
    let provider;
    if (wallet) {
      console.log('Using Web3Provider with wallet');
      provider = new ethers.providers.Web3Provider(wallet as any);
    } else {
      console.log('Falling back to JsonRpcProvider');
      provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
    }

    const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, provider);
    const totalSupply = await tokenContract.totalSupply();
    console.log('Total supply:', totalSupply);
    return ethers.utils.formatUnits(totalSupply, decimals);
  } catch (error) {
    console.error('Error getting token supply:', error);
    return '0';
  }
};

export const useTokenSupply = (inputTokenAddress?: string, outputTokenAddress?: string) => {
  const { getQuote } = useTradeQuote();
  const { allTokens } = useTokenSwapStore();
  const { data: wallet } = useWalletClient();

  return useQuery({
    queryKey: ['token-supply', inputTokenAddress, outputTokenAddress, allTokens, wallet],
    queryFn: async () => {
      console.log('Starting token supply query with:', { inputTokenAddress, outputTokenAddress });

      if (!outputTokenAddress || !allTokens) {
        console.log('Missing required data:', { outputTokenAddress, hasAllTokens: !!allTokens });
        return null;
      }

      const outputToken = allTokens.find(
        token =>
          token.TokenA.Address === outputTokenAddress || token.TokenB.Address === outputTokenAddress
      );

      if (!outputToken) {
        console.log('Output token not found in allTokens for address:', outputTokenAddress);
        return null;
      }

      console.log('Found output token:', outputToken);

      const decimals =
        outputToken.TokenA.Address === outputTokenAddress
          ? outputToken.TokenA.Decimals
          : outputToken.TokenB.Decimals;

      console.log('Using decimals:', decimals);

      const supply = await getTokenSupply(outputTokenAddress, decimals, wallet);
      console.log('Retrieved token supply:', supply);

      if (inputTokenAddress) {
        console.log('Getting quote for market cap calculation');
        const quote = await getQuote({
          outputToken: outputToken.TokenA,
          inputToken: outputToken.TokenB,
          inputAmount: '1',
        });

        console.log('Quote received:', quote);

        // For 1 usd how many output tokens
        const reverseQuote = 1 / quote;
        console.log('Reverse quote:', reverseQuote);

        const marketCap = reverseQuote * parseFloat(supply);
        const totalSupplyInUSD = marketCap.toFixed(2);
        console.log('Calculated market cap:', { marketCap, totalSupplyInUSD });

        return {
          totalSupply: supply,
          totalSupplyUSD: totalSupplyInUSD,
        };
      }

      console.log('No input token provided, returning supply only');
      return {
        totalSupply: supply,
        totalSupplyUSD: '0',
      };
    },
    enabled: !!outputTokenAddress && !!allTokens,
  });
};
