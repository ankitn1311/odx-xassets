import { TradeState, useTokenSwapStore } from '@/stores/token-swap-store';
import { useFormContext } from 'react-hook-form';
import { SwapFormValues } from './TokenSwapForm';
import { useEffect, useRef } from 'react';
import { debounce } from 'lodash';
import { useTradeQuote } from '@/hooks/mutations/use-trade-quote';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { SwapBody } from './SwapBody';
import { useTokenBalance } from '@/hooks/queries/use-token-balance';
import Link from 'next/link';

export function SwapScreens() {
  const { tradeState, inputToken } = useTokenSwapStore();
  console.log('inputToken', inputToken);
  const { data: numericBalance } = useTokenBalance(
    inputToken?.Address ?? '',
    inputToken?.Decimals ?? 18
  );

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
    if (numericBalance && Number(numericBalance) < Number(amount)) {
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
        return inputToken?.Name === 'xUSDT' ? 'Buy' : 'Sell';
    }
  };

  console.log('Numeric Balance', numericBalance);

  const isInsufficientBalance = numericBalance && Number(numericBalance) < Number(amount);
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
