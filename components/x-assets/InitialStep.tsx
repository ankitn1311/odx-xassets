import { TokenInput } from './TokenInput';
import { Button } from '../ui/button';
import Image from 'next/image';
import { TradeState, useTokenSwapStore, TabState } from '@/stores/token-swap-store';
import { useCallback, useEffect, useRef, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { debounce } from 'lodash';
import { useTradeQuote } from '@/hooks/mutations/use-trade-quote';
import { toast } from 'sonner';
import { Info } from 'lucide-react';
import { TokenInfo } from '@/hooks/queries/use-all-tokens';
import { SwapFormValues } from './TokenSwapCard';
import { SlippageSettings } from './SlippageSettings';
import { useAppStore } from '@/stores/app-store';
import { ArrowDown, ArrowUpDown } from 'lucide-react';
import { DemoAlert } from '@/components/common/demo-alert';
import { fmtUsd } from '@/lib/format';
import { QUEUE_ESTIMATE, REDEEM_BUFFER_USD, REDEEM_FEE_BPS, REDEEM_HAIRCUT_BPS } from '@/config/placeholders';
import { useQuoteTimer } from './QuoteTimerContext';
import { sortWeeklyRanks } from '@/utils/weekly-rank-36';
// import { sortWeeklyRank36ByW36Rank } from '@/utils/weekly-rank-36';

const MAX_DECIMALS = 8;
const POLLING_INTERVAL = 10000; // 10 seconds

export function InitialStep() {
  const { tradeState, activeTab, setActiveTab, redeemMode } = useTokenSwapStore();
  const { setValue, watch } = useFormContext<SwapFormValues>();

  const inputToken = watch('inputToken');
  const outputToken = watch('outputToken');
  const outputAmount = watch('outputAmount');
  const { slippage } = useAppStore();
  const isBuy = activeTab === TabState.BUY;

  const debouncedGetQuoteRef = useRef<ReturnType<typeof debounce> | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { setTimeUntilNextQuote, setIsQuoteLoading } = useQuoteTimer();

  const { getQuote } = useTradeQuote();
  const inputAmount = watch('amount');

  // Memoize the restart timer function to prevent unnecessary re-renders
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

  // Memoize the debounced function to prevent recreation on every render
  const debouncedGetQuote = useMemo(() => {
    return debounce(
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
  }, [getQuote, setValue, setIsQuoteLoading, setTimeUntilNextQuote, restartTimer]);

  // Update the ref when the memoized function changes
  useEffect(() => {
    debouncedGetQuoteRef.current = debouncedGetQuote;

    // Cleanup function
    return () => {
      if (debouncedGetQuoteRef.current) {
        debouncedGetQuoteRef.current.cancel();
      }
    };
  }, [debouncedGetQuote]);

  // Optimized polling effect with proper cleanup
  useEffect(() => {
    // Clear any existing timer on mount or dependency change
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (inputAmount === '0' || inputAmount === '' || !inputAmount) {
      setValue('outputAmount', '');
      setValue('amount', inputAmount === '0' ? '0' : '');
      setValue('percentage', 0);
      setTimeUntilNextQuote(POLLING_INTERVAL / 1000);
      setIsQuoteLoading(false);
      return;
    }

    if (inputAmount && inputToken && outputToken) {
      // Reset timer and start the interval
      setTimeUntilNextQuote(POLLING_INTERVAL / 1000);
      restartTimer();
    }

    // Cleanup function
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [
    inputAmount,
    inputToken,
    outputToken,
    setValue,
    setTimeUntilNextQuote,
    setIsQuoteLoading,
    restartTimer,
  ]);

  // Optimized effect for triggering quotes
  useEffect(() => {
    if (
      inputToken &&
      outputToken &&
      debouncedGetQuoteRef.current &&
      inputAmount &&
      inputAmount !== '0'
    ) {
      debouncedGetQuoteRef.current(inputToken, outputToken, inputAmount, isBuy);
    }
  }, [isBuy, inputToken, outputToken, inputAmount]);

  // Memoized amount change handler
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
        debouncedGetQuoteRef.current(inputToken, outputToken, formattedValue, isBuy);
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

  const getRank = async (week: number) => {
    const ranks = await sortWeeklyRanks(week);
    const ranksMaps = ranks.map(rank => {
      return {
        address: rank.address,
        [`${week}_rank`]: rank[`2025_W${week}_rank`],
        [`${week}_points`]: rank[`2025_W${week}`],
      };
    });
    console.log('RANKS MAPS', week, ranksMaps);
  };

  return (
    <>
      <div className="flex flex-col px-4">
        <TokenInput
          label={redeemMode ? 'Burn' : isBuy ? 'Spend' : 'Sell'}
          onAmountChange={handleAmountChange}
          showPercentageButtons={
            tradeState === TradeState.INITIAL ||
            tradeState === TradeState.APPROVED ||
            tradeState === TradeState.CHECKING_APPROVAL
          }
        />

        {/* Swap direction, sitting on the seam between the two blocks. Redeem is one-way. */}
        <div className="relative z-10 -my-3 flex justify-center">
          {redeemMode ? (
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card shadow-sm">
              <ArrowDown className="h-4 w-4 text-muted-foreground" />
            </span>
          ) : (
            <Button
              variant="outline"
              size="icon"
              type="button"
              className="h-8 w-8 rounded-full border-border shadow-sm"
              onClick={handleTabSwitch}
              disabled={[TradeState.PENDING, TradeState.SUCCESS].includes(tradeState)}
              aria-label="Switch between buy and sell"
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          )}
        </div>

        <TokenInput
          label="Receive"
          isOutput
          onAmountChange={handleAmountChange}
          showPercentageButtons={false}
        />
      </div>

      <div className="px-4">
        {redeemMode && (
          <RedeemRoute
            symbol={inputToken?.Name ?? ''}
            outSymbol={outputToken?.Name ?? 'USDC.e'}
            usdOut={Number(outputAmount) || 0}
          />
        )}

        <div className="mt-3 flex flex-col gap-3 rounded-xl bg-card px-4 py-3 text-sm">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">Source</p>
            <ODXApiSource />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="text-muted-foreground">Slippage</p>
              <SlippageSettings />
            </div>
            <p className="font-mono text-xs">{slippage}%</p>
          </div>
        </div>

        <p className="mt-3 flex items-start gap-2 px-1 text-xs leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
          During the alpha, the {redeemMode ? 'redeem' : activeTab === TabState.BUY ? 'purchase' : 'sale'} amount
          must be between 5 and 10 USDC.
        </p>
      </div>
    </>
  );
}

/**
 * Redeem routing and pricing. The route is picked from the amount against the instant
 * buffer; queue position, ETA, fee and haircut are placeholders until the API exists.
 */
function RedeemRoute({ symbol, outSymbol, usdOut }: { symbol: string; outSymbol: string; usdOut: number }) {
  const buffer = REDEEM_BUFFER_USD[symbol] ?? 0;
  const hasAmount = usdOut > 0;
  const instant = hasAmount && usdOut <= buffer;
  const fee = (usdOut * REDEEM_FEE_BPS) / 10_000;
  const haircut = (usdOut * REDEEM_HAIRCUT_BPS) / 10_000;
  const receive = Math.max(0, usdOut - fee - haircut);

  return (
    <div className="mt-3 flex flex-col gap-2.5 rounded-xl bg-card px-4 py-3 text-sm">
      {/* Route: what happens to this amount, and the threshold that decides it */}
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-1 text-muted-foreground">
          Route <DemoAlert className="h-3 w-3" note="Buffer, queue position and ETA are illustrative" />
        </p>
        {!hasAmount ? (
          <span className="font-mono text-xs text-muted-foreground">
            instant up to <span className="tabular-nums">{fmtUsd(buffer, 0)}</span>
          </span>
        ) : instant ? (
          <span className="inline-flex items-center gap-1.5 rounded bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success" /> Instant · from buffer
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded bg-warning/15 px-2.5 py-1 text-xs font-medium text-warning-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-warning" /> Queue · position {QUEUE_ESTIMATE.position} · {QUEUE_ESTIMATE.eta}
          </span>
        )}
      </div>
      {hasAmount && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-muted-foreground">Instant buffer</p>
          <p className="font-mono text-xs tabular-nums">{fmtUsd(buffer, 0)}</p>
        </div>
      )}

      {/* Pricing on one line; the dollar cost only once there is an amount to price */}
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-1 text-muted-foreground">
          Fee · haircut <DemoAlert className="h-3 w-3" note="Fee and haircut are illustrative" />
        </p>
        <p className="font-mono text-xs tabular-nums">
          {REDEEM_FEE_BPS} bps · {REDEEM_HAIRCUT_BPS} bps
          {hasAmount && <span className="text-muted-foreground"> · {fmtUsd(fee + haircut)}</span>}
        </p>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border pt-2.5">
        <p className="font-medium">You receive</p>
        <p className="font-mono text-sm font-medium tabular-nums">
          {fmtUsd(receive)} <span className="text-muted-foreground">{outSymbol}</span>
        </p>
      </div>
    </div>
  );
}

export function ODXApiSource() {
  return (
    <span className="flex items-center gap-1.5 rounded border border-border bg-card px-2.5 py-1 text-xs">
      <Image src="/images/logos/odx-light.svg" alt="ODX" width={14} height={14} className="h-3.5 w-3.5" />
      ODX API
    </span>
  );
}
