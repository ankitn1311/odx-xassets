import React from 'react';
import { Button } from '@/components/ui/button';
import { shortenAddressWithLength } from '@/utils/crypto';
import { AlertTriangle, Wallet } from 'lucide-react';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Portfolio } from '../portfolio';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const CHAIN_ID = 146;
const TESTNET_CHAIN_ID = 57054;

const ConnectWallet = () => {
  const { openConnectModal } = useConnectModal();
  const { address, chainId, isConnected } = useAccount();

  const connectWalletHandler = () => {
    if (isConnected) {
      // Already connected, do nothing
      return;
    }
    openConnectModal?.();
  };

  return (
    <div className="flex flex-col gap-4">
      {isConnected && address && (
        <div className={cn('flex items-center justify-between gap-2')}>
          <TooltipProvider>
            <Tooltip delayDuration={100}>
              <Popover>
                <PopoverTrigger asChild>
                  <TooltipTrigger asChild>
                    <Button
                      variant={
                        chainId && [CHAIN_ID, TESTNET_CHAIN_ID].includes(chainId)
                          ? 'outline'
                          : 'warning'
                      }
                    >
                      <div className="flex items-center gap-2">
                        <Wallet
                          className={`h-4 w-4 ${
                            chainId && [CHAIN_ID, TESTNET_CHAIN_ID].includes(chainId)
                              ? 'text-foreground'
                              : 'text-warning-foreground'
                          }`}
                        />
                        <p className="font-mono text-xs">{shortenAddressWithLength(address, 3)}</p>
                        {/* Remove this for mainnet */}
                        {![CHAIN_ID, TESTNET_CHAIN_ID].includes(chainId || 0) && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <AlertTriangle className="h-4 w-4 text-warning-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Not connected to Sonic</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </Button>
                  </TooltipTrigger>
                </PopoverTrigger>
                <PopoverContent align="end" className="px-0">
                  <Portfolio />
                </PopoverContent>
              </Popover>
              <TooltipContent>Portfolio</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
      {!isConnected && (
        <div className="flex w-full gap-4">
          <Button
            variant="outline"
            className="hover:bg-accent hover:text-accent-foreground"
            onClick={connectWalletHandler}
          >
            Connect Wallet
          </Button>
        </div>
      )}
    </div>
  );
};

export default ConnectWallet;
