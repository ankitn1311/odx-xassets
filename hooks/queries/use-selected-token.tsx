import { useSearchParams } from 'next/navigation';
import { useSingleToken } from './use-single-token';

export const useSelectedToken = () => {
  const searchParams = useSearchParams();

  const tokenAddress = searchParams.get('token');

  return useSingleToken(tokenAddress);
};
