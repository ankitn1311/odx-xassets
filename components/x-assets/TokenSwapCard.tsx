import { TokenSwapForm } from './TokenSwapForm';
import { useTokenSwapStore, TabState, TradeState } from '@/stores/token-swap-store';
import { Form as FormProvider } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { Card } from '../ui/card';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useQuoteTimer } from './QuoteTimerContext';
import { useFormContext } from 'react-hook-form';

const swapFormSchema = z
  .object({
    inputToken: z.object({
      Name: z.string(),
      FullName: z.string(),
      Address: z.string(),
      Decimals: z.number(),
      QtyTickSize: z.number().optional(),
    }),
    outputToken: z.object({
      Name: z.string(),
      FullName: z.string(),
      Address: z.string(),
      Decimals: z.number(),
      QtyTickSize: z.number().optional(),
    }),
    amount: z.string().refine(val => !isNaN(Number(val)), { message: 'Invalid number' }),
    outputAmount: z.string().refine(val => !isNaN(Number(val)), { message: 'Invalid number' }),
    percentage: z.number().min(0).max(100),
  })
  // .refine(
  //   data => {
  //     if (WHOLE_NUMBER_TOKENS.includes(data.inputToken.Name)) {
  //       const inputAmount = Number(data.amount);
  //       return Number.isInteger(inputAmount) && inputAmount > 0;
  //     }
  //     return true;
  //   },
  //   {
  //     message: "This token doesn't support decimals during the alpha phase",
  //     path: ['amount'],
  //   }
  // )
  .refine(
    data => {
      // For Buy tab: amount is USDC, outputAmount is xAsset
      // For Sell tab: amount is xAsset, outputAmount is USDC
      // We need to validate the USDC amount regardless of which field it's in
      const usdcAmount =
        data.inputToken?.Name === 'USDC' ? Number(data.amount) : Number(data.outputAmount);
      if (usdcAmount < 5 || usdcAmount > 10) {
        return false;
      }
      return true;
    },
    {
      message: 'USDC amount must be between 5 and 10, during the alpha',
      path: ['amount'], // This will show the error on the USDC input field
    }
  );
// .refine(
//   data => {
//     // Only validate if QtyTickSize is defined and token is not USDC
//     const tick = data.inputToken.QtyTickSize;
//     console.log('tick', tick, data);

//     if (
//       typeof tick === 'number' &&
//       data.inputToken.Name !== 'USDC' &&
//       data.amount !== '' &&
//       !isNaN(Number(data.amount))
//     ) {
//       const amt = Number(data.amount);
//       // Use toFixed to avoid floating point issues
//       const remainder = Math.abs((amt / tick) % 1);
//       // Allow a small epsilon for floating point errors
//       return remainder < 1e-8 || remainder > 1 - 1e-8;
//     }
//     return true;
//   },
//   data => {
//     const tick = data.inputToken.QtyTickSize;
//     return {
//       message:
//         typeof tick === 'number'
//           ? `Amount must be a multiple of ${tick} (e.g., ${tick}, ${tick * 2}, ${tick * 3}, ...)`
//           : "Amount must be a valid multiple of the token's minimum increment.",
//       path: ['amount'],
//     };
//   }
// );

export type SwapFormValues = z.infer<typeof swapFormSchema>;

