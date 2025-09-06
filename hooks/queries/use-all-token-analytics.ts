import { useTokensSupply } from './use-token-supply';

export function useTotalAnalytics() {
  const { data: allSupplyData, isLoading } = useTokensSupply();

  const totalTVL =
    allSupplyData?.reduce((sum, data) => {
      const tvl = data?.totalSupplyUSD ? parseFloat(data.totalSupplyUSD) : 0;
      return sum + tvl;
    }, 0) || 0;

  return {
    totalTVL,
    isLoading,
  };
}
