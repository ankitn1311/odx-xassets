import { create } from 'zustand';
import { TokenInfo, TokenPair } from '@/hooks/queries/use-all-tokens';
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

export enum TabState {
  BUY = 'BUY',
  SELL = 'SELL',
}

interface TokenSwapState {
  allTokens: TokenPair[];
  numericBalance: number;
  inputToken: TokenInfo | null;
  outputToken: TokenInfo | null;
  isSwapped: boolean;
  tradeState: TradeState;
  isApproved: boolean;
  quoteLoading: boolean;
  activeTab: TabState;
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
  setQuoteLoading: (loading: boolean) => void;
  setActiveTab: (tab: TabState) => void;
}

export const allTokens = [
  {
    TokenA: {
      Name: 'USDC',
      FullName: 'USDC',
      Address: '0x29219dd400f2Bf60E5a23d13Be72B486D4038894',
      Decimals: 6,
    },
    TokenB: {
      Name: 'x1SOL',
      FullName: 'x1SOL',
      Address: '0x40eF79F7f9B0e05e761440B2eC2A6210fc453B1e',
      Decimals: 18,
    },
    Name: 'USDC/x1SOL',
  },
  {
    TokenA: {
      Name: 'USDC',
      FullName: 'USDC',
      Address: '0x29219dd400f2Bf60E5a23d13Be72B486D4038894',
      Decimals: 6,
    },
    TokenB: {
      Name: 'x1XRP',
      FullName: 'x1XRP',
      Address: '0x1B4FEAE9cc60940d1F8745d13527A56c7eb16bCc',
      Decimals: 18,
    },
    Name: 'USDC/x1XRP',
  },
];

export const useTokenSwapStore = create<TokenSwapState & TokenSwapActions>(
  // persist<TokenSwapState & TokenSwapActions>(
  set => ({
    allTokens,
    numericBalance: 0,
    inputToken: null,
    outputToken: null,
    isSwapped: false,
    tradeState: TradeState.INITIAL,
    isApproved: false,
    quoteLoading: false,
    latestTradeHash: '',
    activeTab: TabState.BUY,
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
    setQuoteLoading: (loading: boolean) => set({ quoteLoading: loading }),
    setActiveTab: (tab: TabState) => set({ activeTab: tab }),
    //   {
    //     name: 'token-swap-store',
    //   }
    // )
  })
);
