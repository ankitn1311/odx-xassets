import { LandingGround } from '@/components/landing/landing-ground';
import { LandingHeader } from '@/components/landing/landing-header';
import { LandingFooter } from '@/components/landing/landing-footer';

// One family only: Geist Sans for everything, Geist Mono for numbers and labels.
export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="landing font-landing">
      <LandingGround>
        <LandingHeader />
        <main>{children}</main>
        <LandingFooter />
      </LandingGround>
    </div>
  );
}
