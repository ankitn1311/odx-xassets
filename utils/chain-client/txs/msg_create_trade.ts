/* eslint-disable */
import _m0 from 'protobufjs/minimal';

export const protobufPackage = 'odx.odx';

export interface MsgCreateTrade {
  sender: string;
  assetIn: string;
  assetOut: string;
  amount: string;
  altId: string;
}

export interface MsgCreateTradeResponse {
  id: string;
}

function createBaseMsgCreateTrade(): MsgCreateTrade {
  return { sender: '', assetIn: '', assetOut: '', amount: '', altId: '' };
}

export const MsgCreateTrade = {
  encode(message: MsgCreateTrade, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.sender !== '') {
      writer.uint32(10).string(message.sender);
    }
    if (message.assetIn !== '') {
      writer.uint32(18).string(message.assetIn);
    }
    if (message.assetOut !== '') {
      writer.uint32(26).string(message.assetOut);
    }
    if (message.amount !== '') {
      writer.uint32(34).string(message.amount);
    }
    if (message.altId !== '') {
      writer.uint32(42).string(message.altId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgCreateTrade {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateTrade();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.sender = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.assetIn = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.assetOut = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.amount = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.altId = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MsgCreateTrade {
    return {
      sender: isSet(object.sender) ? String(object.sender) : '',
      assetIn: isSet(object.assetIn) ? String(object.assetIn) : '',
      assetOut: isSet(object.assetOut) ? String(object.assetOut) : '',
      amount: isSet(object.amount) ? String(object.amount) : '',
      altId: isSet(object.altId) ? String(object.altId) : '',
    };
  },

  toJSON(message: MsgCreateTrade): unknown {
    const obj: any = {};
    if (message.sender !== '') {
      obj.sender = message.sender;
    }
    if (message.assetIn !== '') {
      obj.assetIn = message.assetIn;
    }
    if (message.assetOut !== '') {
      obj.assetOut = message.assetOut;
    }
    if (message.amount !== '') {
      obj.amount = message.amount;
    }
    if (message.altId !== '') {
      obj.altId = message.altId;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgCreateTrade>, I>>(base?: I): MsgCreateTrade {
    return MsgCreateTrade.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgCreateTrade>, I>>(object: I): MsgCreateTrade {
    const message = createBaseMsgCreateTrade();
    message.sender = object.sender ?? '';
    message.assetIn = object.assetIn ?? '';
    message.assetOut = object.assetOut ?? '';
    message.amount = object.amount ?? '';
    message.altId = object.altId ?? '';
    return message;
  },
};

function createBaseMsgCreateTradeResponse(): MsgCreateTradeResponse {
  return { id: '' };
}

export const MsgCreateTradeResponse = {
  encode(message: MsgCreateTradeResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgCreateTradeResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateTradeResponse();
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

  fromJSON(object: any): MsgCreateTradeResponse {
    return { id: isSet(object.id) ? String(object.id) : '' };
  },

  toJSON(message: MsgCreateTradeResponse): unknown {
    const obj: any = {};
    if (message.id !== '') {
      obj.id = message.id;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgCreateTradeResponse>, I>>(
    base?: I
  ): MsgCreateTradeResponse {
    return MsgCreateTradeResponse.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgCreateTradeResponse>, I>>(
    object: I
  ): MsgCreateTradeResponse {
    const message = createBaseMsgCreateTradeResponse();
    message.id = object.id ?? '';
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
