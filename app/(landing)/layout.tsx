import { Instrument_Serif } from 'next/font/google';
import { LandingGround } from '@/components/landing/landing-ground';
import { LandingHeader } from '@/components/landing/landing-header';
import { LandingFooter } from '@/components/landing/landing-footer';

// Three type roles, like the reference: Geist Sans (shared with the app) for headings and
// UI, Instrument Serif for descriptive copy and big figures, Geist Mono for data labels.
const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
  display: 'swap',
});

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`landing font-landing ${instrumentSerif.variable}`}>
      <LandingGround>
        <LandingHeader />
        <main>{children}</main>
        <LandingFooter />
      </LandingGround>
    </div>
  );
}
