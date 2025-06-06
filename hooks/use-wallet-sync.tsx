import { useEffect } from 'react';
import { useWalletStore } from '../stores/wallet-store';
import { useAccount } from 'wagmi';

export const useEvmWalletSync = () => {
  const { connectWallet, setSelectedWalletType } = useWalletStore();
  const { address: evmAddress } = useAccount();

  useEffect(() => {
    if (evmAddress) {
      connectWallet('EVM', evmAddress);
      setSelectedWalletType('EVM');
    }
  }, [evmAddress, connectWallet, setSelectedWalletType]);
};
