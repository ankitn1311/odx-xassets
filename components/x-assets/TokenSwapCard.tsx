import { BackgroundGradient } from '../ui/background-gradient';
import { TokenSwapForm } from './TokenSwapForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useTokenSwapStore, TabState, TradeState } from '@/stores/token-swap-store';
import { Form as FormProvider } from '@/components/ui/form';
import { useForm, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { WHOLE_NUMBER_TOKENS } from '@/lib/utils';

const swapFormSchema = z
  .object({
    inputToken: z.object({
      Name: z.string(),
      FullName: z.string(),
      Address: z.string(),
      Decimals: z.number(),
    }),
    outputToken: z.object({
      Name: z.string(),
      FullName: z.string(),
      Address: z.string(),
      Decimals: z.number(),
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
  );

export type SwapFormValues = z.infer<typeof swapFormSchema>;

export const TokenSwapCard = () => {
  const { allTokens, tradeState } = useTokenSwapStore();
  const [firstToken] = allTokens;
  const { TokenA, TokenB } = firstToken;
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

  const { activeTab, setActiveTab } = useTokenSwapStore();

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
      <div className="flex w-full flex-col">
        <BackgroundGradient>
          <div className="w-full rounded-xl bg-card">
            <div className="px-8 pb-8 pt-4">
              <Tabs value={activeTab} onValueChange={value => setActiveTab(value as TabState)}>
                <TabsList className="grid w-full grid-cols-2" variant="underline">
                  <TabsTrigger variant="underline" disabled={isBuyDisabled} value={TabState.BUY}>
                    Buy
                  </TabsTrigger>
                  <TabsTrigger variant="underline" disabled={isSellDisabled} value={TabState.SELL}>
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
          </div>
        </BackgroundGradient>
      </div>
    </FormProvider>
  );
};
