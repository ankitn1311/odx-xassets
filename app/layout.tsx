import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import Providers from './providers';
import NextTopLoader from 'nextjs-toploader';
import { GlobalDialog } from '@/components/common/global-dialog';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'ODX',
  description: 'Real assets, backed onchain',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <link rel="icon" href="/favicon.ico" sizes="any" />
      <link rel="icon" href="/images/favicon.png" type="image/png" sizes="32x32" />
      <link rel="apple-touch-icon" href="/images/favicon.png" />

      <body className={`${geistSans.variable} ${geistMono.variable} font-sans text-sm antialiased`}>
        <NextTopLoader color="#121212" showSpinner={false} height={2} />
        <Providers>
          {/* The product is light-only, like the landing page. */}
          <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light">
            <NextIntlClientProvider messages={messages}>
              <GlobalDialog />
              {children}
            </NextIntlClientProvider>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
