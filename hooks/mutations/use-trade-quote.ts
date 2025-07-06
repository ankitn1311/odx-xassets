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
  x1SOL: 'SOL',
};

// Helper function to calculate quote
const calculateQuote = async (params: QuoteParams, allTokens: any[]) => {
  const isBuying = allTokens?.find(token => token.TokenA.Address === params.inputToken);
  const isSelling = allTokens?.find(token => token.TokenB.Address === params.inputToken);

  const tokenToBuy =
    isBuying && allTokens?.find(token => token.TokenB.Address === params.outputToken);

  const inputTokenName = isBuying ? isBuying.TokenA.Name : isSelling?.TokenB.Name;
  const outputXTokenName = isBuying ? tokenToBuy?.TokenB.Name : isSelling?.TokenA.Name;

  const inputTokenNameToUsd = isBuying
    ? usdcToUsd[inputTokenName as keyof typeof usdcToUsd] || inputTokenName
    : xTokenToToken[inputTokenName as keyof typeof xTokenToToken] || inputTokenName;
  const outputTokenName = isBuying
    ? xTokenToToken[outputXTokenName as keyof typeof xTokenToToken] || outputXTokenName
    : usdcToUsd[outputXTokenName as keyof typeof usdcToUsd] || outputXTokenName;

  const response = await axios.get(`${CRYPTO_API_BASE}/get-valuations`, {
    params: {
      instrument_name: isBuying
        ? `${outputTokenName}_${inputTokenNameToUsd}`
        : `${inputTokenNameToUsd}_${outputTokenName}`,
      valuation_type: 'mark_price',
      count: 1,
    },
  });

  const currentPrice = parseFloat(response.data.result.data[0].v);
  const inputAmount = parseFloat(params.inputAmount);

  // Calculate output amount based on whether we're buying or selling
  let outputAmount;
  if (isBuying) {
    // Calculate how much SOL you'll get for the input USDC amount
    outputAmount = inputAmount / currentPrice;
  } else {
    // Calculate how much USDC you'll get for the input SOL amount
    outputAmount = inputAmount * currentPrice;
  }

  return outputAmount;
};

export const useTradeQuote = () => {
  const { data: allTokens } = useAllTokens();

  const quoteMutation = useMutation({
    mutationFn: async (params: QuoteParams) => {
      try {
        return await calculateQuote(params, allTokens || []);
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
        return await calculateQuote(params, allTokens || []);
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
