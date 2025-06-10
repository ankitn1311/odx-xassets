import { getUser } from '@/apis/users';
import { useQuery } from '@tanstack/react-query';

export const useUserInfo = (username?: string) => {
  return useQuery({
    queryKey: ['user', username || 'me'],
    queryFn: () => getUser(username || 'me'),
    retry: false,
    staleTime: Infinity,
    enabled: false,
  });
};
