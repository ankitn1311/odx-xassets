'use client';
import React from 'react';
import { AppHeaderNavbarItemType } from './types';
import ODXLogoDark from '../components/svg/odx-logo-dark';
import ODXLogoLight from '../components/svg/odx-logo-light';
import { useRouter } from 'nextjs-toploader/app';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useUserInfo } from '@/hooks/queries/use-user';

import { Home, Database, Trophy, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { ModeToggle } from '@/components/theme-toggle';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import ConnectWallet from '@/components/common/connect-wallet';
import { BaseUrlSettings } from '@/components/ui/base-url-settings';

const isStaging = process.env.NEXT_PUBLIC_ENV === 'staging';

export default function AppHeader() {
  return (
    <div className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-2 border-b border-muted/60 bg-white/20 px-4 py-2 backdrop-blur-md dark:bg-black/20">
      <AppHeaderLeft />
      <AppHeaderNavbar />
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
          router.push('/markets');
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

const AppHeaderRight = () => {
  return (
    <div className="flex basis-1/2 items-center justify-end gap-2">
      {isStaging && <BaseUrlSettings />}
      <ModeToggle />
      {/* {isConnecting || isReconnecting ? (
        <Skeleton className="h-8 w-[8.6rem] rounded-full" />
      ) : ( */}
      <ConnectWallet />
      {/* )} */}
    </div>
  );
};

export const MobileNavbar = () => {
  const pathname = usePathname();
  const navItems = [
    { label: 'xAssets', route: '/markets', icon: Home },
    { label: 'Reserves', route: '/reserves', icon: Database },
    { label: 'Explorer', route: '/explorer', icon: Activity },
    { label: 'Leaderboard', route: '/leaderboard', icon: Trophy },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-muted/60 bg-white/40 backdrop-blur-md dark:bg-black/40 md:hidden">
      {navItems.map(({ label, route, icon: Icon }) => {
        const isActive =
          (label === 'xAssets' && pathname.includes('x-assets')) || pathname === route;
        return (
          <Link
            key={label}
            href={route}
            className={cn(
              'flex h-full flex-1 flex-col items-center justify-center text-xs',
              isActive
                ? 'font-bold text-black dark:text-white'
                : 'text-muted-foreground hover:text-foreground'
            )}
            style={{ textDecoration: 'none' }}
          >
            <Icon className="mb-1 h-6 w-6" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

const navbarItems = [
  { label: 'xAssets', route: 'markets' },
  { label: 'reserves', route: 'reserves' },
  { label: 'explorer', route: 'explorer' },
  { label: 'leaderboard', route: 'leaderboard' },
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
        isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
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
