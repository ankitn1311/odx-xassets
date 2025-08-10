import { TokenPair } from '@/hooks/queries/use-all-tokens';
import { Skeleton } from './ui/skeleton';
import { useTokenBalance } from '@/hooks/queries/use-token-balance';
import { Ban, Copy, Power, RefreshCw, AlertTriangle } from 'lucide-react';
import { useCopyToClipboard } from 'usehooks-ts';
import { toast } from 'sonner';
import { Separator } from './ui/separator';
import { useSonicBalance } from '@/hooks/queries/use-sonic-balance';
import { shortenAddress } from '@/utils/crypto';
import Image from 'next/image';
import { Button } from './ui/button';
import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { useAccount, useDisconnect, useSwitchChain } from 'wagmi';
import { useQuote } from '@/hooks/queries/use-quote';
import { convertXUSDT, removeTrailingZeros, truncateToFixed } from '@/lib/utils';
import { useTokenSwapStore } from '@/stores/token-swap-store';
import { useWalletProfile } from '@/hooks/queries/use-wallet-profile';

const CHAIN_ID = 146;

// Skeleton component for portfolio items
const PortfolioItemSkeleton = () => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      <div className="flex flex-col items-end">
        <Skeleton className="h-5 w-16" />
      </div>
    </div>
  );
};

export const Portfolio = () => {
  const { allTokens } = useTokenSwapStore();
  const allTokensData = { data: allTokens, isLoading: false };
  const { address } = useAccount();
  const { data: walletProfile } = useWalletProfile(address);
  const { data: sonicBalance } = useSonicBalance();
  const [, copyToClipboard] = useCopyToClipboard();
  const queryClient = useQueryClient();
  const { chainId } = useAccount();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const { disconnect: disconnectEVM, isPending: isDisconnecting } = useDisconnect();

  const disconnectWalletHandler = () => {
    disconnectEVM();
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['token-balance'] }),
      queryClient.invalidateQueries({ queryKey: ['sonic-balance'] }),
    ]);
    setIsRefreshing(false);
  };

  const handleSwitchToSonic = () => {
    try {
      switchChain({ chainId: CHAIN_ID });
    } catch (error) {
      toast.error('Failed to switch to Sonic chain');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 px-4 pb-4">
        {/* Chain Status */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Connected Chain</p>
          <div className="flex items-center gap-2">
            {chainId === CHAIN_ID ? (
              <div className="flex items-center gap-1 rounded-md bg-green-500/10 px-2 py-1 text-green-600">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <p className="text-xs font-medium">Sonic</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Button
                  variant="warning"
                  size="sm"
                  onClick={handleSwitchToSonic}
                  disabled={isSwitching}
                  className="h-6 px-2 text-xs"
                >
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {isSwitching ? 'Switching...' : 'Switch to Sonic'}
                  </div>
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Address</p>
          <div className="flex items-center gap-1">
            <p className="text-sm">{shortenAddress(address || '')}</p>
            <Copy
              className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-primary-foreground"
              strokeWidth={1}
              onClick={() => {
                copyToClipboard(address || '');
                toast.success(`Copied!`, {
                  description: address,
                });
              }}
            />
          </div>
        </div>
        {walletProfile && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Points</p>
            <p className="text-xl font-medium">
              <span className="text-accent">{walletProfile.totalPoints}</span>
            </p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Sonic Balance</p>
          <p className="text-xl font-medium">
            <span className="text-accent">{sonicBalance}</span> S
          </p>
        </div>
      </div>

      <div className="px-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base text-foreground">Tokens</p>
            <p className="text-muted-foreground">All the tokens in your portofolio</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            isLoading={isRefreshing}
            className="h-8 w-8"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Separator />
      <div className="flex flex-col gap-6 px-4">
        {allTokensData.data?.map((tokenPair, index) => (
          <PortofioItem key={index} data={tokenPair} />
        ))}
        {allTokensData.data?.[0] && <PortofioItem data={allTokensData.data[0]} type="USDX" />}
      </div>
      <Separator />
      <div className="flex w-full justify-center px-4">
        <Button
          variant="ghost"
          onClick={disconnectWalletHandler}
          disabled={isDisconnecting}
          className="w-full text-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          <div className="flex items-center gap-2">
            <Power className="mr-2 h-4 w-4" />
            <p className="text-sm">Disconnect Wallet</p>
          </div>
        </Button>
      </div>
    </div>
  );
};

export const PortofioItem = ({ data, type }: { data?: TokenPair; type?: 'USDX' }) => {
  const [, copyToClipboard] = useCopyToClipboard();
  const tokenBalanceData = useTokenBalance(data?.TokenB.Address || '', data?.TokenB.Decimals);
  const usdxBalance = useTokenBalance(data?.TokenA.Address || '', data?.TokenA.Decimals);

  if (!data) {
    return <PortfolioItemSkeleton />;
  }

  const isUsdx = type === 'USDX';

  if (isUsdx && usdxBalance.isLoading) {
    return <PortfolioItemSkeleton />;
  }

  if (!isUsdx && tokenBalanceData.isLoading) {
    return <PortfolioItemSkeleton />;
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Image
            src={isUsdx ? `/images/tokens/USDC.png` : `/images/tokens/${data.TokenB.Name}.png`}
            alt={data.TokenB.Name}
            width={40}
            height={40}
          />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <div className="">{isUsdx ? convertXUSDT(data.TokenA.Name) : data.TokenB.Name}</div>
            <Copy
              className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-primary-foreground"
              strokeWidth={1}
              onClick={() => {
                copyToClipboard(isUsdx ? data.TokenA.Address : data.TokenB.Address);
                toast.success(`Copied!`, {
                  description: isUsdx ? data.TokenA.Address : data.TokenB.Address,
                });
              }}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <p className="text-base text-foreground">
          {isUsdx
            ? usdxBalance.data
            : removeTrailingZeros(truncateToFixed(Number(tokenBalanceData.data || 0), 6))}
        </p>
      </div>
    </div>
  );
};
