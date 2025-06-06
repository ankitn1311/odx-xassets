import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export type EventType =
  | 'USER_DEPOSIT'
  | 'NATIVE_SWAP_COMPLETE'
  | 'XASSET_MINT_COMPLETE'
  | 'USER_XASSET_BURN'
  | 'WITHDRAWAL_COMPLETE';

export interface Trade {
  PKID: number;
  ID: string;
  UserAddress: string;
  AssetA: string;
  AssetB: string;
  AmountUSD: string;
  Timestamp: string;
  LastTxHash: string;
  FinalTxIndex: number;
  Chain: string;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  EventType: EventType;
  ValidatorAddress: string;
  Fee: string;
  AmountA: string;
  AmountB: string;
  FirstTxHash: string;
  SwapTxHash: string;
}

const getAllTrades = async (address: string, type: 'token' | 'user'): Promise<Trade[]> => {
  const res = await axios.get(
    `https://api1.odx.so/trades/${type === 'token' ? 'token' : 'address'}/${address}`
  );
  return res.data;
};

export const useTrades = (address: string, type: 'token' | 'user') => {
  return useQuery<Record<string, Trade>>({
    queryKey: [`trades-${type}`, address],
    queryFn: async () => {
      const data = await getAllTrades(address, type);
      const trades: Record<string, Trade> = {};
      for (const trade of data) {
        trades[trade.ID] = trade;
      }
      return trades;
    },
    enabled: !!address,
  });
};
