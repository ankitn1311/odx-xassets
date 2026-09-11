import React from 'react';
import Link from 'next/link';
import { useAccount, useDisconnect, useSwitchChain } from 'wagmi';
import { useCopyToClipboard } from 'usehooks-ts';
import { toast } from 'sonner';
import { sonic } from 'viem/chains';
import { AlertTriangle, Copy, ExternalLink, Power, Wallet, Activity, Settings } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSonicBalance } from '@/hooks/queries/use-sonic-balance';
import { shortenAddress } from '@/utils/crypto';
import { cn } from '@/lib/utils';

const CHAIN_ID = sonic.id;
const TESTNET_CHAIN_ID = 57054;
const isStaging = process.env.NEXT_PUBLIC_ENV === 'staging';

const LINKS = [
  { href: '/portfolio', label: 'Portfolio', icon: Wallet },
  { href: '/activity', label: 'Activity', icon: Activity },
  { href: '/settings', label: 'Settings', icon: Settings },
];

/** Compact account menu for the header wallet chip. Holdings live on /portfolio. */
export const Portfolio = () => {
  const { address, chainId } = useAccount();
  const { data: sonicBalance } = useSonicBalance();
  const [, copyToClipboard] = useCopyToClipboard();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const { disconnect, isPending: isDisconnecting } = useDisconnect();

  const onSonic = chainId === CHAIN_ID || (isStaging && chainId === TESTNET_CHAIN_ID);

  return (
    <div className="flex flex-col">
      {/* Identity */}
      <div className="flex items-center gap-3 px-4 pb-3">
        <Avatar className="h-10 w-10 rounded-full bg-secondary">
          <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${address}`} alt="" />
          <AvatarFallback>{address?.slice(2, 4)}</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-1 flex-col leading-tight">
          <span className="flex items-center gap-1.5 font-mono text-sm">
            {shortenAddress(address || '')}
            <button
              type="button"
              aria-label="Copy address"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => {
                copyToClipboard(address || '');
                toast.success('Address copied');
              }}
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
            <a
              href={`https://sonicscan.org/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View on Sonicscan"
              className="text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </span>
          <span className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>
              <span className="font-mono tabular-nums">{sonicBalance ?? '0'}</span> S
            </span>
            <span aria-hidden="true">·</span>
            {onSonic ? (
              <span className="inline-flex items-center gap-1 text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                {chainId === TESTNET_CHAIN_ID ? 'Sonic testnet' : 'Sonic'}
              </span>
            ) : (
              <button
                type="button"
                disabled={isSwitching}
                onClick={() => switchChain({ chainId: CHAIN_ID })}
                className="inline-flex items-center gap-1 text-warning-foreground hover:underline"
              >
                <AlertTriangle className="h-3 w-3" />
                {isSwitching ? 'Switching…' : 'Switch to Sonic'}
              </button>
            )}
          </span>
        </div>
      </div>

      {/* Links */}
      <nav className="flex flex-col border-y border-border py-1">
        {LINKS.map(l => (
          <Link
            key={l.href}
            href={l.href}
            className={cn('flex items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-muted')}
          >
            <l.icon className="h-4 w-4 text-muted-foreground" />
            {l.label}
          </Link>
        ))}
      </nav>

      <button
        type="button"
        onClick={() => disconnect()}
        disabled={isDisconnecting}
        className="flex items-center gap-3 px-4 py-3 text-sm text-destructive transition-colors hover:bg-destructive/5"
      >
        <Power className="h-4 w-4" />
        Disconnect
      </button>
    </div>
  );
};
