import { useQuery } from '@tanstack/react-query';
import { ethers } from 'ethers';
import { erc20Abi } from 'viem';
import { TokenInfo, useAllTokens } from './use-all-tokens';
import { SONIC_RPC_URL } from '@/utils/chain-client/common/provider';
import axios from 'axios';
import { getCurrentBaseUrl } from '@/lib/utils';

// Token conversion mapping for API calls
const tokenConvert = {
  USDC: 'USD',
  USDT: 'USD',
  x2XRP: 'XRP',
  x2SOL: 'SOL',
  x2ADA: 'ADA',
  x2SUI: 'SUI',
  x2DOGE: 'DOGE',
  x2PEPE: 'PEPE',
  x2BTC: 'BTC',
  x2ETH: 'ETH',
};

const getTokenSupply = async (tokenAddress: string | undefined, decimals: number) => {
  if (!tokenAddress) return '0';

  try {
    const provider = new ethers.providers.JsonRpcProvider(SONIC_RPC_URL);
    const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, provider);
    const totalSupply = await tokenContract.totalSupply();
    return ethers.utils.formatUnits(totalSupply, decimals);
  } catch (error) {
    console.error('Error getting token supply:', error);
    return '0';
  }
};

const getTokenPrice = async (tokenSymbol: string) => {
  try {
    const convertedSymbol = tokenConvert[tokenSymbol as keyof typeof tokenConvert];
    console.log(`Getting price for ${tokenSymbol} -> ${convertedSymbol}`);

    const response = await axios.get(`${getCurrentBaseUrl()}/cdc/get-valuations`, {
      params: {
        instrument_name: `${convertedSymbol}_USD`,
        valuation_type: 'mark_price',
        count: 1,
      },
    });

    const price = parseFloat(response.data.result.data[0].v);
    console.log(`Price for ${tokenSymbol}: $${price}`);
    return price;
  } catch (error) {
    console.error('Error getting token price for', tokenSymbol, error);
    return 0;
  }
};

// Input Token - USDC
// Output Token - x1SOL | x1PEPE | x1SUI | x1DOGE | x1ADA | x1XRP | x1BTC etc
export const useTokenSupply = (inputToken?: TokenInfo, outputToken?: TokenInfo) => {
  return useQuery({
    queryKey: ['token-supply', inputToken?.Address, outputToken?.V1Address],
    queryFn: async () => {
      if (!inputToken || !outputToken) {
        return {
          totalSupply: '0',
          totalSupplyUSD: '0',
        };
      }
      const supply = await getTokenSupply(outputToken.V1Address, outputToken.Decimals);

      if (outputToken.V1Address) {
        try {
          // Get the current price of the base token in USD
          const tokenPrice = await getTokenPrice(outputToken.Name);

          // Calculate total value: supply * price
          const totalSupplyInUSD = (tokenPrice * parseFloat(supply)).toFixed(2);

          console.log(
            `${outputToken.Name}: Supply=${supply}, Token=${outputToken.Name}, Price=$${tokenPrice}, Total=$${totalSupplyInUSD}`
          );

          return {
            totalSupply: supply,
            totalSupplyUSD: totalSupplyInUSD,
          };
        } catch (error) {
          console.error('Error getting price for', outputToken.Name, error);
          return {
            totalSupply: supply,
            totalSupplyUSD: '0',
          };
        }
      }

      return {
        totalSupply: supply,
        totalSupplyUSD: '0',
      };
    },
    enabled: !!outputToken?.V1Address && !!inputToken?.Address,
    staleTime: 1000 * 60 * 10,
  });
};

// Optimized hook: fetch supply data for all tokens with better caching and error handling
export const useTokensSupply = () => {
  const { data: allTokens } = useAllTokens();

  return useQuery({
    queryKey: ['tokens-supply'],
    queryFn: async () => {
      // Process all token pairs in parallel with better error handling
      const results = await Promise.allSettled(
        allTokens?.map(async pair => {
          try {
            const supply = await getTokenSupply(pair.TokenB.V1Address, pair.TokenB.Decimals);

            if (pair.TokenB.V1Address) {
              try {
                // Use the full xAsset name directly (e.g., x2SOL)
                const tokenPrice = await getTokenPrice(pair.TokenB.Name);

                // Calculate total value: supply * price
                const totalSupplyInUSD = (tokenPrice * parseFloat(supply)).toFixed(2);

                return {
                  totalSupply: supply,
                  totalSupplyUSD: totalSupplyInUSD,
                };
              } catch (error) {
                console.error('Error getting price for', pair.TokenB.Name, error);
                return {
                  totalSupply: supply,
                  totalSupplyUSD: '0',
                };
              }
            }

            return {
              totalSupply: supply,
              totalSupplyUSD: '0',
            };
          } catch (error) {
            console.error('Error getting supply for', pair.TokenB.Name, error);
            return {
              totalSupply: '0',
              totalSupplyUSD: '0',
            };
          }
        })
      );

      // Extract successful results, fallback to default for failed ones
      return results.map(result =>
        result.status === 'fulfilled' ? result.value : { totalSupply: '0', totalSupplyUSD: '0' }
      );
    },
    // enabled: !!wallet?.account.address,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    gcTime: 1000 * 60 * 10, // 10 minutes in memory (renamed from cacheTime)
    retry: 2, // Retry failed requests twice
    retryDelay: 1000, // 1 second delay between retries
  });
};
