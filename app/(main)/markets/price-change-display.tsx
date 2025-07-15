import { Skeleton } from '@/components/ui/skeleton';
import { useTokenPriceChange, useTokenPriceWithFlash } from '@/hooks/mutations/use-trade-quote';

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
        <span
          className={`rounded px-2 py-1 font-mono transition-colors ${priceChange > 0 ? 'text-success' : 'text-destructive'} ${className}`}
        >
          {(priceChange * 100).toFixed(2)}%
        </span>
      )}
    </div>
  );
}
