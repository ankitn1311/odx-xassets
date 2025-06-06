import { ethers } from 'ethers';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type WalletType = 'BRC20' | 'EVM' | 'WEB3AUTH' | 'TON' | 'SUI';

export type WalletState = {
  privateKey?: string | null;
  privateWallet?: ethers.Wallet;
  connectedWallet?: string | null;
  connectWalletType?: WalletType | null;
  selectedWalletType?: WalletType;
  walletModalOpen?: boolean;
  menuOpen?: boolean;
  signingMessage?: boolean;
};

export type WalletActions = {
  setWallet: (walletAddress: string | null) => void;
  setPrivateWallet: (wallet: { privateKey: string; wallet: ethers.Wallet }) => void;
  disconnectWallet: () => void;
  connectWallet: (walletType: WalletType, walletAddress: string | null) => void;
  setWalletType: (walletType: WalletType) => void;
  setSelectedWalletType: (walletType: WalletType) => void;
  setWalletModalOpen: (open: boolean) => void;
  setMenuOpen: (open: boolean) => void;
  setSigningMessage: (signing: boolean) => void;
};

export type WalletStore = WalletState & WalletActions;

export const defaultInitState: WalletState = {
  connectWalletType: 'EVM',
  selectedWalletType: 'EVM',
};

export const useWalletStore = create(
  persist<WalletStore>(
    set => ({
      ...defaultInitState,
      setWallet: (walletAddress: string | null) => set(() => ({ connectedWallet: walletAddress })),
      setPrivateWallet: (wallet: { privateKey: string; wallet: ethers.Wallet }) =>
        set(() => ({
          privateWallet: wallet.wallet,
          privateKey: wallet.privateKey,
        })),
      disconnectWallet: () => set(() => ({ connectedWallet: null, connectWalletType: null })),
      setWalletType: (walletType: WalletType) => set(() => ({ connectWalletType: walletType })),
      connectWallet: (walletType: WalletType, walletAddress: string | null) =>
        set(() => ({
          connectedWallet: walletAddress,
          connectWalletType: walletType,
        })),
      setSelectedWalletType: (walletType: WalletType) =>
        set(() => ({ selectedWalletType: walletType })),
      setWalletModalOpen: (open: boolean) => set(() => ({ walletModalOpen: open })),
      setMenuOpen: (open: boolean) => set(() => ({ menuOpen: open })),
      setSigningMessage: (signing: boolean) => set(() => ({ signingMessage: signing })),
    }),
    {
      name: 'wallet-ordinox',
    }
  )
);
