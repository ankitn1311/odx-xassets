'use client';
import React, { useState } from 'react';
import { AppHeaderNavbarItemType } from './types';
import { Button } from '../components/ui/button';
import ODXLogo from '../components/svg/odx-logo';
import ODXLogoDark from '../components/svg/odx-logo-dark';
import ODXLogoLight from '../components/svg/odx-logo-light';
import { useRouter } from 'nextjs-toploader/app';
import { usePathname } from 'next/navigation';
import Login from '../components/popups/login';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUserInfo } from '@/hooks/queries/use-user';
import Cookies from 'js-cookie';
import Authenticated from '@/components/common/authenticated';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { shortenAddress } from '../utils/crypto';
import { Copy, LogOut, Menu, User, Star, Power } from 'lucide-react';
import { useCopyToClipboard, useMediaQuery } from 'usehooks-ts';
import { toast } from 'sonner';
import { ModeToggle } from '@/components/theme-toggle';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTheme } from 'next-themes';
import millify from 'millify';
import { ScorePopup } from '@/components/score-popup';
import ConnectWallet from '@/components/common/connect-wallet';
import { useWalletStore } from '@/stores/wallet-store';
import { useDisconnect } from 'wagmi';

export default function AppHeader() {
  return (
    <div className="z-20 flex h-16 items-center justify-between gap-2 border-b border-muted/60 px-4 py-2 lg:px-6">
      <AppHeaderLeft />
      <AppHeaderCenter />
      <AppHeaderRight />
    </div>
  );
}

const AppHeaderLeft = () => {
  const router = useRouter();
  const { theme, systemTheme } = useTheme();

  const currentTheme = theme === 'system' ? systemTheme : theme;

  return (
    <div className="flex basis-1/2 items-center gap-2 lg:gap-4">
      <div
        onClick={() => {
          router.push('/x-assets');
        }}
        className="flex cursor-pointer flex-row gap-2"
      >
        {currentTheme === 'dark' ? (
          <ODXLogoDark className="h-6 w-auto" />
        ) : (
          <ODXLogoLight className="h-6 w-auto" />
        )}
      </div>
    </div>
  );
};

const AppHeaderCenter = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return !isMobile && <AppHeaderNavbar />;
};

const AppHeaderRight = () => {
  const { data: userInfo, isLoading: userInfoLoading } = useUserInfo();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [, copyToClipboard] = useCopyToClipboard();
  const logout = async () => {
    Cookies.remove('auth_token');
    // localStorage.removeItem(StorageKeys.AuthBundle); // DEPRECATED
    // localStorage.removeItem(StorageKeys.CurrentUser);
    // localStorage.removeItem(StorageKeys.UserSession);
    // localStorage.removeItem(StorageKeys.ReadWriteSession);
    // localStorage.removeItem('sessionExpiry');
    window.location.reload();
  };
  const router = useRouter();
  const { disconnect: disconnectEVM } = useDisconnect();
  const { connectedWallet, disconnectWallet } = useWalletStore();

  const disconnectWalletHandler = async () => {
    disconnectEVM();
    disconnectWallet();
  };

  return (
    <div className="flex basis-1/2 items-center justify-end gap-2">
      <ModeToggle />
      <ConnectWallet />
      <MobileNavbar />
    </div>
  );
};

const MobileNavbar = () => {
  const [open, setOpen] = useState(false);
  return (
    <nav className="flex flex-1 items-center justify-center gap-2 pl-2 md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline">
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <SheetContent>
            <nav className="flex h-full flex-1 flex-col items-center justify-center gap-2 pl-2">
              {navbarItems.map(navbarItem => {
                return (
                  <AppHeaderNavbarItem
                    closeSheet={() => setOpen(false)}
                    key={navbarItem.label}
                    {...navbarItem}
                  />
                );
              })}
            </nav>
          </SheetContent>
        </SheetContent>
      </Sheet>
    </nav>
  );
};
const navbarItems = [
  // { label: "buyCrypto", route: "buy-crypto" },
  // { label: "markets", route: "markets" },
  // { label: 'trade', route: 'trade' },
  { label: 'xAssets', route: 'markets' },
  { label: 'reserves', route: 'reserves' },
  // { label: 'score', route: 'score', isProtected: true },
  { label: 'leaderboard', route: 'leaderboard' },
  // { label: "components", route: "components" },
];

const AppHeaderNavbar = () => {
  return (
    <nav className="hidden flex-1 items-center justify-center gap-2 pl-2 md:flex">
      {navbarItems.map(navbarItem => {
        return <AppHeaderNavbarItem key={navbarItem.label} {...navbarItem} />;
      })}
    </nav>
  );
};

const AppHeaderNavbarItem: React.FC<AppHeaderNavbarItemType> = ({
  label,
  route,
  isProtected,
  comingSoon,
  closeSheet,
}) => {
  const pathname = usePathname();
  const t = useTranslations('Navbar');
  const { data: userInfo } = useUserInfo();

  const isXAssetRoute = pathname.includes('x-assets');

  const isActive = isXAssetRoute ? route === 'markets' : pathname === `/${route}`;

  if (isProtected && !userInfo) {
    return null;
  }

  return (
    <Link
      key={label}
      href={comingSoon ? '#' : `/${route}`}
      onClick={
        comingSoon
          ? e => {
              e.preventDefault();
              toast.info('Coming soon');
              closeSheet?.();
            }
          : () => {
              closeSheet?.();
            }
      }
      className={cn(
        'flex items-center px-3 py-2 text-base transition-colors',
        isActive ? 'font-bold text-foreground' : 'text-muted-foreground hover:text-foreground',
        comingSoon && 'opacity-50 hover:text-muted-foreground'
      )}
      style={{ textDecoration: 'none' }}
    >
      <span
        className={cn(
          'mr-2 inline-block h-2 w-2 rounded-full bg-transparent',
          isActive && 'bg-primary'
        )}
      />
      {t(label)}
    </Link>
  );
};
