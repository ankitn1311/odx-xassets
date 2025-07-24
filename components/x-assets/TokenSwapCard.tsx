import { BackgroundGradient } from '../ui/background-gradient';
import { TokenSwapForm } from './TokenSwapForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useTokenSwapStore, TabState, TradeState } from '@/stores/token-swap-store';
import { Form as FormProvider } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { WHOLE_NUMBER_TOKENS } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { Card } from '../ui/card';

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
  .refine(
    data => {
      if (WHOLE_NUMBER_TOKENS.includes(data.inputToken.Name)) {
        const inputAmount = Number(data.amount);
        return Number.isInteger(inputAmount) && inputAmount > 0;
      }
      return true;
    },
    {
      message: "This token doesn't support decimals during the alpha phase",
      path: ['amount'],
    }
  )
  .refine(
    data => {
      if (Number(data.outputAmount) < 5 || Number(data.outputAmount) > 10) {
        return false;
      }
      return true;
    },
    {
      message: 'USDC amount must be between 5 and 10, during the alpha',
      path: ['outputAmount'],
    }
  )
  .refine(
    data => {
      // Only validate if QtyTickSize is defined and token is not USDC
      const tick = data.inputToken.QtyTickSize;
      console.log('tick', tick, data);

      if (
        typeof tick === 'number' &&
        data.inputToken.Name !== 'USDC' &&
        data.amount !== '' &&
        !isNaN(Number(data.amount))
      ) {
        const amt = Number(data.amount);
        // Use toFixed to avoid floating point issues
        const remainder = Math.abs((amt / tick) % 1);
        // Allow a small epsilon for floating point errors
        return remainder < 1e-8 || remainder > 1 - 1e-8;
      }
      return true;
    },
    data => {
      const tick = data.inputToken.QtyTickSize;
      return {
        message:
          typeof tick === 'number'
            ? `Amount must be a multiple of ${tick} (e.g., ${tick}, ${tick * 2}, ${tick * 3}, ...)`
            : "Amount must be a valid multiple of the token's minimum increment.",
        path: ['amount'],
      };
    }
  );

export type SwapFormValues = z.infer<typeof swapFormSchema>;

export const TokenSwapCard = () => {
  const { allTokens, tradeState } = useTokenSwapStore();
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
      inputToken: TokenB,
      outputToken: TokenA,
    },
    mode: 'onBlur',
  });

  // Set the inputToken to the selected token if present in the query param
  useEffect(() => {
    if (selectedTokenAddress && allTokens.length > 0) {
      const found = allTokens.find(t => t.TokenB.Address === selectedTokenAddress);
      if (found) {
        form.setValue('inputToken', found.TokenB);
        form.setValue('outputToken', found.TokenA);
      }
    }
    // Only run on mount or when allTokens changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTokenAddress, allTokens]);

  const { activeTab, setActiveTab, resetTradeState } = useTokenSwapStore();

  const isBuyDisabled = ![
    TradeState.INITIAL,
    TradeState.APPROVAL,
    TradeState.APPROVED,
    TradeState.CHECKING_APPROVAL,
  ].includes(tradeState);
  const isSellDisabled = ![
    TradeState.INITIAL,
    TradeState.APPROVAL,
    TradeState.APPROVED,
    TradeState.CHECKING_APPROVAL,
  ].includes(tradeState);

  return (
    <FormProvider {...form}>
      <BackgroundGradient>
        <div className="flex h-full w-full flex-col">
          <Card className="h-full bg-card">
            <div className="px-8 pb-8 pt-6">
              <Tabs value={activeTab} onValueChange={value => setActiveTab(value as TabState)}>
                <TabsList className="grid w-full grid-cols-2" variant="underline">
                  <TabsTrigger
                    variant="underline"
                    disabled={isBuyDisabled}
                    value={TabState.BUY}
                    onClick={() => {
                      if (
                        [TradeState.SUCCESS, TradeState.PENDING, TradeState.FAILED].includes(
                          tradeState
                        )
                      ) {
                        resetTradeState();
                      }
                    }}
                  >
                    Buy
                  </TabsTrigger>
                  <TabsTrigger
                    variant="underline"
                    disabled={isSellDisabled}
                    value={TabState.SELL}
                    onClick={() => {
                      if (
                        [TradeState.SUCCESS, TradeState.PENDING, TradeState.FAILED].includes(
                          tradeState
                        )
                      ) {
                        resetTradeState();
                      }
                    }}
                  >
                    Sell
                  </TabsTrigger>
                </TabsList>

                <TabsContent value={TabState.BUY} className="mt-6">
                  <TokenSwapForm />
                </TabsContent>

                <TabsContent value={TabState.SELL} className="mt-6">
                  <TokenSwapForm />
                </TabsContent>
              </Tabs>
            </div>
          </Card>
        </div>
      </BackgroundGradient>
    </FormProvider>
  );
};
