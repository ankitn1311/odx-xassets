import Link from 'next/link';

/** Dark feature banner with a clock-face graphic, like the reference app's 24/7 promo. */
export function PromoBanner() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-[#0B1F3A] text-white">
      <div className="relative z-10 grid gap-6 p-6 md:grid-cols-2 md:p-8">
        <div className="flex flex-col items-start gap-3">
          <h2 className="text-[26px] font-medium leading-tight tracking-[-0.02em] md:text-[28px]">
            Mint and redeem xAssets 24/7
          </h2>
          <p className="max-w-[440px] text-[15px] text-[#8CB1ED]">
            Always-on minting and redemption, backed 1:1 in custody, so you can move any time
            the market moves.
          </p>
          <Link
            href="/x-assets"
            className="mt-2 inline-flex h-9 items-center rounded-lg bg-white/15 px-4 text-sm font-medium text-white transition-colors hover:bg-white/25"
          >
            Trade now
          </Link>
        </div>

        <div className="flex items-center justify-center md:justify-end">
          <p className="text-[30px] font-medium tracking-[-0.02em] md:text-[38px]">
            Onchain <span className="text-[#8CB1ED]">24:7:365</span>
          </p>
        </div>
      </div>

      {/* Clock-face: a ring, a long hand across the card, a short hand, a hub. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 800 220"
        preserveAspectRatio="xMaxYMid slice"
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        <circle cx="520" cy="110" r="150" fill="none" stroke="#5A86CC" strokeOpacity="0.25" />
        <circle cx="520" cy="110" r="96" fill="none" stroke="#5A86CC" strokeOpacity="0.15" />
        <line x1="520" y1="110" x2="760" y2="200" stroke="#ffffff" strokeOpacity="0.7" strokeWidth="1.5" />
        <line x1="520" y1="110" x2="600" y2="10" stroke="#8CB1ED" strokeWidth="14" strokeLinecap="round" strokeOpacity="0.9" />
        <circle cx="520" cy="110" r="11" fill="#ffffff" />
      </svg>
    </section>
  );
}
