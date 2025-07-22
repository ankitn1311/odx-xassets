import { Skeleton } from '@/components/ui/skeleton';
import { useTokenPriceChange, useTokenPriceWithFlash } from '@/hooks/mutations/use-trade-quote';
import { TrendingDown, TrendingUp } from 'lucide-react';

interface PriceChangeDisplayProps {
  tokenSymbol: string;
  className?: string;
}

export function PriceChangeDisplay({ tokenSymbol, className = '' }: PriceChangeDisplayProps) {
  const { data: priceChange, isLoading: priceChangeLoading } = useTokenPriceChange(tokenSymbol);

  if (priceChangeLoading) return <Skeleton className="h-4 w-20" />;

  return (
    <div className="items-center= flex gap-2">
      {priceChange && (
        <div className="flex items-center gap-1">
          <span
            className={`rounded px-2 py-1 font-mono transition-colors ${priceChange > 0 ? 'text-success' : 'text-destructive'} ${className}`}
          >
            {priceChange > 0 ? '+' : ''}
            {(priceChange * 100).toFixed(2)}%
          </span>
          {priceChange > 0 ? (
            <TrendingUp className="h-4 w-4 text-success" />
          ) : (
            <TrendingDown className="h-4 w-4 text-destructive" />
          )}
        </div>
      )}
    </div>
  );
}
