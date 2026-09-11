/**
 * Placeholder figures for what the backend doesn't provide yet. Everything here is
 * illustrative and should be replaced by API data as the endpoints land (see
 * docs/xassets-v1-plan.md, "Backend contract"). Keyed by contract symbol (x2XRP…).
 */

/** Portfolio change over longer periods, as fractions. No balance history exists yet. */
export const DEMO_PORTFOLIO_CHANGE = { '1W': -0.0148, '1M': 0.092 };

/** Fallback trading volume in USD when the profile feed has no entry for a token. */
export const DEMO_VOLUME_USD: Record<string, number> = {
  x2XRP: 104_580,
  x2SOL: 78_392,
  x2ETH: 56_047,
  x2ADA: 34_735,
  x2SUI: 31_688,
  x2BTC: 92_113,
  x2DOGE: 22_490,
  x2PEPE: 12_305,
};

/** Listing dates for the "recently listed" card; the token feed carries no dates. */
export const DEMO_LISTED_AT: Record<string, string> = {
  x2ETH: '2026-08-14',
  x2SUI: '2026-07-30',
  x2ADA: '2026-07-02',
  x2SOL: '2026-06-18',
  x2XRP: '2026-05-21',
  x2BTC: '2026-09-02',
  x2DOGE: '2026-09-05',
  x2PEPE: '2026-09-08',
};

/** Filter categories, by underlying asset. */
export const CATEGORY: Record<string, 'Layer 1' | 'Payments' | 'Meme'> = {
  x2XRP: 'Payments',
  x2SOL: 'Layer 1',
  x2ETH: 'Layer 1',
  x2ADA: 'Layer 1',
  x2SUI: 'Layer 1',
  x2BTC: 'Payments',
  x2DOGE: 'Meme',
  x2PEPE: 'Meme',
};
