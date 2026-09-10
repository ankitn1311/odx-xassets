import { Skeleton } from '@/components/ui/skeleton';
import { useTokenPriceChange } from '@/hooks/mutations/use-trade-quote';

interface PriceChangeDisplayProps {
  tokenSymbol: string;
  className?: string;
}

/** Mono delta with a ▲/▼ marker, green for up and red for down. */
export function PriceChangeDisplay({ tokenSymbol, className = '' }: PriceChangeDisplayProps) {
  const { data: priceChange, isLoading: priceChangeLoading } = useTokenPriceChange(tokenSymbol);

  if (priceChangeLoading) return <Skeleton className="h-4 w-20" />;
  if (!priceChange) return null;

  const up = priceChange > 0;
  return (
    <span
      className={`inline-flex items-center gap-1 font-mono text-xs ${up ? 'text-success' : 'text-destructive'} ${className}`}
    >
      <span aria-hidden="true" className="text-[9px]">
        {up ? '▲' : '▼'}
      </span>
      {(Math.abs(priceChange) * 100).toFixed(2)}%
    </span>
  );
}
