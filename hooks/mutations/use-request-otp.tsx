import { RequestOTPSchema } from '@/components/login/request-otp';
import { AXIOS, baseURL } from '@/utils/axiosConfig';
import { useMutation } from '@tanstack/react-query';
import { MutationConfig } from './types';
import { toast } from 'sonner';
import { useDialogStore } from '@/stores/dialog-store';
import VerifyOTP from '@/components/login/verify-otp';

export async function requestOTP(data: RequestOTPSchema) {
  return await AXIOS({
    url: `${baseURL}/auth2/request-otp`,
    method: 'POST',
    data: {
      email: data.email.toLowerCase(),
    },
  });
}

export const useRequestOtp = (config?: MutationConfig<RequestOTPSchema>) => {
  const { open, close } = useDialogStore();

  return useMutation({
    mutationFn: (data: RequestOTPSchema) => requestOTP(data),
    onSuccess: data => {
      toast.success('OTP sent to the email');
      close();
      open({
        title: 'OTP Verification',
        component: <VerifyOTP />,
        size: 'md',
      });
      config?.mutationOptions?.onSuccess?.(data);
    },
    onError: error => {
      toast.error('Server error, try again later');
      config?.mutationOptions?.onError?.(error);
    },
  });
};
