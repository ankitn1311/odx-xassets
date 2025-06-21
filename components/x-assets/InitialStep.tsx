import { TokenInput } from './TokenInput';
import { Button } from '../ui/button';
import Image from 'next/image';
import { TradeState, useTokenSwapStore } from '@/stores/token-swap-store';
import { useCallback, useEffect, useRef } from 'react';
import { SwapFormValues } from './TokenSwapForm';
import { useFormContext } from 'react-hook-form';
import { debounce } from 'lodash';
import { useTradeQuote } from '@/hooks/mutations/use-trade-quote';
import { toast } from 'sonner';
import { Info } from 'lucide-react';

const MAX_DECIMALS = 2;
const POLLING_INTERVAL = 5000; // 5 seconds

export function InitialStep() {
  const { tradeState, inputToken, outputToken, numericBalance, swapTokens, resetTradeState } =
    useTokenSwapStore();
  const { setValue, watch } = useFormContext<SwapFormValues>();
  const debouncedGetQuoteRef = useRef<ReturnType<typeof debounce> | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { getQuote } = useTradeQuote();
  const inputAmount = watch('amount');

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

  // Add polling effect
  useEffect(() => {
    if (inputAmount && inputToken && outputToken) {
      // Clear any existing interval
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }

      // Set up new polling interval
      pollingIntervalRef.current = setInterval(() => {
        if (debouncedGetQuoteRef.current) {
          debouncedGetQuoteRef.current(inputToken.Address, outputToken.Address, inputAmount);
        }
      }, POLLING_INTERVAL);
    }

    // Cleanup function
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [inputAmount, inputToken, outputToken]);

  const handleAmountChange = useCallback(
    async (value: string) => {
      if (!value) {
        console.log(' NO VALUE');
        setValue('amount', '');
        setValue('outputAmount', '');
        setValue('percentage', 0);
        debouncedGetQuoteRef?.current?.(inputToken?.Address, outputToken?.Address, 0);
        return;
      }

      const cleanValue = value.replace(/[^0-9.]/g, '');
      const parts = cleanValue.split('.');
      const formattedValue =
        parts[0] + (parts.length > 1 ? '.' + parts[1].slice(0, MAX_DECIMALS) : '');

      let numValue = Number(formattedValue);
      if (isNaN(numValue)) return;

      if (numValue > 10) {
        numValue = 10;
        toast.info('During the alpha, the maximum trade size is 10 USDC.');
      }

      setValue('amount', numValue.toString());

      if (inputToken && outputToken && debouncedGetQuoteRef.current) {
        debouncedGetQuoteRef.current(inputToken.Address, outputToken.Address, numValue.toString());
      }
    },
    [inputToken, outputToken, setValue]
  );

  const formatNumber = (num: number): string => {
    return num.toFixed(MAX_DECIMALS).replace(/\.?0+$/, '');
  };

  const handleOutputAmountChange = (value: string) => {
    if (!value) {
      setValue('outputAmount', '');
      setValue('amount', '');
      setValue('percentage', 0);
      return;
    }

    const cleanValue = value.replace(/[^0-9.]/g, '');
    const parts = cleanValue.split('.');
    const formattedValue =
      parts[0] + (parts.length > 1 ? '.' + parts[1].slice(0, MAX_DECIMALS) : '');

    const numValue = Number(formattedValue);
    if (isNaN(numValue)) return;

    setValue('outputAmount', formattedValue);
    setValue('amount', formatNumber(numValue / 0.95));
    setValue('percentage', Math.min(100, (numValue / 0.95 / numericBalance) * 100));
  };

  const handleSwap = () => {
    swapTokens();
    // Reset form values
    setValue('amount', '0');
    setValue('outputAmount', '0');
    setValue('percentage', 25);
    // Reset trade state
    resetTradeState();
  };

  return (
    <>
      <TokenInput
        label="Sell"
        onAmountChange={handleAmountChange}
        showPercentageButtons={
          tradeState === TradeState.INITIAL ||
          tradeState === TradeState.APPROVED ||
          tradeState === TradeState.CHECKING_APPROVAL
        }
      />

      <div className="mt-2 flex justify-center">
        <Button
          variant="ghost"
          size="icon"
          type="button"
          className="h-8 w-8 rounded-full bg-muted/50 p-0 hover:bg-muted"
          disabled
          // onClick={handleSwap}
          // disabled={tradeState !== TradeState.INITIAL}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 4L12 20M12 20L18 14M12 20L6 14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Button>
      </div>

      <div className="mt-2">
        <TokenInput
          label="Buy"
          isOutput
          onAmountChange={handleAmountChange}
          onOutputAmountChange={handleOutputAmountChange}
          showPercentageButtons={false}
        />
      </div>

      <div className="mt-2 flex items-center justify-between py-4">
        <p className="text-sm text-muted-foreground">Source</p>
        <Button variant="outline" type="button">
          <div className="flex items-center gap-2">
            <Image src="/images/ODX.svg" alt="ODX" width={16} height={16} className="h-4 w-4" />
            <p className="text-xs">ODX API</p>
          </div>
        </Button>
      </div>

      <div className="my-4 rounded-md border border-primary/20 bg-primary/10 p-3 text-sm text-primary-foreground">
        <div className="flex items-start gap-2">
          <Info className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <p>
            During our alpha test, each trade is limited to a maximum of 10 USDC. You will receive
            x1SOL, which can be swapped back to USDC at a later time.
          </p>
        </div>
      </div>
    </>
  );
}
