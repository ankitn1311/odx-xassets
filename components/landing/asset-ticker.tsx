import Image from 'next/image';
import { cn } from '@/lib/utils';

// Icons live in /public/images/tokens as the x2* contract names; the product ticker is x*.
const ASSETS = [
  { icon: 'x2XRP', symbol: 'xXRP' },
  { icon: 'x2BTC', symbol: 'xBTC' },
  { icon: 'x2DOGE', symbol: 'xDOGE' },
  { icon: 'x2SOL', symbol: 'xSOL' },
  { icon: 'x2ETH', symbol: 'xETH' },
  { icon: 'x2ADA', symbol: 'xADA' },
  { icon: 'x2SUI', symbol: 'xSUI' },
  { icon: 'x2PEPE', symbol: 'xPEPE' },
];

/**
 * Infinite marquee of mintable assets, shown as plain wordmarks like a partner logo row.
 * The list is rendered three times and the track slides by a third of its width, so
 * the loop is seamless.
 */
export function AssetTicker({ tone = 'light', slow = false }: { tone?: 'dark' | 'light'; slow?: boolean }) {
  const dark = tone === 'dark';
  return (
    <div
      className="overflow-hidden"
      style={{
        maskImage: 'linear-gradient(to right, transparent, black 12%, black 88%, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 12%, black 88%, transparent)',
      }}
    >
      <div className={cn('flex w-max', slow ? 'animate-ticker-slow' : 'animate-ticker')}>
        {[0, 1, 2].map(copy => (
          <ul key={copy} aria-hidden={copy > 0} className="flex shrink-0 items-center">
            {ASSETS.map(a => (
              <li
                key={a.symbol}
                className={cn(
                  'mx-9 flex items-center gap-3 md:mx-14',
                  dark ? 'text-white' : 'text-[var(--l-ink)]'
                )}
              >
                <Image
                  src={`/images/tokens/${a.icon}.png`}
                  alt=""
                  width={32}
                  height={32}
                  className="size-7 md:size-8"
                />
                <span className="text-lg font-semibold tracking-[-0.01em] md:text-[22px]">{a.symbol}</span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
