import { AlertCircle } from 'lucide-react';
import { SHOW_DEMO_ALERTS } from '@/config/demo';
import { cn } from '@/lib/utils';

/**
 * Red alert icon placed next to a value that is a constant rather than live data.
 * Renders nothing when SHOW_DEMO_ALERTS is off.
 */
export function DemoAlert({ className, note }: { className?: string; note?: string }) {
  if (!SHOW_DEMO_ALERTS) return null;
  const label = note ?? 'Illustrative value, not live data';
  return (
    <span title={label} aria-label={label} className="inline-flex shrink-0 align-middle">
      <AlertCircle className={cn('h-3.5 w-3.5 text-[#D0342C]', className)} />
    </span>
  );
}
