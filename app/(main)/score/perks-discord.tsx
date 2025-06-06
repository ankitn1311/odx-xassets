import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { FaDiscord } from 'react-icons/fa';
import { RefreshCw, Unplug } from 'lucide-react';
import { useUserInfo } from '@/hooks/queries/use-user';
import { toast } from 'sonner';
import { baseURL } from '@/utils/axiosConfig';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useConnectDiscord } from '@/hooks/queries/use-discord';
import { useDecodeDiscord } from '@/hooks/queries/use-discord';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const PerksDiscord = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const token = searchParams.get('discordtoken');
  const code = searchParams.get('code');

  const [checkStatusPopup, setCheckStatusPopup] = useState(false);

  const { data: userInfo, isLoading: userInfoLoading } = useUserInfo();
  const { data: decodedDiscordData, isLoading: decodedDiscordDataLoading } = useDecodeDiscord({
    token: token || '',
  });

  const { mutate: connectDiscordMutation, isPending: connectDiscordPending } = useConnectDiscord({
    closePopup: () => setCheckStatusPopup(false),
  });

  const isOgBoostEnabled = userInfo?.IsOGBoostEnabled;
  const isBlitzBoostEnabled = userInfo?.IsBlitzBoostEnabled;
  const isKinoBoostEnabled = userInfo?.IsKinoBoostEnabled;
  const isEclipseBoostEnabled = userInfo?.IsEclipseBoostEnabled;
  const isAscendBoostEnabled = userInfo?.IsAscendBoostEnabled;
  const isTranzitBoostEnabled = userInfo?.IsTranzitBoostEnabled;

  const removeQueryParam = (param: string) => {
    const query = new URLSearchParams(searchParams);
    query.delete(param);
    router.replace(`${pathname}?${query.toString()}`);
  };

  useEffect(() => {
    if (code) {
      toast.error('Something went wrong while connecting discord');
      removeQueryParam('code');
    }
  }, [code]);

  if (
    isOgBoostEnabled ||
    isBlitzBoostEnabled ||
    isKinoBoostEnabled ||
    isEclipseBoostEnabled ||
    isAscendBoostEnabled ||
    isTranzitBoostEnabled
  ) {
    return (
      <div className="flex w-full items-center justify-between">
        <div className="">
          {isOgBoostEnabled && (
            <div className="text-2xl font-extrabold italic text-primary">20% BOOST • OG</div>
          )}
          {!isOgBoostEnabled && isBlitzBoostEnabled && (
            <div className="text-2xl font-extrabold italic text-primary">10% BOOST • BLITZ</div>
          )}
          {!isOgBoostEnabled && !isBlitzBoostEnabled && isTranzitBoostEnabled && (
            <div className="text-2xl font-extrabold italic text-primary">10% BOOST • TRANZIT</div>
          )}
          {!isOgBoostEnabled &&
            !isBlitzBoostEnabled &&
            !isTranzitBoostEnabled &&
            isKinoBoostEnabled && (
              <div className="text-2xl font-extrabold italic text-primary">8% BOOST • KINO</div>
            )}
          {!isOgBoostEnabled &&
            !isBlitzBoostEnabled &&
            !isKinoBoostEnabled &&
            isEclipseBoostEnabled && (
              <div className="text-2xl font-extrabold italic text-primary">6% BOOST • ECLIPSE</div>
            )}
          {!isOgBoostEnabled &&
            !isBlitzBoostEnabled &&
            !isKinoBoostEnabled &&
            !isEclipseBoostEnabled &&
            isAscendBoostEnabled && (
              <div className="text-2xl font-extrabold italic text-primary">4% BOOST • ASCEND</div>
            )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className={cn(connectDiscordPending && 'animate-spin')}
          onClick={() => {
            if (token) {
              connectDiscordMutation(token);
            } else {
              window.open(`${baseURL}/auth/discord`, '_self');
            }
          }}
        >
          {token ? <RefreshCw className="h-4 w-4" /> : <Unplug className="h-4 w-4" />}
        </Button>
      </div>
    );
  }

  if (token) {
    return (
      <Dialog
        open={checkStatusPopup}
        onOpenChange={open => {
          setCheckStatusPopup(open);
        }}
      >
        <DialogTrigger asChild>
          <Button
            variant="link"
            className="h-auto p-0 text-primary hover:text-primary/80"
            disabled={userInfoLoading || decodedDiscordDataLoading}
          >
            Check status
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">Discord Connection</DialogTitle>
            <DialogDescription>
              <div className="flex flex-col items-center gap-8 pt-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="h-16 w-16 overflow-hidden rounded-full ring-2 ring-primary/20">
                      <img
                        src={decodedDiscordData?.AvatarURL}
                        alt="Discord Avatar"
                        className="h-16 w-16 object-cover"
                      />
                    </div>
                    <div className="absolute -right-1 -top-1 rounded-full bg-primary p-1.5">
                      <FaDiscord className="text-primary-foreground" size={12} />
                    </div>
                  </div>

                  <svg
                    width="88"
                    height="53"
                    viewBox="0 0 88 53"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-primary"
                  >
                    <path
                      d="M1 19.0878C4.23656 19.0878 2.634 32.074 4.23656 32.074C6.031 32.074 6.848 11.6672 8.86022 11.6672C10.761 11.6672 10.804 41.8136 13.0215 41.8136C15.239 41.8136 15.749 1 17.6452 1C19.619 1 19.017 52.017 21.8065 52.017C24.435 52.017 24.306 1 26.4301 1C28.563 1 28.219 41.8136 30.5914 41.8136C33.336 41.8136 32.5144 11.6672 34.7527 11.6672C36.991 11.6672 37.2467 32.074 39.3763 32.074C41.506 32.074 41.764 19.0878 44 19.0878C46.064 19.0878 46.15 32.074 48.1613 32.074C50.321 32.074 50.536 11.6672 52.7849 11.6672C55.0339 11.6672 54.406 41.8136 56.9462 41.8136C59.4865 41.8136 59.093 1 61.1075 1C63.264 1 62.877 52.017 65.7312 52.017C68.381 52.017 67.65 1 69.8925 1C72.036 1 71.3632 41.8136 74.5161 41.8136C77.669 41.8136 75.734 11.6672 78.6774 11.6672C81.6208 11.6672 81.4294 32.074 82.8387 32.074C84.248 32.074 83.3559 19.0878 87 19.0878"
                      stroke="currentColor"
                      strokeWidth="0.516"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                  <div className="h-16 w-16 overflow-hidden rounded-full ring-2 ring-primary/20">
                    <Image src="/images/favicon.png" alt="ODX Logo" width={64} height={64} />
                  </div>
                </div>
                <div className="text-center text-sm text-muted-foreground">
                  Receive a points boost based on your Discord role.
                  <br />
                  Only the highest role&apos;s boost will be applied.
                </div>
                <Button
                  disabled={connectDiscordPending}
                  className="w-full"
                  onClick={() => connectDiscordMutation(token)}
                >
                  {connectDiscordPending ? 'Checking...' : 'Check Role Status'}
                </Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Button
      variant="link"
      isLoading={userInfoLoading || decodedDiscordDataLoading}
      className="h-auto p-0 text-primary hover:text-primary/80"
      disabled={userInfoLoading || decodedDiscordDataLoading}
      onClick={async () => {
        window.open(`${baseURL}/auth/discord`, '_self');
      }}
    >
      Connect Discord
    </Button>
  );
};

export default PerksDiscord;
