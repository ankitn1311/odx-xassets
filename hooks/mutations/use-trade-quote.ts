import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useAllTokens } from '../queries/use-all-tokens';

interface QuoteParams {
  inputToken: string;
  outputToken: string;
  inputAmount: string;
}

const CRYPTO_API_BASE = 'https://api.crypto.com/exchange/v1/public';

const usdcToUsd = {
  USDC: 'USD',
  USDT: 'USD',
};

const xTokenToToken = {
  xSOL: 'SOL',
};

export const useTradeQuote = () => {
  const { data: allTokens } = useAllTokens();

  const quoteMutation = useMutation({
    mutationFn: async (params: QuoteParams) => {
      try {
        const inputToken = allTokens?.find(token => token.TokenA.Address === params.inputToken);
        const outputToken = allTokens?.find(token => token.TokenB.Address === params.outputToken);

        const inputTokenName = inputToken?.TokenA.Name;
        const outputXTokenName = outputToken?.TokenB.Name;

        const inputTokenNameToUsd =
          usdcToUsd[inputTokenName as keyof typeof usdcToUsd] || inputTokenName;
        const outputTokenName =
          xTokenToToken[outputXTokenName as keyof typeof xTokenToToken] || outputXTokenName;

        const response = await axios.get(`${CRYPTO_API_BASE}/get-valuations`, {
          params: {
            instrument_name: `${outputTokenName}_${inputTokenNameToUsd}`,
            valuation_type: 'mark_price',
            count: 1,
          },
        });

        const currentPrice = parseFloat(response.data.result.data[0].v);
        const inputAmount = parseFloat(params.inputAmount);

        // Calculate how much SOL you'll get for the input USDC amount
        const outputAmount = inputAmount / currentPrice;

        return outputAmount;
      } catch (error) {
        console.error('Error fetching price from Crypto.com:', error);
        throw error;
      }
    },
  });

  return {
    getQuote: quoteMutation.mutateAsync,
    isLoading: quoteMutation.isPending,
    error: quoteMutation.error,
  };
};

export const useTokenQuote = () => {
  const { data: allTokens } = useAllTokens();

  const quoteMutation = useMutation({
    mutationFn: async (params: QuoteParams) => {
      try {
        const inputToken = allTokens?.find(token => token.TokenA.Address === params.inputToken);
        const outputToken = allTokens?.find(token => token.TokenB.Address === params.outputToken);

        const inputTokenName = inputToken?.TokenA.Name;
        const outputXTokenName = outputToken?.TokenB.Name;

        const inputTokenNameToUsd =
          usdcToUsd[inputTokenName as keyof typeof usdcToUsd] || inputTokenName;
        const outputTokenName =
          xTokenToToken[outputXTokenName as keyof typeof xTokenToToken] || outputXTokenName;

        const response = await axios.get(`${CRYPTO_API_BASE}/get-valuations`, {
          params: {
            instrument_name: `${outputTokenName}_${inputTokenNameToUsd}`,
            valuation_type: 'mark_price',
            count: 1,
          },
        });

        const currentPrice = parseFloat(response.data.result.data[0].v);
        const inputAmount = parseFloat(params.inputAmount);

        // Calculate how much SOL you'll get for the input USDC amount
        const outputAmount = inputAmount / currentPrice;

        return outputAmount;
      } catch (error) {
        console.error('Error fetching price from Crypto.com:', error);
        throw error;
      }
    },
  });

  return {
    getQuote: quoteMutation.mutateAsync,
    isLoading: quoteMutation.isPending,
    error: quoteMutation.error,
  };
};
