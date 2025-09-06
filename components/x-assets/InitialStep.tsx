import { TokenInput } from './TokenInput';
import { Button } from '../ui/button';
import { Button as MovingButton } from '../ui/moving-border';
import Image from 'next/image';
import { TradeState, useTokenSwapStore, TabState } from '@/stores/token-swap-store';
import { useCallback, useEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { debounce } from 'lodash';
import { useTradeQuote } from '@/hooks/mutations/use-trade-quote';
import { toast } from 'sonner';
import { Info } from 'lucide-react';
import { TokenInfo } from '@/hooks/queries/use-all-tokens';
import { SwapFormValues } from './TokenSwapCard';
import { useTheme } from 'next-themes';
import { SlippageSettings } from './SlippageSettings';
import { useAppStore } from '@/stores/app-store';
import { Separator } from '../ui/separator';
import { ArrowUpDown } from 'lucide-react';
import { useQuoteTimer } from './QuoteTimerContext';

const MAX_DECIMALS = 8;
const POLLING_INTERVAL = 10000; // 10 seconds

export function InitialStep() {
  const { tradeState, activeTab, setActiveTab } = useTokenSwapStore();
  const { setValue, watch } = useFormContext<SwapFormValues>();

  const inputToken = watch('inputToken');
  const outputToken = watch('outputToken');
  const { slippage } = useAppStore();
  const isBuy = activeTab === TabState.BUY;

  const debouncedGetQuoteRef = useRef<ReturnType<typeof debounce> | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { setTimeUntilNextQuote, setIsQuoteLoading } = useQuoteTimer();

  const { getQuote } = useTradeQuote();
  const inputAmount = watch('amount');

  // Helper function to restart the timer
  const restartTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    timerIntervalRef.current = setInterval(() => {
      setTimeUntilNextQuote(prev => {
        if (prev <= 0) {
          // Clear the interval when we reach 0
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
          }
          // Trigger quote fetch when timer reaches 0
          if (debouncedGetQuoteRef.current) {
            debouncedGetQuoteRef.current(inputToken, outputToken, inputAmount, isBuy);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [inputToken, outputToken, inputAmount, isBuy, setTimeUntilNextQuote]);

  useEffect(() => {
    // Initialize the debounced function
    debouncedGetQuoteRef.current = debounce(
      async (
        inputToken: TokenInfo,
        outputToken: TokenInfo,
        inputAmount: string,
        isBuy: boolean
      ) => {
        try {
          if (inputAmount === '0') {
            setValue('outputAmount', '0');
            setValue('amount', '0');
            setValue('percentage', 0);
            setIsQuoteLoading(false);
            return;
          }

          setIsQuoteLoading(true);
          const quote = await getQuote({
            inputToken,
            outputToken,
            inputAmount,
            type: isBuy ? 'buy' : 'sell',
          });
          if (quote) {
            setValue('outputAmount', quote.toString());
          }
          setIsQuoteLoading(false);
          // Reset timer after quote is fetched and restart the interval
          setTimeUntilNextQuote(POLLING_INTERVAL / 1000);
          restartTimer();
        } catch (error) {
          toast.error('Failed to get quote');
          console.error('Error getting quote:', error);
          setIsQuoteLoading(false);
          // Reset timer even on error and restart the interval
          setTimeUntilNextQuote(POLLING_INTERVAL / 1000);
          restartTimer();
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
  }, [getQuote, setValue, setIsQuoteLoading, setTimeUntilNextQuote, restartTimer]);

  // Add polling effect
  useEffect(() => {
    if (inputAmount === '0' || inputAmount === '' || !inputAmount) {
      setValue('outputAmount', '');
      setValue('amount', inputAmount === '0' ? '0' : '');
      setValue('percentage', 0);
      setTimeUntilNextQuote(POLLING_INTERVAL / 1000);
      setIsQuoteLoading(false);
      return;
    }

    if (inputAmount && inputToken && outputToken) {
      // Clear any existing timer interval
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }

      // Reset timer and start the interval
      setTimeUntilNextQuote(POLLING_INTERVAL / 1000);
      restartTimer();
    }

    // Cleanup function
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [
    inputAmount,
    inputToken,
    outputToken,
    setValue,
    isBuy,
    setTimeUntilNextQuote,
    setIsQuoteLoading,
    restartTimer,
  ]);

  useEffect(() => {
    if (inputToken && outputToken && debouncedGetQuoteRef.current && inputAmount) {
      debouncedGetQuoteRef.current(inputToken, outputToken, inputAmount, isBuy);
    }
  }, [isBuy, inputToken, outputToken, inputAmount, debouncedGetQuoteRef]);

  const handleAmountChange = useCallback(
    async (value: string) => {
      if (!value) {
        setValue('amount', '');
        setValue('outputAmount', '');
        setValue('percentage', 0);
        debouncedGetQuoteRef?.current?.(inputToken, outputToken, 0, isBuy);
        return;
      }

      const cleanValue = value.replace(/[^0-9.]/g, '');
      const parts = cleanValue.split('.');
      const formattedValue =
        parts[0] + (parts.length > 1 ? '.' + parts[1].slice(0, MAX_DECIMALS) : '');
      setValue('amount', formattedValue);
      const numValue = Number(formattedValue);
      if (isNaN(numValue)) return;

      if (numValue === 0) {
        setValue('outputAmount', '0');
        setValue('amount', /^0\.0*$/.test(formattedValue) ? formattedValue : '0');
        setValue('percentage', 0);
        debouncedGetQuoteRef?.current?.(inputToken, outputToken, 0, isBuy);
        return;
      }

      if (inputToken && outputToken && debouncedGetQuoteRef.current) {
        debouncedGetQuoteRef.current(inputToken, outputToken, numValue.toString(), isBuy);
      }
    },
    [inputToken, outputToken, setValue, isBuy]
  );

  const handleTabSwitch = useCallback(() => {
    const newTab = activeTab === TabState.BUY ? TabState.SELL : TabState.BUY;
    setActiveTab(newTab);

    // Reset trade state if needed
    if ([TradeState.SUCCESS, TradeState.PENDING, TradeState.FAILED].includes(tradeState)) {
      // This will be handled by the TokenSwapCard useEffect
    }
  }, [activeTab, setActiveTab, tradeState]);

  return (
    <>
      <Separator className="mb-3" />
      <div className="px-4">
        <TokenInput
          label="You Pay"
          onAmountChange={handleAmountChange}
          showPercentageButtons={
            tradeState === TradeState.INITIAL ||
            tradeState === TradeState.APPROVED ||
            tradeState === TradeState.CHECKING_APPROVAL
          }
        />
        {/* {WHOLE_NUMBER_TOKENS.includes(inputToken.Name) && (
        <div className="my-4 flex flex-col gap-4 rounded-md border border-warning/20 bg-warning/10 p-3 text-sm text-warning-foreground">
          <div className="flex items-end gap-2">
            <Info className="h-5 w-5 flex-shrink-0" />
            <p className="h-5">{inputToken.Name} amount must be a whole number.</p>
          </div>
        </div>
      )} */}

        <div className="mt-2 flex justify-center">
          <Button
            variant="ghost"
            size="icon"
            type="button"
            className="h-8 w-8 rounded-full p-0 transition-colors"
            onClick={handleTabSwitch}
            disabled={[TradeState.PENDING, TradeState.SUCCESS].includes(tradeState)}
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-2">
          <TokenInput
            label="You Get"
            isOutput
            onAmountChange={handleAmountChange}
            // onOutputAmountChange={handleOutputAmountChange}
            showPercentageButtons={false}
          />
        </div>
      </div>
      <Separator className="mt-3" />
      <div className="px-4">
        <div className="flex flex-col gap-3">
          <div className="mt-2 flex items-center justify-between pt-4">
            <p className="text-sm text-muted-foreground">Source</p>
            <MovingButton className="border-border bg-card text-card-foreground">
              <ODXApiSource />
            </MovingButton>
          </div>

          <div className="flex items-center justify-between pb-4">
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">Slippage</p>
              <SlippageSettings />
            </div>
            <p className="text-sm text-muted-foreground">{slippage}%</p>
          </div>
        </div>

        <div className="my-4 flex flex-col gap-4 rounded-md border border-primary/20 bg-primary/10 p-3 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <Info className="h-5 w-5 flex-shrink-0" />
            <p>
              During our alpha test, {activeTab === TabState.BUY ? 'purchase' : 'sale'} amount
              should be between 5 and 10 USDC.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export function ODXApiSource() {
  const { theme, systemTheme } = useTheme();
  const currentTheme = theme === 'system' ? systemTheme : theme;
  return (
    <div className="flex items-center gap-2">
      {currentTheme === 'dark' ? (
        <Image
          src="/images/logos/odx-dark.svg"
          alt="ODX"
          width={16}
          height={16}
          className="h-4 w-4"
        />
      ) : (
        <Image
          src="/images/logos/odx-light.svg"
          alt="ODX"
          width={16}
          height={16}
          className="h-4 w-4"
        />
      )}
      <p className="text-xs">ODX API</p>
    </div>
  );
}
