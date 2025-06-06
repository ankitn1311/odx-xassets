import { useQuery } from '@tanstack/react-query';

export const useSelectedTokenPrice = ({
  symbol,
  quoteSymbol,
}: {
  symbol: string;
  quoteSymbol: string;
}) => {
  return useQuery({
    queryKey: ['price', `${symbol}/${quoteSymbol}`],
    queryFn: () => ({
      pair: `${symbol}/${quoteSymbol}`,
      baseToQuote: 0,
      quoteToBase: 0,
      lastUpdated: 0,
      priceChanges: { '24h': 0 },
      type: 'price_update',
    }),
    staleTime: Infinity,
    enabled: !!symbol,
  });
};
