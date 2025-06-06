// import { DirectSecp256k1Wallet, Registry } from "@cosmjs/proto-signing";
// import { SigningStargateClient } from "@cosmjs/stargate";
// import { fromHex } from "@cosmjs/encoding";
// import { MsgRequestFaucet } from "../txs/msg_request_facuet";
// import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
//
// const CHAIN_ID = "odx";
// const GRPC_ADDR = "http://0.0.0.0:26657";
// const TYPE_URL = "/odx.odx.MsgRequestFaucet";
//
// const registry = new Registry();
// registry.register(TYPE_URL, MsgRequestFaucet);
//
// export const getAccount = async (privateKey: string) => {
//   // const wallet = await DirectSecp256k1HdWallet.(mnemonic);
//   const pk = privateKey.split("0x")[1];
//   console.log("PRVIATE", pk);
//   const pk2 = fromHex(pk);
//   const wallet = await DirectSecp256k1Wallet.fromKey(pk2, "odx");
//   const [firstAccount] = await wallet.getAccounts();
//   const address = firstAccount.address;
//   const signingClient = await SigningStargateClient.connectWithSigner(
//     GRPC_ADDR,
//     wallet,
//     { registry },
//   );
//
//   const messagePayload: MsgRequestFaucet = {
//     sender: address,
//   };
//
//   const msg = {
//     typeUrl: TYPE_URL,
//     value: messagePayload,
//   };
//
//   const fee = {
//     amount: [],
//     gas: "0",
//   };
//
//   const signed = await signingClient.sign(
//     address,
//     [msg],
//     fee,
//     "Sending MsgSendCmd",
//     {
//       chainId: CHAIN_ID,
//       sequence: 0,
//       accountNumber: 0,
//     },
//   );
//   await signingClient.getAccount(address);
//   const w = TxRaw.encode(signed).finish();
//   const result = await signingClient.broadcastTx(w);
//   console.log("Broadcast result:", result);
// };
