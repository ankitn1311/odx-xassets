/** Money and percentage formatting shared by the market views. */

export const fmtUsd = (n: number, digits = 2) =>
  `$${n.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;

/** Prices get more decimals the smaller they are, so sub-dollar assets stay readable. */
export const fmtPrice = (n: number) => fmtUsd(n, n >= 100 ? 2 : n >= 1 ? 4 : 5);

export const fmtPct = (fraction: number) => `${(Math.abs(fraction) * 100).toFixed(2)}%`;

export const fmtCompactUsd = (n: number) =>
  `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

/** "just now", "4 min ago", "2 h ago", "3 d ago" */
export const timeAgo = (ts: number) => {
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} h ago`;
  return `${Math.floor(h / 24)} d ago`;
};

/** Token units with up to 4 decimals and thousands separators. */
export const fmtUnits = (n: number) =>
  n.toLocaleString(undefined, { maximumFractionDigits: n >= 1000 ? 0 : 4 });

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
