import { TradeState, useTokenSwapStore, TabState } from '@/stores/token-swap-store';
import { useFormContext } from 'react-hook-form';
import { useEffect, useRef } from 'react';
import { debounce } from 'lodash';
import { useTradeQuote } from '@/hooks/mutations/use-trade-quote';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { SwapBody } from './SwapBody';
import { useTokenBalance } from '@/hooks/queries/use-token-balance';
import { TokenInfo } from '@/hooks/queries/use-all-tokens';
import { SwapFormValues } from './TokenSwapCard';
import { Loader } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Trade } from '@/utils/chain-client/query/type-trade';

export function SwapScreens() {
  const { tradeState, quoteLoading, activeTab } = useTokenSwapStore();
  const isBuy = activeTab === TabState.BUY;
  const queryClient = useQueryClient();

  const {
    watch,
    setValue,
    formState: { isSubmitting },
  } = useFormContext<SwapFormValues>();
  const amount = watch('amount');
  const inputToken = watch('inputToken');
  const outputToken = watch('outputToken');
  const outputAmount = watch('outputAmount');
  const debouncedGetQuoteRef = useRef<ReturnType<typeof debounce> | null>(null);
  const { data: numericBalance, isRefetching: isTokenBalanceRefetching } = useTokenBalance(
    isBuy ? (outputToken?.Address ?? '') : (inputToken?.Address ?? ''),
    isBuy ? (outputToken?.Decimals ?? 18) : (inputToken?.Decimals ?? 18)
  );

  const { getQuote } = useTradeQuote();
  const amountToUse = isBuy ? outputAmount : amount;

  useEffect(() => {
    // Initialize the debounced function
    debouncedGetQuoteRef.current = debounce(
      async (inputToken: TokenInfo, outputToken: TokenInfo, inputAmount: string) => {
        try {
          const quote = await getQuote({
            inputToken,
            outputToken,
            inputAmount,
          });
          if (quote) {
            setValue('outputAmount', quote.toString());
          }
        } catch (error) {
          toast.error('Failed to get quote');
          console.error('Error getting quote:', error);
        }
      },
      500
    );

    // Cleanup function
    return () => {
      if (debouncedGetQuoteRef.current) {
        debouncedGetQuoteRef.current.cancel();
      }
    };
  }, [getQuote, setValue]);

  const getButtonText = () => {
    if (quoteLoading) {
      return 'Fetching quote...';
    }
    if (isTokenBalanceRefetching) {
      return 'Updating balance...';
    }
    if (numericBalance && Number(numericBalance) < Number(amountToUse)) {
      return 'Insufficient Balance';
    }
    switch (tradeState) {
      case TradeState.PROCESSING:
      case TradeState.CHECKING_APPROVAL:
        return 'Processing...';
      case TradeState.APPROVAL:
        return `Approve spending for ${inputToken?.Name}`;
      case TradeState.REVIEW:
        return 'Confirm trade';
      case TradeState.APPROVED:
        return 'Review trade';
      case TradeState.SUCCESS:
        return 'Done';
      case TradeState.FAILED:
        return 'Try Again';
      case TradeState.PENDING:
        return 'Done';
      default:
        return activeTab === TabState.BUY ? 'Buy' : 'Sell';
    }
  };

  const isInsufficientBalance = numericBalance && Number(numericBalance) < Number(amountToUse);
  const isValidAmount = amountToUse && Number(amountToUse) > 0;
  const isInsufficientOutputAmount = Number(outputAmount) === 0;

  useEffect(() => {
    if (tradeState === TradeState.SUCCESS) {
      console.log('UPDATING BALANCE SUCCESS', tradeState);
      // queryClient.invalidateQueries({
      //   queryKey: ['token-balance', inputToken?.Address, inputToken?.Decimals],
      // });
      // queryClient.invalidateQueries({
      //   queryKey: ['token-balance', outputToken?.Address, outputToken?.Decimals],
      // });
    }
    // if (tradeState === TradeState.INITIAL) {
    //   console.log('UPDATING BALANCE INITIAL', tradeState);
    //   queryClient.invalidateQueries({
    //     queryKey: ['token-balance', inputToken?.Address, inputToken?.Decimals],
    //   });
    //   queryClient.invalidateQueries({
    //     queryKey: ['token-balance', outputToken?.Address, outputToken?.Decimals],
    //   });
    // }
  }, [tradeState]);

  return (
    <>
      <SwapBody />
      {tradeState === TradeState.SUCCESS ||
      tradeState === TradeState.FAILED ||
      tradeState === TradeState.PENDING ? (
        <Button type="submit" size="lg" className="mt-4 w-full" disabled={isSubmitting}>
          {tradeState === TradeState.SUCCESS || tradeState === TradeState.PENDING
            ? 'Done'
            : 'Try Again'}
        </Button>
      ) : (
        <Button
          type="submit"
          size="lg"
          className="mt-4 w-full"
          disabled={
            quoteLoading ||
            isSubmitting ||
            isInsufficientBalance ||
            isInsufficientOutputAmount ||
            !isValidAmount ||
            isTokenBalanceRefetching ||
            tradeState === TradeState.CHECKING_APPROVAL
          }
        >
          <div className="flex items-center gap-2">
            {tradeState === TradeState.PROCESSING && (
              <Loader className="mr-2 h-4 w-4 animate-spin" />
            )}
            {getButtonText()}
          </div>
        </Button>
      )}
    </>
  );
}
