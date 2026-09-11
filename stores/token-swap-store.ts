import { create } from 'zustand';
import { ALL_V2_TOKEN_PAIRS, TokenInfo, TokenPair } from '@/hooks/queries/use-all-tokens';

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
  selectedXAsset: TokenInfo | null;
  isSwapped: boolean;
  tradeState: TradeState;
  isApproved: boolean;
  quoteLoading: boolean;
  activeTab: TabState;
  isBalanceUpdating: boolean;
  /** The swap card is being used as the Redeem page: sell only, "Burn" button. */
  redeemMode: boolean;
}

interface TokenSwapActions {
  setNumericBalance: (balance: number) => void;
  setInputToken: (token: TokenSwapState['inputToken']) => void;
  setOutputToken: (token: TokenSwapState['outputToken']) => void;
  setSelectedXAsset: (token: TokenSwapState['selectedXAsset']) => void;
  swapTokens: () => void;
  setTradeState: (state: TradeState) => void;
  setIsApproved: (isApproved: boolean) => void;
  resetTradeState: () => void;
  latestTradeHash: string;
  setLatestTradeHash: (hash: string) => void;
  setQuoteLoading: (loading: boolean) => void;
  setActiveTab: (tab: TabState) => void;
  setAllTokens: (tokens: TokenPair[]) => void;
  setIsBalanceUpdating: (updating: boolean) => void;
  setRedeemMode: (on: boolean) => void;
}

export const useTokenSwapStore = create<TokenSwapState & TokenSwapActions>(
  // persist<TokenSwapState & TokenSwapActions>(
  set => ({
    allTokens: ALL_V2_TOKEN_PAIRS,
    numericBalance: 0,
    inputToken: null,
    outputToken: null,
    selectedXAsset: null,
    isSwapped: false,
    tradeState: TradeState.INITIAL,
    isApproved: false,
    quoteLoading: false,
    latestTradeHash: '',
    activeTab: TabState.BUY,
    isBalanceUpdating: false,
    redeemMode: false,
    setNumericBalance: (balance: number) => set({ numericBalance: balance }),
    setInputToken: (token: TokenSwapState['inputToken']) => set({ inputToken: token }),
    setOutputToken: (token: TokenSwapState['outputToken']) => set({ outputToken: token }),
    setSelectedXAsset: (token: TokenSwapState['selectedXAsset']) => set({ selectedXAsset: token }),
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
    setAllTokens: (tokens: TokenPair[]) => set({ allTokens: tokens }),
    setIsBalanceUpdating: (updating: boolean) => set({ isBalanceUpdating: updating }),
    setRedeemMode: (on: boolean) => set({ redeemMode: on }),
    //   {
    //     name: 'token-swap-store',
    //   }
    // )
  })
);
