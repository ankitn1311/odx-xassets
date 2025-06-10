import { TokenPair, useAllTokens } from '@/hooks/queries/use-all-tokens';
import { Skeleton } from './ui/skeleton';
import { useTokenBalance } from '@/hooks/queries/use-token-balance';
import { Ban, Copy, Power, RefreshCw } from 'lucide-react';
import { useCopyToClipboard } from 'usehooks-ts';
import { toast } from 'sonner';
import { Separator } from './ui/separator';
import { useSonicBalance } from '@/hooks/queries/use-sonic-balance';
import { shortenAddress } from '@/utils/crypto';
import Image from 'next/image';
import { Button } from './ui/button';
import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useWalletStore } from '@/stores/wallet-store';
import { useQuote } from '@/hooks/queries/use-quote';
import { convertXUSDT } from '@/lib/utils';

const CHAIN_ID = 146;

export const Portfolio = () => {
  const allTokensData = useAllTokens();
  const { connectedWallet } = useWalletStore();
  const { data: sonicBalance } = useSonicBalance();
  const [, copyToClipboard] = useCopyToClipboard();
  const queryClient = useQueryClient();
  const { chainId } = useAccount();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const { disconnect: disconnectEVM, isPending: isDisconnecting } = useDisconnect();
  const { connectWalletType, disconnectWallet } = useWalletStore();
  const disconnectEVMWallet = async () => {
    disconnectEVM();
    disconnectWallet();
  };
  /** Disconnect wallet based on wallet type */
  const disconnectWalletHandler = () => {
    switch (connectWalletType) {
      case 'EVM': {
        disconnectEVMWallet();
        break;
      }
      // case 'TON': {
      //   try {
      //     disconnectWallet();
      //     tonConnect?.disconnect();
      //   } catch (error) {
      //     console.log('Error disconnecting wallet', error);
      //   }
      //   break;
      // }
      // case 'SUI': {
      //   disconnectSUIWallet();
      // }
      default: {
        toast.info('Please select a wallet');
      }
    }
  };
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['token-balance'] }),
      // queryClient.invalidateQueries({ queryKey: ['balances'] }),
      queryClient.invalidateQueries({ queryKey: ['sonic-balance'] }),
    ]);
    setIsRefreshing(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 px-4 pb-4">
        {/* Remove this for mainnet */}
        {chainId !== CHAIN_ID && (
          <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-2 py-1 text-destructive">
            <Ban className="h-4 w-4 flex-shrink-0" />
            <p className="text-xs">Not connected to Sonic or Wallet is not connected properly</p>
          </div>
        )}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Address</p>
          <div className="flex items-center gap-1">
            <p className="text-sm">{shortenAddress(connectedWallet || '')}</p>
            <Copy
              className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-primary-foreground"
              strokeWidth={1}
              onClick={() => {
                copyToClipboard(connectedWallet || '');
                toast.success(`Copied!`, {
                  description: connectedWallet,
                });
              }}
            />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Sonic Balance</p>
          <p className="text-xl font-medium">
            <span className="text-accent">{sonicBalance}</span> S
          </p>
        </div>
        {/* <div className="self-end">
          <Button variant="outline" onClick={disconnectWalletHandler} disabled={isDisconnecting}>
            <Power className="h-4 w-4 text-red-600 hover:text-red-500" />
          </Button>
        </div> */}
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
  const tokenBalanceData = useTokenBalance(data?.TokenA.Address || '', data?.TokenA.Decimals);
  const usdxBalance = useTokenBalance(data?.TokenB.Address || '', data?.TokenB.Decimals);
  const { data: quote, isLoading: isQuoteLoading } = useQuote({
    assetIn: data?.TokenA.Address || '',
    assetOut: data?.TokenB.Address || '',
    amount: 1,
    enabled: !!data?.TokenA.Address && !!data?.TokenB.Address,
  });

  if (!data || tokenBalanceData.isLoading || usdxBalance.isLoading || isQuoteLoading) {
    return <Skeleton className="h-4 w-20 shrink-0" />;
  }
  const isUsdx = type === 'USDX';
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Image
            src={isUsdx ? `/images/tokens/XUSDC.png` : `/images/tokens/${data.TokenA.Name}.png`}
            alt={data.TokenA.Name}
            width={40}
            height={40}
          />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <div className="">{isUsdx ? convertXUSDT(data.TokenB.Name) : data.TokenA.Name}</div>
            <Copy
              className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-primary-foreground"
              strokeWidth={1}
              onClick={() => {
                copyToClipboard(isUsdx ? data.TokenB.Address : data.TokenA.Address);
                toast.success(`Copied!`, {
                  description: isUsdx ? data.TokenB.Address : data.TokenA.Address,
                });
              }}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <p className="text-base text-foreground">
          {isUsdx ? usdxBalance.data : tokenBalanceData.data}
        </p>
        {!isUsdx && (
          <div className="text-xs text-muted-foreground">
            {quote ? Number(quote * Number(tokenBalanceData.data)).toFixed(4) : '0'}{' '}
            {convertXUSDT(data.TokenB.Name)}
          </div>
        )}
      </div>
    </div>
  );
};
