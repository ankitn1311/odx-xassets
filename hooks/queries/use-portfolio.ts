import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { useAccount, useWalletClient } from 'wagmi';
import { useTokenSwapStore } from '@/stores/token-swap-store';
import { getBalance, getBalanceWithProvider } from '@/utils/chain-client/txs/create_trade';
import { useMarketRows } from './use-market-rows';

const TESTNET_CHAIN_ID = 57054;

/**
 * Value of the connected wallet's xAsset and USDC holdings at live prices, with the
 * 24h change implied by each asset's 24h move. Shares query keys with useTokenBalance.
 */
export function usePortfolio() {
  const { address: user, chainId, isConnected } = useAccount();
  const { data: wallet } = useWalletClient();
  const { allTokens } = useTokenSwapStore();
  const { rows } = useMarketRows();
  const isTestnet = chainId === TESTNET_CHAIN_ID;
  const net = isTestnet ? 'testnet' : 'mainnet';

  // USDC appears as TokenA on every pair; hold it once.
  const usdc = allTokens[0]?.TokenA;
  const tokens = [...allTokens.map(t => t.TokenB), ...(usdc ? [usdc] : [])];

  const balances = useQueries({
    queries: tokens.map(t => ({
      queryKey: ['token-balance', t.Address, t.Decimals, user, net],
      queryFn: () =>
        isTestnet
          ? getBalance(wallet, t.Address, t.Decimals)
          : getBalanceWithProvider(t.Address, user!, t.Decimals),
      enabled: isTestnet ? !!wallet && !!t.Address : !!user && !!t.Address,
    })),
  });

  return useMemo(() => {
    let value = 0;
    let change = 0;
    const holdings = tokens.map((t, i) => {
      const balance = Number(balances[i]?.data ?? 0);
      const isUsdc = t.Name === 'USDC';
      const row = rows.find(r => r.symbol === t.Name);
      const price = isUsdc ? 1 : row?.price ?? 0;
      const changeUsd = isUsdc ? 0 : row?.changeUsd ?? 0;
      value += balance * price;
      change += balance * changeUsd;
      return { symbol: t.Name, balance, price, value: balance * price };
    });
    const previous = value - change;
    return {
      isConnected,
      isLoading: balances.some(b => b.isLoading),
      value,
      change24h: change,
      change24hPct: previous > 0 ? change / previous : 0,
      holdings: holdings.filter(h => h.balance > 0),
    };
  }, [tokens, balances, rows, isConnected]);
}
