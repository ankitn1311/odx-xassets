import { Wallet } from 'ethers';
import { useSingleToken } from './use-single-token';
import { useQuery } from '@tanstack/react-query';
import { getBalance, getBalanceWithProvider } from '@/utils/chain-client/txs/create_trade';
import { nativeAddressToXAssetAddressMapping } from '@/utils/chain-client/txs/constants';
import { useAccount, useWalletClient } from 'wagmi';
import { formatUnits } from 'ethers/lib/utils';
import { useAppStore } from '@/stores/app-store';
//
// export const useTokenBalance = (address: string) => {
//   const { data: allBalances, isLoading: allBalancesLoading } = useBalances();
//
//   const { data: selectedToken, isLoading: selectedTokenLoading } = useSingleToken(address);
//   // const usdxBalance =
//   //   (Number(
//   //     allBalances?.find((balance) => balance.denom === "odx1/odxusd/usd")
//   //       ?.amount,
//   //   ) ?? 0) /
//   //   10 ** (selectedToken?.QuoteDecimals || 0);
//   //
//   // const usdxBalance = parseUnits(
//   //   allBalances?.find((balance) => balance.denom === "odx1/odxusd/usd")
//   //     ?.amount || "0",
//   //   selectedToken?.QuoteDecimals || 6,
//   // );
//   //
//   const selectedTokenDenom =
//     `${selectedToken?.Chain}/${selectedToken?.BaseSymbol}-${selectedToken?.BaseAddress}/${selectedToken?.BaseSymbol}`?.toLowerCase();
//
//   const selectedTokenBalance = parseFloat(
//     formatUnits(
//       allBalances?.find(balance => balance.denom.toLowerCase() === selectedTokenDenom)?.amount ||
//         '0',
//       selectedToken?.BaseDecimals || 6
//     )
//   ).toFixed(2);
//
//   return {
//     data: selectedTokenBalance,
//     isLoading: allBalancesLoading || selectedTokenLoading,
//   };
// };
//
const TESTNET_CHAIN_ID = 57054;

export const useTokenBalance = (address: string, decimals: number = 18) => {
  const { address: userAddress, chainId } = useAccount();

  const { data: wallet } = useWalletClient();

  const isTestnet = chainId === TESTNET_CHAIN_ID;

  // const xAddress =
  //   nativeAddressToXAssetAddressMapping[
  //     address as keyof typeof nativeAddressToXAssetAddressMapping
  //   ];
  //

  const queryEnabled = isTestnet ? !!wallet && !!address : !!userAddress && !!address;

  const { data, isLoading, isRefetching } = useQuery({
    queryKey: ['token-balance', address, decimals],
    queryFn: () =>
      isTestnet
        ? getBalance(wallet, address, decimals)
        : getBalanceWithProvider(address, userAddress!, decimals),
    enabled: queryEnabled,
  });

  if (!address) return { data: 0, isLoading: false };

  return {
    data: data,
    fullBalance: data,
    isLoading,
    isRefetching,
  };
};
