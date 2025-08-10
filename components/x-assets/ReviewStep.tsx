import { useFormContext } from 'react-hook-form';
import { useWatchAsset } from 'wagmi';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Network, Zap, DollarSign, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { TabState, TradeState, useTokenSwapStore } from '@/stores/token-swap-store';
import { TokenInfo } from '@/hooks/queries/use-all-tokens';
import { toast } from 'sonner';
import { removeTrailingZeros } from '@/lib/utils';
import { SwapFormValues } from './TokenSwapCard';
import { useTradeQuote } from '@/hooks/mutations/use-trade-quote';
import { ODXApiSource } from './InitialStep';

const POLLING_INTERVAL = 5000; // 5 seconds

export function ReviewStep() {
  const { watchAssetAsync, isPending } = useWatchAsset();
  const [tokenToAdd, setTokenToAdd] = useState<TokenInfo | null>(null);
  const { setTradeState, activeTab, tradeState } = useTokenSwapStore();
  const form = useFormContext<SwapFormValues>();
  const amount = form.watch('amount');
  const outputAmount = form.watch('outputAmount');
  const inputToken = form.watch('inputToken');
  const outputToken = form.watch('outputToken');

  const { getQuote } = useTradeQuote();
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  // Polling effect to update outputAmount every 500ms
  useEffect(() => {
    // Only poll if all required values are present
    if (!inputToken || !outputToken || !amount || amount === '' || amount === '0') {
      form.setValue('outputAmount', '');
      return;
    }

    if (tradeState === TradeState.PROCESSING && pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      return;
    }

    // Clear any existing interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    // Set up polling
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const quote = await getQuote({
          inputToken,
          outputToken,
          inputAmount: amount,
          type: activeTab === TabState.BUY ? 'buy' : 'sell',
        });
        if (quote !== undefined && quote !== null) {
          form.setValue('outputAmount', quote.toString());
        }
      } catch (error) {
        // Optionally handle error (e.g., toast)
      }
    }, POLLING_INTERVAL);
    // Cleanup
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [inputToken, outputToken, amount, getQuote, form, tradeState, activeTab]);

  const addTokenToWallet = async (token: TokenInfo) => {
    setTokenToAdd(token);
    try {
      await watchAssetAsync({
        type: 'ERC20',
        options: {
          address: token.Address,
          symbol: token.Name,
          decimals: token.Decimals,
          // image: token.Image,
        },
      });
      toast.success('Token added to wallet');
    } catch (error) {
      console.error('Error adding token to wallet:', error);
      toast.error('Error adding token to wallet');
    }
  };

  const onBack = () => {
    setTradeState(TradeState.INITIAL);

    form.reset({
      amount: '',
      outputAmount: '',
      percentage: 0,
      inputToken: inputToken,
      outputToken: outputToken,
    });
  };

  return (
    <div className="flex flex-col">
      <div className="mb-4 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack} className="-ml-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold">Review</h2>
      </div>

      <div className="flex justify-between">
        <div className="flex flex-col items-start">
          <p className="mb-2 text-sm text-muted-foreground">
            {activeTab === TabState.BUY ? 'Buy' : 'Sell'}
          </p>
          <div className="flex items-center gap-2">
            <Image
              src={`/images/tokens/${inputToken?.Name}.png`}
              alt={inputToken?.Name ?? ''}
              width={32}
              height={32}
            />
            <div className="flex flex-col">
              <p className="font-mono text-base font-medium">{removeTrailingZeros(amount)}</p>
              <p className="text-sm text-muted-foreground">{inputToken?.Name}</p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              addTokenToWallet(inputToken!);
            }}
            className="mt-2"
            disabled={isPending && tokenToAdd?.Address === inputToken?.Address}
          >
            {isPending && tokenToAdd?.Address === inputToken?.Address
              ? 'Adding...'
              : 'Add to wallet'}
          </Button>
        </div>

        <div className="flex flex-col items-end">
          <p className="mb-2 text-sm text-muted-foreground">
            {activeTab === TabState.BUY ? 'Sell' : 'Buy'}
          </p>
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-end">
              <p className="font-mono text-base font-medium">{removeTrailingZeros(outputAmount)}</p>
              <p className="text-sm text-muted-foreground">{outputToken?.Name}</p>
            </div>
            <Image
              src={`/images/tokens/${outputToken?.Name}.png`}
              alt={outputToken?.Name ?? ''}
              width={32}
              height={32}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              addTokenToWallet(outputToken!);
            }}
            className="mt-2"
            disabled={isPending && tokenToAdd?.Address === outputToken?.Address}
          >
            {isPending && tokenToAdd?.Address === outputToken?.Address
              ? 'Adding...'
              : 'Add to wallet'}
          </Button>
        </div>
      </div>

      {/* Details Section */}
      <div className="my-10 grid grid-cols-1 gap-4 rounded-xl bg-muted/60 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <DollarSign className="h-4 w-4 text-primary" /> Source
          </span>
          <ODXApiSource />
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Zap className="h-4 w-4 text-primary" /> Rate
          </span>
          <span className="text-sm font-medium">
            <span className="font-mono font-bold">1</span>{' '}
            <span className="text-muted-foreground">{inputToken?.Name}</span> = $
            <span className="font-mono font-bold">
              {removeTrailingZeros((Number(outputAmount) / Number(amount)).toString())}
            </span>{' '}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Network className="h-4 w-4 text-primary" /> Network
          </span>
          <span className="text-sm font-medium">SONIC</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <DollarSign className="h-4 w-4 text-primary" /> Network cost
          </span>
          <span className="text-sm font-medium">Free</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <ArrowRight className="h-4 w-4 text-primary" /> Receive at least
          </span>
          <span className="text-sm font-semibold">
            <span className="font-mono font-bold text-success">
              {activeTab === TabState.BUY
                ? removeTrailingZeros(amount)
                : removeTrailingZeros(outputAmount)}
            </span>{' '}
            {activeTab === TabState.BUY ? inputToken?.Name : outputToken?.Name}
          </span>
        </div>
      </div>

      {/* <Button
        type="submit"
        size="lg"
        className="mt-6 w-full bg-muted/80 text-muted-foreground hover:bg-muted"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Confirming...' : 'Confirm trade'}
      </Button> */}
    </div>
  );
}
