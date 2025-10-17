'use client';

import React, { useState } from 'react';
import { PasswordProtection } from '@/components/auth/password-protection';
import { useSonicBalanceByAddress } from '@/hooks/queries/use-sonic-balance-by-address';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Wallet, TrendingUp, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { shortenAddress } from '@/utils/crypto';
import { useAuthStore } from '@/stores/auth-store';

// Wallet addresses to monitor
const WALLET_ADDRESSES = [
  { label: 'Wallet 1', address: '0x4804C4a5634226fCf61075D6d93841500c7A119d' },
  { label: 'Wallet 2', address: '0x74F81Bc722788dd5E8523B6A1D5B93e983F2EbEF' },
  { label: 'Wallet 3', address: '0x8f453f98B9Ea483883Ebd4282c35Db4197EbcA66' },
  { label: 'Wallet 4', address: '0x491Dc87523afcB2076A886B1b8Aa14De2DE3D3bC' },
  { label: 'Wallet 5', address: '0xEDb1034FEe328A3eC6A637c76472c25d1fbA80B7' },
  { label: 'Wallet 6', address: '0xa9c374D24f6c131E551E17b501cFA6a0B9c81596' },
];

const CORRECT_PASSWORD = '654321';

// Individual wallet balance component
const WalletBalanceCard = ({ wallet }: { wallet: { label: string; address: string } }) => {
  const { data: balance, isLoading, error } = useSonicBalanceByAddress(wallet.address);

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{wallet.label}</span>
            </div>
            <Badge variant="destructive">Error</Badge>
          </div>
          <CardDescription className="font-mono text-xs">
            {shortenAddress(wallet.address)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">Failed to load balance</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{wallet.label}</span>
          </div>
        </div>
        <CardDescription className="font-mono text-xs">
          {shortenAddress(wallet.address)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-accent">{balance}</span>
              <span className="text-sm text-muted-foreground">S</span>
            </div>
            <p className="text-xs text-muted-foreground">Sonic Balance</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Main dashboard component
const TokensDashboard = () => {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { logout } = useAuthStore();

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    await Promise.all(
      WALLET_ADDRESSES.map(async wallet => {
        await queryClient.invalidateQueries({
          queryKey: ['sonic-balance-by-address', wallet.address],
        });
      })
    );
    setIsRefreshing(false);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="container mx-auto space-y-6 p-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold md:text-3xl">Tokens Dashboard</h1>
          <p className="text-muted-foreground">Monitor Sonic balances across multiple wallets</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleRefreshAll}
            className="flex items-center gap-2"
            isLoading={isRefreshing}
            disabled={isRefreshing}
          >
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              <p>Refresh All</p>
            </div>
          </Button>
          <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            <p>Logout</p>
          </Button>
        </div>
      </div>

      <div>
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold md:text-xl">
          <TrendingUp className="h-5 w-5" />
          Wallet Balances
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {WALLET_ADDRESSES.map(wallet => (
            <WalletBalanceCard key={wallet.address} wallet={wallet} />
          ))}
        </div>
      </div>
    </div>
  );
};

// Main page component with password protection
export default function TokensDashboardPage() {
  return (
    <PasswordProtection correctPassword={CORRECT_PASSWORD}>
      <TokensDashboard />
    </PasswordProtection>
  );
}
