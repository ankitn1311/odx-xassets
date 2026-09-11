import { cn } from '@/lib/utils';

/** The logo's blue square, used as a marker before eyebrows and titles. */
export function Marker({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn('inline-block h-2 w-2 shrink-0 bg-[#63A0F8]', className)} />;
}

/**
 * Drawn diagram of the mint flow on a dark blueprint grid: USDC.e in, the custody
 * square in the middle, the xAsset out, with the 1:1 relation marked. Stands in for
 * hero photography.
 */
export function MintDiagram({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 800 800"
      preserveAspectRatio="xMidYMid slice"
      className={cn('h-full w-full', className)}
      aria-hidden="true"
    >
      <defs>
        <pattern id="bp-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0V40" fill="none" stroke="#ffffff" strokeOpacity="0.04" />
        </pattern>
        <marker id="bp-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10z" fill="#63A0F8" />
        </marker>
      </defs>
      <rect width="800" height="800" fill="#0B0F17" />
      <rect width="800" height="800" fill="url(#bp-grid)" />

      {/* The flow sits above the headline band and the held box below it, so the centre
          stays clear while the diagram is full-bleed (visible y is roughly 200..600). */}
      {/* Custody: the square */}
      <rect x="350" y="250" width="100" height="100" fill="none" stroke="#63A0F8" strokeWidth="2" />
      <rect x="362" y="262" width="76" height="76" fill="#63A0F8" fillOpacity="0.08" />
      <rect x="440" y="240" width="12" height="12" fill="#63A0F8" />
      <text x="400" y="296" textAnchor="middle" fill="#E6EBF5" fontFamily="ui-monospace, monospace" fontSize="11" letterSpacing="2">CUSTODY</text>
      <text x="400" y="318" textAnchor="middle" fill="#63A0F8" fontFamily="ui-monospace, monospace" fontSize="17">1 : 1</text>

      {/* In: USDC.e */}
      <circle cx="170" cy="300" r="36" fill="none" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="1.5" />
      <text x="170" y="305" textAnchor="middle" fill="#E6EBF5" fontFamily="ui-monospace, monospace" fontSize="11">USDC.e</text>
      <line x1="212" y1="300" x2="342" y2="300" stroke="#63A0F8" strokeWidth="1.5" markerEnd="url(#bp-arrow)" strokeDasharray="6 6" />
      <text x="277" y="288" textAnchor="middle" fill="#9AA3B2" fontFamily="ui-monospace, monospace" fontSize="10">MINT</text>

      {/* Out: xXRP */}
      <circle cx="630" cy="300" r="36" fill="none" stroke="#63A0F8" strokeWidth="1.5" />
      <text x="630" y="305" textAnchor="middle" fill="#E6EBF5" fontFamily="ui-monospace, monospace" fontSize="11">xXRP</text>
      <line x1="458" y1="300" x2="586" y2="300" stroke="#63A0F8" strokeWidth="1.5" markerEnd="url(#bp-arrow)" />
      <line x1="586" y1="326" x2="458" y2="326" stroke="#9AA3B2" strokeWidth="1" markerEnd="url(#bp-arrow)" strokeDasharray="3 5" />
      <text x="522" y="346" textAnchor="middle" fill="#9AA3B2" fontFamily="ui-monospace, monospace" fontSize="10">REDEEM</text>

      {/* Underlying held: XRP below the square, tied to it by a hairline that runs behind the headline */}
      <line x1="400" y1="350" x2="400" y2="470" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="1" strokeDasharray="2 6" />
      <rect x="346" y="470" width="108" height="40" fill="none" stroke="#ffffff" strokeOpacity="0.5" />
      <text x="400" y="495" textAnchor="middle" fill="#E6EBF5" fontFamily="ui-monospace, monospace" fontSize="11">XRP · held</text>

      {/* Coordinates, like a drawing */}
      <text x="24" y="776" fill="#9AA3B2" fillOpacity="0.7" fontFamily="ui-monospace, monospace" fontSize="11">ODX · MINT/REDEEM · SONIC</text>
      <text x="776" y="776" textAnchor="end" fill="#9AA3B2" fillOpacity="0.7" fontFamily="ui-monospace, monospace" fontSize="11">REV 1.0</text>
    </svg>
  );
}

/**
 * The hero at rest: near-black sheet, faint grid, and the logo's square motif drawn
 * large and quiet behind the headline. Nothing to read, nothing competing with the text.
 */
export function HeroSheet() {
  return (
    <div className="blueprint-grid-dark absolute inset-0 bg-[#0B0F17]">
      <svg
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        {/* One large outlined square, centred, with the solid corner mark from the logo. */}
        <rect x="560" y="210" width="480" height="480" fill="none" stroke="#63A0F8" strokeOpacity="0.28" strokeWidth="1.5" />
        <rect x="1024" y="194" width="32" height="32" fill="#63A0F8" fillOpacity="0.9" />
        {/* Registration marks in the corners of the sheet. */}
        <path d="M60 100V60h40M1540 100V60h-40M60 800v40h40M1540 800v40h-40" fill="none" stroke="#ffffff" strokeOpacity="0.35" />
      </svg>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0B0F17]/70" />
    </div>
  );
}

/** Small diagram tiles for cards: a glyph on the blueprint grid. */
export function DiagramTile({ kind, className }: { kind: 'mint' | 'reserves' | 'redeem'; className?: string }) {
  return (
    <svg viewBox="0 0 400 260" className={cn('h-full w-full', className)} aria-hidden="true">
      <defs>
        <pattern id={`tile-grid-${kind}`} width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0V40" fill="none" stroke="#ffffff" strokeOpacity="0.05" />
        </pattern>
      </defs>
      <rect width="400" height="260" fill="#111828" />
      <rect width="400" height="260" fill={`url(#tile-grid-${kind})`} />
      {kind === 'mint' && (
        <>
          <circle cx="90" cy="130" r="30" fill="none" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="1.5" />
          <line x1="128" y1="130" x2="230" y2="130" stroke="#63A0F8" strokeWidth="1.5" strokeDasharray="6 6" />
          <rect x="240" y="90" width="80" height="80" fill="none" stroke="#63A0F8" strokeWidth="2" />
          <rect x="312" y="82" width="12" height="12" fill="#63A0F8" />
        </>
      )}
      {kind === 'reserves' && (
        <>
          {[0, 1, 2, 3].map(i => (
            <g key={i}>
              <rect x={70 + i * 70} y={190 - (60 + i * 20)} width="24" height={60 + i * 20} fill="#63A0F8" fillOpacity="0.9" />
              <rect x={98 + i * 70} y={190 - (60 + i * 20)} width="24" height={60 + i * 20} fill="none" stroke="#ffffff" strokeOpacity="0.6" />
            </g>
          ))}
          <line x1="60" y1="190" x2="350" y2="190" stroke="#ffffff" strokeOpacity="0.4" />
        </>
      )}
      {kind === 'redeem' && (
        <>
          <rect x="70" y="90" width="80" height="80" fill="none" stroke="#63A0F8" strokeWidth="2" />
          <line x1="160" y1="130" x2="262" y2="130" stroke="#63A0F8" strokeWidth="1.5" />
          <path d="M254 122l10 8-10 8" fill="none" stroke="#63A0F8" strokeWidth="1.5" />
          <circle cx="310" cy="130" r="30" fill="none" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="1.5" />
          <path d="M100 210h140" stroke="#9AA3B2" strokeWidth="1" strokeDasharray="3 5" />
        </>
      )}
    </svg>
  );
}
