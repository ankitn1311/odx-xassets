import { useMutation } from '@tanstack/react-query';
import { MutationConfig } from './types';
import { toast } from 'sonner';
import { api } from '@/utils/axiosConfig';

export type AddPointsData = {
  tx_hash: string;
  email: string;
};

const addPoints = async (data: AddPointsData) => {
  const res = await api.AXIOS(
    {
      method: 'POST',
      url: '/trade/v1/p',
      data: {
        tx_hash: data.tx_hash,
        email: data.email,
      },
    },
    'pricefeed'
  );
  return res.data;
};

export const useAddPoints = (config?: MutationConfig<any>) => {
  return useMutation({
    mutationFn: (data: AddPointsData) => addPoints(data),
    onError: (error: any) => {
      toast.error('Daily points limit reached');
      config?.mutationOptions?.onError?.(error);
    },
  });
};
