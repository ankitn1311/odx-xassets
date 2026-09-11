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

type StepProps = { series: number[]; color: string; badge?: string };

/**
 * Stepped line for a price that accrues: each step holds, then moves up. The line is
 * drawn in from the left, with a faint fill beneath it and the value badge at the end.
 */
export function StepLine({ series, color, badge }: StepProps) {
  const [ref, { w, h }] = useSize<HTMLDivElement>();
  const top = 30;
  const bottom = 8;
  const n = series.length;
  const min = Math.min(...series);
  const max = Math.max(...series);
  const span = h - top - bottom;
  const y = (v: number) =>
    max === min ? top + span / 2 : h - bottom - ((v - min) / (max - min)) * span;
  const x = (i: number) => 4 + (i / Math.max(1, n - 1)) * (w - 8);
  // Horizontal run to the next x, then the vertical rise: a staircase.
  const steps = series.map((v, i) => {
    const px = x(i);
    const nx = i < n - 1 ? x(i + 1) : px;
    return `${i === 0 ? 'M' : 'L'} ${px} ${y(v)} L ${nx} ${y(v)}`;
  });
  const line = steps.join(' ');
  const area = `${line} L ${x(n - 1)} ${h - bottom} L ${x(0)} ${h - bottom} Z`;

  return (
    <div ref={ref} className="relative h-full min-h-[140px] w-full">
      {badge && (
        <span
          className="absolute right-0 top-0 rounded border px-1.5 py-0.5 font-mono text-[11px]"
          style={{ borderColor: color, color }}
        >
          {badge}
        </span>
      )}
      {w > 0 && (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="block" aria-hidden="true">
          {Array.from({ length: 7 }).map((_, i) => {
            const gy = top + (i / 6) * span;
            return (
              <line key={i} x1="0" x2={w} y1={gy} y2={gy} stroke="#D9DEE7" strokeDasharray="2 4" />
            );
          })}
          <motion.path
            d={area}
            fill={color}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.08 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.6 }}
          />
          <motion.path
            d={line}
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeLinejoin="miter"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.1, ease: EASE, delay: 0.15 }}
          />
          <motion.rect
            x={x(n - 1) - 4}
            y={y(series[n - 1]) - 4}
            width={8}
            height={8}
            fill={color}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: EASE, delay: 1.2 }}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          />
        </svg>
      )}
    </div>
  );
}

type PairedProps = { series: number[]; color: string; badge?: string; labels?: [string, string] };

/**
 * Paired bars, the same mark as the hero ledger: for every step a solid bar (minted)
 * stands next to an outlined bar (in custody) of exactly the same height, so "backed
 * 1:1" reads as a shape rather than a claim. Bars rise from a zero baseline.
 */
export function PairedBars({
  series,
  color,
  badge,
  labels = ['Minted', 'In custody'],
}: PairedProps) {
  const [ref, { w, h }] = useSize<HTMLDivElement>();
  const top = 30;
  const bottom = 8;
  const n = series.length;
  const max = Math.max(...series, 1);
  const floor = h - bottom;
  const span = h - top - bottom;
  const slot = (w - 8) / n;
  const bw = Math.max(3, Math.floor((slot - 6) / 2));
  const bar = (i: number, v: number, outlined: boolean) => {
    const bh = Math.max(2, (v / max) * span);
    const x = 4 + i * slot + (outlined ? bw + 2 : 0);
    return (
      <motion.rect
        key={`${outlined ? 'c' : 'm'}${i}`}
        x={x + (outlined ? 0.5 : 0)}
        y={floor - bh + (outlined ? 0.5 : 0)}
        width={outlined ? bw - 1 : bw}
        height={outlined ? Math.max(1, bh - 1) : bh}
        fill={outlined ? 'none' : color}
        stroke={outlined ? color : 'none'}
        strokeWidth={outlined ? 1 : 0}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.15 + i * 0.03 }}
        style={{ transformBox: 'fill-box', transformOrigin: 'bottom' }}
      />
    );
  };

  return (
    <div ref={ref} className="relative h-full min-h-[140px] w-full">
      <div className="absolute left-0 top-0 flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--l-muted)]">
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="inline-block size-2" style={{ background: color }} />
          {labels[0]}
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="inline-block size-2 border" style={{ borderColor: color }} />
          {labels[1]}
        </span>
      </div>
      {badge && (
        <span className="absolute right-0 top-0 rounded border border-[var(--l-plum)] px-1.5 py-0.5 font-mono text-[11px] text-[var(--l-plum)]">
          {badge}
        </span>
      )}
      {w > 0 && (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="block" aria-hidden="true">
          {Array.from({ length: 7 }).map((_, i) => {
            const gy = top + (i / 6) * span;
            return (
              <line key={i} x1="0" x2={w} y1={gy} y2={gy} stroke="#D9DEE7" strokeDasharray="2 4" />
            );
          })}
          <line x1="0" x2={w} y1={floor} y2={floor} stroke="#D9DEE7" />
          {series.map((v, i) => bar(i, v, false))}
          {series.map((v, i) => bar(i, v, true))}
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
