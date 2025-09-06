import { BuyTokenType, SellTokenType } from '@/hooks/mutations/use-buy-selected-token';
import { DEX_ADDRESS } from '@/lib/constants';
import { ethers } from 'ethers';
import { createWalletClient, custom, erc20Abi } from 'viem';
import SwapAbi from '@/utils/chain-client/abis/SwapAbi.json';
import { formatUnits } from 'ethers/lib/utils';
import { removeTrailingZeros } from '@/lib/utils';
import { SONIC_RPC_URL, sonicProvider } from '@/utils/chain-client/common/provider';

/**
 * Buy a token using the user's wallet
 * @param wallet - The wallet to use
 * @param assetOut - The asset to buy
 * @param amount - The amount to buy
 */
export const buyTokenEvm = async ({
  wallet,
  assetIn,
  assetInDecimals,
  assetOut,
  amount,
}: BuyTokenType) => {
  const provider = new ethers.providers.JsonRpcProvider(SONIC_RPC_URL);
  const account = await wallet.getAddresses();
  const connectedSigner = provider.getSigner(account[0]);

  const assetContract = new ethers.Contract(assetIn, erc20Abi, connectedSigner);

  // Check current allowance before approving
  const currentAllowance = await assetContract.allowance(account[0], DEX_ADDRESS);
  const requiredAmount = ethers.utils.parseUnits(amount, assetInDecimals);
  if (Number(currentAllowance) < Number(requiredAmount)) {
    const approveTx = await assetContract.approve(DEX_ADDRESS, ethers.constants.MaxUint256); // Approve max to save gas on future trades
    const approveTxRes = await approveTx.wait();
  }

  const dexContract = new ethers.Contract(
    DEX_ADDRESS,
    [
      'function getQuote(address,address,uint256) view returns (uint256)',
      'function swap(address,address,uint256,uint256) returns (uint256)',
    ],
    connectedSigner
  );
  const slippageBps = 100;

  const quote = await dexContract.getQuote(assetIn, assetOut, requiredAmount);
  const amountOutMin = quote.mul(10000 - slippageBps).div(10000);
  const data = await dexContract.swap(assetIn, assetOut, requiredAmount, amountOutMin);
  return data;
};

/**
 * Sell a token using the user's wallet
 * @param wallet - The wallet to use
 * @param assetIn - The asset to sell
 * @param amount - The amount to sell
 */
export const sellTokenEvm = async ({
  wallet,
  assetIn, // the asset to sell
  assetInDecimals,
  assetOut, // the asset to buy
  amount,
}: SellTokenType) => {
  const provider = new ethers.providers.JsonRpcProvider(SONIC_RPC_URL);
  const account = await wallet.getAddresses();
  const connectedSigner = provider.getSigner(account[0]);

  const assetContract = new ethers.Contract(assetIn, erc20Abi, connectedSigner);

  const currentAllowance = await assetContract.allowance(account[0], DEX_ADDRESS);
  const requiredAmount = ethers.utils.parseUnits(amount, assetInDecimals);

  if (Number(currentAllowance) < Number(requiredAmount)) {
    const approveTx = await assetContract.approve(DEX_ADDRESS, ethers.constants.MaxUint256);
    const approveTxRes = await approveTx.wait();
  }

  // const assetFactoryContract = new ethers.Contract(
  //   assetFactoryAddress, // 0xDdd65132D3BC0F10AF425EC0DfD1B0Eaf72F8C15
  //   SONIC_ASSET_FACTORY_ABI,
  //   connectedSigner
  // );

  // Create ODXDEX contract instance
  const dexContract = new ethers.Contract(
    DEX_ADDRESS,
    [
      'function getQuote(address,address,uint256) view returns (uint256)',
      'function swap(address,address,uint256,uint256) returns (uint256)',
    ],
    connectedSigner
  );
  const slippageBps = 100;

  const quote = await dexContract.getQuote(assetIn, assetOut, requiredAmount);

  const amountOutMin = quote.mul(10000 - slippageBps).div(10000);

  const data = await dexContract.swap(assetIn, assetOut, requiredAmount, amountOutMin);
  return data;
};

export const getQuote = async ({
  wallet,
  assetIn,
  assetOut,
  amount,
}: {
  wallet: any;
  assetIn: string;
  assetOut: string;
  amount: number;
}) => {
  try {
    // Use the JSON RPC provider instead of wallet-based provider for read operations
    const dexContract = new ethers.Contract(DEX_ADDRESS, SwapAbi, sonicProvider);
    const formattedAmount = ethers.utils.parseUnits(amount.toString(), 18);
    const quote = await dexContract.getQuote(assetIn, assetOut, formattedAmount);
    return quote;
  } catch (error) {
    console.error('Error getting quote:', error);
    return 0;
  }
};

/**
 * Get the balance of a token using the user's wallet
 * @param wallet - The wallet to use
 * @returns The balance of the token
 */
export const getBalance = async (wallet: any, tokenAddress: string, decimals: number) => {
  // Create a provider and signer using wallet client
  const walletClient = createWalletClient({
    transport: custom(wallet.transport),
  });
  const provider = new ethers.providers.JsonRpcProvider(SONIC_RPC_URL);

  const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, provider);

  const balances = await tokenContract.balanceOf(wallet.account.address);
  const balance = balances ? parseFloat(formatUnits(balances, decimals)).toString() : '0';

  return removeTrailingZeros(balance);
};

/**
 * Get the balance of a token using the JSON RPC provider (no wallet required)
 * @param tokenAddress - The token contract address
 * @param userAddress - The user's wallet address
 * @param decimals - The token decimals
 * @returns The balance of the token
 */
export const getBalanceWithProvider = async (
  tokenAddress: string,
  userAddress: string,
  decimals: number
) => {
  try {
    const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, sonicProvider);
    const balances = await tokenContract.balanceOf(userAddress);
    // convert test balance to BigNumber
    let balance = '0';

    if (balances) {
      const formatted = formatUnits(balances, decimals);
      // Work directly with the formatted string to avoid scientific notation
      const removedTrailingZeros = removeTrailingZeros(formatted, 8);
      balance = removedTrailingZeros !== '' ? removedTrailingZeros : '0';
    }

    return balance;
  } catch (error) {
    console.error('Error getting balance with provider:', error);
    return '0';
  }
};

export const sonicBalance = async (wallet: any) => {
  const provider = new ethers.providers.JsonRpcProvider(SONIC_RPC_URL);
  const balance = await provider.getBalance(wallet.account.address);
  return balance;
};

/**
 * Get Sonic balance using the JSON RPC provider (no wallet required)
 * @param userAddress - The user's wallet address
 * @returns The Sonic balance
 */
export const getSonicBalanceWithProvider = async (userAddress: string) => {
  try {
    const balance = await sonicProvider.getBalance(userAddress);
    return balance;
  } catch (error) {
    console.error('Error getting Sonic balance with provider:', error);
    return ethers.BigNumber.from(0);
  }
};
