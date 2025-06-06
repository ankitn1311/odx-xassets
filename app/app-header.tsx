'use client';
import React from 'react';
import { AppHeaderNavbarItemType } from './types';
import { Button } from '../components/ui/button';
import ODXLogo from '../components/svg/odx-logo';
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
import Image from 'next/image';
import millify from 'millify';
import { ScorePopup } from '@/components/score-popup';
import ConnectWallet from '@/components/common/connect-wallet';
import { useWalletStore } from '@/stores/wallet-store';
import { useDisconnect } from 'wagmi';

export default function AppHeader() {
  return (
    <div className="flex h-16 items-center justify-between gap-2 px-4 lg:px-6">
      <AppHeaderLeft />
      <AppHeaderRight />
    </div>
  );
}

const AppHeaderLeft = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const router = useRouter();
  const { theme, systemTheme } = useTheme();

  const currentTheme = theme === 'system' ? systemTheme : theme;

  return (
    <div className="flex items-center gap-2 lg:gap-4">
      <Image
        onClick={() => {
          router.push('/trade');
        }}
        src={`/images/logos/odx-${currentTheme ? currentTheme : 'dark'}-text.svg`}
        alt="ODX Logo"
        width={169}
        height={211}
        className="h-6 w-auto"
      />
      {!isMobile && <AppHeaderNavbar />}
    </div>
  );
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
    <div className="flex items-center gap-2">
      <ModeToggle />
      <ConnectWallet />
    </div>
  );
};

// const navbarItems = [
//   // { label: "buyCrypto", route: "buy-crypto" },
//   // { label: "markets", route: "markets" },
//   // { label: 'trade', route: 'trade' },
//   // { label: 'xAssets', route: 'x-assets' },
//   // { label: 'score', route: 'score', isProtected: true },
//   // { label: 'Leaderboard' },
//   // { label: "components", route: "components" },
// ];

const AppHeaderNavbar = () => {
  return null;
};

const AppHeaderNavbarItem: React.FC<AppHeaderNavbarItemType> = ({ label, route, isProtected }) => {
  const pathname = usePathname();
  const { push } = useRouter();
  const t = useTranslations('Navbar');
  const { data: userInfo } = useUserInfo();

  const isActive = pathname === `/${route}`;

  if (isProtected && !userInfo) {
    return null;
  }

  return (
    <Button
      key={label}
      variant="ghost"
      className={cn(isActive && 'font-bold text-primary', 'hover:text-primary')}
      onClick={() => push(`/${route}`)}
    >
      {t(label)}
    </Button>
  );
};
