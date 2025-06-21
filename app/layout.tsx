import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import Providers from './providers';
import NextTopLoader from 'nextjs-toploader';
import { GlobalDialog } from '@/components/common/global-dialog';
import { GridBackground } from '@/components/ui/grid-background';

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
  description: 'An Omnichain Trading Layer',
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
      <link
        rel="apple-touch-icon"
        href="/images/favicon.png"
        type="image/<generated>"
        sizes="<generated>"
      />

      <body className={`${geistSans.variable} ${geistMono.variable} font-sans text-xs antialiased`}>
        <NextTopLoader color="#d7a7d7" />
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <NextIntlClientProvider messages={messages}>
              <GlobalDialog />
              <GridBackground>
                {/* <div className="absolute inset-0 z-50 flex flex-col items-center justify-center px-4"> */}
                {children}
                {/* </div> */}
              </GridBackground>
            </NextIntlClientProvider>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
