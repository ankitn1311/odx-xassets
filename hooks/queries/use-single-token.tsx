import { useAllTokens } from './use-all-tokens';

export const useSingleToken = (address: string | null) => {
  const allTokensData = useAllTokens();

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
