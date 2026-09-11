'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const CX = 690;
const CY = 110;
const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Dark blueprint banner. The clock is real: hands and the readout follow UTC, ticking
 * once a second, so the "always on" claim is shown rather than decorated.
 */
export function PromoBanner() {
  // Set only on the client so the server and first client render agree.
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const h = now?.getUTCHours() ?? 0;
  const m = now?.getUTCMinutes() ?? 0;
  const s = now?.getUTCSeconds() ?? 0;
  const hourDeg = ((h % 12) + m / 60) * 30;
  const minuteDeg = (m + s / 60) * 6;
  const secondDeg = s * 6;
  const readout = now ? `${pad(h)}:${pad(m)}:${pad(s)}` : '--:--:--';

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

        {/* Live readout: the time now, and the fact that there is no close to wait for. */}
        <div className="flex flex-col justify-center gap-1.5">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/45">Market clock · UTC · 24:7:365</p>
          <p className="font-mono text-[34px] font-medium leading-none tracking-[-0.02em] text-[#63A0F8] tabular-nums md:text-[42px]">
            <time dateTime={now?.toISOString()} suppressHydrationWarning>
              {readout}
            </time>
          </p>
          <p className="flex items-center gap-2 font-mono text-[12px] text-white/60">
            <span className="h-1.5 w-1.5 rounded-full bg-[#1DA66A]" />
            Open now · next close: never
          </p>
        </div>
      </div>

      {/* Clock face drawn like a plan: dashed ring, square-capped hands set to the time above. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 800 220"
        preserveAspectRatio="xMaxYMid slice"
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        <circle cx={CX} cy={CY} r="124" fill="none" stroke="#63A0F8" strokeOpacity="0.3" strokeDasharray="4 8" />
        <circle cx={CX} cy={CY} r="96" fill="none" stroke="#63A0F8" strokeOpacity="0.2" />
        {/* Hour ticks on the inner ring */}
        {Array.from({ length: 12 }, (_, i) => (
          <line
            key={i}
            x1={CX}
            y1={CY - 96}
            x2={CX}
            y2={CY - (i % 3 === 0 ? 84 : 90)}
            stroke="#63A0F8"
            strokeOpacity={i % 3 === 0 ? 0.6 : 0.3}
            strokeWidth={i % 3 === 0 ? 2 : 1}
            transform={`rotate(${i * 30} ${CX} ${CY})`}
          />
        ))}
        {/* Seconds: a hairline that sweeps the outer ring */}
        <line
          x1={CX}
          y1={CY}
          x2={CX}
          y2={CY - 104}
          stroke="#ffffff"
          strokeOpacity="0.35"
          strokeWidth="1"
          transform={`rotate(${secondDeg} ${CX} ${CY})`}
        />
        {/* Minutes */}
        <line
          x1={CX}
          y1={CY}
          x2={CX}
          y2={CY - 88}
          stroke="#ffffff"
          strokeOpacity="0.7"
          strokeWidth="2"
          transform={`rotate(${minuteDeg} ${CX} ${CY})`}
        />
        {/* Hours */}
        <line
          x1={CX}
          y1={CY}
          x2={CX}
          y2={CY - 58}
          stroke="#63A0F8"
          strokeWidth="8"
          strokeOpacity="0.9"
          transform={`rotate(${hourDeg} ${CX} ${CY})`}
        />
        <rect x={CX - 6} y={CY - 6} width="12" height="12" fill="#63A0F8" />
      </svg>
    </section>
  );
}
