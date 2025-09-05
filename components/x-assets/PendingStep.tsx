import { useFormContext } from 'react-hook-form';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { SwapFormValues } from './TokenSwapCard';
import { TabState, useTokenSwapStore } from '@/stores/token-swap-store';
import { removeTrailingZeros } from '@/lib/utils';

export function PendingStep() {
  const form = useFormContext<SwapFormValues>();
  const amount = form.watch('amount');
  const outputAmount = form.watch('outputAmount');
  const inputToken = form.watch('inputToken');
  const outputToken = form.watch('outputToken');
  const { activeTab } = useTokenSwapStore();

  return (
    <div className="flex flex-col items-center">
      <div className="mb-6 mt-4 text-center">
        <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-destructive" />
        <h2 className="text-xl font-semibold">Transaction Pending</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Your transaction is pending. Please wait for it to be confirmed.
        </p>
      </div>

      <div className="w-full space-y-6">
        <div className="flex w-full justify-between border-b border-border pb-4">
          <div className="flex flex-col items-start">
            <p className="mb-2 text-sm text-muted-foreground">
              {activeTab === TabState.BUY ? 'Attempting to Pay' : 'Attempting to Sell'}
            </p>
            <div className="flex items-center gap-2">
              <Image
                src={`/images/tokens/${inputToken?.Name}.png`}
                alt={inputToken?.Name ?? ''}
                width={24}
                height={24}
              />
              <div className="flex flex-col">
                <p className="font-mono text-base font-medium">{removeTrailingZeros(amount)}</p>
                <p className="text-sm text-muted-foreground">{inputToken?.Name}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <p className="mb-2 text-sm text-muted-foreground">
              {activeTab === TabState.BUY ? 'Would Receive' : 'Would Receive'}
            </p>
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-end">
                <p className="font-mono text-base font-medium">
                  {removeTrailingZeros(outputAmount)}
                </p>
                <p className="text-sm text-muted-foreground">{outputToken?.Name}</p>
              </div>
              <Image
                src={`/images/tokens/${outputToken?.Name}.png`}
                alt={outputToken?.Name ?? ''}
                width={24}
                height={24}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="text-sm text-destructive">Pending</p>
          </div>

          {/* <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Error</p>
            <p className="text-sm text-destructive">Insufficient funds for gas</p>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">TxHash</p>
            <div className="flex items-center gap-1">
              <p className="text-sm text-primary">0x520c1118d14d761801...</p>
              <Button variant="ghost" size="icon" className="h-4 w-4 p-0">
                <Image src="/images/copy.svg" alt="Copy" width={12} height={12} />
              </Button>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}
