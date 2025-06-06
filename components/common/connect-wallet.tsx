import React from 'react';
import { useWalletStore, WalletType } from '@/stores/wallet-store';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
// import { customToast } from '../../../utils/toast';
import { shortenAddress, shortenAddressWithLength } from '@/utils/crypto';
import { Ban, Wallet } from 'lucide-react';
// import { cn } from '../../../utils/twMerge.helper';
import { ConnectButton, useChainModal, useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount, useDisconnect } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { useUserInfo } from '@/hooks/queries/use-user';
import TonIcon, { EthereumSvg } from '../icons/ton';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Portfolio } from '../portfolio';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const ConnectWallet = ({ loginUI }: { loginUI?: boolean }) => {
  const {
    connectedWallet,
    disconnectWallet,
    selectedWalletType,
    setSelectedWalletType,
    setWalletModalOpen,
    connectWallet,
    // web3auth: web3AuthFromStore
  } = useWalletStore();
  const queryClient = useQueryClient();

  const refetchBalance = (address?: string) => {
    queryClient.invalidateQueries({
      queryKey: ['ordinoxBalance', address],
    });
  };

  const { openConnectModal } = useConnectModal();
  const { data: userInfo, isLoading: userInfoLoading } = useUserInfo();

  const { address, chainId } = useAccount();
  const { disconnect: disconnectEVM } = useDisconnect();

  const connectBTCWallet = async () => {
    try {
      const unisat = (window as any).unisat;
      await unisat.requestAccounts();
      const [address] = await unisat.getAccounts();
      connectWallet('BRC20', address);
    } catch (error: any) {
      // SendEventToSentry(error);
      const message = (error as Error)?.message;
      console.log('ERROR', { error, message });
      toast.error('Please install unisat wallet');
    }
  };

  /* useEffect(() => {
    connectWalletHandler();
  }, []); */

  const connectEVMWallet = async () => {
    if (address) {
      console.log('ADDRESS', address);
      connectWallet('EVM', address);
    } else {
      openConnectModal?.();
    }
  };

  // useEffect(() => {
  //   try {
  //     // if (!tonWalletAddress) {
  //     //   disconnectWallet();
  //     //   return;
  //     // }
  //     if (
  //       tonWalletAddress &&
  //       userInfo?.BoundConfirmed &&
  //       userInfo?.AuthAddress &&
  //       tonWalletAddress !== userInfo?.AuthAddress
  //     ) {
  //       customToast({
  //         message: `You need to connect with ${shortenAddress(userInfo?.AuthAddress)}. Address currently used ${shortenAddress(tonWalletAddress)} is incorrect, disconnecting wallet....`,
  //         type: 'error',
  //         duration: 1000
  //       });
  //       // add 3 seconds delay to show toast
  //       setTimeout(() => {
  //         disconnectWallet();
  //         tonConnect?.disconnect();
  //       }, 3000);
  //       return;
  //     }
  //     if (tonWalletAddress) {
  //       connectWallet('TON', tonWalletAddress);
  //       setSelectedWalletType('TON');
  //     }
  //   } catch (error) {
  //     console.log('TON WALLET ERROR', error);
  //   }
  // }, [tonWalletAddress]);

  // useEffect(() => {
  //   if (address && !connectedWallet && !(connectWalletType === 'EVM')) {
  //     setSelectedWalletType('EVM');
  //     connectWallet('EVM', address)
  //   }
  // }, [address, connectWalletType, connectedWallet]);

  const disconnectBTCWallet = async () => {
    disconnectWallet();
  };

  const disconnectEVMWallet = async () => {
    disconnectEVM();
    disconnectWallet();
  };

  const connectWalletHandler = () => {
    switch (selectedWalletType) {
      case 'BRC20': {
        connectBTCWallet();
        break;
      }
      case 'EVM': {
        connectEVMWallet();
        break;
      }
      default: {
        // customToast({
        //   message: 'Please select a wallet',
        //   type: 'info'
        // });
      }
    }
  };

  /** Copy wallet address to clipboard */
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied', {
      id: 'copy',
    });
  };

  if (loginUI) {
    return (
      <div className="flex w-full flex-col gap-4 px-6 pb-6 pt-2">
        <Select
          value={selectedWalletType}
          onValueChange={(value: WalletType) => setSelectedWalletType(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Wallet" />
          </SelectTrigger>
          <SelectContent position="item-aligned">
            {/* <SelectItem value='BRC20'>Bitcoin</SelectItem> */}
            <SelectItem value="EVM">EVM</SelectItem>
            <SelectItem value="TON">Telegram</SelectItem>
            <SelectItem value="SUI">SUI</SelectItem>
            {/* <SelectItem value='WEB3AUTH'>Web3auth</SelectItem> */}
          </SelectContent>
        </Select>
        <div className={cn('fle font-poppins items-center justify-center gap-2')}>
          <Button
            variant="secondary"
            className="flex w-full flex-nowrap items-center gap-2"
            onClick={connectWalletHandler}
          >
            <div className="flex items-center gap-2">
              <EthereumSvg className="h-5 w-5" />
              <p>Connect Wallet</p>
            </div>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* {connectedWallet ? (
        <div className={cn('flex items-center gap-4 ', loginUI && 'text-center')}>
          <div className={cn('flex flex-col gap-1', loginUI ? 'items-stretch w-full' : 'items-start')}>
            {!loginUI && <div className='text-xs'>Connected account: </div>}
            <div className={cn('flex items-center gap-2 text-lg', loginUI && 'w-full justify-center')}>
              <div className={cn('text-brand-300', loginUI && 'text-center font-poppins')}>
                {shortenAddress(connectedWallet)}
              </div>
              <Copy
                onClick={() => copyToClipboard(connectedWallet!)}
                className='w-4 h-4 text-gray-500 cursor-pointer hover:text-gray-300'
              />
            </div>
          </div>
          <ConnectedWalletChain />
          {isWeb3AuthWalletConnected && !!accountBalanceError && (
            <div className='flex flex-col items-start self-end px-4'>
              <div className='text-xs'>Account Balance: </div>
              {accountBalance && !accountBalanceLoading && (
                <div className='text-lg font-normal'>{roundDownToTwoDecimals(Number(accountBalance), 5)} ETH</div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className={cn('text-xs self-start ', !connectedWallet && 'pt-8')}>Connect a wallet</div>
      )} */}
      {connectedWallet && (
        <div className={cn('flex items-center justify-between gap-2')}>
          <TooltipProvider>
            <Tooltip delayDuration={100}>
              <Popover>
                <PopoverTrigger asChild>
                  <TooltipTrigger asChild>
                    <Button variant={chainId !== 57054 ? 'destructive' : 'outline'}>
                      <div className="flex items-center gap-2">
                        <Wallet
                          className={`h-4 w-4 ${chainId !== 57054 ? 'text-destructive-foreground' : 'text-foreground'}`}
                        />
                        <p className="text-xs">{shortenAddressWithLength(connectedWallet!, 3)}</p>
                        {/* Remove this for mainnet */}
                        {chainId !== 57054 && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Ban className="h-4 w-4 text-destructive-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  Not connected to Sonic Blaze Testnet or Wallet is not connected
                                  properly
                                </p>
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
          {/* <div className={cn('flex items-center gap-4', loginUI && 'text-center')}>
            <div
              className={cn(
                'flex flex-col gap-1',
                loginUI ? 'w-full items-stretch' : 'items-start'
              )}
            >
              <div
                className={cn(
                  'flex items-center gap-2 text-lg',
                  loginUI && 'w-full justify-center'
                )}
              >
                <div className={cn('text-brand-300', loginUI && 'font-poppins text-center')}>
                  {shortenAddress(connectedWallet!)}
                </div>
                <Copy
                  onClick={() => copyToClipboard(connectedWallet!)}
                  className="h-4 w-4 cursor-pointer text-gray-500 hover:text-gray-300"
                />
              </div>
            </div>
          </div> */}

          {/* <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                refetchBalance(connectedWallet!);
              }}
            >
              <RefreshCw className={cn('h-4 w-4 text-zinc-400 hover:text-zinc-300')} />
            </Button>

            <Button variant="outline" onClick={disconnectWalletHandler} disabled={isDisconnecting}>
              <Power className="h-4 w-4 text-red-600 hover:text-red-500" />
            </Button>
          </div> */}
        </div>
      )}
      {!connectedWallet && (
        <div className="flex w-full gap-4">
          {/* {userInfo && !userInfoLoading && ( */}
          {/* )} */}
          {/* <Select
            value={selectedWalletType}
            onValueChange={(value: WalletType) => setSelectedWalletType(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Wallet" />
            </SelectTrigger>
            <SelectContent position="item-aligned">
              <SelectItem value="EVM">EVM</SelectItem>
              <SelectItem value="TON">Telegram</SelectItem>
              <SelectItem value="SUI">SUI</SelectItem>
            </SelectContent>
          </Select> */}
          {/* {selectedWalletType === 'SUI' && (
            <SuiConnectButton
              onConnectSuccess={data => {
                connectWalletHandler();
              }}
              className="my-button whitespace-nowrap text-sm"
              label="Connect SUI Wallet"
            />
          )}
          {selectedWalletType !== 'SUI' && (
            <Button
              variant="secondary"
              className="flex w-full flex-nowrap items-center gap-2"
              onClick={connectWalletHandler}
            >
              <div className="flex items-center gap-2">
                {selectedWalletType === 'TON' ? (
                  <TonIcon className="h-5 w-5" />
                ) : (
                  <EthereumSvg className="h-5 w-5" />
                )}
                <p>Connect Wallet</p>
              </div>
            </Button>
          )} */}
          {/* <ConnectButton /> */}
          <Button
            variant="outline"
            className="hover:bg-accent hover:text-accent-foreground"
            onClick={() => {
              connectWalletHandler();
            }}
          >
            Connect Wallet
          </Button>
        </div>
      )}
    </div>
  );
};

export const EVMConnectButton = ({ onClick }: { onClick: () => void }) => {
  return <Button onClick={onClick}>Connect</Button>;
};

export const ConnectedWalletChain = () => {
  const walletType = useWalletStore(state => state.connectWalletType);
  const { openChainModal } = useChainModal();
  const { chain } = useAccount();

  if (!(walletType === 'EVM')) return null;

  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        // const ready = mounted && authenticationStatus !== 'loading';
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (chain?.unsupported) {
                return (
                  <Button
                    suppressHydrationWarning
                    className="font-poppins rounded-md border-red-400 bg-red-400 px-6 py-2 text-xs font-semibold uppercase text-white hover:border-red-500 hover:bg-red-500 focus:ring-1 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black active:border-red-400 active:bg-red-400 md:py-2"
                    onClick={() => {
                      openChainModal?.();
                    }}
                  >
                    Wrong network
                  </Button>
                );
              }

              return (
                <div style={{ display: 'flex', gap: 12 }}>
                  <div
                    onClick={openChainModal}
                    className="font-poppins group flex cursor-pointer items-center"
                  >
                    {chain?.hasIcon && (
                      <div
                        className={cn('mr-2 h-6 w-6 overflow-hidden rounded-full')}
                        style={{
                          background: chain.iconBackground,
                        }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            className="h-6 w-6"
                          />
                        )}
                      </div>
                    )}
                    <span className="text-xs group-hover:text-gray-100">{chain?.name}</span>
                  </div>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

export default ConnectWallet;
