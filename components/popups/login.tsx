'use client';
import React from 'react';
import RequestOTP from '../login/request-otp';
import { Button } from '../ui/button';
import useAuthToken from '@/hooks/use-auth';
import { useDialogStore } from '@/stores/dialog-store';
import { useAppStore } from '@/stores/app-store';

export default function Login() {
  const { privateKey, setPrivateKey, setLoginEmail } = useAppStore();

  const { open } = useDialogStore();

  {
    /*const createWallet = () => {
    const wallet = ethers.Wallet.createRandom();
    setPrivateKey(wallet.privateKey);
  };

  const rF = () => {
    requestFaucet(privateKey!);
  };
  */
  }

  return (
    <>
      <Button
        variant="secondary"
        onClick={() => {
          open({
            title: 'Login to your ODX account',
            component: <RequestOTP />,
            size: 'md',
          });
          setLoginEmail('');
        }}
      >
        Log in
      </Button>
      <Button
        onClick={() => {
          open({
            title: 'Welcome to ODX',
            component: <RequestOTP />,
            size: 'md',
          });
          setLoginEmail('');
        }}
      >
        Sign up
      </Button>
    </>
  );
}
