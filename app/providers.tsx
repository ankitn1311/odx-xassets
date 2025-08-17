'use client';
import type * as React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { getQueryClient } from '@/app/get-query-client';
import { RainbowKitProvider, darkTheme, getDefaultConfig } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { sonic } from 'viem/chains';
import { WagmiProvider } from 'wagmi';
import { Toaster } from 'sonner';
import { TradesProvider } from '@/providers/trades-provider';
import { useAllTokens } from '@/hooks/queries/use-all-tokens';
import { useTokenSwapStore } from '@/stores/token-swap-store';
import { useEffect } from 'react';

const config = getDefaultConfig({
  appName: 'Ordinox',
  projectId: '19012e6bbba81176ee306427e8b07d5e',
  // chains: [{ ...sonicTestnet, id: 57054 }],
  chains: [sonic],
  ssr: true,
});

// Provider component to manage global token state
function TokenProvider({ children }: { children: React.ReactNode }) {
  const { data: tokens } = useAllTokens();
  const { setAllTokens } = useTokenSwapStore();

  // Update store when tokens change
  useEffect(() => {
    if (tokens && tokens.length > 0) {
      setAllTokens(tokens);
    }
  }, [tokens, setAllTokens]);

  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config} reconnectOnMount>
        <RainbowKitProvider theme={darkTheme()} key="ODX">
          <TradesProvider>
            <TokenProvider>
              {children}
              <ReactQueryDevtools />
              <Toaster richColors />
            </TokenProvider>
          </TradesProvider>
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
