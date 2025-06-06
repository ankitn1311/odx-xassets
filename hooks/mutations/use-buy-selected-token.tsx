import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MutationConfig } from './types';
import { toast } from 'sonner';
import { buyTokenEvm, sellTokenEvm } from '@/utils/chain-client/txs/create_trade';
import { WalletClient } from 'viem';
import { useAddPoints } from './use-add-points';
import { useUserInfo } from '@/hooks/queries/use-user';

export type SwapTokenType = {
  wallet: WalletClient;
  assetIn: string;
  assetOut: string;
  amount: string;
  altId?: string;
};
export type SellTokenType = {
  wallet: WalletClient;
  assetIn: string;
  assetInDecimals: number;
  assetOut: string;
  amount: string;
};

export type BuyTokenType = {
  wallet: WalletClient;
  assetOut: string;
  assetIn: string;
  assetInDecimals: number;
  amount: string;
};

export const useBuyTokens = (config?: MutationConfig<any>) => {
  const queryClient = useQueryClient();
  const addPointsMutation = useAddPoints();
  const { data: userInfo } = useUserInfo();

  return useMutation({
    mutationFn: (data: BuyTokenType) => buyTokenEvm(data),
    onSuccess: result => {
      toast.success('Trade successful', {
        description: (
          <a
            href={`https://testnet.sonicscan.org/tx/${result.hash}`}
            target="_blank"
            rel="noreferrer"
          >
            View on Sonicscan
          </a>
        ),
      });
      queryClient.invalidateQueries({ queryKey: ['balances'] });

      if (userInfo?.Email) {
        addPointsMutation.mutate({
          tx_hash: result.hash,
          email: userInfo.Email,
        });
      }
    },
    onError: (error: any) => {
      if (error?.action && error?.action === 'estimateGas') {
        toast.error('Insufficient balance');
      } else {
        console.log({ error });
        toast.error('RPC Error, try reducing the amount');
      }
      if (error?.response?.status === 401) {
        toast.error('Please refresh the page to continue. Your session needs to be renewed.');
      }
      config?.mutationOptions?.onError?.(error);
    },
  });
};

export const useSellTokens = (config?: MutationConfig<any>) => {
  const queryClient = useQueryClient();
  const addPointsMutation = useAddPoints();
  const { data: userInfo } = useUserInfo();

  return useMutation({
    mutationFn: (data: SellTokenType) => sellTokenEvm(data),
    onSuccess: result => {
      toast.success('Trade successful', {
        description: (
          <a
            href={`https://testnet.sonicscan.org/tx/${result.hash}`}
            target="_blank"
            rel="noreferrer"
          >
            View on Sonicscan
          </a>
        ),
      });
      queryClient.invalidateQueries({ queryKey: ['balances'] });

      if (userInfo?.Email) {
        addPointsMutation.mutate({
          tx_hash: result.hash,
          email: userInfo.Email,
        });
      }
    },
    onError: (error: any) => {
      console.log({ error });
      if (error?.action && error?.action === 'estimateGas') {
        toast.error('Insufficient balance');
      } else {
        toast.error('RPC Error, try reducing the amount');
      }
      if (error?.response?.status === 401) {
      }
      config?.mutationOptions?.onError?.(error);
    },
  });
};
