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
      <div className="min-h-[calc(100vh-6.875rem)] flex-1 overflow-y-auto pb-20">{children}</div>
      <AppFooter />
    </div>
  );
}
