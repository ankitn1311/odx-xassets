import ODXWordmark from '@/components/svg/odx-wordmark';

const COLUMNS = [
  { title: 'Use', links: [['Mint', '#products'], ['Earn', '#products'], ['Redeem', '#products'], ['Portfolio', '#products']] },
  { title: 'Trust', links: [['Reserves', '#reserves'], ['Status', '#reserves'], ['Activity', '#reserves']] },
  { title: 'Explore', links: [['Docs', 'https://docs.odx.so'], ['Medium', 'https://medium.com/@odx']] },
  {
    title: 'Community',
    links: [['X', 'https://x.com/ODXLabs'], ['Discord', 'https://discord.gg/9r7sU8H23H'], ['Telegram', 'https://t.me/odxlabs']],
  },
  { title: 'Legal', links: [['Terms of Service', '#'], ['Privacy Policy', '#']] },
];

export function LandingFooter() {
  return (
    <footer>
      <div className="mx-auto max-w-[1600px] px-5 pt-14 md:px-10">
        <div className="grid gap-10 sm:grid-cols-3 md:grid-cols-5">
          {COLUMNS.map(col => (
            <div key={col.title}>
              <h4 className="text-[15px] font-medium">{col.title}</h4>
              <ul className="mt-3 flex flex-col gap-2">
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    <a
                      href={href}
                      target={href.startsWith('http') ? '_blank' : undefined}
                      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="text-[15px] text-[var(--l-muted)] transition-colors hover:text-[var(--l-ink)]"
                    >
                      {label}
                      {href.startsWith('http') ? ' ↗' : ''}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-16 max-w-[760px] border-t border-[var(--l-line)] pt-6 text-xs leading-relaxed text-[var(--l-muted)]">
          xAssets are receipts for assets held in custody, not the underlying assets themselves.
          xCASH is priced at net asset value and may require identity verification where the
          series requires it. Nothing on this page is investment advice. Figures shown in product
          tiles are illustrative; live figures are inside the app and on the reserves page.
        </p>

        <div className="mt-16 flex flex-wrap items-end justify-between gap-8 md:mt-24">
          <ODXWordmark
            aria-label="ODX"
            className="h-[clamp(72px,11vw,170px)] w-auto text-[var(--l-ink)]"
          />
          <p className="max-w-[300px] pb-2 text-[15px] leading-snug text-[var(--l-muted)]">
            Real assets, backed onchain. Built on Sonic and Whitechain, custodied by Safeheron.
          </p>
        </div>
      </div>

      <div className="mt-8 border-t border-[var(--l-line)]">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-5 py-5 text-sm text-[var(--l-muted)] md:px-10">
          <div className="flex gap-6">
            <span className="text-[var(--l-ink)]">ODX © {new Date().getFullYear()}</span>
            <a href="#" className="hover:text-[var(--l-ink)]">Terms of Service</a>
            <a href="#" className="hover:text-[var(--l-ink)]">Privacy Policy</a>
          </div>
          <div className="flex gap-4">
            <a href="https://x.com/ODXLabs" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--l-ink)]">X</a>
            <a href="https://discord.gg/9r7sU8H23H" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--l-ink)]">Discord</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
