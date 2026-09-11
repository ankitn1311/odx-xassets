'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import ODXLogoDark from '@/components/svg/odx-logo-dark';
import ODXLogoLight from '@/components/svg/odx-logo-light';
import { LaunchGate } from './launch-gate';
import { useLandingExpanded } from './landing-ground';
import { cn } from '@/lib/utils';

const NAV = [
  { label: 'Products', href: '#products' },
  { label: 'Reserves', href: '#reserves' },
  { label: 'Principles', href: '#principles' },
  { label: 'Docs', href: 'https://docs.odx.so', external: true },
];

/** Which in-page section is currently on screen, by its id. */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const els = ids.map(id => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    if (!els.length) return;
    // Track which sections cross the band around the middle of the viewport; the
    // first one in page order wins, and none at all (the hero) clears the highlight.
    const visible = new Set<string>();
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(e =>
          e.isIntersecting ? visible.add(e.target.id) : visible.delete(e.target.id)
        );
        setActive(ids.find(id => visible.has(id)) ?? null);
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: 0 }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [ids]);
  return active;
}

const SECTION_IDS = NAV.filter(n => !n.external).map(n => n.href.slice(1));

/**
 * Plain header: wordmark left, Launch App right, the links grouped in one box in the
 * middle. Over the hero everything is white and the box is just an outline. Once the
 * page is scrolled the bar gets a light blurred ground, the wordmark turns ink, the
 * button turns blue and the box fills solid ink. The section on screen reads in blue.
 */
