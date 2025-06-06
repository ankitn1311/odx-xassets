/* eslint-disable */
import _m0 from 'protobufjs/minimal';

export const protobufPackage = 'odx.odx';

export interface MsgRequestFaucet {
  sender: string;
}

function createBaseMsgRequestFaucet(): MsgRequestFaucet {
  return { sender: '' };
}

export const MsgRequestFaucet = {
  encode(message: MsgRequestFaucet, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.sender !== '') {
      writer.uint32(10).string(message.sender);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgRequestFaucet {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgRequestFaucet();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.sender = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MsgRequestFaucet {
    return { sender: isSet(object.sender) ? String(object.sender) : '' };
  },

  toJSON(message: MsgRequestFaucet): unknown {
    const obj: any = {};
    if (message.sender !== '') {
      obj.sender = message.sender;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgRequestFaucet>, I>>(base?: I): MsgRequestFaucet {
    return MsgRequestFaucet.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgRequestFaucet>, I>>(object: I): MsgRequestFaucet {
    const message = createBaseMsgRequestFaucet();
    message.sender = object.sender ?? '';
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
