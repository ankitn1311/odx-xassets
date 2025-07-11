import { Skeleton } from '@/components/ui/skeleton';
import { useTokenPriceWithFlash } from '@/hooks/mutations/use-trade-quote';

interface PriceDisplayProps {
  tokenSymbol: string;
  className?: string;
}

export function PriceDisplay({ tokenSymbol, className = '' }: PriceDisplayProps) {
  const { data, isLoading, error, flashState } = useTokenPriceWithFlash(tokenSymbol);

  if (error) return <span className={className}>-</span>;

  if (isLoading) return <Skeleton className="h-4 w-20" />;

  const flashClass =
    flashState === 'up'
      ? 'price-flash-up'
      : flashState === 'down'
        ? 'price-flash-down'
        : flashState === 'same'
          ? 'price-flash-same'
          : '';

  return (
    <div className="items-center= flex gap-2">
      <span className={`rounded px-2 py-1 transition-colors ${flashClass} ${className}`}>
        ${data}
      </span>
    </div>
  );
}
