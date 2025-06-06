/* eslint-disable */
import _m0 from 'protobufjs/minimal';
import { PageRequest, PageResponse } from '../common/pagination';
import { Trade } from './type-trade';

export const protobufPackage = 'odx.odx';

export interface QueryTrade {
  id: string;
}

export interface QueryTradeResponse {
  trade: Trade | undefined;
}

export interface QueryTradesByOwner {
  owner: string;
}

export interface QueryTradesByOwnerResponse {
  trades: Trade[];
}

export interface QueryTradesByStatus {
  status: number;
}

export interface QueryTradesByStatusResponse {
  tradeIds: string[];
}

export interface QueryAllTrades {
  pagination: PageRequest | undefined;
}

export interface QueryAllTradesResponse {
  trades: Trade[];
  pagination: PageResponse | undefined;
}

function createBaseQueryTrade(): QueryTrade {
  return { id: '' };
}

export const QueryTrade = {
  encode(message: QueryTrade, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): QueryTrade {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryTrade();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.id = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): QueryTrade {
    return { id: isSet(object.id) ? String(object.id) : '' };
  },

  toJSON(message: QueryTrade): unknown {
    const obj: any = {};
    if (message.id !== '') {
      obj.id = message.id;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<QueryTrade>, I>>(base?: I): QueryTrade {
    return QueryTrade.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<QueryTrade>, I>>(object: I): QueryTrade {
    const message = createBaseQueryTrade();
    message.id = object.id ?? '';
    return message;
  },
};

function createBaseQueryTradeResponse(): QueryTradeResponse {
  return { trade: undefined };
}

export const QueryTradeResponse = {
  encode(message: QueryTradeResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.trade !== undefined) {
      Trade.encode(message.trade, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): QueryTradeResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryTradeResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.trade = Trade.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): QueryTradeResponse {
    return {
      trade: isSet(object.trade) ? Trade.fromJSON(object.trade) : undefined,
    };
  },

  toJSON(message: QueryTradeResponse): unknown {
    const obj: any = {};
    if (message.trade !== undefined) {
      obj.trade = Trade.toJSON(message.trade);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<QueryTradeResponse>, I>>(base?: I): QueryTradeResponse {
    return QueryTradeResponse.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<QueryTradeResponse>, I>>(object: I): QueryTradeResponse {
    const message = createBaseQueryTradeResponse();
    message.trade =
      object.trade !== undefined && object.trade !== null
        ? Trade.fromPartial(object.trade)
        : undefined;
    return message;
  },
};

function createBaseQueryTradesByOwner(): QueryTradesByOwner {
  return { owner: '' };
}

export const QueryTradesByOwner = {
  encode(message: QueryTradesByOwner, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.owner !== '') {
      writer.uint32(10).string(message.owner);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): QueryTradesByOwner {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryTradesByOwner();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.owner = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): QueryTradesByOwner {
    return { owner: isSet(object.owner) ? String(object.owner) : '' };
  },

  toJSON(message: QueryTradesByOwner): unknown {
    const obj: any = {};
    if (message.owner !== '') {
      obj.owner = message.owner;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<QueryTradesByOwner>, I>>(base?: I): QueryTradesByOwner {
    return QueryTradesByOwner.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<QueryTradesByOwner>, I>>(object: I): QueryTradesByOwner {
    const message = createBaseQueryTradesByOwner();
    message.owner = object.owner ?? '';
    return message;
  },
};

function createBaseQueryTradesByOwnerResponse(): QueryTradesByOwnerResponse {
  return { trades: [] };
}

export const QueryTradesByOwnerResponse = {
  encode(
    message: QueryTradesByOwnerResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.trades) {
      Trade.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): QueryTradesByOwnerResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryTradesByOwnerResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.trades.push(Trade.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): QueryTradesByOwnerResponse {
    return {
      trades: Array.isArray(object?.trades) ? object.trades.map((e: any) => Trade.fromJSON(e)) : [],
    };
  },

  toJSON(message: QueryTradesByOwnerResponse): unknown {
    const obj: any = {};
    if (message.trades?.length) {
      obj.trades = message.trades.map(e => Trade.toJSON(e));
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<QueryTradesByOwnerResponse>, I>>(
    base?: I
  ): QueryTradesByOwnerResponse {
    return QueryTradesByOwnerResponse.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<QueryTradesByOwnerResponse>, I>>(
    object: I
  ): QueryTradesByOwnerResponse {
    const message = createBaseQueryTradesByOwnerResponse();
    message.trades = object.trades?.map(e => Trade.fromPartial(e)) || [];
    return message;
  },
};

function createBaseQueryTradesByStatus(): QueryTradesByStatus {
  return { status: 0 };
}

export const QueryTradesByStatus = {
  encode(message: QueryTradesByStatus, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.status !== 0) {
      writer.uint32(8).int32(message.status);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): QueryTradesByStatus {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryTradesByStatus();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.status = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): QueryTradesByStatus {
    return { status: isSet(object.status) ? Number(object.status) : 0 };
  },

  toJSON(message: QueryTradesByStatus): unknown {
    const obj: any = {};
    if (message.status !== 0) {
      obj.status = Math.round(message.status);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<QueryTradesByStatus>, I>>(base?: I): QueryTradesByStatus {
    return QueryTradesByStatus.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<QueryTradesByStatus>, I>>(
    object: I
  ): QueryTradesByStatus {
    const message = createBaseQueryTradesByStatus();
    message.status = object.status ?? 0;
    return message;
  },
};

function createBaseQueryTradesByStatusResponse(): QueryTradesByStatusResponse {
  return { tradeIds: [] };
}

export const QueryTradesByStatusResponse = {
  encode(
    message: QueryTradesByStatusResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.tradeIds) {
      writer.uint32(10).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): QueryTradesByStatusResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryTradesByStatusResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.tradeIds.push(reader.string());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): QueryTradesByStatusResponse {
    return {
      tradeIds: Array.isArray(object?.tradeIds) ? object.tradeIds.map((e: any) => String(e)) : [],
    };
  },

  toJSON(message: QueryTradesByStatusResponse): unknown {
    const obj: any = {};
    if (message.tradeIds?.length) {
      obj.tradeIds = message.tradeIds;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<QueryTradesByStatusResponse>, I>>(
    base?: I
  ): QueryTradesByStatusResponse {
    return QueryTradesByStatusResponse.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<QueryTradesByStatusResponse>, I>>(
    object: I
  ): QueryTradesByStatusResponse {
    const message = createBaseQueryTradesByStatusResponse();
    message.tradeIds = object.tradeIds?.map(e => e) || [];
    return message;
  },
};

function createBaseQueryAllTrades(): QueryAllTrades {
  return { pagination: undefined };
}

export const QueryAllTrades = {
  encode(message: QueryAllTrades, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.pagination !== undefined) {
      PageRequest.encode(message.pagination, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): QueryAllTrades {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryAllTrades();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.pagination = PageRequest.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): QueryAllTrades {
    return {
      pagination: isSet(object.pagination) ? PageRequest.fromJSON(object.pagination) : undefined,
    };
  },

  toJSON(message: QueryAllTrades): unknown {
    const obj: any = {};
    if (message.pagination !== undefined) {
      obj.pagination = PageRequest.toJSON(message.pagination);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<QueryAllTrades>, I>>(base?: I): QueryAllTrades {
    return QueryAllTrades.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<QueryAllTrades>, I>>(object: I): QueryAllTrades {
    const message = createBaseQueryAllTrades();
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageRequest.fromPartial(object.pagination)
        : undefined;
    return message;
  },
};

function createBaseQueryAllTradesResponse(): QueryAllTradesResponse {
  return { trades: [], pagination: undefined };
}

export const QueryAllTradesResponse = {
  encode(message: QueryAllTradesResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.trades) {
      Trade.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.pagination !== undefined) {
      PageResponse.encode(message.pagination, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): QueryAllTradesResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryAllTradesResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.trades.push(Trade.decode(reader, reader.uint32()));
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.pagination = PageResponse.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): QueryAllTradesResponse {
    return {
      trades: Array.isArray(object?.trades) ? object.trades.map((e: any) => Trade.fromJSON(e)) : [],
      pagination: isSet(object.pagination) ? PageResponse.fromJSON(object.pagination) : undefined,
    };
  },

  toJSON(message: QueryAllTradesResponse): unknown {
    const obj: any = {};
    if (message.trades?.length) {
      obj.trades = message.trades.map(e => Trade.toJSON(e));
    }
    if (message.pagination !== undefined) {
      obj.pagination = PageResponse.toJSON(message.pagination);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<QueryAllTradesResponse>, I>>(
    base?: I
  ): QueryAllTradesResponse {
    return QueryAllTradesResponse.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<QueryAllTradesResponse>, I>>(
    object: I
  ): QueryAllTradesResponse {
    const message = createBaseQueryAllTradesResponse();
    message.trades = object.trades?.map(e => Trade.fromPartial(e)) || [];
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageResponse.fromPartial(object.pagination)
        : undefined;
    return message;
  },
};

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin
  ? T
  : T extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T extends ReadonlyArray<infer U>
      ? ReadonlyArray<DeepPartial<U>>
      : T extends {}
        ? { [K in keyof T]?: DeepPartial<T[K]> }
        : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin
  ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & {
      [K in Exclude<keyof I, KeysOfUnion<P>>]: never;
    };

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
