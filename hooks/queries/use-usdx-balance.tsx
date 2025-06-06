import { xUSDCAddress, XUSDT_DECIMALS } from '@/utils/chain-client/txs/constants';
import { useTokenBalance } from './use-token-balance';

// export const useUsdxBalance = () => {
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

//   const usdxBalance = parseFloat(
//     formatUnits(
//       allBalances?.find(balance => balance.denom === 'odx1/odxusd/usd')?.amount || '0',
//       selectedToken?.QuoteDecimals || 6
//     )
//   ).toFixed(2);

//   // console.log({
//   //   amount: allBalances?.find((balance) => balance.denom === "odx1/odxusd/usd")
//   //     ?.amount,
//   //   quoteDecimal: selectedToken?.QuoteDecimals,
//   //   allBalances,
//   //   selectedToken,
//   // });

//   return {
//     data: usdxBalance,
//     isLoading: allBalancesLoading || selectedTokenLoading,
//   };
// };

export const useUsdxBalance = () => {
  const { data: balance, isLoading } = useTokenBalance(xUSDCAddress, XUSDT_DECIMALS);

  return {
    data: balance,
    isLoading,
  };
};
