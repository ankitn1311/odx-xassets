import { useEffect } from 'react';
import { useUserInfo } from './queries/use-user';
import { customToast } from '../utils/toast';
import { shortenAddress } from '../utils/crypto';
import { useWalletStore } from '../stores/wallet-store';
import { useAccount, useDisconnect } from 'wagmi';
import { toast } from 'sonner';

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
