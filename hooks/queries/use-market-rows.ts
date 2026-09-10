import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { useTokenSwapStore } from '@/stores/token-swap-store';
import {
  getTokenPrice,
  getTokenPriceChange,
  tokenConvert,
  tokenConvertForUI,
} from '@/hooks/mutations/use-trade-quote';
import { useWalletProfile } from '@/hooks/queries/use-wallet-profile';
import { CATEGORY, DEMO_LISTED_AT, DEMO_VOLUME_USD } from '@/app/(main)/markets/demo-data';

export interface MarketRow {
  symbol: string; // contract symbol, e.g. x2XRP
  name: string; // display name, e.g. XRP
  underlying: string; // ticker of the underlying, e.g. XRP
  address: string;
  image: string;
  price?: number;
  /** 24h change as a fraction, e.g. 0.0352 */
  change?: number;
  /** 24h change in USD, derived from price and change */
  changeUsd?: number;
  volumeUsd: number;
  volumeIsDemo: boolean;
  listedAt?: string;
  category: string;
  status: 'open';
}

/**
 * One row per tradeable xAsset with live price, 24h change and volume. Prices and
 * changes share the same query keys as the per-cell hooks, so the cache is shared.
 */
export function useMarketRows() {
  const { allTokens } = useTokenSwapStore();
  const { data: profile } = useWalletProfile(); // zero address = protocol totals
  const symbols = allTokens.map(t => t.TokenB.Name);

  const prices = useQueries({
    queries: symbols.map(s => ({
      queryKey: ['token-price', s],
      queryFn: () => getTokenPrice(s),
      refetchInterval: 1000 * 5,
    })),
  });
  const changes = useQueries({
    queries: symbols.map(s => ({
      queryKey: ['token-tickers', s],
      queryFn: () => getTokenPriceChange(s),
      refetchInterval: 1000 * 8,
    })),
  });

  const rows = useMemo<MarketRow[]>(
    () =>
      allTokens.map((t, i) => {
        const symbol = t.TokenB.Name;
        const underlying = tokenConvert[symbol as keyof typeof tokenConvert] ?? symbol;
        const price = prices[i]?.data;
        const change = changes[i]?.data;
        const feed = profile?.volumeData?.find(
          v => v.symbol === symbol || v.symbol === underlying || v.id === symbol
        );
        return {
          symbol,
          name: tokenConvertForUI[underlying as keyof typeof tokenConvertForUI] ?? underlying,
          underlying,
          address: t.TokenB.Address,
          image: `/images/tokens/${symbol}.png`,
          price,
          change,
          changeUsd:
            price !== undefined && change !== undefined ? price - price / (1 + change) : undefined,
          // Real volumes once the profile feed is in; demo figures only while it isn't,
          // so real and illustrative numbers never sit side by side.
          volumeUsd: profile ? (feed?.totalVolumeUSD ?? 0) : (DEMO_VOLUME_USD[symbol] ?? 0),
          volumeIsDemo: !profile,
          listedAt: DEMO_LISTED_AT[symbol],
          category: CATEGORY[symbol] ?? 'Other',
          status: 'open',
        };
      }),
    [allTokens, prices, changes, profile]
  );

  return {
    rows,
    isLoading: prices.some(p => p.isLoading) || changes.some(c => c.isLoading),
  };
}
