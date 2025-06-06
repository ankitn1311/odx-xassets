'use client';
import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TabsContent } from '@/components/ui/tabs';
import { useAppStore } from '@/stores/app-store';
import { useSelectedToken } from '@/hooks/queries/use-selected-token';
import { useBuyTokens } from '@/hooks/mutations/use-buy-selected-token';
import Authenticated from '@/components/common/authenticated';
import RequestOTP from '@/components/login/request-otp';
import { useDialogStore } from '@/stores/dialog-store';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useSonicBalance } from '@/hooks/queries/use-sonic-balance';
import { ExportWalletGuide } from '@/app/components/login/export-wallet-guide';
import { useWalletClient } from 'wagmi';
import { useTokenBalance } from '@/hooks/queries/use-token-balance';
import { ethers } from 'ethers';
import { getQuote } from '@/utils/chain-client/txs/create_trade';
import { debounce } from 'lodash';
import { formatUnits, parseUnits } from 'ethers/lib/utils';

const PRESET_PERCENTAGES = [0, 25, 50, 75, 100] as const;
const MAX_DECIMALS = 2;

interface FormValues {
  amount: string;
  percentage: number;
}

const buyFormSchema = z.object({
  amount: z.string().refine(val => !isNaN(Number(val)), { message: 'Invalid number' }),
  percentage: z.number().min(0).max(100),
});

