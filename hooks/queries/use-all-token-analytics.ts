import { useMemo, useState } from 'react';
import { useTokenSupply } from './use-token-supply';
import { useRecentTrades } from './useRecentTrades';
import { ALL_V2_TOKEN_PAIRS, TokenPair } from './use-all-tokens';

// Helper to get 24h ago timestamp
const get24hAgo = () => Date.now() - 24 * 60 * 60 * 1000;

export function useAllTokenAnalytics() {
  // For each token pair, get TVL and 24h volume
  // We'll use the TokenB (xAsset) as the main token
  const analytics = ALL_V2_TOKEN_PAIRS.map(pair => {
    // TVL
    const { data: supplyData, isLoading: isSupplyLoading } = useTokenSupply(
      pair.TokenA,
      pair.TokenB
    );
    // // Volume: fetch recent trades for this token
    // const { data: trades, isLoading: isTradesLoading } = useRecentTrades(
    //   'token',
    //   pair.TokenB.Address
    // );
    // Sum amountIn for trades in the last 24h
    const now = Date.now();
    // const volume24h = trades
    //   ? trades
    //       .filter(trade => trade.timestamp >= get24hAgo())
    //       .reduce((sum, trade) => sum + Number(trade.amountIn), 0)
    //   : 0;
    return {
      token: pair.TokenB,
      tvl: supplyData?.totalSupplyUSD ? parseFloat(supplyData.totalSupplyUSD) : 0,
      tvlRaw: supplyData?.totalSupply || '0',
      isTvlLoading: isSupplyLoading,
      volume24h: 0,
      isVolumeLoading: false,
    };
  });

  return analytics;
}

// New hook: aggregate total TVL and volume, and provide flat chart data for now
export function useTotalAnalytics(duration: '7D' | '30D' | '90D' | '180D' = '30D') {
  const analytics = useAllTokenAnalytics();
  const isLoading = analytics.some(a => a.isTvlLoading || a.isVolumeLoading);
  const totalTVL = analytics.reduce((sum, a) => sum + (a.tvl || 0), 0);
  // const totalVolume24h = analytics.reduce((sum, a) => sum + (a.volume24h || 0), 0);

  // For now, create a flat chart with N points (simulate history)
  const points = duration === '7D' ? 7 : duration === '30D' ? 30 : duration === '90D' ? 90 : 180;
  const now = Date.now();
  const interval = 24 * 60 * 60 * 1000; // 1 day
  const tvlChart = Array.from({ length: points }, (_, i) => ({
    time: now - (points - i - 1) * interval,
    value: totalTVL,
  }));
  // const volumeChart = Array.from({ length: points }, (_, i) => ({
  //   time: now - (points - i - 1) * interval,
  //   value: totalVolume24h,
  // }));

  return {
    totalTVL,
    // totalVolume24h,
    isLoading,
    tvlChart,
    // volumeChart,
  };
}
