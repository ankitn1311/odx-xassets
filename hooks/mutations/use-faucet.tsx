import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MutationConfig } from './types';
import { toast } from 'sonner';
import { api } from '@/utils/axiosConfig';

export type RequestFaucetData = {
  email: string;
  ethAddress: string;
  token: string;
};

const requestFaucet = async (data: RequestFaucetData) => {
  const res = await api.AXIOS(
    {
      method: 'POST',
      url: '/fa',
      data: {
        token: data.token,
        email: data.email,
        address: data.ethAddress,
      },
    },
    'pricefeed'
  );
  console.log('RES', res);
  return res;
};

export const useFaucet = (config?: MutationConfig<any>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RequestFaucetData) => requestFaucet(data),
    onSuccess: response => {
      queryClient.invalidateQueries({ queryKey: ['balances'] });
      queryClient.invalidateQueries({ queryKey: ['token-balance'] });
      console.log('RESPONSe', response);
      const txHash = response;
      toast.success('Faucet request successful!', {
        description: (
          <a
            // href={`https://testnet.sonicscan.org/tx/${txHash}`}
            href={`https://sonicscan.org/tx/${txHash}`}
            target="_blank"
            rel="noreferrer"
            className="text-primary underline hover:text-primary/80"
          >
            View on Sonicscan
          </a>
        ),
      });
    },
    onError: (error: any) => {
      console.log('ERROR', error);
      if (error.response?.data === 'Please wait 24hrs before each faucet claim') {
        toast.info('Please wait 24hrs before each faucet claim');
      } else {
        toast.error('Something went wrong');
      }
      config?.mutationOptions?.onError?.(error);
    },
  });
};