export const BuyTab = () => {
  const { data: sonicBalance } = useSonicBalance();
  const { data: wallet } = useWalletClient();
  const { open } = useDialogStore();
  const { setLoginEmail } = useAppStore();
  const [estimatedTokens, setEstimatedTokens] = useState<number>(0);
  const { data: selectedToken } = useSelectedToken();
  const {
    data: balance,
    fullBalance,
    isLoading: isBalanceLoading,
  } = useTokenBalance(selectedToken?.TokenB.Address || '', selectedToken?.TokenB.Decimals || 0);
  const buyTokensMutation = useBuyTokens();
  const debouncedGetEstimatedTokensRef = useRef<ReturnType<typeof debounce> | null>(null);

  const numericBalance = useMemo(() => Number(balance || 0), [balance]);

  const form = useForm<FormValues>({
    resolver: zodResolver(buyFormSchema),
    defaultValues: {
      amount: '',
      percentage: 25,
    },
  });

  const { watch, setValue } = form;
  const amount = watch('amount');
  const percentage = watch('percentage');

  const formatNumber = (num: number): string => {
    return num?.toFixed(MAX_DECIMALS).replace(/\.?0+$/, '');
  };

  useEffect(() => {
    // Initialize the debounced function
    debouncedGetEstimatedTokensRef.current = debounce(
      async (inputTokenAddress: string, outputTokenAddress: string, inputAmount: number) => {
        try {
          const quote = await getQuote({
            wallet: wallet as any,
            assetIn: inputTokenAddress,
            assetOut: outputTokenAddress,
            amount: inputAmount,
          });
          const estimatedTokens =
            !isNaN(inputAmount) && inputAmount > 0 ? ethers.utils.formatUnits(quote, 18) : 0;
          setEstimatedTokens(Number(estimatedTokens));
        } catch (error) {
          console.error('Error getting estimated tokens:', error);
        }
      },
      500
    );

    // Cleanup function
    return () => {
      if (debouncedGetEstimatedTokensRef.current) {
        debouncedGetEstimatedTokensRef.current.cancel();
      }
    };
  }, [
    selectedToken?.TokenA.Decimals,
    selectedToken?.TokenB.Address,
    selectedToken?.TokenA.Address,
    wallet,
  ]);

  const handleAmountChange = useCallback(
    async (value: string) => {
      if (!value) {
        setValue('amount', '');
        setValue('percentage', 0);
        return;
      }

      const cleanValue = value.replace(/[^0-9.]/g, '');
      const parts = cleanValue.split('.');
      const formattedValue =
        parts[0] + (parts.length > 1 ? '.' + parts[1].slice(0, MAX_DECIMALS) : '');

      let numValue = Number(formattedValue);
      if (isNaN(numValue)) return;

      let fullBalanceNumber = 0;

      if (fullBalance) {
        fullBalanceNumber = Number(formatUnits(fullBalance ?? 0, 18));
      }

      if (fullBalanceNumber && numValue > fullBalanceNumber) {
        numValue = fullBalanceNumber;
      }

      setValue('amount', numValue.toString());
      setValue('percentage', Math.min(100, (numValue / numericBalance) * 100));

      if (
        selectedToken?.TokenB.Address &&
        selectedToken?.TokenA.Address &&
        debouncedGetEstimatedTokensRef.current
      ) {
        debouncedGetEstimatedTokensRef.current(
          selectedToken.TokenB.Address,
          selectedToken.TokenA.Address,
          numValue
        );
      }
    },
    [
      selectedToken?.TokenB.Address,
      selectedToken?.TokenA.Address,
      numericBalance,
      setValue,
      fullBalance,
    ]
  );

  useEffect(() => {
    const newAmount = numericBalance * (percentage / 100);
    // setValue('amount', formatNumber(newAmount));
    handleAmountChange(formatNumber(newAmount));
  }, [percentage, numericBalance, handleAmountChange]);

  const isInsufficientBalance = useMemo(() => {
    const numAmount = Number(amount);
    return !isNaN(numAmount) && numAmount > numericBalance;
  }, [amount, numericBalance]);

  const isValidAmount = useMemo(() => {
    if (!amount) return false;
    const numAmount = Number(amount);
    return !isNaN(numAmount) && numAmount > 0;
  }, [amount]);

  const checkInsufficientSonicBalance = (sonicBalance: string | undefined) => {
    const sonicBalanceNumber = Number(sonicBalance || 0);
    if (sonicBalanceNumber <= 0) {
      open({
        title: '',
        component: <ExportWalletGuide />,
        size: 'md',
      });
      return true;
    }
    return false;
  };

  const onSubmit = (values: FormValues) => {
    if (checkInsufficientSonicBalance(sonicBalance)) return;
    if (!isValidAmount) return toast.error('Amount must be greater than 0');

    const numAmount = Number(values.amount);
    buyTokensMutation.mutate({
      wallet: wallet as any,
      assetIn: selectedToken?.TokenB.Address || '',
      assetInDecimals: selectedToken?.TokenB.Decimals || 0,
      assetOut: selectedToken?.TokenA.Address || '',
      amount: formatNumber(numAmount),
    });
  };

  return (
    <TabsContent value="buy">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-8 pt-8 text-muted-foreground"
        >
          <div className="flex flex-col gap-2">
            <p className="text-sm">Balance</p>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={selectedToken?.TokenB.Name} />
              </SelectTrigger>
              <SelectContent>
                {selectedToken?.TokenB.Name ? (
                  <SelectItem value={selectedToken?.TokenB.Name}>
                    {selectedToken?.TokenB.Name}
                  </SelectItem>
                ) : (
                  <SelectItem value="XUSDX">XUSDX</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-sm">Amount</p>
              <p className="text-sm text-muted-foreground">
                Balance: {formatNumber(numericBalance)} {selectedToken?.TokenB.Name}
              </p>
            </div>
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="0.00"
                      type="text"
                      inputMode="decimal"
                      value={field.value}
                      onChange={e => handleAmountChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-col gap-2 pt-4">
            <FormField
              control={form.control}
              name="percentage"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Slider
                      value={[field.value]}
                      onValueChange={([value]) => setValue('percentage', value)}
                      max={100}
                      step={1}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex justify-between">
              {PRESET_PERCENTAGES.map(percent => (
                <div
                  key={percent}
                  onClick={() => setValue('percentage', percent)}
                  className="cursor-pointer hover:text-primary"
                >
                  {percent === 100 ? 'Max' : `${percent}%`}
                </div>
              ))}
            </div>
          </div>

          <Authenticated
            customUI={
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  open({
                    title: 'Login to your ODX account',
                    component: <RequestOTP />,
                    size: 'md',
                  });
                  setLoginEmail('');
                }}
              >
                Login or Signup
              </Button>
            }
          >
            <Button
              type="submit"
              isLoading={buyTokensMutation.isPending}
              variant={isInsufficientBalance ? 'destructive' : 'default'}
            >
              {isInsufficientBalance
                ? 'Insufficient Balance'
                : isValidAmount
                  ? 'Buy'
                  : 'Enter Amount'}
            </Button>
          </Authenticated>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p>{selectedToken?.TokenB.Name} Balance</p>
              <div>
                {isBalanceLoading ? (
                  <Skeleton className="h-4 w-20" />
                ) : (
                  formatNumber(numericBalance)
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p>{selectedToken?.TokenA.Name} (estimated)</p>
              <p>{formatNumber(estimatedTokens)}</p>
            </div>
            <div className="flex items-center justify-between">
              <p>Order Value</p>
              <p>
                {amount
                  ? `${formatNumber(Number(amount))} ${selectedToken?.TokenB.Name}`
                  : `0.00 ${selectedToken?.TokenB.Name}`}
              </p>
            </div>
          </div>
        </form>
      </Form>
    </TabsContent>
  );
};
