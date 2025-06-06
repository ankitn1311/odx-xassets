import { useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';
import { useEffect } from 'react';
import { useUserInfo } from './queries/use-user';
import { customToast } from '../utils/toast';
import { shortenAddress } from '../utils/crypto';
import { useWalletStore } from '../stores/wallet-store';
import { useAccount, useDisconnect } from 'wagmi';
import { useWallet } from '@suiet/wallet-kit';
import { toast } from 'sonner';

function isTonConnectSdkError(error: Error | string) {
  const tonConnectError = 'TON_CONNECT_SDK';
  if (typeof error === 'string') {
    return error.includes(tonConnectError);
  }

  return error.message?.includes(tonConnectError);
}

export const useTonWalletSync = () => {
  const tonWalletAddress = useTonAddress();
  const [tonConnect] = useTonConnectUI();
  const { connectWallet, setSelectedWalletType, disconnectWallet } = useWalletStore();
  const { data: userInfo } = useUserInfo();

  useEffect(() => {
    try {
      if (
        tonWalletAddress &&
        userInfo?.BoundConfirmed &&
        userInfo?.AuthAddress &&
        tonWalletAddress !== userInfo?.AuthAddress
      ) {
        customToast({
          message: `You need to connect with ${shortenAddress(userInfo?.AuthAddress)}. Address currently used ${shortenAddress(tonWalletAddress)} is incorrect, disconnecting wallet....`,
          type: 'error',
          duration: 1000,
        });

        setTimeout(() => {
          disconnectWallet();
          tonConnect?.disconnect();
        }, 3000);
        return;
      }
      if (tonWalletAddress) {
        connectWallet('TON', tonWalletAddress);
        setSelectedWalletType('TON');
      }
    } catch (error) {
      console.log('TON WALLET ERROR', error);
    }
  }, [tonWalletAddress, userInfo?.BoundConfirmed, userInfo?.AuthAddress]);

  useEffect(() => {
    window.addEventListener('unhandledrejection', function (rejection: PromiseRejectionEvent) {
      // handle rejection
      if (isTonConnectSdkError(rejection.reason)) return rejection.preventDefault();
    });
    return () => {
      window.removeEventListener('unhandledrejection', function (rejection: PromiseRejectionEvent) {
        // handle rejection
        if (isTonConnectSdkError(rejection.reason)) return rejection.preventDefault();
      });
    };
  }, []);
};

export const useEvmWalletSync = () => {
  const { connectWallet, setSelectedWalletType, disconnectWallet } = useWalletStore();
  const { address: evmAddress } = useAccount();
  const { data: userInfo } = useUserInfo();
  const { disconnect: disconnectEVM } = useDisconnect();

  useEffect(() => {
    if (!userInfo) return;
    console.log('EVM ADDRESS', evmAddress);
    // if (
    //   evmAddress &&
    //   userInfo?.BoundConfirmedEvm &&
    //   userInfo?.AuthAddressEvm &&
    //   evmAddress !== userInfo?.AuthAddressEvm
    // ) {
    //   console.log('=====HERE=====');
    //   toast.error(
    //     `You need to connect with ${shortenAddress(userInfo?.AuthAddressEvm)}. Address currently used ${shortenAddress(evmAddress)} is incorrect, disconnecting wallet....`
    //   );
    //   setTimeout(() => {
    //     disconnectEVM();
    //     disconnectWallet();
    //   }, 3000);
    //   return;
    // }

    if (evmAddress) {
      connectWallet('EVM', evmAddress);
      setSelectedWalletType('EVM');
    }
  }, [evmAddress, userInfo?.BoundConfirmedEvm, userInfo?.AuthAddressEvm]);
};

export const useSuiWalletSync = () => {
  const suiwallet = useWallet();
  const { data: userInfo } = useUserInfo();

  const { selectedWalletType, connectWallet, disconnectWallet } = useWalletStore();
  useEffect(() => {
    const suiAddress = suiwallet.address;
    if (!userInfo) return;
    if (
      suiAddress &&
      userInfo?.BoundConfirmedSui &&
      userInfo?.AuthAddressSui &&
      suiAddress !== userInfo?.AuthAddressSui
    ) {
      customToast({
        message: `You need to connect with ${shortenAddress(userInfo?.AuthAddressSui)}. Address currently used ${shortenAddress(suiAddress)} is incorrect, disconnecting wallet....`,
        type: 'error',
        duration: 1000,
      });

      setTimeout(() => {
        suiwallet.disconnect();
        disconnectWallet();
      }, 3000);
      return;
    }
    if (selectedWalletType === 'SUI' && suiwallet.address && suiwallet.connected) {
      connectWallet('SUI', suiwallet.address);
    }

    if (selectedWalletType === 'SUI' && !suiwallet.connected) {
      disconnectWallet();
    }
  }, [
    suiwallet.address,
    selectedWalletType,
    suiwallet.connected,
    userInfo?.BoundConfirmedSui,
    userInfo?.AuthAddressSui,
  ]);
};
