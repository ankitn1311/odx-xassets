import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export interface SwapperData {
  address: string;
  totalPoints: number;
  tradeCount: number;
  legacyPoints: number;
  lastTradeTimestamp: number;
  currentRank?: number;
  lastRankUpdate?: number;
}

const fetchWalletProfile = async (address: string): Promise<SwapperData> => {
  if (!address) throw new Error('Wallet address is required');
  const response = await axios.get(`${BASE_URL}/swapper/${address}`);
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
