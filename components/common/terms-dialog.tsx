'use client';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

const POINTS = [
  'An xAsset is a receipt for an asset held in custody. It is not the underlying asset itself.',
  'Each unit is backed 1:1 by the underlying, held by the custodian, and can be redeemed for USDC.e.',
  'Identity verification is required only for series that need it, such as fund shares.',
  'Prices come from a market feed; quotes can move before an order fills, within your slippage setting.',
];

/**
 * Terms of Service gate. Shown once per wallet before the first order; also openable
 * from Settings. `onAccept` is only called when the reader ticks the box and confirms.
 */
export function TermsDialog({
  open,
  onOpenChange,
  onAccept,
  readOnly = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept?: () => void;
  readOnly?: boolean;
}) {
  const [checked, setChecked] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl p-6 sm:rounded-2xl">
        <DialogHeader className="text-left sm:text-left">
          <DialogTitle className="text-xl font-medium tracking-tight">Before you continue</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            A short version of the terms. The full text is linked below.
          </DialogDescription>
        </DialogHeader>

        <ul className="mt-2 flex flex-col gap-3 text-sm leading-relaxed">
          {POINTS.map(p => (
            <li key={p} className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground" />
              <span>{p}</span>
            </li>
          ))}
        </ul>

        <p className="text-xs text-muted-foreground">
          Read the full{' '}
          <a href="https://docs.odx.so" target="_blank" rel="noopener noreferrer" className="text-foreground underline underline-offset-2">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="https://docs.odx.so" target="_blank" rel="noopener noreferrer" className="text-foreground underline underline-offset-2">
            Privacy Policy
          </a>
          .
        </p>

        {!readOnly && (
          <>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-secondary p-3 text-sm">
              <Checkbox id="terms-ack" checked={checked} onCheckedChange={v => setChecked(v === true)} className="mt-0.5" />
              <span>I understand that xAssets are receipts, not the underlying assets, and I accept the terms.</span>
            </label>
            <Button size="lg" className="w-full" disabled={!checked} onClick={onAccept}>
              Accept and continue
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
