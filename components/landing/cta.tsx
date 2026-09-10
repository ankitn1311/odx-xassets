import Image from 'next/image';
import { LaunchGate } from './launch-gate';
import { Words, Reveal } from './reveal';

const BIG = ['xXRP', 'xBTC', 'xDOGE', 'xSOL', 'xETH', 'xADA', 'xSUI', 'xPEPE'];
const ICON: Record<string, string> = {
  xXRP: 'x2XRP', xBTC: 'x2BTC', xDOGE: 'x2DOGE', xSOL: 'x2SOL', xETH: 'x2ETH', xADA: 'x2ADA', xSUI: 'x2SUI', xPEPE: 'x2PEPE',
};

/** Black "rails" section with a large asset ticker lit at the centre, then an image CTA card. */
export function Cta() {
  return (
    <>
      <section className="bg-black py-24 text-white md:py-36">
        <div className="mx-auto max-w-[1600px] px-5 text-center md:px-10">
          <p className="text-sm text-white/60">Mint</p>
          <Words
            text="Mint XRP on this chain."
            muted="Redeem anytime."
            className="mx-auto mt-3 max-w-[720px] text-[36px] font-medium leading-[1.05] tracking-[-0.03em] md:text-[56px]"
          />
        </div>

        <div
          className="mt-16 overflow-hidden"
          style={{
            maskImage: 'linear-gradient(to right, transparent, rgba(0,0,0,.25) 30%, black 50%, rgba(0,0,0,.25) 70%, transparent)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, rgba(0,0,0,.25) 30%, black 50%, rgba(0,0,0,.25) 70%, transparent)',
          }}
        >
          <div className="flex w-max animate-ticker-slow">
            {[0, 1, 2].map(copy => (
              <ul key={copy} aria-hidden={copy > 0} className="flex shrink-0 items-center">
                {BIG.map(sym => (
                  <li key={sym} className="mx-10 flex items-center gap-5">
                    <Image src={`/images/tokens/${ICON[sym]}.png`} alt="" width={72} height={72} className="size-14 md:size-[72px]" />
                    <span className="text-[56px] font-medium leading-none tracking-[-0.03em] md:text-[88px]">{sym}</span>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>

        <Reveal className="mx-auto mt-14 flex max-w-[560px] flex-col items-center px-5 text-center">
          <p className="font-display text-lg leading-[1.45] text-white/70 md:text-[20px]">
            Start with USDC.e, pick an asset, and see the backing before you mint. If you pick
            xCASH you stay on the same screen.
          </p>
          <LaunchGate variant="light" size="lg" className="mt-8" />
        </Reveal>
      </section>

      <section className="mx-auto max-w-[1600px] px-5 py-16 md:px-10 md:py-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl">
            <Image
              src="https://picsum.photos/id/1078/1920/900"
              alt=""
              width={1920}
              height={900}
              sizes="100vw"
              className="h-[420px] w-full object-cover md:h-[520px]"
            />
            <div className="absolute inset-0 bg-black/45" />
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
              <h2 className="text-[32px] font-medium leading-[1.05] tracking-[-0.03em] md:text-[56px]">
                The future of backed assets
              </h2>
              <p className="mt-3 max-w-[560px] text-[22px] leading-[1.15] tracking-[-0.02em] text-white/70 md:text-[36px]">
                Mint, hold, earn and redeem, with the proof in public.
              </p>
              <LaunchGate variant="light" size="lg" className="mt-8" />
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
