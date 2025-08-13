import { getCurrentBaseUrl } from '@/lib/utils';
import { TradeData } from '@/providers/trades-provider';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export interface SwapperData {
  address: string;
  totalPoints: number;
  tradeCount: number;
  legacyPoints: number;
  lastTradeTimestamp: number;
  current_rank?: number;
  lastRankUpdate?: number;
  userTrades: TradeData[];
  recentTrades: TradeData[];
  volumeData: VolumeData[];
}

export interface VolumeData {
  tradeCount: number;
  lastUpdated: string;
  totalVolumeUSD: number;
  id: string;
  symbol: string;
}

const fetchWalletProfile = async (address: string): Promise<SwapperData> => {
  if (!address) throw new Error('Wallet address is required');
  const response = await axios.get<SwapperData>(`${getCurrentBaseUrl()}/swapper/${address}`);
  return response.data;
};

export const useWalletProfile = (address: string | undefined | null) => {
  return useQuery<SwapperData>({
    queryKey: ['wallet-profile', address],
    queryFn: () => fetchWalletProfile(address!),
    enabled: !!address,
    retry: false,
  });
};
