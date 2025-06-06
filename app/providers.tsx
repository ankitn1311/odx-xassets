'use client';
import type * as React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { getQueryClient } from '@/app/get-query-client';
import { RainbowKitProvider, darkTheme, getDefaultConfig } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { base, baseSepolia, sonic, sonicTestnet } from 'viem/chains';
import { WagmiProvider } from 'wagmi';
import { THEME, TonConnectUIProvider } from '@tonconnect/ui-react';
import { WalletProvider } from '@suiet/wallet-kit';
import '@suiet/wallet-kit/style.css';
import '@/styles/suiet-wallet-kit-custom.css';
import { Toaster } from 'sonner';
import WalletSync from './wallet-sync';
import { TokenPriceFeedProvider } from '@/providers/token-price-feed';
import { TradeProvider } from '@/providers/trade-provider';

const config = getDefaultConfig({
  appName: 'Ordinox',
  projectId: '19012e6bbba81176ee306427e8b07d5e',
  chains: [{ ...sonicTestnet, id: 57054 }],
  ssr: true,
});

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  const manifestUrl = process.env.NEXT_PUBLIC_TONCONNECT_MANIFEST_URL;
  const returnUrl = process.env.NEXT_PUBLIC_TONCONNECT_RETURN_URL! as `${string}://${string}`;

  return (
    <QueryClientProvider client={queryClient}>
      <TonConnectUIProvider
        manifestUrl={manifestUrl}
        uiPreferences={{ theme: THEME.DARK }}
        actionsConfiguration={{
          twaReturnUrl: returnUrl,
        }}
        restoreConnection
      >
        <WalletProvider>
          <WagmiProvider config={config} reconnectOnMount>
            <RainbowKitProvider theme={darkTheme()} key="ODX">
              <WalletSync>
                {children}
                <ReactQueryDevtools />
                <Toaster richColors />
              </WalletSync>
            </RainbowKitProvider>
          </WagmiProvider>
        </WalletProvider>
      </TonConnectUIProvider>
    </QueryClientProvider>
  );
}
