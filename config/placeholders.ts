/**
 * Illustrative values for pages whose backend endpoints don't exist yet (redeem queue,
 * vaults, protocol status). Every use carries a DemoAlert icon. Replace as the API lands;
 * see docs/xassets-v1-plan.md, "Backend contract".
 */

/** Instant-redeem buffer per asset, in USD. Above this, a redeem goes to the queue. */
export const REDEEM_BUFFER_USD: Record<string, number> = {
  x2XRP: 2_500,
  x2SOL: 2_500,
  x2ETH: 5_000,
  x2ADA: 1_000,
  x2SUI: 1_000,
  x2BTC: 10_000,
  x2DOGE: 500,
  x2PEPE: 250,
};

/** Redeem pricing, in basis points. */
export const REDEEM_FEE_BPS = 10;
export const REDEEM_HAIRCUT_BPS = 0;

/** What a queued redeem would look like. */
export const QUEUE_ESTIMATE = { position: 3, eta: 'T+1' };

export type PendingItem = {
  id: string;
  kind: 'mint' | 'redeem';
  symbol: string;
  amount: number;
  usd: number;
  status: 'queued' | 'claimable' | 'processing';
  position?: number;
  eta?: string;
  createdAt: string;
};

/** Pending mints / redeems shown on Redeem and Portfolio until the queue endpoint exists. */
export const PENDING_ITEMS: PendingItem[] = [
  {
    id: 'q-1',
    kind: 'redeem',
    symbol: 'x2XRP',
    amount: 1_800,
    usd: 2_430,
    status: 'queued',
    position: 3,
    eta: 'T+1',
    createdAt: '2026-09-10T14:20:00Z',
  },
];

/** xCASH figures until the vault endpoint exists. NAV comes from the product spec. */
export const XCASH = { nav: 1.012, apy30d: 0.0412, shares: 0 };

/** Protocol status flags until /status exists. */
export const PROTOCOL_STATUS = {
  mintPaused: false,
  redeemPaused: false,
  oracleStale: false,
  bufferLow: false,
  updatedAt: '2026-09-11T00:00:00Z',
};

/** Networks offered in Settings. Only Sonic is live today. */
export const NETWORKS = [
  { id: 146, name: 'Sonic', live: true },
  { id: 0, name: 'Whitechain', live: false },
];

/** Symbols treated as test assets by the "hide test assets" setting. */
export const TEST_ASSETS = new Set<string>([]);
