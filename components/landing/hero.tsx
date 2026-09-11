'use client';
import { useEffect, useRef, useState } from 'react';
import { HeroSheet, MintDiagram } from './blueprint';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { useLandingExpanded } from './landing-ground';
import { AssetTicker } from './asset-ticker';

const MORPH = { duration: 1.1, ease: [0.45, 0, 0.25, 1] as const };
const LEFT = 'Real assets,';
const RIGHT = 'backed onchain.';

/**
 * Pinned full-screen hero. At rest the photo fills the viewport with the headline
 * centred over it. The first scroll collapses the photo into a rounded square, slides
 * the two halves of the headline to the page edges, turns them black and reveals the
 * subtitle. The section is only slightly taller than the viewport: the page parks at
 * HOLD (120px, see landing-ground) while the morph plays, and the next wheel notch
 * should start moving the page rather than scrolling through dead space.
 */
export function Hero() {
  const expanded = useLandingExpanded();
  const reduce = useReducedMotion();
  const leftRef = useRef<HTMLSpanElement>(null);
  const rightRef = useRef<HTMLSpanElement>(null);
  const [geo, setGeo] = useState({ dxL: 0, dxR: 0, dy: 0, square: 480, scale: 1 });

  useEffect(() => {
    const measure = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const mobile = vw < 768;
      const square = mobile ? Math.min(vw * 0.8, 420) : Math.min(vh * 0.61, 518);
      const margin = Math.max(24, vw * 0.05);
      const l = leftRef.current;
      const r = rightRef.current;
      if (!l || !r) return;
      // Each half has to fit in the gutter between the page edge and the square.
      // If it doesn't, shrink it about its outer edge.
      const gutter = (vw - square) / 2 - margin - 32;
      const scale = mobile ? 1 : Math.min(1, gutter / Math.max(l.offsetWidth, r.offsetWidth));
      // offsetLeft ignores transforms, so this is stable however far the halves have moved.
      const dxL = margin - l.offsetLeft;
      const dxR = vw - margin - (r.offsetLeft + r.offsetWidth);
      setGeo({
        dxL: mobile ? 0 : dxL,
        dxR: mobile ? 0 : dxR,
        dy: mobile ? -(square / 2 + 72) : 0,
        square,
        scale,
      });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const t = reduce ? { duration: 0 } : MORPH;
  const ink = expanded ? '#0B0F17' : '#ffffff';

  return (
    <section
      id="hero"
      className="relative h-[calc(100vh+160px)]"
      style={{ ['--hero-square' as string]: `${geo.square}px` }}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="hero-media">
          {/* Full-bleed: a quiet sheet, grid and the square motif only. The mint diagram
              is drawn in once the media has collapsed into the square. */}
          <HeroSheet />
          <motion.div
            className="absolute inset-0"
            initial={false}
            animate={{ opacity: expanded ? 1 : 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: expanded ? 0.5 : 0 }}
          >
            <MintDiagram />
          </motion.div>
        </div>

        <h1 className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-center gap-[0.3em] whitespace-nowrap px-4 text-center text-[40px] font-semibold leading-none tracking-[-0.03em] sm:text-[60px] md:flex-row md:text-[72px] lg:text-[84px]">
          <motion.span
            ref={leftRef}
            className="inline-block origin-left"
            animate={{
              x: expanded ? geo.dxL : 0,
              y: expanded ? geo.dy : 0,
              scale: expanded ? geo.scale : 1,
              color: ink,
            }}
            transition={t}
          >
            {LEFT}
          </motion.span>
          <motion.span
            ref={rightRef}
            className="inline-block origin-right"
            animate={{
              x: expanded ? geo.dxR : 0,
              y: expanded ? geo.dy : 0,
              scale: expanded ? geo.scale : 1,
              color: ink,
            }}
            transition={t}
          >
            {RIGHT}
          </motion.span>
        </h1>

        <motion.p
          className="absolute inset-x-0 mx-auto max-w-[560px] px-6 text-center text-lg font-normal leading-snug text-[var(--l-ink-2)] md:text-[20px]"
          style={{ top: `calc(50% + ${geo.square / 2}px + 40px)` }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: expanded ? 1 : 0, y: expanded ? 0 : 12 }}
          transition={{ ...t, delay: expanded ? 0.35 : 0 }}
        >
          ODX mints wrapped XRP, BTC, DOGE and more, each unit held in custody and shown on a
          public reserves page. Mint with USDC.e, hold or earn, and redeem anytime.
        </motion.p>

        <motion.div
          className="absolute inset-x-0 bottom-0 pb-8 text-white"
          animate={{ opacity: expanded ? 0 : 1, y: expanded ? 40 : 0 }}
          transition={t}
        >
          <p className="mb-8 flex items-center justify-center gap-1.5 font-mono text-xs uppercase tracking-[0.14em] text-white/70">
            Scroll to explore <ArrowDown className="size-3.5" />
          </p>
          <AssetTicker tone="dark" />
        </motion.div>
      </div>
    </section>
  );
}
