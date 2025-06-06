import { Button } from '@/components/ui/button';
import { ExternalLink, Coins } from 'lucide-react';

const SONIC_LABS_URL = 'https://testnet.soniclabs.com/account';

export const ExportWalletGuide = () => {
  const handleOpenSonicLabs = () => {
    window.open(SONIC_LABS_URL, '_blank');
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Coins className="h-6 w-6 text-primary" />
          <h3 className="text-xl font-semibold">Get SONIC Tokens</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Follow these simple steps to get your SONIC tokens on the testnet:
        </p>
        <ol className="list-none space-y-4">
          <li className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
              1
            </div>
            <div>
              <p className="font-medium">Visit Sonic Labs</p>
              <p className="text-sm text-muted-foreground">
                You&apos;ll be redirected to the Sonic Labs testnet platform
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
              2
            </div>
            <div>
              <p className="font-medium">Connect your wallet</p>
              <p className="text-sm text-muted-foreground">
                Use your wallet to connect to Sonic Labs
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
              3
            </div>
            <div>
              <p className="font-medium">Get SONIC tokens</p>
              <p className="text-sm text-muted-foreground">
                Use the faucet to receive your testnet SONIC tokens
              </p>
            </div>
          </li>
        </ol>
      </div>

      <div className="flex flex-col gap-3">
        <Button onClick={handleOpenSonicLabs} variant="outline" className="w-full">
          <div className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4" />
            <p>Open Sonic Labs</p>
          </div>
        </Button>
      </div>
    </div>
  );
};
