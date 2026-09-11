import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { getCurrentBaseUrl } from '@/lib/utils';

const TOKEN_SYMBOL_MAP: Record<string, string> = {
  x2XRP: 'XRP_USD',
  x2SOL: 'SOL_USD',
  x2ADA: 'ADA_USD',
  x2DOGE: 'DOGE_USD',
  x2PEPE: 'PEPE_USD',
  x2SUI: 'SUI_USD',
  x2ETH: 'ETH_USD',
  x2BTC: 'BTC_USD',
};

// Candle interval and how many candles make up each range. The feed returns ~25
// candles per call, so each range is sized to fit in one request.
const DURATION_MAP: Record<string, { interval: string; limit: number }> = {
  '1D': { interval: '1h', limit: 24 },
  '7D': { interval: '12h', limit: 14 },
  '1M': { interval: '1D', limit: 25 },
};

export interface ChartPoint {
  time: number;
  price: number;
}

/** Candles for a token over a range. Returns an empty list when the feed has nothing. */
async function fetchCryptoChartData(token: string, duration: string): Promise<ChartPoint[]> {
  const symbol = TOKEN_SYMBOL_MAP[token];
  if (!symbol) return [];
  const { interval, limit } = DURATION_MAP[duration] || DURATION_MAP['1D'];
  const url = `${getCurrentBaseUrl()}/cdc/get-candlestick?instrument_name=${symbol}&timeframe=${interval}`;
  const res = await axios.get(url);
  const data = res.data?.result?.data;
  if (!Array.isArray(data) || data.length === 0) return [];
  const sorted = [...data].sort((a: any, b: any) => a.t - b.t);
  return sorted.slice(-limit).map((item: any) => ({
    time: item.t,
    price: Number(item.c),
  }));
}

export function useCryptoChart(token: string, duration: string) {
  return useQuery({
    queryKey: ['crypto-chart', token, duration],
    queryFn: () => fetchCryptoChartData(token, duration),
    enabled: !!token && !!duration,
    staleTime: 1000 * 60, // 1 minute
  });
}
