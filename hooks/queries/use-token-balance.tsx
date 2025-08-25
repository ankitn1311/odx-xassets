import { Wallet } from 'ethers';
import { useSingleToken } from './use-single-token';
import { useQuery } from '@tanstack/react-query';
import { getBalance, getBalanceWithProvider } from '@/utils/chain-client/txs/create_trade';
import { nativeAddressToXAssetAddressMapping } from '@/utils/chain-client/txs/constants';
import { useAccount, useWalletClient } from 'wagmi';
import { formatUnits } from 'ethers/lib/utils';
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

export const useTokenBalance = (address: string, decimals: number = 18) => {
  const { address: userAddress } = useAccount();

  // const xAddress =
  //   nativeAddressToXAssetAddressMapping[
  //     address as keyof typeof nativeAddressToXAssetAddressMapping
  //   ];

  const { data, isLoading, isRefetching } = useQuery({
    queryKey: ['token-balance', address, decimals],
    queryFn: () => getBalanceWithProvider(address, userAddress!, decimals),
    enabled: !!address && !!userAddress,
  });

  if (!address) return { data: 0, isLoading: false };

  // const balance = data ? parseFloat(formatUnits(data, decimals)).toFixed(2) : '0';

  return {
    data: data,
    fullBalance: data,
    isLoading,
    isRefetching,
  };
};
