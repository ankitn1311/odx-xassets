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

const MAX_DECIMALS = 6;
const POLLING_INTERVAL = 5000; // 5 seconds

export function InitialStep() {
  const { tradeState, activeTab } = useTokenSwapStore();
  const { setValue, watch } = useFormContext<SwapFormValues>();
  const inputToken = watch('inputToken');
  const outputToken = watch('outputToken');
  const { slippage } = useAppStore();

  const debouncedGetQuoteRef = useRef<ReturnType<typeof debounce> | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { getQuote } = useTradeQuote();
  const inputAmount = watch('amount');

  useEffect(() => {
    // Initialize the debounced function
    debouncedGetQuoteRef.current = debounce(
      async (inputToken: TokenInfo, outputToken: TokenInfo, inputAmount: string) => {
        try {
          if (inputAmount === '0') {
            setValue('outputAmount', '0');
            setValue('amount', '0');
            setValue('percentage', 0);
            return;
          }
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

  // Add polling effect
  useEffect(() => {
    if (inputAmount === '0' || inputAmount === '' || !inputAmount) {
      setValue('outputAmount', '');
      setValue('amount', inputAmount === '0' ? '0' : '');
      setValue('percentage', 0);
      return;
    }

    if (inputAmount && inputToken && outputToken) {
      // Clear any existing interval
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }

      // Set up new polling interval
      pollingIntervalRef.current = setInterval(() => {
        if (debouncedGetQuoteRef.current) {
          debouncedGetQuoteRef.current(inputToken, outputToken, inputAmount);
        }
      }, POLLING_INTERVAL);
    }

    // Cleanup function
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [inputAmount, inputToken, outputToken, setValue]);

  const handleAmountChange = useCallback(
    async (value: string) => {
      if (!value) {
        setValue('amount', '');
        setValue('outputAmount', '');
        setValue('percentage', 0);
        debouncedGetQuoteRef?.current?.(inputToken, outputToken, 0);
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
        debouncedGetQuoteRef?.current?.(inputToken, outputToken, 0);
        return;
      }

      if (inputToken && outputToken && debouncedGetQuoteRef.current) {
        debouncedGetQuoteRef.current(inputToken, outputToken, numValue.toString());
      }
    },
    [inputToken, outputToken, setValue]
  );

  return (
    <>
      <TokenInput
        label={activeTab === TabState.BUY ? 'You Get' : 'You Sell'}
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
          className="h-8 w-8 rounded-full bg-muted/50 p-0 hover:bg-muted"
          disabled
          // onClick={handleSwap}
          // disabled={
          //   ![TradeState.INITIAL, TradeState.APPROVED, TradeState.CHECKING_APPROVAL].includes(
          //     tradeState
          //   )
          // }
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
          label={activeTab === TabState.BUY ? 'You Pay' : 'You Get'}
          isOutput
          onAmountChange={handleAmountChange}
          // onOutputAmountChange={handleOutputAmountChange}
          showPercentageButtons={false}
        />
      </div>
      <div className="flex flex-col gap-4">
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
            During our alpha test, {activeTab === TabState.BUY ? 'purchase' : 'sale'} amount should
            be between 5 and 10 USDC.
          </p>
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
