import { Registry } from '@cosmjs/proto-signing';
import { MsgRequestFaucet } from './msg_request_facuet';
import { MsgCreateTrade } from './msg_create_trade';
import { SigningStargateClient } from '@cosmjs/stargate';
import { ethers } from 'ethers';

// Constants
export const CHAIN_ID = 'odx';
export const GRPC_ADDR = process.env.NEXT_PUBLIC_ODX_RPC!;
export const WS_ADDR = process.env.NEXT_PUBLIC_ODX_WS!;
// MSG TYPES
export const REQUEST_FAUCET_TYPE_URL = '/odx.odx.MsgRequestFaucet';
export const CREATE_TRADE_TYPE_URL = '/odx.odx.MsgCreateTrade';

// Registry
export const registry = new Registry();
registry?.register(REQUEST_FAUCET_TYPE_URL, MsgRequestFaucet);
registry?.register(CREATE_TRADE_TYPE_URL, MsgCreateTrade);

// export const getTurnkeyWallet = async (
//   authIframeClient: TurnkeyIframeClient,
//   wallet: TurnkeyWallet,
//   chainName: string
// ) => {
//   if (chainName === 'evm') {
//     return new ethers.providers.Web3Provider(wallet as any);
//     // return new TurnkeySigner({
//     //   // @ts-expect-error - TurnkeyIframeClient is not compatible with TurnkeyServerClient
//     //   client: authIframeClient,
//     //   organizationId: wallet.subOrgId,
//     //   signWith: wallet.ethAddress,
//     // });
//   }
//   return TurnkeyDirectWallet.init({
//     config: {
//       client: authIframeClient,
//       organizationId: wallet.subOrgId,
//       signWith: wallet.uncompressedAddress,
//     },
//     prefix: 'odx',
//   });
// };

// export const getSigningClient = async (tkWallet: TurnkeyDirectWallet) => {
//   return SigningStargateClient.connectWithSigner(
//     GRPC_ADDR,
//     // @ts-expect-error - TurnkeyDirectWallet is not compatible with DirectSecp256k1Wallet
//     tkWallet,
//     { registry }
//   );
// };
