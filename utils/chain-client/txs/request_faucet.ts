import { MsgRequestFaucet } from './msg_request_facuet';
// import { RequestFaucetMutationType } from '@/hooks/mutations/use-faucet';
// import { getTurnkeyWallet, REQUEST_FAUCET_TYPE_URL } from './registry';
//import { signAndBroadcast } from './broadcast';
import { ethers } from 'ethers';
import { FAUCET_ADDRESSES } from '@/utils/crypto';
// import { TurnkeySigner } from '@turnkey/ethers';
import SONIC_TARGET_ROUTER_ABI from '@/utils/chain-client/abis/SonicTargetRouterAbi.json';
import SONIC_ASSET_FACTORY_ABI from '@/utils/chain-client/abis/SonicAssetFactoryAbi.json';
import SONIC_TOKEN_ABI from '@/utils/chain-client/abis/SonicRouterAbi.json';
import { erc20Abi } from 'viem';
import { assetFactoryAddress, targetRouterAddress, xUSDTAddress } from './constants';

/*
 * TODO:
 apporve will be called on token contract
 
 deposit will be called on target router contract
 
 withdraw will be called on asset factory contract
 
 for selling -> asset factory
*/

// Request faucet drip for the user's turnkey account
// export const requestFaucetTurnkey = async ({
//   wallet,
//   authIframeClient,
// }: RequestFaucetMutationType) => {
//   const turnkeywallet = (await getTurnkeyWallet(
//     authIframeClient,
//     wallet,
//     'odx'
//   )) as TurnkeyDirectWallet;
//   const odxAccount = (await turnkeywallet.getAccounts())[0];
//   const odxAddress = odxAccount.address;

//   const messagePayload = MsgRequestFaucet.fromPartial({
//     sender: odxAddress,
//   });

//   const msg = {
//     typeUrl: REQUEST_FAUCET_TYPE_URL,
//     value: messagePayload,
//   };

//   const broadcastRes = await signAndBroadcast({
//     msg,
//     tkWallet: turnkeywallet,
//     odxAccountData: odxAccount,
//   });

//   console.log({ broadcastRes });

//   return { hash: '', tx: new Uint8Array() };
// };

// Request faucet drip for the user's turnkey account on EVM chains
// export const requestFaucetEthTurnkey = async ({
//   wallet,
//   authIframeClient,
// }: RequestFaucetMutationType) => {
//   const turnkeySigner = await getTurnkeyWallet(authIframeClient, wallet, 'evm');

//   // Create a provider (using Infura as an example)
//   const provider = new ethers.providers.JsonRpcProvider(SONIC_RPC_URL);

//   const connectedSigner = (turnkeySigner as any).connect(provider);

//   // Create a contract instance
//   const xUSDTContract = new ethers.Contract(xUSDTAddress, erc20Abi, connectedSigner);

//   console.log({ targetRouterAddress, assetFactoryAddress });

//   const approveTx = await xUSDTContract.approve(
//     targetRouterAddress,
//     ethers.utils.parseUnits('10', 6)
//   );
//   const approveTxRes = await approveTx.wait();
//   console.log({ approveTxRes });

//   const targetRouterContract = new ethers.Contract(
//     targetRouterAddress,
//     SONIC_TARGET_ROUTER_ABI,
//     connectedSigner
//   );

//   const depositTx = await targetRouterContract.deposit(
//     'BASE', // targetChainId
//     xUSDTAddress, // token address
//     6, // decimals (assuming 6 for USDT)
//     false, // isNative (false for USDT)
//     ethers.utils.parseUnits('10', 6),
//     '0x7Abc10792A56ceDd3d9d311F1D58ACcf520eb985'
//   );
//   const depositTxRes = await depositTx.wait();
//   console.log({ depositTxRes });
// };
