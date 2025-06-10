import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

interface QuoteParams {
  inputToken: string;
  outputToken: string;
  inputAmount: string;
}

const CRYPTO_API_BASE = 'https://api.crypto.com/exchange/v1/public';

export const useTradeQuote = () => {
  const quoteMutation = useMutation({
    mutationFn: async (params: QuoteParams) => {
      try {
        const response = await axios.get(`${CRYPTO_API_BASE}/get-valuations`, {
          params: {
            instrument_name: 'SOL_USDC',
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
