import { useTokenSwapStore } from '@/stores/token-swap-store';

export const useSingleToken = (address: string | null) => {
  const { allTokens } = useTokenSwapStore();
  const allTokensData = { data: allTokens, isLoading: false };

  if (allTokensData.isLoading) {
    return {
      data: undefined,
      isLoading: true,
    };
  }

  const token = address
    ? allTokensData.data?.find(tokenPair => tokenPair.TokenA.Address === address)
    : allTokensData.data?.[0];

  return {
    data: token,
    isLoading: false,
  };
};
