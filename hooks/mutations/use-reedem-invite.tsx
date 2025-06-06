import { AXIOS, baseURL } from '@/utils/axiosConfig';
import { useMutation } from '@tanstack/react-query';
import { MutationConfig } from './types';
import { toast } from 'sonner';
import { InviteSchema } from '@/app/(other)/invite/redeem-invite';

export async function redeemInvite(data: InviteSchema) {
  return await AXIOS({
    url: `${baseURL}/invite/apply`,
    method: 'POST',
    data: {
      invite_code: data.otp,
    },
  });
}

export const useRedeemInvite = (config?: MutationConfig<InviteSchema>) => {
  return useMutation({
    mutationFn: (data: InviteSchema) => redeemInvite(data),
    onSuccess: data => {
      config?.mutationOptions?.onSuccess?.(data);
    },
    onError: error => {
      toast.error('Invalid invite code');
      config?.mutationOptions?.onError?.(error);
    },
  });
};
