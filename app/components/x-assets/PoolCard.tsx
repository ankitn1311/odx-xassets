import { Card } from '@/components/ui/card';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface PoolCardProps {
  token1Icon: string;
  token2Icon: string;
  token1Symbol: string;
  token2Symbol: string;
  apr: number;
  tvl: number;
  className?: string;
}

export function PoolCard({
  token1Icon,
  token2Icon,
  token1Symbol,
  token2Symbol,
  apr,
  tvl,
  className,
}: PoolCardProps) {
  return (
    <Card
      className={cn(
        'cursor-pointer bg-secondary/40 p-4 transition-colors hover:bg-secondary/50',
        className
      )}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-8">
          <div className="relative h-8">
            <div className="relative h-8 w-8">
              <Image
                src={token1Icon}
                alt={`${token1Symbol} icon`}
                fill
                className="rounded-full object-cover"
              />
              <div className="absolute -bottom-1 -right-1 rounded-full border border-border bg-background p-0.5">
                <div className="h-3 w-3 rounded-full bg-primary" />
              </div>
            </div>
            <div className="absolute left-6 top-0 h-8 w-8">
              <Image
                src={token2Icon}
                alt={`${token2Symbol} icon`}
                fill
                className="rounded-full border-2 border-background object-cover"
              />
              <div className="absolute -bottom-1 -right-1 rounded-full border border-border bg-background p-0.5">
                <div className="h-3 w-3 rounded-full bg-primary" />
              </div>
            </div>
          </div>
          <span className="text-sm text-muted-foreground">
            {token1Symbol}/{token2Symbol}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <div className="flex flex-col gap-0.5">
            <span className="text-muted-foreground">APR</span>
            <span className="font-semibold text-success">{apr.toFixed(2)}%</span>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-muted-foreground">TVL</span>
            <span className="font-semibold">${tvl.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
