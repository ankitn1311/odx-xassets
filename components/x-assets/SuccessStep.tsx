import { useFormContext } from 'react-hook-form';
import { TabState, useTokenSwapStore } from '@/stores/token-swap-store';
import Image from 'next/image';
import { Button } from '../ui/button';
import { CheckCircle2 } from 'lucide-react';
import { TokenInfo } from '@/hooks/queries/use-all-tokens';
import { useState } from 'react';
import { useWatchAsset } from 'wagmi';
import { toast } from 'sonner';
import { shortenAddress } from '@/utils/crypto';
import { convertXUSDT } from '@/lib/utils';
import { SwapFormValues } from './TokenSwapCard';

const symbolReplace = {
  USDC: 'USDC',
  x1SOL: 'x1SOL',
  x1XRP: 'x1XRP',
  x1ADA: 'x1ADA',
};

export function SuccessStep() {
  const { watchAssetAsync, isPending } = useWatchAsset();
  const [tokenToAdd, setTokenToAdd] = useState<TokenInfo | null>(null);
  const { latestTradeHash, activeTab } = useTokenSwapStore();
  const form = useFormContext<SwapFormValues>();
  const amount = form.watch('amount');
  const outputAmount = form.watch('outputAmount');
  const inputToken = form.watch('inputToken');
  const outputToken = form.watch('outputToken');

  const addTokenToWallet = async (token: TokenInfo) => {
    setTokenToAdd(token);
    try {
      await watchAssetAsync({
        type: 'ERC20',
        options: {
          address: token.Address,
          symbol: symbolReplace[token.Name as keyof typeof symbolReplace] || token.Name,
          decimals: token.Decimals,
          // image: token.Image,
        },
      });
      toast.success('Token added to wallet');
    } catch (error) {
      console.error('Error adding token to wallet:', error);
      // You might want to show an error message to the user here
      toast.error('Error adding token to wallet');
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-6 mt-4 text-center">
        <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-500" />
        <h2 className="text-xl font-semibold">Transaction Complete</h2>
      </div>

      <div className="w-full space-y-6">
        <div className="flex w-full justify-between border-b border-border pb-4">
          <div className="flex flex-col items-start">
            <p className="mb-2 text-sm text-muted-foreground">
              {activeTab === TabState.BUY ? 'Bought' : 'Sold'}
            </p>
            <div className="flex items-center gap-2">
              <Image
                src={`/images/tokens/${inputToken?.Name}.png`}
                alt={inputToken?.Name ?? ''}
                width={24}
                height={24}
                className="rounded-full"
              />
              <div className="flex flex-col">
                <p className="font-medium">{amount}</p>
                <p className="text-sm text-muted-foreground">
                  {convertXUSDT(inputToken?.Name ?? '')}
                </p>
                {/* <p className="text-sm text-muted-foreground">
                  ${(Number(amount) * 2.056).toFixed(2)}
                </p> */}
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="mt-2"
              onClick={() => {
                addTokenToWallet(inputToken!);
              }}
              disabled={isPending && tokenToAdd?.Address === inputToken?.Address}
            >
              {isPending && tokenToAdd?.Address === inputToken?.Address
                ? 'Adding...'
                : 'Add to wallet'}
            </Button>
          </div>

          <div className="flex flex-col items-end">
            <p className="mb-2 text-sm text-muted-foreground">
              {activeTab === TabState.BUY ? 'Sold' : 'Bought'}
            </p>
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-end">
                <p className="font-medium">{Number(outputAmount).toFixed(8)}</p>
                <p className="text-sm text-muted-foreground">
                  {convertXUSDT(outputToken?.Name ?? '')}
                </p>
                {/* <p className="text-sm text-muted-foreground">${Number(outputAmount).toFixed(2)}</p> */}
              </div>
              <Image
                src={`/images/tokens/${outputToken?.Name}.png`}
                alt={outputToken?.Name ?? ''}
                width={24}
                height={24}
                className="rounded-full"
              />
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="mt-2"
              onClick={() => {
                addTokenToWallet(outputToken!);
              }}
              disabled={isPending && tokenToAdd?.Address === outputToken?.Address}
            >
              {isPending && tokenToAdd?.Address === outputToken?.Address
                ? 'Adding...'
                : 'Add to wallet'}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="text-sm text-green-500">Completed</p>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Rate</p>
            <p className="text-sm">
              {amount} {convertXUSDT(inputToken?.Name ?? '')} = {Number(outputAmount).toFixed(8)}{' '}
              {convertXUSDT(outputToken?.Name ?? '')}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">TxHash</p>
            <div className="flex items-center gap-1">
              <a
                className="text-sm text-primary"
                // href={`https://testnet.sonicscan.org/tx/${latestTradeHash}`}
                href={`https://sonicscan.org/tx/${latestTradeHash}`}
                target="_blank"
              >
                {shortenAddress(latestTradeHash)}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
