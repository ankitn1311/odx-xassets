import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

interface QuoteParams {
  inputToken: string;
  outputToken: string;
  inputAmount: string;
}

const BINANCE_API_BASE = 'https://api.binance.com/api/v3';

export const useTradeQuote = () => {
  const quoteMutation = useMutation({
    mutationFn: async (params: QuoteParams) => {
      // For SOL/USDC pair
      const symbol = 'SOLUSDC';

      try {
        const response = await axios.get(`${BINANCE_API_BASE}/ticker/price`, {
          params: { symbol },
        });

        const currentPrice = parseFloat(response.data.price);
        const inputAmount = parseFloat(params.inputAmount);

        // Calculate how much SOL you'll get for the input USDC amount
        const outputAmount = inputAmount / currentPrice;

        return outputAmount;
      } catch (error) {
        console.error('Error fetching price from Binance:', error);
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
