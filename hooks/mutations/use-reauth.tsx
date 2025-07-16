import { AXIOS, baseURL } from '@/utils/axiosConfig';
import { useMutation } from '@tanstack/react-query';
import { MutationConfig } from './types';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import { InviteSchema } from '@/app/(other)/invite/redeem-invite';
import { AxiosError } from 'axios';

export async function reauth() {
  return await AXIOS({
    url: `${baseURL}/auth2/reauth`,
    method: 'get',
  });
}

export const useReauth = (config?: MutationConfig<InviteSchema>) => {
  return useMutation({
    mutationFn: () => reauth(),
    onSuccess: data => {
      toast.loading('Verified', {
        description: 'Redirecting to dashboard...',
      });
      Cookies.set('auth_token', data);
      // push('/trade');
      window.location.reload();
    },
    onError: (error: AxiosError) => {
      toast.error((error?.response?.data as string) || 'Something went wrong');
      config?.mutationOptions?.onError?.(error);
    },
  });
};
