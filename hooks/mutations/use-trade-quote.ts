import { useMutation } from '@tanstack/react-query';
import { api } from '@/utils/axiosConfig';
import { debounce } from 'lodash';

interface QuoteParams {
  inputToken: string;
  outputToken: string;
  inputAmount: string;
}

export const useTradeQuote = () => {
  const quoteMutation = useMutation({
    mutationFn: async (params: QuoteParams) => {
      const response = await api.AXIOS(
        {
          url: '/trade/v1/quote',
          method: 'GET',
          params,
        },
        'pricefeed'
      );

      return response as number;
    },
  });

  return {
    getQuote: quoteMutation.mutateAsync,
    isLoading: quoteMutation.isPending,
    error: quoteMutation.error,
  };
};
