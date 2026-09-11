'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import ODXLogoDark from '@/components/svg/odx-logo-dark';
import ODXMark from '@/components/svg/odx-mark';
import { LaunchGate } from './launch-gate';
import { useLandingExpanded } from './landing-ground';
import { cn } from '@/lib/utils';

const NAV = [
  { label: 'Products', href: '#products' },
  { label: 'Reserves', href: '#reserves' },
  { label: 'Principles', href: '#principles' },
  { label: 'Docs', href: 'https://docs.odx.so', external: true },
];

/**
 * Over the hero the bar is full-width and transparent. As soon as the page is scrolled
 * it morphs into a floating black pill, the way the reference site does.
 */
export function LandingHeader() {
  const expanded = useLandingExpanded();
  const reduce = useReducedMotion();
  const [menuOpen, setMenuOpen] = useState(false);

  // While the sheet is open the page behind it stays put, and Escape closes it.
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);
  const [hover, setHover] = useState<string | null>(null);

  return (
    <header className="fixed inset-x-0 top-0 z-40 text-white">
      <div
        className={cn(
          'site-bar relative z-10 mx-auto flex w-full items-center justify-between',
          expanded
            ? 'site-bar--mirror mt-3 h-[64px] max-w-[calc(100%-24px)] rounded-full px-2 md:max-w-[720px]'
            : 'mt-0 h-[88px] max-w-[1600px] rounded-none bg-transparent px-5 shadow-none md:px-10'
        )}
      >
        <Link href="/" aria-label="ODX home" className="relative flex h-12 items-center">
          {/* Wordmark over the hero; a white disc with the mark once the bar is a pill. */}
          <ODXLogoDark
            className={cn(
              'h-6 w-auto transition-opacity duration-300',
              expanded ? 'pointer-events-none opacity-0' : 'opacity-100'
            )}
          />
          <span
            aria-hidden
            className={cn(
              'absolute left-0 top-0 flex size-12 items-center justify-center rounded-full bg-white text-[#0B0F17] transition-[opacity,transform] duration-300',
              expanded ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
            )}
          >
            <ODXMark className="h-[22px] w-auto" />
          </span>
        </Link>

        <nav className="hidden items-center md:flex" onMouseLeave={() => setHover(null)}>
          {NAV.map(item => (
            <a
              key={item.label}
              href={item.href}
              target={item.external ? '_blank' : undefined}
              rel={item.external ? 'noopener noreferrer' : undefined}
              onMouseEnter={() => setHover(item.label)}
              onFocus={() => setHover(item.label)}
              onBlur={() => setHover(null)}
              className={cn(
                'relative px-4 py-2 text-[15px] font-medium transition-colors duration-200',
                hover === item.label ? 'text-white' : 'text-white/80'
              )}
            >
              {/* One highlight pill shared by all links: it glides to whichever is hovered. */}
              {hover === item.label && (
                <motion.span
                  layoutId="nav-hover"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 40 }}
                  className="absolute inset-0 rounded-full bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,.12)]"
                />
              )}
              <span className="relative">{item.label}</span>
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LaunchGate
            variant="light"
            className={cn(
              'hidden transition-[border-radius,height,padding] duration-300 sm:inline-flex',
              expanded && 'h-12 rounded-full px-6'
            )}
          />
          <button
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(o => !o)}
            className="flex size-10 items-center justify-center rounded-md md:hidden"
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Phone menu: a sheet under the pill, the page dimmed behind it. */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="menu"
            className="fixed inset-0 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
              className="absolute inset-0 bg-[#0B0F17]/60 backdrop-blur-sm"
            />
            <motion.div
              role="dialog"
              aria-label="Menu"
              className="absolute inset-x-3 top-[84px] rounded-2xl bg-[#0B0F17] px-5 pb-5 pt-2 text-white shadow-[0_30px_80px_-20px_rgba(0,0,0,.7),inset_0_1px_0_rgba(255,255,255,.08)]"
              initial={reduce ? false : { y: -12, scale: 0.98, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={reduce ? undefined : { y: -8, scale: 0.98, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 420, damping: 36 }}
            >
              <nav className="flex flex-col">
                {NAV.map((item, i) => (
                  <motion.a
                    key={item.label}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    target={item.external ? '_blank' : undefined}
                    rel={item.external ? 'noopener noreferrer' : undefined}
                    className="flex items-center gap-4 border-b border-white/10 py-4 text-[22px] font-medium tracking-[-0.01em] active:text-white/70"
                    initial={reduce ? false : { opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.04, duration: 0.25 }}
                  >
                    <span className="w-6 font-mono text-[11px] text-[#63A0F8] tabular-nums">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {item.label}
                    {item.external && <ArrowUpRight className="ml-auto size-4 text-white/40" />}
                  </motion.a>
                ))}
              </nav>
              <LaunchGate variant="light" className="mt-5 h-12 w-full rounded-full text-base" size="lg" />
              <p className="mt-4 text-center font-mono text-[11px] uppercase tracking-[0.14em] text-white/40">
                Real assets, backed onchain
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
