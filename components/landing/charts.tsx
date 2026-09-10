'use client';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1] as const;

/** Measures its element so charts can draw in real pixels and fit whatever tile height they get. */
function useSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ w: Math.round(width), h: Math.round(height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, size] as const;
}

type LineProps = { series: number[]; color: string; badge?: string; secondary?: number[] };

/** Dotted line chart drawn as staggered squares over a dashed grid, with a value badge. */
export function DottedLine({ series, color, badge, secondary }: LineProps) {
  const [ref, { w, h }] = useSize<HTMLDivElement>();
  const top = 30;
  const bottom = 8;
  const all = [...series, ...(secondary ?? [])];
  const min = Math.min(...all);
  const max = Math.max(...all);
  const y = (v: number) =>
    max === min ? top + (h - top - bottom) / 2 : h - bottom - ((v - min) / (max - min)) * (h - top - bottom);
  const x = (i: number, n: number) => 4 + (i / Math.max(1, n - 1)) * (w - 8);
  // The secondary series is drawn first and larger, so where the two overlap it shows
  // as a halo around the primary dot: "matched" reads at a glance.
  const dot = (i: number, n: number, v: number, fill: string, delay: number, key: string, size = 6) => (
    <motion.rect
      key={key}
      x={x(i, n) - size / 2}
      y={y(v) - size / 2}
      width={size}
      height={size}
      rx={0}
      fill={fill}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: EASE, delay }}
      style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
    />
  );

  return (
    <div ref={ref} className="relative h-full min-h-[140px] w-full">
      {badge && (
        <span className="absolute right-0 top-0 rounded border border-[var(--l-plum)] px-1.5 py-0.5 font-mono text-[11px] text-[var(--l-plum)]">
          {badge}
        </span>
      )}
      {w > 0 && (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="block" aria-hidden="true">
          {Array.from({ length: 7 }).map((_, i) => {
            const gy = top + (i / 6) * (h - top - bottom);
            return <line key={i} x1="0" x2={w} y1={gy} y2={gy} stroke="#D9DEE7" strokeDasharray="2 4" />;
          })}
          {secondary?.map((v, i) => dot(i, secondary.length, v, '#D9DEE7', 0.1 + i * 0.03, `s${i}`, 12))}
          {series.map((v, i) => dot(i, series.length, v, color, 0.2 + i * 0.04, `p${i}`))}
        </svg>
      )}
    </div>
  );
}

type BarsProps = { values: { label: string; value: number }[]; color: string; badge?: string };

/** Bars grow from the baseline, lightest to darkest, with an optional badge. */
export function Bars({ values, color, badge }: BarsProps) {
  const [ref, { w, h }] = useSize<HTMLDivElement>();
  const top = 30;
  const labels = 22;
  const gap = 10;
  const max = Math.max(...values.map(v => v.value), 1);
  const bw = (w - gap * (values.length - 1)) / values.length;
  const base = h - labels;

  return (
    <div ref={ref} className="relative h-full min-h-[160px] w-full">
      {badge && (
        <span className="absolute right-0 top-0 rounded border border-[var(--l-blue)] px-1.5 py-0.5 font-mono text-[11px] text-[var(--l-blue)]">
          {badge}
        </span>
      )}
      {w > 0 && (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="block" aria-hidden="true">
          {values.map((v, i) => {
            const bh = Math.max(6, (v.value / max) * (base - top));
            const alpha = 0.35 + (0.65 * (i + 1)) / values.length;
            return (
              <g key={v.label}>
                <motion.rect
                  x={i * (bw + gap)}
                  y={base - bh}
                  width={bw}
                  height={bh}
                  rx="0"
                  fill={color}
                  fillOpacity={alpha}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.8, ease: EASE, delay: 0.15 + i * 0.12 }}
                  style={{ transformBox: 'fill-box', transformOrigin: 'bottom' }}
                />
                <text
                  x={i * (bw + gap) + bw / 2}
                  y={h - 6}
                  textAnchor="middle"
                  fontSize="11"
                  fontFamily="var(--font-geist-mono), ui-monospace, monospace"
                  fill="#5B6474"
                >
                  {v.label}
                </text>
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
}

/**
 * Grid of token icons popping in one after another. The PNGs carry their own ring and
 * ODX badge, so they're shown as-is: no extra circle, no clipping.
 */
export function IconGrid({ icons }: { icons: string[] }) {
  return (
    <div className="grid h-full min-h-[150px] grid-cols-4 gap-2 [grid-auto-rows:minmax(0,1fr)]">
      {icons.map((icon, i) => (
        <motion.div
          key={icon}
          className="flex min-h-0 items-center justify-center"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: EASE, delay: 0.15 + i * 0.07 }}
        >
          <Image
            src={`/images/tokens/${icon}.png`}
            alt=""
            width={96}
            height={96}
            className="aspect-square h-full max-h-[88px] w-auto max-w-full object-contain"
          />
        </motion.div>
      ))}
    </div>
  );
}

/** Mini reserves table, rows sliding in. */
export function MiniTable({ rows }: { rows: [string, string, string][] }) {
  return (
    <div className="overflow-hidden rounded-md border border-[var(--l-line)] text-[12px]">
      <div className="grid grid-cols-3 bg-[var(--l-surface)] px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-[var(--l-muted)]">
        <span>Asset</span>
        <span>Minted</span>
        <span>In custody</span>
      </div>
      {rows.map((r, i) => (
        <motion.div
          key={r[0]}
          className="grid grid-cols-3 border-t border-[var(--l-line)] px-3 py-2 font-mono"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: EASE, delay: 0.15 + i * 0.08 }}
        >
          <span className="font-semibold">{r[0]}</span>
          <span className="text-[var(--l-muted)]">{r[1]}</span>
          <span className="text-[var(--l-muted)]">{r[2]}</span>
        </motion.div>
      ))}
    </div>
  );
}
