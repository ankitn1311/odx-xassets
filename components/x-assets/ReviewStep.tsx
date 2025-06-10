import { useFormContext } from 'react-hook-form';
import { useWatchAsset } from 'wagmi';
import { SwapFormValues } from './TokenSwapForm';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { TradeState, useTokenSwapStore } from '@/stores/token-swap-store';
import { TokenInfo } from '@/hooks/queries/use-all-tokens';
import { toast } from 'sonner';
import { convertXUSDT } from '@/lib/utils';
export function ReviewStep() {
  const { watchAssetAsync, isPending } = useWatchAsset();
  const [tokenToAdd, setTokenToAdd] = useState<TokenInfo | null>(null);
  const { setTradeState } = useTokenSwapStore();
  const { inputToken, outputToken } = useTokenSwapStore();
  const form = useFormContext<SwapFormValues>();
  const amount = form.watch('amount');
  const outputAmount = form.watch('outputAmount');

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
    } catch (error) {
      console.error('Error adding token to wallet:', error);
      toast.error('Error adding token to wallet');
    }
  };

  const onBack = () => {
    setTradeState(TradeState.INITIAL);
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
          <p className="mb-2 text-sm text-muted-foreground">Sell</p>
          <div className="flex items-center gap-2">
            <Image
              src={`/images/tokens/${inputToken?.Name}.png`}
              alt={inputToken?.Name ?? ''}
              width={32}
              height={32}
              className="rounded-full"
            />
            <div className="flex flex-col">
              <p className="font-medium">{amount}</p>
              <p className="text-sm text-muted-foreground">
                {convertXUSDT(inputToken?.Name ?? '')}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="link"
            onClick={() => {
              addTokenToWallet(inputToken!);
            }}
            className="mt-1 h-auto p-0 text-xs text-muted-foreground"
            disabled={isPending && tokenToAdd?.Address === inputToken?.Address}
          >
            {isPending && tokenToAdd?.Address === inputToken?.Address
              ? 'Adding...'
              : 'Add to wallet'}
          </Button>
        </div>

        <div className="flex flex-col items-end">
          <p className="mb-2 text-sm text-muted-foreground">Buy</p>
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-end">
              <p className="font-medium">{outputAmount}</p>
              <p className="text-sm text-muted-foreground">
                {convertXUSDT(outputToken?.Name ?? '')}
              </p>
            </div>
            <Image
              src={`/images/tokens/${outputToken?.Name}.png`}
              alt={outputToken?.Name ?? ''}
              width={32}
              height={32}
              className="rounded-full"
            />
          </div>
          <Button
            type="button"
            variant="link"
            onClick={() => {
              addTokenToWallet(outputToken!);
            }}
            className="mt-1 h-auto p-0 text-xs text-muted-foreground"
            disabled={isPending && tokenToAdd?.Address === outputToken?.Address}
          >
            {isPending && tokenToAdd?.Address === outputToken?.Address
              ? 'Adding...'
              : 'Add to wallet'}
          </Button>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Source</p>
          <div className="flex items-center gap-2">
            <Image src="/images/ODX.svg" alt="ODX" width={16} height={16} className="h-4 w-4" />
            <p className="text-sm">ODX API</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Rate</p>
          <p className="text-sm">
            {amount} {convertXUSDT(inputToken?.Name ?? '')} = {outputAmount}{' '}
            {convertXUSDT(outputToken?.Name ?? '')}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Network</p>
          <div className="flex items-center gap-2">
            {/* <div className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500">
              <Image src="/images/xrp.svg" alt="SONIC" width={12} height={12} />
            </div> */}
            <p className="text-sm">SONIC</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Network cost</p>
          <p className="text-sm">Free</p>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Receive at least</p>
          <p className="text-sm">
            {outputAmount} {convertXUSDT(outputToken?.Name ?? '')}
          </p>
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
