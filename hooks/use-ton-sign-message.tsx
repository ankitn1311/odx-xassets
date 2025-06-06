import {
  useIsConnectionRestored,
  useTonAddress,
  useTonConnectModal,
  useTonConnectUI,
  useTonWallet,
} from '@tonconnect/ui-react';
import { useEffect, useState } from 'react';
import { useWalletStore } from '../stores/wallet-store';
import { useUserInfo } from './queries/use-user';
import { customToast } from '@/utils/toast';
import { shortenAddress } from '../utils/crypto';
import useBoundMismatch from './use-bound-mismatch';

export type TonProof = {
  sig: string;
  address: string;
  state_init: string;
  domain: any;
  timestamp: number;
  network: string;
};

export type TonSignature = {
  auth_msg: string;
  signature: string;
  ton_proof: TonProof;
  raw: string;
};

export const useTonSignMessage = ({
  id,
  onSignatureSubmit,
  onSubmitError,
}: {
  id: string;
  onSignatureSubmit: (signature: TonSignature) => void;
  onSubmitError?: (message: string) => void;
}) => {
  const [message, setMessage] = useState<string | null>(null);
  const [tonSignature, setTonSignature] = useState<TonSignature | null>(null);
  const tonWallet = useTonWallet();
  const tonWalletAddress = useTonAddress();
  const isConnectionRestored = useIsConnectionRestored();
  const [tonConnectUI] = useTonConnectUI();
  const { state } = useTonConnectModal();
  const boundMismatch = useBoundMismatch();

  const { data: userInfo } = useUserInfo();
  const boundAddress = userInfo?.AuthAddress;
  const { setSigningMessage, disconnectWallet, connectWallet } = useWalletStore();

  const boundConfirmed = userInfo?.BoundConfirmed;

  useEffect(() => {
    try {
      if (!isConnectionRestored) return;
      if (!message) return;

      if (!tonWallet && message) {
        tonConnectUI.setConnectRequestParameters({ state: 'loading' });
        tonConnectUI.setConnectRequestParameters({
          state: 'ready',
          value: {
            tonProof: message,
          },
        });
      }

      if (tonWalletAddress) {
        connectWallet('TON', tonWalletAddress);
      }
      if (boundConfirmed && tonWalletAddress && boundAddress && tonWalletAddress !== boundAddress) {
        customToast({
          message: `You need to sign with ${shortenAddress(boundAddress)}. Address currently used ${shortenAddress(tonWalletAddress)} is incorrect`,
          type: 'error',
          id,
          duration: 10000,
        });
        try {
          setSigningMessage(false);
          disconnectWallet();
          tonConnectUI.disconnect();
          clearTonSignMessage();
        } catch (error) {
          console.log('ERROR', error);
        }
        return;
      }
    } catch (error) {
      console.log('ERROR IN TON SIGN MESSGAGE', error);
    }
  }, [tonWallet, message, tonWalletAddress, isConnectionRestored]);

  useEffect(
    () =>
      tonConnectUI.onStatusChange(tonWallet => {
        if (
          boundConfirmed &&
          tonWalletAddress &&
          boundAddress &&
          tonWalletAddress !== boundAddress
        ) {
          customToast({
            message: `You need to sign with ${shortenAddress(boundAddress)}. Address currently used ${shortenAddress(tonWalletAddress)} is incorrect!`,
            type: 'error',
            id,
            duration: 10000,
          });
          try {
            setSigningMessage(false);
            tonConnectUI.disconnect();
            disconnectWallet();
            clearTonSignMessage();
          } catch (error) {
            console.log('ERROR', error);
          }
          return;
        }
        if (
          tonWallet &&
          tonWallet.connectItems?.tonProof &&
          'proof' in tonWallet?.connectItems?.tonProof
        ) {
          const tonProof = (tonWallet?.connectItems?.tonProof as any)?.proof;

          const signature = tonProof?.signature;
          const address = tonWallet.account.address;
          const stateInit = tonWallet.account.walletStateInit;
          const domain = tonProof?.domain.value;
          const timestamp = tonProof?.timestamp;
          const chain = tonWallet?.account.chain;

          setTonSignature({
            auth_msg: message!,
            signature: signature,
            ton_proof: {
              sig: signature,
              address: address,
              state_init: stateInit,
              domain: domain,
              timestamp: timestamp,
              network: chain,
            },
            raw: JSON.stringify(tonWallet),
          });
        }
      }),
    [tonWalletAddress, boundAddress, boundConfirmed]
  );

  const signTonMessage = async (message: string) => {
    setMessage(message);
    try {
      console.log('boundAddress', boundAddress, boundMismatch);
      // if (boundAddress && boundMismatch) {
      //   clearTonSignMessage();
      //   return customToast({
      //     message: `You need to sign with ${shortenAddress(boundAddress!)}. Address currently used ${shortenAddress(tonWalletAddress)} is incorrect!!`,
      //     type: 'error',
      //     id,
      //     duration: 10000
      //   });
      // }
      setSigningMessage(true);
      await tonConnectUI.disconnect();
    } catch (error) {
      console.log('ERROR', error);
    }

    console.log('CONNECTING');
    tonConnectUI.openModal();
  };

  const clearTonSignMessage = () => {
    setMessage(null);
    setTonSignature(null);
    tonConnectUI.setConnectRequestParameters(null);
    setSigningMessage(false);
  };

  useEffect(() => {
    if (tonSignature) {
      try {
        onSignatureSubmit(tonSignature!);
        clearTonSignMessage();
      } catch (error) {
        console.log('ERROR', error);
        clearTonSignMessage();
        onSubmitError?.('Error signing the message');
      }
    }
  }, [tonSignature, boundAddress, boundMismatch, tonWalletAddress]);

  useEffect(() => {
    if (message && state.status === 'closed' && state.closeReason === 'action-cancelled') {
      return;
      customToast({
        message: `Message signing was cancelled. Please reconnect your wallet.`,
        type: 'error',
        id,
      });
      clearTonSignMessage();
      disconnectWallet();
      onSubmitError?.('Message signing was cancelled. Please reconnect your wallet.');
    }
  }, [state, message]);

  return {
    signTonMessage,
    clearTonSignMessage,
    tonSignature,
  };
};
