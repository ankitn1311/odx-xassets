import { useSelectedToken } from './use-selected-token';
import { useTokenBalance } from './use-token-balance';

// export const useSelectedTokenBalance = () => {
//   const { data: allBalances, isLoading: allBalancesLoading } = useBalances();

//   const { data: selectedToken, isLoading: selectedTokenLoading } = useSelectedToken();
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

//   const selectedTokenBalance = parseFloat(
//     formatUnits(
//       allBalances?.find(balance => balance.denom.toLowerCase() === selectedTokenDenom)?.amount ||
//         '0',
//       selectedToken?.BaseDecimals || 6
//     )
//   ).toFixed(2);

//   return {
//     data: selectedTokenBalance,
//     isLoading: allBalancesLoading || selectedTokenLoading,
//   };
// };

export const useSelectedTokenBalance = () => {
  const { data: selectedToken, isLoading: selectedTokenLoading } = useSelectedToken();

  const { data: balance, isLoading } = useTokenBalance(
    selectedToken?.TokenB.Address || '',
    selectedToken?.TokenB.Decimals || 18
  );

  return {
    data: balance,
    isLoading: selectedTokenLoading || isLoading,
  };
};
