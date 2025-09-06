import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useFormContext } from 'react-hook-form';
import { useTokenSwapStore, TabState } from '@/stores/token-swap-store';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { useTradeQuote } from '@/hooks/mutations/use-trade-quote';
import { toast } from 'sonner';
import { debounce } from 'lodash';
import { useTokenBalance } from '@/hooks/queries/use-token-balance';
import { cn, convertXUSDT, removeTrailingZeros } from '@/lib/utils';
import { TokenInfo } from '@/hooks/queries/use-all-tokens';
import { Skeleton } from '../ui/skeleton';
import { Wallet } from 'lucide-react';

interface TokenInputProps {
  label: string;
  isOutput?: boolean;
  onAmountChange: (value: string) => void;
  onOutputAmountChange?: (value: string) => void;
  showPercentageButtons?: boolean;
}

const PERCENTAGE_OPTIONS = [50, 100];

export function TokenInput({
  label,
  isOutput = false,
  onAmountChange,
  showPercentageButtons = true,
}: TokenInputProps) {
  const form = useFormContext();
  const { watch, setValue, clearErrors } = form;
  const fieldName = isOutput ? 'outputAmount' : 'amount';
  const debouncedGetQuoteRef = useRef<ReturnType<typeof debounce> | null>(null);

  const { allTokens, isBalanceUpdating, activeTab, setSelectedXAsset } = useTokenSwapStore();
  const inputToken = watch('inputToken');
  const outputToken = watch('outputToken');

  const token = !isOutput ? inputToken : outputToken;
  const isUSDT = token?.Name === 'USDC';
  const { getQuote } = useTradeQuote();
  // const token = isOutput ? outputToken : inputToken;

  const availableTokens = allTokens?.map(tokens => {
    if (tokens.TokenA.Name === 'USDC') {
      return tokens.TokenB;
    }
    return tokens.TokenA;
  });

  const { data: balance = 0, isLoading: isBalanceLoading } = useTokenBalance(
    token?.Address ?? '',
    token?.Decimals ?? 18
  );

  const handlePercentageClick = (percentage: number) => {
    setValue('percentage', percentage);
    // use the balance of the token
    if (percentage === 100) {
      onAmountChange(balance.toString());
    } else {
      onAmountChange(((Number(balance) * percentage) / 100).toString());
    }
  };

  const handleTokenSelect = (tokenName: string) => {
    const selectedToken = availableTokens?.find(t => t.Name === tokenName);
    if (!selectedToken) return;

    if (isOutput) {
      setValue('outputToken', selectedToken);
    } else {
      setValue('inputToken', selectedToken);
    }

    // Always update store and URL if it's an xAsset (regardless of input/output)
    if (selectedToken.Name !== 'USDC') {
      // Update the selected xAsset in the store
      setSelectedXAsset(selectedToken);
      // Update URL
      const newUrl = `/x-assets?selected-token=${selectedToken.Address}`;
      window.history.pushState({}, '', newUrl);
    }
    clearErrors();

    // For Buy tab: when changing xAsset, keep the USDC amount
    // For Sell tab: when changing xAsset, clear the amount
    if (activeTab === TabState.BUY && selectedToken.Name !== 'USDC') {
      // Keep the USDC amount when changing xAsset on Buy tab
      setValue('outputAmount', '');
    } else {
      // Clear amounts for other cases
      setValue('amount', '');
      setValue('outputAmount', '');
    }
    setValue('percentage', 0);
  };

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
          const quote = await getQuote({
            inputToken: inputToken,
            outputToken: outputToken,
            inputAmount,
            type: isBuy ? 'buy' : 'sell',
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

  return (
    <div className="relative">
      <div className={cn('rounded-lg bg-card/50 py-3')}>
        <div
          className={cn('mb-3 text-xs font-black uppercase tracking-wider text-muted-foreground')}
        >
          {label}
        </div>
        <div className="flex items-center justify-between gap-2">
          <FormField
            control={form.control}
            name={fieldName}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    type="text"
                    placeholder="0.0"
                    disabled={isOutput}
                    className="min-h-[2.5rem] overflow-hidden text-ellipsis border-0 bg-transparent px-0 py-2 font-normal placeholder:text-muted-foreground/50 focus-visible:ring-0 md:text-2xl"
                    value={field.value}
                    onChange={
                      e => !isOutput && onAmountChange(e.target.value)
                      // ? onOutputAmountChange?.(e.target.value)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {isUSDT ? (
            <div className="flex h-10 shrink-0 items-center gap-2 rounded-md bg-background/50 px-3 py-2">
              <Image
                src={`/images/tokens/${token?.Name}.png`}
                alt={token?.Name}
                width={24}
                height={24}
              />
              <span className="font-medium">{convertXUSDT(token?.Name)}</span>
            </div>
          ) : (
            <Select value={token?.Name} onValueChange={handleTokenSelect}>
              <SelectTrigger className="h-10 w-auto gap-2 border-0 bg-background/50 px-3 py-2 hover:bg-background">
                {/* <div className="flex items-center gap-2">
                     
                  <Image
                    src={`/images/tokens/${token?.Name}.png`}
                    alt={token?.Name}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                  <SelectValue placeholder="Select token" />
                </div> */}
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent>
                <div className="flex flex-col gap-2">
                  {availableTokens
                    ?.filter(t => t.Name !== 'xUSDT') // Exclude xUSDT from dropdown
                    .map(token => (
                      <SelectItem
                        key={token.Address}
                        value={token.Name}
                        className="flex items-center gap-2"
                      >
                        <div className="flex items-center gap-2">
                          <Image
                            src={`/images/tokens/${token.Name}.png`}
                            alt={token.Name}
                            width={24}
                            height={24}
                          />
                          <span>{convertXUSDT(token.Name)}</span>
                        </div>
                      </SelectItem>
                    ))}
                </div>
              </SelectContent>
            </Select>
          )}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-md bg-muted/50 px-2 py-1">
              <Wallet
                className={
                  'h-3 w-3 text-muted-foreground ' + (isBalanceUpdating && 'animate-pulse')
                }
              />
              {/* <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={cn('text-muted-foreground', isBalanceUpdating && 'animate-pulse')}
              >
                <path
                  d="M3 7C3 4.79086 4.79086 3 7 3H17C19.2091 3 21 4.79086 21 7V17C21 19.2091 19.2091 21 17 21H7C4.79086 21 3 19.2091 3 17V7Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M16.5 8.5L16.5 16.5M16.5 16.5L12 12M16.5 16.5L21 16.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg> */}
              <span className="text-xs text-muted-foreground">Balance:</span>
              {isBalanceLoading ? (
                <Skeleton className="h-3 w-16" />
              ) : (
                <span className={cn('text-xs font-medium', isBalanceUpdating && 'animate-pulse')}>
                  {removeTrailingZeros(Number(balance).toString())}
                </span>
              )}
            </div>
          </div>
          {!isOutput && showPercentageButtons && (
            <div className="flex items-center gap-1">
              {PERCENTAGE_OPTIONS.map(percentage => (
                <Button
                  key={percentage}
                  variant="ghost"
                  size="sm"
                  type="button"
                  className="h-6 rounded px-2 text-xs font-medium"
                  onClick={() => handlePercentageClick(percentage)}
                >
                  {percentage === 100 ? 'MAX' : `${percentage}%`}
                </Button>
              ))}
            </div>
          )}
          {isOutput && showPercentageButtons && <div className="invisible h-6" />}
        </div>
      </div>
    </div>
  );
}
