import AppFooter from '../app-footer';
import AppHeader, { MobileNavbar } from '../app-header';
import { StatusBanner } from '@/components/common/status-banner';

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex h-dvh w-screen flex-col overflow-y-auto bg-background">
      <AppHeader />
      <StatusBanner />
      <div className="flex flex-1 items-start justify-center">{children}</div>
      <AppFooter />
      <MobileNavbar />
    </div>
  );
}
