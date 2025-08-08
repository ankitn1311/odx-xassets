import { BASE_URL } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const TOKEN_SYMBOL_MAP: Record<string, string> = {
  x1XRP: 'XRP_USD',
  x1SOL: 'SOL_USD',
  x1ADA: 'ADA_USD',
  x1DOGE: 'DOGE_USD',
  x1PEPE: 'PEPE_USD',
  x1SUI: 'SUI_USD',
  // Add more mappings as needed
};

const DURATION_MAP: Record<string, { interval: string; limit: number }> = {
  '1D': { interval: '1D', limit: 24 }, // 24 hours of 1D intervals
  '7D': { interval: '7D', limit: 7 }, // 7 days of 7D intervals
  '1M': { interval: '1M', limit: 30 }, // 30 days of 1M intervals
};

export interface ChartPoint {
  time: number;
  price: number;
}

function getMockChartData(limit: number, price: number = 1): ChartPoint[] {
  const now = Date.now();
  const interval = Math.floor((24 * 60 * 60 * 1000) / limit); // spread over 1 day
  return Array.from({ length: limit }, (_, i) => ({
    time: now - (limit - i) * interval,
    price: Math.random() * 10,
  }));
}

async function fetchCryptoChartData(token: string, duration: string): Promise<ChartPoint[]> {
  const symbol = TOKEN_SYMBOL_MAP[token] || 'XRP_USD';
  const { interval, limit } = DURATION_MAP[duration] || DURATION_MAP['1D'];
  const url = `${BASE_URL}/cdc/get-candlestick?instrument_name=${symbol}&timeframe=${interval}`;
  try {
    const res = await axios.get(url);
    const json = res.data;
    if (
      !json.result ||
      !json.result.data ||
      !Array.isArray(json.result.data) ||
      json.result.data.length === 0
    ) {
      // Return mock data if API returns no data
      return getMockChartData(limit);
    }
    const sorted = json.result.data.sort((a: any, b: any) => a.t - b.t);
    return sorted.slice(-limit).map((item: any) => ({
      time: item.t,
      price: Number(item.c),
    }));
  } catch (e) {
    // Return mock data if API fails
    console.log('error', e);
    return getMockChartData(limit);
  }
}

export function useCryptoChart(token: string, duration: string) {
  return useQuery({
    queryKey: ['crypto-chart', token, duration],
    queryFn: () => fetchCryptoChartData(token, duration),
    enabled: !!token && !!duration,
    staleTime: 1000 * 60, // 1 minute
  });
}
