import { BackgroundGradient } from '../ui/background-gradient';
import { TokenSwapForm } from './TokenSwapForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useTokenSwapStore, TabState, TradeState } from '@/stores/token-swap-store';
import { Form as FormProvider } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
  const { allTokens, tradeState, activeTab, setActiveTab, resetTradeState } = useTokenSwapStore();
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

  // Set the inputToken to the selected token if present in the query param
  useEffect(() => {
    if (selectedTokenAddress && allTokens.length > 0) {
      const found = allTokens.find(t => t.TokenB.Address === selectedTokenAddress);
      if (found) {
        // For Buy tab: inputToken = USDC (TokenA), outputToken = xAsset (TokenB)
        // For Sell tab: inputToken = xAsset (TokenB), outputToken = USDC (TokenA)
        if (activeTab === TabState.BUY) {
          form.setValue('inputToken', found.TokenA); // USDC
          form.setValue('outputToken', found.TokenB); // xAsset
        } else {
          form.setValue('inputToken', found.TokenB); // xAsset
          form.setValue('outputToken', found.TokenA); // USDC
        }
      }
    }
    // Only run on mount or when allTokens changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTokenAddress, allTokens, activeTab]);

  // Handle token swapping when switching between Buy and Sell tabs
  useEffect(() => {
    if (allTokens.length > 0) {
      const [firstToken] = allTokens;
      const { TokenA, TokenB } = firstToken;

      // For Buy tab: inputToken = USDC (TokenA), outputToken = xAsset (TokenB)
      // For Sell tab: inputToken = xAsset (TokenB), outputToken = USDC (TokenA)
      if (activeTab === TabState.BUY) {
        form.setValue('inputToken', TokenA); // USDC
        form.setValue('outputToken', TokenB); // xAsset
      } else {
        form.setValue('inputToken', TokenB); // xAsset
        form.setValue('outputToken', TokenA); // USDC
      }

      // Reset amounts when switching tabs
      form.setValue('amount', '0');
      form.setValue('outputAmount', '0');
      form.setValue('percentage', 0);
    }
  }, [activeTab, allTokens, form]);

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
            <div className="h-full px-8 pb-8 pt-6">
              <Tabs
                className="flex h-full flex-col"
                value={activeTab}
                onValueChange={value => setActiveTab(value as TabState)}
              >
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

                <TabsContent value={TabState.BUY} className="mt-6 flex-1">
                  <TokenSwapForm />
                </TabsContent>

                <TabsContent value={TabState.SELL} className="mt-6 flex-1">
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
