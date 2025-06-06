/* eslint-disable */
import Long from 'long';
import _m0 from 'protobufjs/minimal';
import { Asset } from '../common/asset';
import { Coin } from '../common/coin';

export const protobufPackage = 'odx.odx';

export enum TradeStatus {
  CREATED = 0,
  PROCESSED = 1,
  COMPLETE = 2,
  FAILED = 3,
  UNKNOWN = 4,
  UNRECOGNIZED = -1,
}

export function tradeStatusFromJSON(object: any): TradeStatus {
  switch (object) {
    case 0:
    case 'CREATED':
      return TradeStatus.CREATED;
    case 1:
    case 'PROCESSED':
      return TradeStatus.PROCESSED;
    case 2:
    case 'COMPLETE':
      return TradeStatus.COMPLETE;
    case 3:
    case 'FAILED':
      return TradeStatus.FAILED;
    case 4:
    case 'UNKNOWN':
      return TradeStatus.UNKNOWN;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return TradeStatus.UNRECOGNIZED;
  }
}

export function tradeStatusToJSON(object: TradeStatus): string {
  switch (object) {
    case TradeStatus.CREATED:
      return 'CREATED';
    case TradeStatus.PROCESSED:
      return 'PROCESSED';
    case TradeStatus.COMPLETE:
      return 'COMPLETE';
    case TradeStatus.FAILED:
      return 'FAILED';
    case TradeStatus.UNKNOWN:
      return 'UNKNOWN';
    case TradeStatus.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED';
  }
}

export interface Trade {
  id: string;
  owner: string;
  size: Coin | undefined;
  outAsset: Asset | undefined;
  status: TradeStatus;
  startHeight: number;
  endHeight: number;
  /** This is after swapping */
  outSize: Coin | undefined;
  outHashes: string[];
}

function createBaseTrade(): Trade {
  return {
    id: '',
    owner: '',
    size: undefined,
    outAsset: undefined,
    status: 0,
    startHeight: 0,
    endHeight: 0,
    outSize: undefined,
    outHashes: [],
  };
}

export const Trade = {
  encode(message: Trade, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id);
    }
    if (message.owner !== '') {
      writer.uint32(18).string(message.owner);
    }
    if (message.size !== undefined) {
      Coin.encode(message.size, writer.uint32(26).fork()).ldelim();
    }
    if (message.outAsset !== undefined) {
      Asset.encode(message.outAsset, writer.uint32(34).fork()).ldelim();
    }
    if (message.status !== 0) {
      writer.uint32(40).int32(message.status);
    }
    if (message.startHeight !== 0) {
      writer.uint32(48).int64(message.startHeight);
    }
    if (message.endHeight !== 0) {
      writer.uint32(56).int64(message.endHeight);
    }
    if (message.outSize !== undefined) {
      Coin.encode(message.outSize, writer.uint32(66).fork()).ldelim();
    }
    for (const v of message.outHashes) {
      writer.uint32(74).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Trade {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTrade();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.id = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.owner = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.size = Coin.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.outAsset = Asset.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.status = reader.int32() as any;
          continue;
        case 6:
          if (tag !== 48) {
            break;
          }

          message.startHeight = longToNumber(reader.int64() as Long);
          continue;
        case 7:
          if (tag !== 56) {
            break;
          }

          message.endHeight = longToNumber(reader.int64() as Long);
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.outSize = Coin.decode(reader, reader.uint32());
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.outHashes.push(reader.string());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Trade {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      owner: isSet(object.owner) ? String(object.owner) : '',
      size: isSet(object.size) ? Coin.fromJSON(object.size) : undefined,
      outAsset: isSet(object.outAsset) ? Asset.fromJSON(object.outAsset) : undefined,
      status: isSet(object.status) ? tradeStatusFromJSON(object.status) : 0,
      startHeight: isSet(object.startHeight) ? Number(object.startHeight) : 0,
      endHeight: isSet(object.endHeight) ? Number(object.endHeight) : 0,
      outSize: isSet(object.outSize) ? Coin.fromJSON(object.outSize) : undefined,
      outHashes: Array.isArray(object?.outHashes)
        ? object.outHashes.map((e: any) => String(e))
        : [],
    };
  },

  toJSON(message: Trade): unknown {
    const obj: any = {};
    if (message.id !== '') {
      obj.id = message.id;
    }
    if (message.owner !== '') {
      obj.owner = message.owner;
    }
    if (message.size !== undefined) {
      obj.size = Coin.toJSON(message.size);
    }
    if (message.outAsset !== undefined) {
      obj.outAsset = Asset.toJSON(message.outAsset);
    }
    if (message.status !== 0) {
      obj.status = tradeStatusToJSON(message.status);
    }
    if (message.startHeight !== 0) {
      obj.startHeight = Math.round(message.startHeight);
    }
    if (message.endHeight !== 0) {
      obj.endHeight = Math.round(message.endHeight);
    }
    if (message.outSize !== undefined) {
      obj.outSize = Coin.toJSON(message.outSize);
    }
    if (message.outHashes?.length) {
      obj.outHashes = message.outHashes;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<Trade>, I>>(base?: I): Trade {
    return Trade.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<Trade>, I>>(object: I): Trade {
    const message = createBaseTrade();
    message.id = object.id ?? '';
    message.owner = object.owner ?? '';
    message.size =
      object.size !== undefined && object.size !== null ? Coin.fromPartial(object.size) : undefined;
    message.outAsset =
      object.outAsset !== undefined && object.outAsset !== null
        ? Asset.fromPartial(object.outAsset)
        : undefined;
    message.status = object.status ?? 0;
    message.startHeight = object.startHeight ?? 0;
    message.endHeight = object.endHeight ?? 0;
    message.outSize =
      object.outSize !== undefined && object.outSize !== null
        ? Coin.fromPartial(object.outSize)
        : undefined;
    message.outHashes = object.outHashes?.map(e => e) || [];
    return message;
  },
};

declare const self: any | undefined;
declare const window: any | undefined;
declare const global: any | undefined;
const tsProtoGlobalThis: any = (() => {
  if (typeof globalThis !== 'undefined') {
    return globalThis;
  }
  if (typeof self !== 'undefined') {
    return self;
  }
  if (typeof window !== 'undefined') {
    return window;
  }
  if (typeof global !== 'undefined') {
    return global;
  }
  throw 'Unable to locate global object';
})();

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

function longToNumber(long: Long): number {
  if (long.gt(Number.MAX_SAFE_INTEGER)) {
    throw new tsProtoGlobalThis.Error('Value is larger than Number.MAX_SAFE_INTEGER');
  }
  return long.toNumber();
}

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
