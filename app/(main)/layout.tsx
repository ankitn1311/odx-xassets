import AppFooter from '../app-footer';
import AppHeader from '../app-header';
import { Github, Twitter, MessageCircle } from 'lucide-react';

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen w-screen flex-col">
      <AppHeader />
      <div className="flex-1 pb-20 md:pb-0">{children}</div>
      <AppFooter />
    </div>
  );
}
