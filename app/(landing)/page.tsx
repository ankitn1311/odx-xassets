import type { Metadata } from 'next';
import { Hero } from '@/components/landing/hero';
import { Latest } from '@/components/landing/latest';
import { ProductsBento } from '@/components/landing/products-bento';
import { Foundation } from '@/components/landing/foundation';
import { Beliefs } from '@/components/landing/beliefs';
import { Principles } from '@/components/landing/principles';
import { Cta } from '@/components/landing/cta';

export const metadata: Metadata = {
  title: 'ODX · Backed onchain assets',
  description:
    'Mint wrapped XRP, BTC, DOGE and more, backed 1:1 in custody with public proof of reserves. Hold, earn with xCASH, and redeem anytime.',
};

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Latest />
      <ProductsBento />
      <Foundation />
      <Beliefs />
      <Principles />
      <Cta />
    </>
  );
}
