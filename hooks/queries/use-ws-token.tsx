import { useAllTokens } from './use-all-tokens';

export const useWsToken = () => {
  const { data: tokens } = useAllTokens();

  const wsToken = tokens?.find(token => token.TokenB.Name === 'wS');

  return wsToken?.TokenB.Address;
};
