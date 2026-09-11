import { cn } from '@/lib/utils';

/** Mono ▲/▼ figure in green or red. Pass the already-formatted magnitude. */
export function Delta({
  up,
  children,
  className,
}: {
  up: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-mono text-xs tabular-nums',
        up ? 'text-success' : 'text-destructive',
        className
      )}
    >
      <span aria-hidden="true" className="text-[9px]">
        {up ? '▲' : '▼'}
      </span>
      {children}
    </span>
  );
}
