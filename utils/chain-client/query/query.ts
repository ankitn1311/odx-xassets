import { QueryClient, StargateClient } from '@cosmjs/stargate';
import { Tendermint34Client } from '@cosmjs/tendermint-rpc';
import { GRPC_ADDR } from '../txs/registry';

export const query = async (servicePath: string, msgBytes: Uint8Array): Promise<Uint8Array> => {
  const tmClient = await Tendermint34Client.connect(GRPC_ADDR);
  const q = new QueryClient(tmClient);
  const response = await q.queryAbci(servicePath, msgBytes);
  return response.value;
};
