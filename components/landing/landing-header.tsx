'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import ODXLogoDark from '@/components/svg/odx-logo-dark';
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
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-40 text-white">
      <div
        className={cn(
          'site-bar mx-auto flex w-full items-center justify-between',
          expanded
            ? 'mt-3 h-[58px] max-w-[calc(100%-24px)] rounded-xl bg-black px-3 shadow-[0_24px_60px_-24px_rgba(0,0,0,.6)] md:max-w-[792px] md:px-6'
            : 'mt-0 h-[88px] max-w-[1600px] rounded-none bg-transparent px-5 shadow-none md:px-10'
        )}
      >
        <Link href="/" aria-label="ODX home" className="flex items-center">
          <ODXLogoDark className="h-6 w-auto" />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map(item => (
            <a
              key={item.label}
              href={item.href}
              target={item.external ? '_blank' : undefined}
              rel={item.external ? 'noopener noreferrer' : undefined}
              className="rounded-full px-4 py-2 text-[15px] font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LaunchGate variant="light" className="hidden sm:inline-flex" />
          <button
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(o => !o)}
            className="flex size-10 items-center justify-center rounded-full md:hidden"
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="mx-3 mt-2 rounded-xl bg-black px-5 pb-6 pt-2 text-white md:hidden">
          <nav className="flex flex-col">
            {NAV.map(item => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noopener noreferrer' : undefined}
                className="border-b border-white/10 py-4 text-lg font-medium last:border-b-0"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <LaunchGate variant="light" className="mt-4 w-full" size="lg" />
        </div>
      )}
    </header>
  );
}
