import { AXIOS, baseURL } from '@/utils/axiosConfig';
import { useMutation } from '@tanstack/react-query';
import { MutationConfig } from './types';
import { toast } from 'sonner';
import { VerifyOTPSchema } from '@/components/login/verify-otp';
import Cookies from 'js-cookie';
import { useDialogStore } from '@/stores/dialog-store';
import { useAppStore } from '@/stores/app-store';
import { ethers } from 'ethers';

export async function verifyOTP(data: VerifyOTPSchema) {
  return await AXIOS({
    url: `${baseURL}/auth2/verify-otp`,
    method: 'POST',
    data: {
      email: data.email.toLowerCase(),
      otp: data.otp,
    },
  });
}

export const useVerifyOtp = (config?: MutationConfig<VerifyOTPSchema>) => {
  const { close } = useDialogStore();
  const { setLoginEmail, privateKey, setPrivateKey } = useAppStore();

  return useMutation({
    mutationFn: (data: VerifyOTPSchema) => verifyOTP(data),
    onSuccess: data => {
      toast.success('Verified');
      if (!privateKey) {
        const wallet = ethers.Wallet.createRandom();
        setPrivateKey(wallet.privateKey);
        toast.info('Wallet Created');
      }
      Cookies.set('auth_token', data);
      close();
      setLoginEmail('');
      window.location.reload();
      config?.mutationOptions?.onSuccess?.(data);
    },
    onError: error => {
      toast.error('Server error, try again later');
      config?.mutationOptions?.onError?.(error);
    },
  });
};
