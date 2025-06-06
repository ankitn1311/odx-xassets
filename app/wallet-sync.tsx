'use client';

import { useEvmWalletSync } from '@/hooks/use-wallet-sync';
import { PropsWithChildren } from 'react';

export default function WalletSync({ children }: PropsWithChildren) {
  useEvmWalletSync();
  return <>{children}</>;
}