export function LandingHeader() {
  const expanded = useLandingExpanded();
  const reduce = useReducedMotion();
  const active = useActiveSection(SECTION_IDS);
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

  return (
    <header
      className={cn('fixed inset-x-0 top-0 z-40', expanded ? 'text-[var(--l-ink)]' : 'text-white')}
    >
      <div className={cn('site-bar relative z-10 w-full', expanded && 'site-bar--scrolled')}>
        <div
          className={cn(
            'mx-auto flex w-full max-w-[1600px] items-center justify-between px-5 md:px-10',
            expanded ? 'h-[64px]' : 'h-[88px]'
          )}
        >
          <Link href="/" aria-label="ODX home" className="relative flex h-10 items-center">
            <ODXLogoDark
              className={cn(
                'h-6 w-auto transition-opacity duration-300',
                expanded ? 'pointer-events-none opacity-0' : 'opacity-100'
              )}
            />
            <ODXLogoLight
              className={cn(
                'absolute left-0 top-1/2 h-6 w-auto -translate-y-1/2 transition-opacity duration-300',
                expanded ? 'opacity-100' : 'pointer-events-none opacity-0'
              )}
            />
          </Link>

          {/* The nav box: invisible over the hero, solid ink once scrolled. */}
          <nav
            className={cn(
              'nav-box absolute left-1/2 hidden h-11 -translate-x-1/2 items-center rounded-lg p-1 md:flex',
              expanded && 'nav-box--solid'
            )}
          >
            {NAV.map(item => {
              const on = !item.external && active === item.href.slice(1);
              return (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.external ? '_blank' : undefined}
                  rel={item.external ? 'noopener noreferrer' : undefined}
                  className={cn(
                    'relative flex h-full items-center gap-1 rounded-md px-4 text-[14px] font-medium text-white transition-colors duration-200',
                    on ? 'text-[var(--l-sky)]' : 'text-white/75 hover:text-white'
                  )}
                >
                  {on && (
                    <motion.span
                      layoutId="nav-active"
                      aria-hidden
                      className="absolute inset-0 rounded-md bg-white/[0.07]"
                      transition={
                        reduce ? { duration: 0 } : { type: 'spring', stiffness: 450, damping: 40 }
                      }
                    />
                  )}
                  <span className="relative">{item.label}</span>
                  {item.external && <ArrowUpRight className="relative size-3.5 opacity-50" />}
                </a>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <LaunchGate
              variant={expanded ? 'solid' : 'light'}
              className="hidden h-10 rounded-md px-4 sm:inline-flex"
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
      </div>

      {/* Phone menu: an ink panel under the bar, the page dimmed behind it. */}
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
              className={cn(
                'absolute inset-x-4 rounded-lg bg-[#0B0F17] px-5 pb-5 pt-2 text-white shadow-[0_30px_80px_-20px_rgba(0,0,0,.7)]',
                expanded ? 'top-[76px]' : 'top-[100px]'
              )}
              initial={reduce ? false : { y: -12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduce ? undefined : { y: -8, opacity: 0 }}
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
                    className="flex items-center border-b border-white/10 py-4 text-[22px] font-medium tracking-[-0.01em] active:text-white/70"
                    initial={reduce ? false : { opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.04, duration: 0.25 }}
                  >
                    {item.label}
                    {item.external && <ArrowUpRight className="ml-auto size-4 text-white/40" />}
                  </motion.a>
                ))}
              </nav>
              <LaunchGate
                variant="solid"
                className="mt-5 h-12 w-full rounded-md text-base"
                size="lg"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ---------------------------------------------------------------------------------
 * Variant A (kept for reference): full-width transparent bar over the hero that settles
 * into a light blurred bar with a hairline rule, mono numbered nav with a gliding blue
 * square. Uncomment this block (and `.site-bar--drawn` in globals.css) to restore it.
 * ------------------------------------------------------------------------------- */
// 'use client';
// import Link from 'next/link';
// import { useEffect, useState } from 'react';
// import { ArrowUpRight, Menu, X } from 'lucide-react';
// import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
// import ODXLogoDark from '@/components/svg/odx-logo-dark';
// import ODXLogoLight from '@/components/svg/odx-logo-light';
// import { LaunchGate } from './launch-gate';
// import { useLandingExpanded } from './landing-ground';
// import { cn } from '@/lib/utils';
//
// const NAV = [
//   { label: 'Products', href: '#products' },
//   { label: 'Reserves', href: '#reserves' },
//   { label: 'Principles', href: '#principles' },
//   { label: 'Docs', href: 'https://docs.odx.so', external: true },
// ];
//
// /**
//  * Blueprint header. Over the hero it is a full-width transparent bar in white ink.
//  * Once the page is scrolled it settles into a drawn bar: a light, blurred ground with a
//  * hairline rule underneath, the wordmark swapped for its ink version, the button turned
//  * blue. No pill: the shape never changes, only the ink and the rule.
//  */
// export function LandingHeader() {
//   const expanded = useLandingExpanded();
//   const reduce = useReducedMotion();
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [hover, setHover] = useState<string | null>(null);
//
//   // While the sheet is open the page behind it stays put, and Escape closes it.
//   useEffect(() => {
//     if (!menuOpen) return;
//     const prev = document.body.style.overflow;
//     document.body.style.overflow = 'hidden';
//     const onKey = (e: KeyboardEvent) => {
//       if (e.key === 'Escape') setMenuOpen(false);
//     };
//     window.addEventListener('keydown', onKey);
//     return () => {
//       document.body.style.overflow = prev;
//       window.removeEventListener('keydown', onKey);
//     };
//   }, [menuOpen]);
//
//   return (
//     <header
//       className={cn(
//         'fixed inset-x-0 top-0 z-40',
//         expanded ? 'text-[var(--l-ink)]' : 'text-white'
//       )}
//     >
//       <div className={cn('site-bar relative z-10 w-full', expanded && 'site-bar--drawn')}>
//         <div
//           className={cn(
//             'mx-auto flex w-full max-w-[1600px] items-center justify-between px-5 md:px-10',
//             expanded ? 'h-[64px]' : 'h-[88px]'
//           )}
//         >
//           <Link href="/" aria-label="ODX home" className="relative flex h-10 items-center">
//             {/* White wordmark over the hero, ink wordmark on the light ground. */}
//             <ODXLogoDark
//               className={cn(
//                 'h-6 w-auto transition-opacity duration-300',
//                 expanded ? 'pointer-events-none opacity-0' : 'opacity-100'
//               )}
//             />
//             <ODXLogoLight
//               className={cn(
//                 'absolute left-0 top-1/2 h-6 w-auto -translate-y-1/2 transition-opacity duration-300',
//                 expanded ? 'opacity-100' : 'pointer-events-none opacity-0'
//               )}
//             />
//           </Link>
//
//           {/* Mono index labels; one blue square glides to the hovered item. */}
//           <nav
//             className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex"
//             onMouseLeave={() => setHover(null)}
//           >
//             {NAV.map((item, i) => {
//               const on = hover === item.label;
//               return (
//                 <a
//                   key={item.label}
//                   href={item.href}
//                   target={item.external ? '_blank' : undefined}
//                   rel={item.external ? 'noopener noreferrer' : undefined}
//                   onMouseEnter={() => setHover(item.label)}
//                   onFocus={() => setHover(item.label)}
//                   onBlur={() => setHover(null)}
//                   className={cn(
//                     'relative flex h-9 items-center gap-2 rounded px-3 font-mono text-[12px] uppercase tracking-[0.14em] transition-colors duration-200',
//                     on ? 'opacity-100' : 'opacity-70 hover:opacity-100'
//                   )}
//                 >
//                   <span className="relative flex size-2 items-center justify-center">
//                     <span
//                       aria-hidden
//                       className={cn(
//                         'absolute inset-0 border transition-colors duration-200',
//                         expanded ? 'border-[rgba(11,15,23,.3)]' : 'border-white/30'
//                       )}
//                     />
//                     {on && (
//                       <motion.span
//                         layoutId="nav-marker"
//                         aria-hidden
//                         className="absolute inset-0 bg-[var(--l-sky)]"
//                         transition={
//                           reduce ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 40 }
//                         }
//                       />
//                     )}
//                   </span>
//                   <span className="tabular-nums">{String(i + 1).padStart(2, '0')}</span>
//                   <span>{item.label}</span>
//                   {item.external && <ArrowUpRight className="-ml-1 size-3 opacity-60" />}
//                 </a>
//               );
//             })}
//           </nav>
//
//           <div className="flex items-center gap-2">
//             <LaunchGate
//               variant={expanded ? 'solid' : 'light'}
//               className="hidden h-10 rounded-md px-4 sm:inline-flex"
//             />
//             <button
//               type="button"
//               aria-label={menuOpen ? 'Close menu' : 'Open menu'}
//               aria-expanded={menuOpen}
//               onClick={() => setMenuOpen(o => !o)}
//               className={cn(
//                 'flex size-10 items-center justify-center rounded-md border transition-colors md:hidden',
//                 expanded ? 'border-[var(--l-line)]' : 'border-white/20'
//               )}
//             >
//               {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
//             </button>
//           </div>
//         </div>
//       </div>
//
//       {/* Phone menu: a drawn ink panel under the bar, the page dimmed behind it. */}
//       <AnimatePresence>
//         {menuOpen && (
//           <motion.div
//             key="menu"
//             className="fixed inset-0 md:hidden"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             transition={{ duration: 0.2 }}
//           >
//             <button
//               type="button"
//               aria-label="Close menu"
//               onClick={() => setMenuOpen(false)}
//               className="absolute inset-0 bg-[#0B0F17]/60 backdrop-blur-sm"
//             />
//             <motion.div
//               role="dialog"
//               aria-label="Menu"
//               className={cn(
//                 'blueprint-grid-dark absolute inset-x-4 rounded-lg border border-white/10 bg-[#0B0F17] px-5 pb-5 pt-2 text-white shadow-[0_30px_80px_-20px_rgba(0,0,0,.7)]',
//                 expanded ? 'top-[76px]' : 'top-[100px]'
//               )}
//               initial={reduce ? false : { y: -12, opacity: 0 }}
//               animate={{ y: 0, opacity: 1 }}
//               exit={reduce ? undefined : { y: -8, opacity: 0 }}
//               transition={{ type: 'spring', stiffness: 420, damping: 36 }}
//             >
//               <nav className="flex flex-col">
//                 {NAV.map((item, i) => (
//                   <motion.a
//                     key={item.label}
//                     href={item.href}
//                     onClick={() => setMenuOpen(false)}
//                     target={item.external ? '_blank' : undefined}
//                     rel={item.external ? 'noopener noreferrer' : undefined}
//                     className="flex items-center gap-4 border-b border-white/10 py-4 text-[22px] font-medium tracking-[-0.01em] active:text-white/70"
//                     initial={reduce ? false : { opacity: 0, x: -8 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     transition={{ delay: 0.05 + i * 0.04, duration: 0.25 }}
//                   >
//                     <span className="flex w-8 items-center gap-2 font-mono text-[11px] text-[var(--l-sky)] tabular-nums">
//                       <span aria-hidden className="size-1.5 bg-[var(--l-sky)]" />
//                       {String(i + 1).padStart(2, '0')}
//                     </span>
//                     {item.label}
//                     {item.external && <ArrowUpRight className="ml-auto size-4 text-white/40" />}
//                   </motion.a>
//                 ))}
//               </nav>
//               <LaunchGate variant="solid" className="mt-5 h-12 w-full rounded-md text-base" size="lg" />
//               <p className="mt-4 text-center font-mono text-[11px] uppercase tracking-[0.14em] text-white/40">
//                 Real assets, backed onchain
//               </p>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </header>
//   );
// }
