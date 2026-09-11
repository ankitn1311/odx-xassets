import React from 'react';
import { Button } from '@/components/ui/button';
import { shortenAddressWithLength } from '@/utils/crypto';
import { AlertTriangle, Wallet } from 'lucide-react';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Portfolio } from '../portfolio';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const CHAIN_ID = 146;
const TESTNET_CHAIN_ID = 57054;

/** Black "Connect Wallet" when disconnected; a grey address chip that opens the portfolio when connected. */
const ConnectWallet = () => {
  const { openConnectModal } = useConnectModal();
  const { address, chainId, isConnected } = useAccount();
  const onSupportedChain = !!chainId && [CHAIN_ID, TESTNET_CHAIN_ID].includes(chainId);

  if (isConnected && address) {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={100}>
          <Popover>
            <PopoverTrigger asChild>
              <TooltipTrigger asChild>
                <Button variant={onSupportedChain ? 'secondary' : 'warning'}>
                  <span className="flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    <span className="font-mono text-xs">{shortenAddressWithLength(address, 3)}</span>
                    {!onSupportedChain && <AlertTriangle className="h-4 w-4" />}
                  </span>
                </Button>
              </TooltipTrigger>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72 rounded-2xl px-0 pb-0 pt-4">
              <Portfolio />
            </PopoverContent>
          </Popover>
          <TooltipContent>{onSupportedChain ? 'Account' : 'Not connected to Sonic'}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return <Button onClick={() => openConnectModal?.()}>Connect Wallet</Button>;
};

export default ConnectWallet;
