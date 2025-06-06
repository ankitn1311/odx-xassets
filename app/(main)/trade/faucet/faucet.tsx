'use client';
import Authenticated from '@/components/common/authenticated';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useFaucet } from '@/hooks/mutations/use-faucet';
import { useUserInfo } from '@/hooks/queries/use-user';
import { useWalletStore } from '@/stores/wallet-store';
import { toast } from 'sonner';
import Cookies from 'js-cookie';

export default function Faucet() {
  const faucetMutation = useFaucet();
  const { connectedWallet } = useWalletStore();
  const { data: userInfo } = useUserInfo();

  return (
    <Card className="Available-Balances flex flex-col gap-2 bg-gradient-to-br from-accent/10 via-accent/0 to-card p-2">
      <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-md p-4 text-center">
        <p className="text-sm font-semibold text-accent">USDT.x Faucet</p>
        <p className="text-xs text-secondary-foreground">
          Request faucet to receive USDT.x token to your wallet balance.
        </p>
      </div>
      <Authenticated>
        <div className="flex justify-center gap-2">
          <Button
            className="w-full"
            size="sm"
            variant="accent"
            disabled={faucetMutation.isPending}
            isLoading={faucetMutation.isPending}
            onClick={async () => {
              return toast.info(
                'We are currently upgrading our xAssets platform to bring you an even better experience. Please check back soon!'
              );
              // if (!connectedWallet) return toast.error('Please connect your wallet');
              // if (!userInfo?.Email) return toast.error('Please login to your account');
              // const authToken = Cookies.get('auth_token');
              // faucetMutation.mutate({
              //   ethAddress: connectedWallet!,
              //   email: userInfo?.Email,
              //   token: authToken!,
              // });
            }}
          >
            {faucetMutation.isPending ? 'Requesting' : 'Request'}
          </Button>
        </div>
      </Authenticated>
    </Card>
  );
}
