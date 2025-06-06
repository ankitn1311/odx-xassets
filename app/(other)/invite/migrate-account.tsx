'use client';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import ConnectWallet from '@/components/common/connect-wallet';
import { useWalletStore } from '@/stores/wallet-store';
import { Button } from '@/components/ui/button';
import { useRef, useState } from 'react';
import { remove0xFromAddress, shortenAddress } from '@/utils/crypto';
import { walletConnectedProperly } from '@/utils/helper';
import { useWallet } from '@suiet/wallet-kit';
import { useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';
import { useAccount, useDisconnect, useSignMessage } from 'wagmi';
import { toast } from 'sonner';
import { AXIOS, baseURL } from '@/utils/axiosConfig';
import axios from 'axios';
import { TonSignature, useTonSignMessage } from '@/hooks/use-ton-sign-message';
import { useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { LogOut } from 'lucide-react';
import { useUserInfo } from '@/hooks/queries/use-user';
import { Separator } from '@/components/ui/separator';

export default function MigrateAccount() {
  const { connectedWallet, connectWalletType, disconnectWallet } = useWalletStore();
  const [migrating, setMigrating] = useState(false);
  const authMessageRef = useRef<string | Uint8Array | null>(null);
  const { data: userInfo } = useUserInfo();
  const email = userInfo?.Email;

  const queryClient = useQueryClient();
  const token = Cookies.get('auth_token');

  const suiwallet = useWallet();
  const suiAddress = suiwallet.address;
  const tonAddress = useTonAddress();
  const { disconnect: disconnectEVM } = useDisconnect();
  const [tonConnect] = useTonConnectUI();
  const { address: evmAddress } = useAccount();

  const { signMessage } = useSignMessage({
    mutation: {
      onSuccess(sig) {
        verifySignedMessage(sig, 'EVM');
      },
      onError(error: any) {
        setMigrating(false);
        console.log('ERROR', error);
        toast.error(
          error?.response?.data || error?.response?.message || 'User rejected the request',
          { id: 'home' }
        );
      },
    },
  });
  const { signTonMessage, clearTonSignMessage } = useTonSignMessage({
    id: 'home',
    onSignatureSubmit(tonSignature) {
      if (tonSignature.signature) toast.loading('Verifying signature...', { id: 'home' });
      if (!tonSignature.signature) {
        toast.error('Signature is empty', { id: 'home' });

        setMigrating(false);
      }
      verifySignedMessage(tonSignature, 'TON');
    },
    onSubmitError(message) {
      setMigrating(false);
    },
  });

  const disconnectWalletHandler = () => {
    const disconnectTONWallet = () => {
      try {
        disconnectWallet();
        if (tonAddress) tonConnect.disconnect();
      } catch (error) {
        console.error('Error disconnecting wallet', error);
      }
    };

    const disconnectEVMWallet = () => {
      try {
        disconnectWallet();
        disconnectEVM();
      } catch (error) {
        console.error('Error disconnecting wallet', error);
      }
    };

    const disconnectSUIWallet = async () => {
      try {
        await suiwallet?.disconnect();
      } catch (error) {
        console.error('Error disconnecting wallet', error);
      }
    };
    switch (connectWalletType) {
      case 'TON':
        disconnectTONWallet();
        break;
      case 'EVM':
        disconnectEVMWallet();
        break;
      case 'SUI':
        disconnectSUIWallet();
        break;
    }
  };

  const verifySignedMessage = async (
    sig: TonSignature | string,
    walletType: 'TON' | 'EVM' | 'SUI'
  ) => {
    let body;
    // body = {
    //   address: connectedWallet,
    //   ...signature,
    //   signature: ''
    // };
    if (walletType === 'TON') {
      const signature = sig as TonSignature;
      body = {
        address: connectedWallet,
        ...signature,
        signature: '',
        signature_type: 'TON',
      };
    } else if (walletType === 'EVM') {
      body = {
        auth_msg: authMessageRef.current,
        signature: remove0xFromAddress(sig as string),
        address: connectedWallet,
        signature_type: 'EVM',
      };
    } else if (walletType === 'SUI') {
      body = {
        auth_msg: authMessageRef.current,
        signature: sig as string,
        signature_type: 'SUI',
        address: connectedWallet,
      };
    }
    try {
      if (
        !walletConnectedProperly({
          connectedWallet: connectedWallet!,
          connectedWalletType: connectWalletType!,
          tonAddress: tonAddress!,
          evmAddress: evmAddress!,
          suiAddress: suiAddress!,
        })
      ) {
        toast.error('Please connect your wallet properly or restart app!', {
          id: 'home',
        });
        disconnectWallet();
        if (tonAddress) {
          tonConnect.disconnect();
        }
        if (evmAddress) {
          disconnectEVM();
        }
        if (suiAddress) {
          suiwallet.disconnect();
        }
        clearTonSignMessage();
        return;
      }
      const verifyResponse: any = await axios({
        url: `${baseURL}/auth2/address/verify`,
        method: 'POST',
        data: body,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const walletTokenResponse: any = await axios({
        url: `${baseURL}/auth2/reauth`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const walletToken = walletTokenResponse.data;
      Cookies.set('auth_token', walletToken);
      if (connectWalletType === 'TON') {
        clearTonSignMessage();
      }
      await queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.loading('Successfully migrated account!', {
        description: 'Redirecting to dashboard...',
        id: 'home',
      });
      setMigrating(false);
      // router.push('/trade');
      window.location.reload();
    } catch (error: any) {
      setMigrating(false);
      console.log('DISMISSING TOAST');
      toast.dismiss('home');
      console.log('ERROR', error);
      toast.error(
        typeof error?.response?.data === 'string' ? error?.response?.data : 'Something went wrong!',
        {
          description: 'The address you are trying to migrate is already migrated.',
        }
      );
    }
  };

  const migrateAccount = async () => {
    setMigrating(true);
    try {
      if (
        !walletConnectedProperly({
          connectedWallet: connectedWallet!,
          connectedWalletType: connectWalletType!,
          tonAddress: tonAddress!,
          evmAddress: evmAddress!,
          suiAddress: suiwallet.address!,
        })
      ) {
        toast.error('Please reconnect your wallet. The message signing was interrupted.', {
          id: 'home',
        });
        disconnectWallet();
        setMigrating(false);
        if (evmAddress) disconnectEVM();
        if (tonAddress) tonConnect.disconnect();
        if (suiAddress) return;
      }
      const response = await AXIOS({
        url: `/auth2/address/authmsg?address=${connectedWallet}&sig_type=${connectWalletType}`,
      });
      toast.loading('Signing message...', {
        id: 'home',
      });
      // sign message using signMessageAsync and send the  stringified response as the message
      const stringifiedResponse = JSON.stringify(response);
      if (connectWalletType === 'TON') {
        authMessageRef.current = response;
        signTonMessage(response);
      } else if (connectWalletType === 'EVM') {
        authMessageRef.current = response;
        signMessage({ message: response });
      } else if (connectWalletType === 'SUI') {
        const message = new TextEncoder().encode(response);
        authMessageRef.current = response;
        const suiresponse = await suiwallet.signPersonalMessage({
          message,
        });
        verifySignedMessage(suiresponse.signature, 'SUI');
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error?.response?.data;
        if (
          errorMessage === 'Not Found' ||
          errorMessage?.includes?.('user not found with address')
        ) {
          toast.dismiss('home');
          toast.info('User not found with the address', {
            description: 'Please try again with a different address',
            id: 'home',
          });
          setMigrating(false);
          // window.location.href = `${baseURL}/auth/twitter`;
        } else {
          toast.error(error?.response?.data.message ?? 'Something went wrong!', {
            id: 'home',
          });
          setMigrating(false);
        }
      } else {
        toast.error('Something went wrong!', {
          id: 'home',
        });
        setMigrating(false);
      }
    }
  };

  const logout = async () => {
    Cookies.remove('auth_token');
    localStorage.removeItem('sessionExpiry');
    queryClient.invalidateQueries({ queryKey: ['user'] });
    window.location.reload();
  };

  return (
    <Card className="max-w-lg px-2 py-4 md:p-10">
      <div className={cn('flex flex-col items-center gap-6')}>
        <div className="flex flex-col items-center gap-1">
          <h3 className="text-center text-xl text-foreground">Migrate account</h3>
          <p className="text-center text-base text-muted-foreground">
            V1 users need to migrate their accounts to retain access to their points
          </p>
        </div>
        {connectedWallet ? (
          <div className="flex w-full flex-col gap-14">
            <div className="flex w-full flex-col gap-4">
              <Button
                disabled={migrating}
                isLoading={migrating}
                onClick={() => !migrating && migrateAccount()}
                className="w-full"
              >
                {migrating ? 'Migrating...' : 'Migrate'}
              </Button>
              <Button
                size="lg"
                className="group flex w-full items-center justify-center gap-2 border border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive"
                variant="ghost"
                onClick={disconnectWalletHandler}
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="font-medium">Disconnect Wallet</span>
                  <span className="text-sm text-muted-foreground">
                    {shortenAddress(connectedWallet!)}
                  </span>
                </div>
              </Button>
            </div>
            <Separator />
            <div className="flex w-full flex-col items-center gap-2 rounded-lg bg-muted/50 p-4 text-base">
              {email && (
                <div className="flex w-full flex-col items-center gap-2 rounded-lg bg-muted/50 p-4">
                  <p className="text-muted-foreground">Current Email</p>
                  <p className="font-medium">{email}</p>
                  <p className="text-center text-muted-foreground">
                    To change your email, please logout and sign in with a different account
                  </p>
                </div>
              )}
              <Button
                size="lg"
                className="group flex w-full items-center justify-center gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                variant="ghost"
                onClick={logout}
              >
                <div className="flex flex-row items-center gap-2">
                  <LogOut className="size-[1.2rem]" />
                  <span>Logout</span>
                </div>
              </Button>
            </div>
          </div>
        ) : (
          <ConnectWallet loginUI />
        )}

        {/* <Tabs
          defaultValue="using-wallet"
          className="w-full flex flex-col items-center"
        >
          <TabsList className="">
            <TabsTrigger value="using-wallet">Using Wallet</TabsTrigger>
            <TabsTrigger value="using-twitter">Using Twitter</TabsTrigger>
          </TabsList>
          <TabsContent value="using-wallet" className="w-full py-6">
            {connectedWallet ? (
              <div className="flex flex-col gap-4 w-full">
                <Button
                  disabled={migrating}
                  onClick={() => !migrating && migrateAccount()}
                  className="w-full"
                >
                  {migrating ? "Migrating..." : "Migrate"}
                </Button>
                <Button
                  size="lg"
                  className="flex items-center w-full gap-2 group text-destructive hover:text-destructive hover:bg-destructive/20"
                  variant="ghost"
                  onClick={disconnectWalletHandler}
                >
                  <p>DISCONNECT</p>
                  <p className="inline-block text-xs text-zinc-300 ">
                    {shortenAddress(connectedWallet!)}
                  </p>
                </Button>
              </div>
            ) : (
              <ConnectWallet loginUI />
            )}
          </TabsContent>
          <TabsContent value="using-twitter">
            <ComingSoon />
          </TabsContent>
        </Tabs>
*/}
      </div>
    </Card>
  );
}
