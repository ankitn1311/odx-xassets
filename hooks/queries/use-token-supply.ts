import { useQuery } from '@tanstack/react-query';
import { ethers } from 'ethers';
import { erc20Abi } from 'viem';
import { useTokenPrice, useTradeQuote } from '@/hooks/mutations/use-trade-quote';
import { useWalletClient } from 'wagmi';
import { useTokenSwapStore } from '@/stores/token-swap-store';
import { TokenInfo } from './use-all-tokens';

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

// Input Token - USDC
// Output Token - x1SOL | x1PEPE | x1SUI | x1DOGE | x1ADA | x1XRP | x1BTC etc
export const useTokenSupply = (inputToken?: TokenInfo, outputToken?: TokenInfo) => {
  const { getQuote } = useTradeQuote();
  const { data: wallet } = useWalletClient();
  console.log('inputToken', inputToken);
  console.log('outputToken', outputToken);

  return useQuery({
    queryKey: ['token-supply', inputToken?.Address, outputToken?.Address, wallet?.account.address],
    queryFn: async () => {
      console.log('Starting token supply query with:', { inputToken, outputToken });
      if (!inputToken || !outputToken) {
        console.log('Missing required data:', { inputToken, outputToken });
        return {
          totalSupply: '0',
          totalSupplyUSD: '0',
        };
      }

      // const outputToken = allTokens.find(
      //   token =>
      //     token.TokenA.Address === outputTokenAddress || token.TokenB.Address === outputTokenAddress
      // );

      // if (!outputToken) {
      //   console.log('Output token not found in allTokens for address:', outputTokenAddress);
      //   return null;
      // }

      console.log('Found output token:', outputToken);

      // const decimals =
      //   outputToken.TokenA.Address === outputTokenAddress
      //     ? outputToken.TokenA.Decimals
      //     : outputToken.TokenB.Decimals;

      // console.log('Using decimals:', decimals);

      const supply = await getTokenSupply(outputToken.Address, outputToken.Decimals, wallet);
      console.log('Retrieved token supply:', supply);

      if (outputToken.Address) {
        console.log('Getting quote for market cap calculation');
        const quote = await getQuote({
          outputToken: inputToken,
          inputToken: outputToken,
          inputAmount: '1',
        });

        // console.log('Quote received:', quote);

        // For 1 usd how many output tokens
        const reverseQuote = quote;
        console.log('Reverse quote: ', outputToken.Name, reverseQuote);

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
    enabled: !!outputToken?.Address && !!inputToken?.Address,
    staleTime: 1000 * 60 * 10,
  });
};
