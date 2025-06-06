'use client';

import { useEvmWalletSync, useSuiWalletSync, useTonWalletSync } from '@/hooks/use-wallet-sync';
import { PropsWithChildren } from 'react';

export default function WalletSync({ children }: PropsWithChildren) {
  useEvmWalletSync();
  useSuiWalletSync();
  useTonWalletSync();
  return <>{children}</>;
}
