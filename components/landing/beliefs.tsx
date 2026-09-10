'use client';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Marker } from './blueprint';

const BELIEFS = [
  {
    title: 'Open access',
    body: 'Trading a wrap should not need an identity check. A gate applies only to a series that requires one, such as fund shares, and never to holding xXRP.',
  },
  {
    title: 'Verifiable backing',
    body: 'A receipt is only worth what stands behind it. Units minted, units in custody and the custodian are public, so anyone can check the ratio themselves.',
  },
  {
    title: 'An exit, anytime',
    body: 'Redeem whenever you like. The route is chosen for you: instant from the buffer, or a queue with your position and ETA, always back to USDC.e.',
  },
];

/** "We believe in" with a rotating dotted globe and three auto-cycling beliefs. */
export function Beliefs() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setTimeout(() => setI(n => (n + 1) % BELIEFS.length), 5000);
    return () => clearTimeout(id);
  }, [i]);

  return (
    <section id="principles" className="mx-auto max-w-[1600px] scroll-mt-24 px-5 py-20 md:px-10 md:py-32">
      <div className="grid items-center gap-10 md:grid-cols-[1fr_1.2fr_1fr]">
        <div>
          <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-[var(--l-muted)]">
            <Marker /> A message from ODX
          </p>
          <h2 className="mt-3 text-[40px] font-semibold leading-none tracking-[-0.03em] md:text-[56px]">
            We believe in
          </h2>
        </div>

        <Globe className="mx-auto aspect-square w-full max-w-[440px]" />

        <div className="md:text-right">
          <AnimatePresence mode="wait">
            <motion.h3
              key={i}
              initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -16, filter: 'blur(8px)' }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="text-[36px] font-semibold leading-none tracking-[-0.03em] text-[var(--l-blue)] md:text-[52px]"
            >
              {BELIEFS[i].title}
            </motion.h3>
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <AnimatePresence mode="wait">
          <motion.p
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-[560px] text-lg leading-[1.45] text-[var(--l-ink-2)]"
          >
            {BELIEFS[i].body}
          </motion.p>
        </AnimatePresence>
        <div className="flex gap-2">
          {BELIEFS.map((b, n) => (
            <button
              key={b.title}
              type="button"
              onClick={() => setI(n)}
              aria-label={b.title}
              aria-current={n === i}
              className={cn(
                'flex size-9 items-center justify-center rounded-md border font-mono text-xs font-medium transition-colors',
                n === i
                  ? 'border-[var(--l-surface)] bg-[var(--l-surface)] text-[var(--l-ink)]'
                  : 'border-[var(--l-line)] text-[var(--l-muted-2)] hover:text-[var(--l-ink)]'
              )}
            >
              {String(n + 1).padStart(2, '0')}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Dotted globe on a canvas: a Fibonacci sphere, slowly rotating, land tinted darker. */
function Globe({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const N = 1600;
    const pts: { x: number; y: number; z: number; land: boolean }[] = [];
    const phi = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const th = phi * i;
      const x = Math.cos(th) * r;
      const z = Math.sin(th) * r;
      // A few overlapping sine fields stand in for continents.
      const f = Math.sin(3.1 * x + 1.3) * Math.cos(2.7 * y - 0.4) + Math.sin(2.2 * z + 0.9) * 0.6 + Math.cos(4.1 * x * y);
      pts.push({ x, y, z, land: f > 0.55 });
    }

    let raf = 0;
    let size = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      size = canvas.clientWidth;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (t: number) => {
      const a = t * 0.00012;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      const R = size * 0.47;
      const cx = size / 2;
      const cy = size / 2;
      ctx.clearRect(0, 0, size, size);
      for (const p of pts) {
        const x = p.x * ca - p.z * sa;
        const z = p.x * sa + p.z * ca;
        const depth = (z + 1) / 2; // 0 back, 1 front
        const alpha = 0.12 + depth * 0.88;
        const rad = 1.4 + depth * 1.2;
        ctx.beginPath();
        ctx.arc(cx + x * R, cy + p.y * R, rad, 0, Math.PI * 2);
        ctx.fillStyle = p.land ? `rgba(47,107,255,${alpha})` : `rgba(99,160,248,${alpha * 0.55})`;
        ctx.fill();
      }
      if (!reduce) raf = requestAnimationFrame(draw);
    };

    resize();
    draw(0);
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className={className} />;
}
