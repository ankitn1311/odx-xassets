// import AppBanner from '../app-banner';
import AppHeader from '../app-header';

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* <AppBanner /> */}
      <AppHeader />
      {children}
    </>
  );
}
