import { useUserInfo } from '@/hooks/queries/use-user';
import { useWalletStore } from '@/stores/wallet-store';

const useBoundMismatch = () => {
  const { connectedWallet, connectWalletType } = useWalletStore();
  const { data: userInfo } = useUserInfo();

  const boundedTonWallet = userInfo?.AuthAddress;
  const boundedEvmWallet = userInfo?.AuthAddressEvm;
  const boundedSuiWallet = userInfo?.AuthAddressSui;

  const checkBoundMismatch = () => {
    switch (connectWalletType) {
      case 'TON':
        return boundedTonWallet !== connectedWallet;
      case 'EVM':
        return boundedEvmWallet !== connectedWallet;
      case 'SUI':
        return boundedSuiWallet !== connectedWallet;
      default:
        return true;
    }
  };

  const boundMismatch = checkBoundMismatch();

  return boundMismatch;
};

export default useBoundMismatch;
