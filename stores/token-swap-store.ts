import { create } from 'zustand';
import { TokenInfo } from '@/hooks/queries/use-all-tokens';
import { persist } from 'zustand/middleware';

export enum TradeState {
  INITIAL = 'INITIAL',
  APPROVAL = 'APPROVAL',
  REVIEW = 'REVIEW',
  CHECKING_APPROVAL = 'CHECKING_APPROVAL',
  PROCESSING = 'PROCESSING',
  APPROVED = 'APPROVED',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
}

interface TokenSwapState {
  numericBalance: number;
  inputToken: TokenInfo | null;
  outputToken: TokenInfo | null;
  isSwapped: boolean;
  tradeState: TradeState;
  isApproved: boolean;
}

interface TokenSwapActions {
  setNumericBalance: (balance: number) => void;
  setInputToken: (token: TokenSwapState['inputToken']) => void;
  setOutputToken: (token: TokenSwapState['outputToken']) => void;
  swapTokens: () => void;
  setTradeState: (state: TradeState) => void;
  setIsApproved: (isApproved: boolean) => void;
  resetTradeState: () => void;
  latestTradeHash: string;
  setLatestTradeHash: (hash: string) => void;
}

export const useTokenSwapStore = create<TokenSwapState & TokenSwapActions>(
  // persist<TokenSwapState & TokenSwapActions>(
  set => ({
    numericBalance: 0,
    inputToken: null,
    outputToken: null,
    isSwapped: false,
    tradeState: TradeState.INITIAL,
    isApproved: false,
    latestTradeHash: '',
    setNumericBalance: (balance: number) => set({ numericBalance: balance }),
    setInputToken: (token: TokenSwapState['inputToken']) => set({ inputToken: token }),
    setOutputToken: (token: TokenSwapState['outputToken']) => set({ outputToken: token }),
    swapTokens: () =>
      set(state => ({
        inputToken: state.outputToken,
        outputToken: state.inputToken,
        isSwapped: !state.isSwapped,
      })),
    setTradeState: (state: TradeState) => set({ tradeState: state }),
    setIsApproved: (isApproved: boolean) => set({ isApproved }),
    resetTradeState: () => set({ tradeState: TradeState.INITIAL }),
    setLatestTradeHash: (hash: string) => set({ latestTradeHash: hash }),
    //   {
    //     name: 'token-swap-store',
    //   }
    // )
  })
);
