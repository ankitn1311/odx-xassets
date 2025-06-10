import { TradeState, useTokenSwapStore } from '@/stores/token-swap-store';
import { useFormContext } from 'react-hook-form';
import { SwapFormValues } from './TokenSwapForm';
import { useEffect, useRef } from 'react';
import { debounce } from 'lodash';
import { useTradeQuote } from '@/hooks/mutations/use-trade-quote';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { SwapBody } from './SwapBody';

export function SwapScreens() {
  const { tradeState, inputToken, numericBalance } = useTokenSwapStore();
  const {
    watch,
    setValue,
    formState: { isSubmitting },
  } = useFormContext<SwapFormValues>();
  const amount = watch('amount');
  const outputAmount = watch('outputAmount');
  const debouncedGetQuoteRef = useRef<ReturnType<typeof debounce> | null>(null);

  const { getQuote, isLoading: isQuoteLoading } = useTradeQuote();

  useEffect(() => {
    // Initialize the debounced function
    debouncedGetQuoteRef.current = debounce(
      async (inputTokenAddress: string, outputTokenAddress: string, inputAmount: string) => {
        try {
          const quote = await getQuote({
            inputToken: inputTokenAddress,
            outputToken: outputTokenAddress,
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
        return inputToken?.Name === 'xUSDT' ? 'Buy' : 'Sell';
    }
  };

  const isInsufficientBalance = Number(amount) > numericBalance;
  const isValidAmount = amount && Number(amount) > 0;
  const isInsufficientOutputAmount = Number(outputAmount) === 0;

  return (
    <>
      <SwapBody />
      <Button
        type="submit"
        size="lg"
        className="mt-4 w-full"
        disabled={
          isQuoteLoading ||
          isSubmitting ||
          isInsufficientBalance ||
          isInsufficientOutputAmount ||
          !isValidAmount ||
          tradeState === TradeState.CHECKING_APPROVAL
        }
      >
        {getButtonText()}
      </Button>
    </>
  );
}
