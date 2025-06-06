import React from 'react';
import { Card } from '@/components/ui/card';
import { TokenPair, useAllTokens } from '@/hooks/queries/use-all-tokens';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { useQuote } from '@/hooks/queries/use-quote';
import { cn } from '@/lib/utils';

const loadingAmount = Array.from({ length: 5 }, (_, i) => i + 1);

export default function Quickbar() {
  const allTokensData = useAllTokens();

  return (
    <Card className="Quickbar">
      <div className="no-scrollbar touch-scroll relative h-full w-full overflow-x-auto">
        <div className="no-scrollbar touch-scroll overflow-x-auto">
          <div className="flex gap-8 p-2">
            {allTokensData.data?.map((tokenPair, index) => (
              <QuickbarToken key={index} data={tokenPair} />
            ))}
            {allTokensData.isLoading &&
              loadingAmount.map((_, index: number) => <QuickbarToken key={index} data={null} />)}
          </div>
        </div>
      </div>
    </Card>
  );
}

function QuickbarToken({ data }: { data: TokenPair | null }) {
  const router = useRouter();
  const { data: quote, isLoading: isQuoteLoading } = useQuote({
    assetIn: data?.TokenA.Address || '',
    assetOut: data?.TokenB.Address || '',
    amount: 1,
    enabled: !!data?.TokenA.Address && !!data?.TokenB.Address,
  });

  if (!data || isQuoteLoading) {
    return <Skeleton className="h-4 w-20 shrink-0" />;
  }

  return (
    <div
      className="group flex items-center gap-1 hover:cursor-pointer"
      onClick={() => router.push(`?token=${data.TokenA.Address}`)}
    >
      {/* <div className="flex flex-shrink-0 -space-x-1 *:ring *:ring-card">
        <Avatar className="h-4 w-4">
          <div className="bg-primary w-4 h-4 rounded-full"></div>
        </Avatar>
        <Avatar className='h-4 w-4'>
          <div className="bg-secondary w-4 h-4 rounded-full"></div>
        </Avatar>
      </div> */}
      <div className="flex items-center gap-1">
        <div className="group-hover:text-foreground">
          {data.TokenA.Name}/{data.TokenB.Name}
        </div>
        <div className="text-xs text-muted-foreground">
          {quote ? Number(quote).toFixed(6) : '0'}
        </div>
      </div>
    </div>
  );
}