export const TokenSwapCard = () => {
  const {
    allTokens,
    tradeState,
    activeTab,
    setActiveTab,
    resetTradeState,
    selectedXAsset,
    setSelectedXAsset,
  } = useTokenSwapStore();
  const [firstToken] = allTokens;
  const { TokenA, TokenB } = firstToken;
  const searchParams = useSearchParams();
  const selectedTokenAddress = searchParams.get('selected-token');
  const form = useForm<SwapFormValues>({
    resolver: zodResolver(swapFormSchema),
    defaultValues: {
      amount: '0',
      outputAmount: '0',
      percentage: 25,
      inputToken: TokenA, // USDC for Buy tab
      outputToken: TokenB, // xAsset for Buy tab
    },
    mode: 'onBlur',
  });

  // Set the selected xAsset from query param (only on mount)
  useEffect(() => {
    if (selectedTokenAddress && allTokens.length > 0) {
      const found = allTokens.find(t => t.TokenB.Address === selectedTokenAddress);
      if (found) {
        setSelectedXAsset(found.TokenB); // Store in global state
      }
    }
    // Only run on mount or when allTokens changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTokenAddress, allTokens]);

  // Initialize selectedXAsset if not set
  useEffect(() => {
    if (!selectedXAsset && allTokens.length > 0) {
      const [firstToken] = allTokens;
      setSelectedXAsset(firstToken.TokenB);
    }
  }, [selectedXAsset, allTokens, setSelectedXAsset]);

  // Update form when selectedXAsset changes from store (disabled to prevent race conditions)
  // useEffect(() => {
  //   if (selectedXAsset && allTokens.length > 0) {
  //     const [firstToken] = allTokens;
  //     const { TokenA } = firstToken; // USDC is always TokenA

  //     if (activeTab === TabState.BUY) {
  //       form.setValue('inputToken', TokenA); // USDC
  //       form.setValue('outputToken', selectedXAsset); // selected xAsset
  //     } else {
  //       form.setValue('inputToken', selectedXAsset); // selected xAsset
  //       form.setValue('outputToken', TokenA); // USDC
  //     }
  //   }
  // }, [selectedXAsset, activeTab, allTokens, form]);

  // Handle token swapping when switching between Buy and Sell tabs
  useEffect(() => {
    if (allTokens.length > 0) {
      const [firstToken] = allTokens;
      const { TokenA } = firstToken; // USDC is always TokenA

      // Get current form values BEFORE any updates
      const currentInputToken = form.getValues('inputToken');
      const currentOutputToken = form.getValues('outputToken');
      const currentAmount = form.getValues('amount');
      const currentOutputAmount = form.getValues('outputAmount');

      // Determine which amount corresponds to which token type based on CURRENT tab
      let usdcAmount = '0';
      let xAssetAmount = '0';

      // Check which tab we're currently on to determine token positions
      const isCurrentlyBuy = currentInputToken?.Name === 'USDC';

      if (isCurrentlyBuy) {
        // Currently on Buy tab: inputToken = USDC, outputToken = xAsset
        usdcAmount = currentAmount;
        xAssetAmount = currentOutputAmount;
      } else {
        // Currently on Sell tab: inputToken = xAsset, outputToken = USDC
        usdcAmount = currentOutputAmount;
        xAssetAmount = currentAmount;
      }

      // Always prioritize the selectedXAsset from store
      let currentSelectedXAsset = selectedXAsset;

      // If no xAsset in store, try to get from form values as fallback
      if (!currentSelectedXAsset) {
        if (currentInputToken?.Name !== 'USDC') {
          currentSelectedXAsset = currentInputToken;
        } else if (currentOutputToken?.Name !== 'USDC') {
          currentSelectedXAsset = currentOutputToken;
        }

        // If still no xAsset, use the first one as default
        if (!currentSelectedXAsset) {
          currentSelectedXAsset = firstToken.TokenB;
        }

        // Store it for future use
        setSelectedXAsset(currentSelectedXAsset);
      }

      // For Buy tab: inputToken = USDC, outputToken = selected xAsset
      // For Sell tab: inputToken = selected xAsset, outputToken = USDC
      if (activeTab === TabState.BUY) {
        form.setValue('inputToken', TokenA); // USDC
        form.setValue('outputToken', currentSelectedXAsset); // selected xAsset
        // Use the USDC amount for the input field
        form.setValue('amount', usdcAmount);
        form.setValue('outputAmount', '0');
      } else {
        form.setValue('inputToken', currentSelectedXAsset); // selected xAsset
        form.setValue('outputToken', TokenA); // USDC
        // Use the xAsset amount for the input field
        form.setValue('amount', xAssetAmount);
        form.setValue('outputAmount', '0');
      }

      form.setValue('percentage', 0);

      // Reset error state when changing tabs
      form.clearErrors();
    }
  }, [activeTab, allTokens, form, selectedXAsset, setSelectedXAsset, firstToken]);

  // Separate effect to handle trade state reset
  useEffect(() => {
    if (tradeState === TradeState.FAILED) {
      resetTradeState();
    }
  }, [tradeState, resetTradeState]);

  const tabLocked = [TradeState.PENDING, TradeState.SUCCESS, TradeState.PROCESSING].includes(
    tradeState
  );

  return (
    <FormProvider {...form}>
      {/* Grey panel with white input blocks inside, like the reference trade card. */}
      <Card className="flex h-full w-full flex-col border-0 bg-[#F3F3F3] py-4">
        <div className="flex h-full flex-col gap-4">
          <div className="flex items-center justify-between px-4">
            <div className="flex rounded-lg bg-[#E6E6E6] p-1 text-sm">
              {[TabState.BUY, TabState.SELL].map(tab => (
                <button
                  key={tab}
                  type="button"
                  disabled={tabLocked}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'rounded-md px-4 py-1.5 font-medium transition-colors disabled:opacity-60',
                    activeTab === tab
                      ? 'bg-white text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {tab === TabState.BUY ? 'Buy' : 'Sell'}
                </button>
              ))}
            </div>

            <QuoteTimer />
          </div>

          <div className="flex-1">
            <TokenSwapForm />
          </div>
        </div>
      </Card>
    </FormProvider>
  );
};

// QuoteTimer component
function QuoteTimer() {
  const { tradeState } = useTokenSwapStore();
  const { timeUntilNextQuote, isQuoteLoading } = useQuoteTimer();
  const form = useFormContext<SwapFormValues>();
  const inputAmount = form.watch('amount');

  // Only show timer in INITIAL state
  if (
    [
      TradeState.FAILED,
      TradeState.PENDING,
      TradeState.SUCCESS,
      TradeState.REVIEW,
      TradeState.APPROVAL,
      TradeState.CHECKING_APPROVAL,
      TradeState.PROCESSING,
    ].includes(tradeState)
  ) {
    return null;
  }

  // Don't show timer if there's no input amount or if amount is 0
  if (!inputAmount || inputAmount === '0' || inputAmount === '') {
    return null;
  }

  // Show loader when timer is at 0 or when quote is loading
  if (timeUntilNextQuote === 0 || isQuoteLoading) {
    return (
      <div className="gap2 flex w-8 items-center justify-center text-sm text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }
  return (
    <div className="flex h-7 flex-col items-center text-xs text-muted-foreground">
      <span className="font-mono">{timeUntilNextQuote}s</span>
      <div className="h-1 w-8 overflow-hidden rounded-full bg-[#E0E0E0]">
        <div
          className="h-1 bg-foreground transition-all duration-1000 ease-linear"
          style={{ width: `${(timeUntilNextQuote / 10) * 100}%` }}
        />
      </div>
    </div>
  );
}
