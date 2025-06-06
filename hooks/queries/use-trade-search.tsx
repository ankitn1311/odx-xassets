import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Trade, EventType } from './use-trades';

type SearchType = 'trade-id' | 'address' | 'token';

// Mock data generator
const generateMockTrade = (id: string = crypto.randomUUID()): Trade => {
  const eventTypes: EventType[] = [
    'XASSET_MINT_COMPLETE',
    'WITHDRAWAL_COMPLETE',
    'USER_DEPOSIT',
    'NATIVE_SWAP_COMPLETE',
    'USER_XASSET_BURN',
  ];
  const assets = ['USDT.x', 'RIFT.x', 'CULT.x', 'NADE.x', 'NOVA.x', 'WISH.x'];
  const chains = ['ethereum', 'sui', 'solana'];
  const timestamp = new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString();

  return {
    PKID: Math.floor(Math.random() * 1000),
    ID: id,
    UserAddress: `0x${crypto.randomUUID().replace(/-/g, '').slice(0, 40)}`,
    AssetA: assets[Math.floor(Math.random() * assets.length)],
    AssetB: assets[Math.floor(Math.random() * assets.length)],
    AmountUSD: (Math.random() * 1000).toFixed(2),
    LastTxHash: `0x${crypto.randomUUID().replace(/-/g, '').slice(0, 64)}`,
    FinalTxIndex: Math.floor(Math.random() * 100),
    Chain: chains[Math.floor(Math.random() * chains.length)],
    Timestamp: timestamp,
    CreatedAt: timestamp,
    UpdatedAt: timestamp,
    DeletedAt: null,
    EventType: eventTypes[Math.floor(Math.random() * eventTypes.length)],
    ValidatorAddress: `0x${crypto.randomUUID().replace(/-/g, '').slice(0, 40)}`,
    Fee: (Math.random() * 10).toFixed(4),
    AmountA: (Math.random() * 1000).toFixed(2),
    AmountB: (Math.random() * 1000).toFixed(2),
    FirstTxHash: `0x${crypto.randomUUID().replace(/-/g, '').slice(0, 64)}`,
    SwapTxHash: `0x${crypto.randomUUID().replace(/-/g, '').slice(0, 64)}`,
  };
};

const getSearchEndpoint = (type: SearchType, query: string) => {
  switch (type) {
    case 'trade-id':
      return `https://api1.odx.so/trades/id/${query}`;
    case 'token':
      return `https://api1.odx.so/events/address/${query}`;
    case 'address':
      return `https://api1.odx.so/trades/address/${query}`;
    default:
      throw new Error('Invalid search type');
  }
};

const searchTrades = async (type: SearchType, query: string): Promise<Trade[] | Trade> => {
  try {
    const endpoint = getSearchEndpoint(type, query);
    const res = await axios.get(endpoint);
    return res.data;
  } catch (error) {
    // Return mock data when API call fails
    console.log('Using mock data for search:', type, query);

    if (type === 'trade-id') {
      return generateMockTrade(query);
    }

    // Generate multiple mock trades for address and token searches
    const mockTrades: Trade[] = [];
    const count = Math.floor(Math.random() * 10) + 5; // 5-15 trades

    for (let i = 0; i < count; i++) {
      mockTrades.push(generateMockTrade());
    }

    return mockTrades;
  }
};

export const useTradeSearch = (type: SearchType | null, query: string | null) => {
  return useQuery<Record<string, Trade>>({
    queryKey: ['trade-search', type, query],
    queryFn: async () => {
      if (!type || !query) return {};
      const data = await searchTrades(type, query);
      if (type === 'trade-id') {
        return { [query]: data as Trade };
      }
      const trades: Record<string, Trade> = {};
      for (const trade of data as Trade[]) {
        trades[trade.ID] = trade;
      }
      return trades;
    },
    enabled: !!type && !!query,
    retry: false,
  });
};
