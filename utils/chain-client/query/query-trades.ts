import { PageRequest } from '../common/pagination';
import { query } from './query';
import {
  QueryAllTrades,
  QueryAllTradesResponse,
  QueryTrade,
  QueryTradeResponse,
  QueryTradesByOwner,
  QueryTradesByOwnerResponse,
} from './query-types';
import {
  Query_AllTrades_FullMethodName,
  Query_Trade_FullMethodName,
  Query_TradesByOwner_FullMethodName,
} from './service-paths';

export async function queryTradesByOwner(odxAddress: string): Promise<QueryTradesByOwnerResponse> {
  const msg = QueryTradesByOwner.fromPartial({ owner: odxAddress });
  const msgBytes = QueryTradesByOwner.encode(msg).finish();
  const res = await query(Query_TradesByOwner_FullMethodName, msgBytes);
  return QueryTradesByOwnerResponse.decode(res);
}

export async function queryTrade(id: string): Promise<QueryTradeResponse> {
  const msg = QueryTrade.fromPartial({ id: id });
  const msgBytes = QueryTrade.encode(msg).finish();
  const res = await query(Query_Trade_FullMethodName, msgBytes);
  return QueryTradeResponse.decode(res);
}

export async function queryAllTrades(limit: number): Promise<QueryAllTradesResponse> {
  const msg = QueryAllTrades.fromPartial({
    pagination: PageRequest.fromPartial({ reverse: true, limit: limit, countTotal: true }),
  });
  const msgBytes = QueryAllTrades.encode(msg).finish();
  const res = await query(Query_AllTrades_FullMethodName, msgBytes);
  return QueryAllTradesResponse.decode(res);
}
