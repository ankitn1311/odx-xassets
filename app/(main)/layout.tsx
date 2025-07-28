import AppFooter from '../app-footer';
import AppHeader, { MobileNavbar } from '../app-header';

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex h-dvh w-screen flex-col overflow-y-auto">
      <AppHeader />
      <div className="flex flex-1 items-center justify-center">{children}</div>
      <AppFooter />
      <MobileNavbar />
    </div>
  );
}
