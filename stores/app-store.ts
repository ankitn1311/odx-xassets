import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AppState = {
  code?: string | null;
  loginEmail?: string;
  imported_addresses: string[];
  privateKey?: string | null;
  sessionExpiry?: number;
  isBannerVisible?: boolean;
  slippage: number;
  customBaseUrl?: string;
  customWebSocketUrl?: string;
};

export type AppActions = {
  setCode: (code: string | null) => void;
  setLoginEmail: (loginEmail: string) => void;
  setImportedAddress: (address: string) => void;
  setPrivateKey: (privateKey: string) => void;
  setSessionExpiry: (sessionExpiry: number) => void;
  setIsBannerVisible: (isBannerVisible: boolean) => void;
  setSlippage: (slippage: number) => void;
  setCustomBaseUrl: (url: string) => void;
  setCustomWebSocketUrl: (url: string) => void;
  clearCustomBaseUrl: () => void;
  clearCustomWebSocketUrl: () => void;
};

export type AppStore = AppState & AppActions;

export const defaultInitState: AppState = {
  code: null,
  loginEmail: '',
  imported_addresses: [],
  isBannerVisible: false,
  slippage: 0.2,
  customBaseUrl: '',
  customWebSocketUrl: '',
};

export const useAppStore = create(
  persist<AppStore>(
    set => ({
      ...defaultInitState,
      setPrivateKey: (privateKey: string) => set(() => ({ privateKey: privateKey })),
      setCode: (code: string | null) => set(() => ({ code: code })),
      setLoginEmail: (loginEmail: string) => set(() => ({ loginEmail: loginEmail })),
      setSessionExpiry: (sessionExpiry: number) => set(() => ({ sessionExpiry: sessionExpiry })),
      setImportedAddress: (address: string) =>
        set(state => ({
          ...state,
          imported_addresses: state.imported_addresses.includes(address)
            ? state.imported_addresses
            : [...state.imported_addresses, address],
        })),
      setIsBannerVisible: (isBannerVisible: boolean) =>
        set(() => ({ isBannerVisible: isBannerVisible })),
      setSlippage: (slippage: number) => set(() => ({ slippage: slippage })),
      setCustomBaseUrl: (customBaseUrl: string) => set(() => ({ customBaseUrl })),
      clearCustomBaseUrl: () => set(() => ({ customBaseUrl: '' })),
      setCustomWebSocketUrl: (customWebSocketUrl: string) => set(() => ({ customWebSocketUrl })),
      clearCustomWebSocketUrl: () => set(() => ({ customWebSocketUrl: '' })),
    }),
    {
      name: 'app-odx',
    }
  )
);
