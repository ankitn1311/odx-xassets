'use client';
import { useEffect, useRef } from 'react';

const PITCH = 26; // px from one pair of bars to the next
const REACH = 120; // radius of the cursor's influence, px
const SKY = '99,160,248';

/**
 * A skyline of paired bars: one solid blue (units minted) beside one outlined (units in
 * custody), always the same height. The reserves page as a landscape. Heights are fixed
 * per column, breathe very slightly, and the pairs under the cursor light up. Canvas,
 * full-bleed, no pointer capture: it listens on the window and maps the pointer into
 * its own box, so the headline and header above it keep working. Pauses off-screen.
 *
 * The picture is always composed at the viewport's size and cropped to the box, like an
 * image with object-fit: cover, so when the hero collapses into the square the square
 * shows the centre of the same skyline rather than a smaller, emptier one.
 */
export function ReservesField({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0;
    let h = 0;
    let vw = 1;
    let vh = 1;
    let raf = 0;
    let visible = true;
    const t0 = performance.now();

    // Deterministic column heights, so the skyline is the same on every visit.
    const seed: number[] = [];
    let s = 11;
    for (let i = 0; i < 200; i++) {
      s = (s * 9301 + 49297) % 233280;
      seed.push(s / 233280);
    }

    // Pointer, in canvas space. `cur` eases after the cursor; `str` fades in when the
    // cursor is over the field and out when it leaves.
    const target = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };
    let strTarget = 0;
    let str = 0;

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = Math.max(1, Math.round(r.width));
      h = Math.max(1, Math.round(r.height));
      vw = Math.max(w, window.innerWidth);
      vh = Math.max(h, window.innerHeight);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Setting the size clears the canvas, and ResizeObserver runs after this frame's
      // animation callback, so redraw here or every frame of the morph paints blank.
      draw(performance.now());
    };

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const inside = x >= 0 && y >= 0 && x <= r.width && y <= r.height;
      target.x = x;
      target.y = y;
      strTarget = inside ? 1 : 0;
      if (inside && str === 0) {
        cur.x = x;
        cur.y = y;
      }
    };
    const onLeave = () => {
      strTarget = 0;
    };

    const draw = (time: number) => {
      const t = (time - t0) / 1000;
      cur.x += (target.x - cur.x) * 0.12;
      cur.y += (target.y - cur.y) * 0.12;
      str += (strTarget - str) * (strTarget > str ? 0.1 : 0.05);
      if (str < 0.002) str = 0;

      ctx.clearRect(0, 0, w, h);
      // Compose at the viewport's size, centred on the box (object-fit: cover).
      const ox = (w - vw) / 2;
      const oy = (h - vh) / 2;
      const base = Math.round(oy + vh * 0.86) + 0.5;
      const n = Math.ceil(vw / PITCH) + 1;
      const bw = Math.max(2, Math.round(PITCH * 0.22));
      const x0 = ox + (vw - (n - 1) * PITCH) / 2;

      for (let i = 0; i < n; i++) {
        const x = x0 + i * PITCH;
        const k = seed[i % seed.length];
        let hh = vh * (0.16 + 0.42 * (0.5 + 0.5 * Math.sin(i * 0.55 + k * 2)));
        if (!reduce) hh *= 1 + 0.03 * Math.sin(t * 0.6 + i * 0.4);
        hh = Math.round(hh);
        const d = x - cur.x;
        const g = str > 0 ? str * Math.exp(-(d * d) / (2 * REACH * REACH)) : 0;

        // Minted: solid blue. Held: the same height, outlined.
        ctx.fillStyle = `rgba(${SKY},${0.28 + 0.6 * g})`;
        ctx.fillRect(x - bw - 1, base - hh, bw, hh);
        ctx.strokeStyle = `rgba(255,255,255,${0.22 + 0.5 * g})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 1.5, base - hh + 0.5, bw, hh - 1);
      }
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fillRect(ox, base - 0.5, vw, 1);
    };

    const loop = (time: number) => {
      draw(time);
      raf = visible ? requestAnimationFrame(loop) : 0;
    };
    const start = () => {
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    window.addEventListener('resize', resize);
    resize();
    if (reduce) {
      draw(performance.now());
      return () => {
        ro.disconnect();
        window.removeEventListener('resize', resize);
      };
    }

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(canvas);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    start();
    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className={className} />;
}
