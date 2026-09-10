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

interface TokenInputProps {
  label: string;
  isOutput?: boolean;
  onAmountChange: (value: string) => void;
  onOutputAmountChange?: (value: string) => void;
  showPercentageButtons?: boolean;
}

const PERCENTAGE_OPTIONS = [50, 100];

/** One white "Spend" / "Receive" block: label, big amount, token chip, balance row. */
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

  const chipClass =
    'flex h-9 shrink-0 items-center gap-2 rounded-full bg-secondary px-3 text-sm font-medium';

  return (
    <div className="rounded-xl bg-card p-4">
      <div className="text-[13px] text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-center justify-between gap-3">
        <FormField
          control={form.control}
          name={fieldName}
          render={({ field }) => (
            <FormItem className="min-w-0 flex-1">
              <FormControl>
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder="0"
                  disabled={isOutput}
                  className="h-11 overflow-hidden text-ellipsis border-0 bg-transparent px-0 text-[30px] font-normal tracking-[-0.02em] placeholder:text-muted-foreground/60 focus-visible:ring-0 disabled:opacity-100 md:text-[30px]"
                  value={field.value}
                  onChange={e => !isOutput && onAmountChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {isUSDT ? (
          <div className={chipClass}>
            <Image src={`/images/tokens/${token?.Name}.png`} alt={token?.Name} width={22} height={22} />
            <span>{convertXUSDT(token?.Name)}</span>
          </div>
        ) : (
          <Select value={token?.Name} onValueChange={handleTokenSelect}>
            <SelectTrigger className={cn(chipClass, 'w-auto border-0 py-0 hover:bg-[#E6E6E6]')}>
              <SelectValue placeholder="Select token" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <div className="flex flex-col gap-1">
                {availableTokens
                  ?.filter(t => t.Name !== 'xUSDT') // Exclude xUSDT from dropdown
                  .map(token => (
                    <SelectItem key={token.Address} value={token.Name} className="rounded-lg">
                      <div className="flex items-center gap-2">
                        <Image
                          src={`/images/tokens/${token.Name}.png`}
                          alt={token.Name}
                          width={22}
                          height={22}
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
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <span>Balance</span>
          {isBalanceLoading ? (
            <Skeleton className="h-3 w-16" />
          ) : (
            <span className={cn('font-mono text-foreground', isBalanceUpdating && 'animate-pulse')}>
              {removeTrailingZeros(Number(balance).toString())}
            </span>
          )}
        </div>
        {!isOutput && showPercentageButtons && (
          <div className="flex items-center gap-1">
            {PERCENTAGE_OPTIONS.map(percentage => (
              <Button
                key={percentage}
                variant="secondary"
                size="sm"
                type="button"
                className="h-6 rounded-full px-2 text-[11px]"
                onClick={() => handlePercentageClick(percentage)}
              >
                {percentage === 100 ? 'Max' : `${percentage}%`}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
