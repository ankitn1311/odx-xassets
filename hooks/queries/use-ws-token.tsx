import { useTokenSwapStore } from '@/stores/token-swap-store';

export const useWsToken = () => {
  const { allTokens } = useTokenSwapStore();

  const wsToken = allTokens?.find(token => token.TokenB.Name === 'wS');

  return wsToken?.TokenB.Address;
};
