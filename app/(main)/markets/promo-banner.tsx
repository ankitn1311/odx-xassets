import Link from 'next/link';

/** Dark blueprint banner: faint grid, a drawn clock face, blue square markers. */
export function PromoBanner() {
  return (
    <section className="blueprint-grid-dark relative overflow-hidden rounded-lg bg-[#0B0F17] text-white">
      <div className="relative z-10 grid gap-6 p-6 md:grid-cols-2 md:p-8">
        <div className="flex flex-col items-start gap-3">
          <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[#63A0F8]">
            <span className="h-2 w-2 bg-[#63A0F8]" /> Always on
          </span>
          <h2 className="text-[26px] font-semibold leading-tight tracking-[-0.02em] md:text-[28px]">
            Mint and redeem xAssets 24/7
          </h2>
          <p className="max-w-[440px] text-[15px] text-white/65">
            Always-on minting and redemption, backed 1:1 in custody, so you can move any time
            the market moves.
          </p>
          <Link
            href="/x-assets"
            className="mt-2 inline-flex h-9 items-center rounded-md bg-[#2F6BFF] px-4 text-sm font-medium text-white transition-colors hover:bg-[#1F55E0]"
          >
            Trade now
          </Link>
        </div>

        <div className="flex items-center justify-center md:justify-start md:pl-6">
          <p className="font-mono text-[30px] font-medium tracking-[-0.02em] md:text-[38px]">
            <span className="text-white/60">Onchain</span> <span className="text-[#63A0F8]">24:7:365</span>
          </p>
        </div>
      </div>

      {/* Clock-face drawn like a plan: square-capped hands, dashed ring, no fills. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 800 220"
        preserveAspectRatio="xMaxYMid slice"
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        <circle cx="720" cy="110" r="150" fill="none" stroke="#63A0F8" strokeOpacity="0.3" strokeDasharray="4 8" />
        <circle cx="720" cy="110" r="96" fill="none" stroke="#63A0F8" strokeOpacity="0.2" />
        <line x1="720" y1="110" x2="560" y2="230" stroke="#ffffff" strokeOpacity="0.6" strokeWidth="1" />
        <line x1="720" y1="110" x2="790" y2="10" stroke="#63A0F8" strokeWidth="8" strokeOpacity="0.9" />
        <rect x="714" y="104" width="12" height="12" fill="#63A0F8" />
      </svg>
    </section>
  );
}
