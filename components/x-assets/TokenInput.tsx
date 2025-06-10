import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useFormContext } from 'react-hook-form';
import { useTokenSwapStore } from '@/stores/token-swap-store';
import { ChevronDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Image from 'next/image';
import { useEffect, useCallback, useRef } from 'react';
import { useAllTokens } from '@/hooks/queries/use-all-tokens';
import { useTradeQuote } from '@/hooks/mutations/use-trade-quote';
import { toast } from 'sonner';
import { debounce } from 'lodash';
import { useTokenBalance } from '@/hooks/queries/use-token-balance';
import { convertXUSDT } from '@/lib/utils';

const MAX_DECIMALS = 2;

interface TokenInputProps {
  label: string;
  isOutput?: boolean;
  onAmountChange: (value: string) => void;
  onOutputAmountChange?: (value: string) => void;
  showPercentageButtons?: boolean;
}

const PERCENTAGE_OPTIONS = [25, 50, 75, 100];

export function TokenInput({
  label,
  isOutput = false,
  onAmountChange,
  onOutputAmountChange,
  showPercentageButtons = true,
}: TokenInputProps) {
  const form = useFormContext();
  const { setValue } = form;
  const fieldName = isOutput ? 'outputAmount' : 'amount';
  const { getQuote, isLoading: isQuoteLoading } = useTradeQuote();
  const debouncedGetQuoteRef = useRef<ReturnType<typeof debounce> | null>(null);

  const { inputToken, outputToken, setInputToken, setOutputToken } = useTokenSwapStore();
  const { data: allTokens } = useAllTokens();
  // const token = isOutput ? outputToken : inputToken;

  const availableTokens = allTokens?.map(tokens => {
    if (tokens.TokenA.Name === 'USDC') {
      return tokens.TokenB;
    }
    return tokens.TokenA;
  });

  const token = !isOutput ? inputToken : outputToken;
  const { data: balance } = useTokenBalance(token?.Address ?? '', token?.Decimals ?? 18);

  const isUSDT = token?.Name === 'USDC';

  const handlePercentageClick = (percentage: number) => {
    setValue('percentage', percentage);
    // use the balance of the token
    // setValue('amount', ((Number(balance) * percentage) / 100).toFixed(2));
    onAmountChange(((Number(balance) * percentage) / 100).toFixed(2));
  };

  const handleTokenSelect = (tokenName: string) => {
    const selectedToken = availableTokens?.find(t => t.Name === tokenName);
    if (!selectedToken) return;

    if (isOutput) {
      setOutputToken(selectedToken);
    } else {
      setInputToken(selectedToken);
    }
  };

  useEffect(() => {
    // Initialize the debounced function
    debouncedGetQuoteRef.current = debounce(
      async (inputTokenAddress: string, outputTokenAddress: string, inputAmount: string) => {
        try {
          const quote = await getQuote({
            inputToken: inputTokenAddress,
            outputToken: outputTokenAddress,
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

  const handleAmountChange = useCallback(
    async (value: string) => {
      if (!value) {
        setValue('amount', '');
        setValue('outputAmount', '');
        setValue('percentage', 0);
        return;
      }

      const cleanValue = value.replace(/[^0-9.]/g, '');
      const parts = cleanValue.split('.');
      const formattedValue =
        parts[0] + (parts.length > 1 ? '.' + parts[1].slice(0, MAX_DECIMALS) : '');

      const numValue = Number(formattedValue);
      if (isNaN(numValue)) return;

      setValue('amount', formattedValue);

      if (inputToken && outputToken && debouncedGetQuoteRef.current) {
        debouncedGetQuoteRef.current(inputToken.Address, outputToken.Address, formattedValue);
      }
    },
    [inputToken, outputToken, setValue]
  );

  useEffect(() => {
    if (allTokens) {
      const inpToken = allTokens?.[0].TokenA;
      const outToken = allTokens?.[0].TokenB;
      if (inpToken) {
        setInputToken(inpToken);
      }
      if (outToken) {
        setOutputToken(outToken);
      }
    }
  }, [allTokens, setInputToken, setOutputToken]);

  return (
    <div className="relative">
      <div className="rounded-lg border bg-card/50 p-3">
        <div className="mb-2 text-sm text-muted-foreground">{label}</div>
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
                    className="border-0 bg-transparent p-0 text-2xl font-normal placeholder:text-muted-foreground/50 focus-visible:ring-0"
                    value={field.value}
                    onChange={e =>
                      isOutput
                        ? onOutputAmountChange?.(e.target.value)
                        : onAmountChange(e.target.value)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {isUSDT ? (
            <div className="flex h-10 shrink-0 items-center gap-2 px-3 py-2">
              <Image
                src={`/images/tokens/${token?.Name}.png`}
                alt={token?.Name}
                width={24}
                height={24}
                className="rounded-full"
              />
              <span className="font-medium">{convertXUSDT(token?.Name)}</span>
            </div>
          ) : (
            <Select value={token?.Name} onValueChange={handleTokenSelect}>
              <SelectTrigger className="h-10 w-auto gap-2 border-0 bg-transparent px-3 py-2">
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
                          className="rounded-full"
                        />
                        <span>{convertXUSDT(token.Name)}</span>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-muted-foreground"
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
            </svg>
            <p className="text-xs text-muted-foreground">Balance: {Number(balance).toFixed(2)}</p>
          </div>
          {showPercentageButtons && (
            <div className="flex items-center gap-1.5">
              {PERCENTAGE_OPTIONS.map(percentage => (
                <Button
                  key={percentage}
                  variant="secondary"
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
        </div>
      </div>
    </div>
  );
}
