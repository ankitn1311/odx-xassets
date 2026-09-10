'use client';
import { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, X } from 'lucide-react';
import { useProtocolStatus } from '@/hooks/use-protocol-status';

/** Shows the most severe protocol issue above the app; dismissable per issue for the session. */
export function StatusBanner() {
  const { issues } = useProtocolStatus();
  const [dismissed, setDismissed] = useState<string[]>([]);
  const issue = issues.find(i => !dismissed.includes(i.key));
  if (!issue) return null;

  return (
    <div className="border-b border-warning/30 bg-warning/15 text-warning-foreground">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-2 text-sm">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <span className="font-medium">{issue.label}.</span>
        <span className="hidden text-warning-foreground/80 sm:inline">{issue.detail}</span>
        <Link href="/status" className="ml-auto text-xs underline underline-offset-2">Status</Link>
        <button type="button" aria-label="Dismiss" onClick={() => setDismissed(d => [...d, issue.key])} className="opacity-70 hover:opacity-100">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
