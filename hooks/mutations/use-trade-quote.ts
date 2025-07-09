import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useTokenSwapStore } from '@/stores/token-swap-store';
import { TokenInfo } from '../queries/use-all-tokens';

interface QuoteParams {
  inputToken: TokenInfo;
  outputToken: TokenInfo;
  inputAmount: string;
}

const CRYPTO_API_BASE = 'https://api.crypto.com/exchange/v1/public';

const usdcToUsd = {
  USDC: 'USD',
  USDT: 'USD',
};

const xTokenToToken = {
  x1SOL: 'SOL',
  x1XRP: 'XRP',
};

const tokenConvert = {
  USDC: 'USD',
  USDT: 'USD',
  x1SOL: 'SOL',
  x1XRP: 'XRP',
  x1ADA: 'ADA',
};

// Helper function to calculate quote
const calculateQuote = async (params: QuoteParams, allTokens: any[]) => {
  const inputToken = params.inputToken.Name;
  const outputToken = params.outputToken.Name;

  const response = await axios.get(`${CRYPTO_API_BASE}/get-valuations`, {
    params: {
      instrument_name: `${tokenConvert[inputToken as keyof typeof tokenConvert]}_${tokenConvert[outputToken as keyof typeof tokenConvert]}`,
      valuation_type: 'mark_price',
      count: 1,
    },
  });

  const currentPrice = parseFloat(response.data.result.data[0].v);
  const inputAmount = parseFloat(params.inputAmount);

  // Calculate how much USDC you'll get for the input SOL amount
  return inputAmount * currentPrice;
};

export const useTradeQuote = () => {
  const { allTokens, setQuoteLoading } = useTokenSwapStore();

  const quoteMutation = useMutation({
    mutationFn: async (params: QuoteParams) => {
      try {
        setQuoteLoading(true);
        return await calculateQuote(params, allTokens || []);
      } catch (error) {
        console.error('Error fetching price from Crypto.com:', error);
        throw error;
      } finally {
        setQuoteLoading(false);
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
  const { allTokens } = useTokenSwapStore();

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
