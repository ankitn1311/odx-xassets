'use client';
import React from 'react';
import { AppHeaderNavbarItemType } from './types';
import ODXLogoLight from '../components/svg/odx-logo-light';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useUserInfo } from '@/hooks/queries/use-user';

import { Home, Database, Trophy, Activity } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import ConnectWallet from '@/components/common/connect-wallet';
import { StagingSettings } from '@/components/ui/base-url-settings';

const isStaging = process.env.NEXT_PUBLIC_ENV === 'staging';

/** White bar with a hairline, text nav on the left and the wallet on the right. */
export default function AppHeader() {
  return (
    <header className="sticky top-0 z-20 shrink-0 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-6 px-4">
        <AppHeaderLeft />
        <AppHeaderNavbar />
        <AppHeaderRight />
      </div>
    </header>
  );
}

const AppHeaderLeft = () => (
  <Link href="/markets" aria-label="ODX markets" className="flex shrink-0 items-center">
    <ODXLogoLight className="h-6 w-auto" />
  </Link>
);

const AppHeaderRight = () => {
  return (
    <div className="ml-auto flex items-center gap-2">
      {isStaging && <StagingSettings />}
      <ConnectWallet />
    </div>
  );
};

export const MobileNavbar = () => {
  const pathname = usePathname();
  const navItems = [
    { label: 'Markets', route: '/markets', icon: Home },
    { label: 'Reserves', route: '/reserves', icon: Database },
    { label: 'Explorer', route: '/explorer', icon: Activity },
    { label: 'Leaderboard', route: '/leaderboard', icon: Trophy },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-border bg-background/95 backdrop-blur-md md:hidden">
      {navItems.map(({ label, route, icon: Icon }) => {
        const isActive =
          (label === 'Markets' && pathname.includes('x-assets')) || pathname === route;
        return (
          <Link
            key={label}
            href={route}
            className={cn(
              'flex h-full flex-1 flex-col items-center justify-center text-xs',
              isActive ? 'font-medium text-foreground' : 'text-muted-foreground'
            )}
            style={{ textDecoration: 'none' }}
          >
            <Icon className="mb-1 h-5 w-5" />
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
    <nav className="hidden items-center gap-1 md:flex">
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
        'rounded-lg px-3 py-2 text-sm transition-colors',
        isActive ? 'font-medium text-foreground' : 'text-muted-foreground hover:text-foreground',
        comingSoon && 'opacity-50 hover:text-muted-foreground'
      )}
      style={{ textDecoration: 'none' }}
    >
      {t(label)}
    </Link>
  );
};
