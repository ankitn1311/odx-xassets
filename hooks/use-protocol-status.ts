import { PROTOCOL_STATUS } from '@/config/placeholders';

export type StatusIssue = { key: string; label: string; detail: string };

/**
 * Protocol health for the banner and /status. Reads placeholders until the /status
 * endpoint exists; the shape is what the API is expected to return.
 */
export function useProtocolStatus() {
  const s = PROTOCOL_STATUS;
  const issues: StatusIssue[] = [];
  if (s.mintPaused) issues.push({ key: 'mint', label: 'Minting paused', detail: 'New mints are on hold. Redeems continue.' });
  if (s.redeemPaused) issues.push({ key: 'redeem', label: 'Redeems paused', detail: 'Redeems are on hold. Minting continues.' });
  if (s.oracleStale) issues.push({ key: 'oracle', label: 'Price feed stale', detail: 'Quotes may lag the market until the feed catches up.' });
  if (s.bufferLow) issues.push({ key: 'buffer', label: 'Instant buffer low', detail: 'Larger redeems will route to the queue.' });

  return {
    checks: [
      { key: 'mint', label: 'Minting', ok: !s.mintPaused },
      { key: 'redeem', label: 'Redeems', ok: !s.redeemPaused },
      { key: 'oracle', label: 'Price feed', ok: !s.oracleStale },
      { key: 'buffer', label: 'Instant buffer', ok: !s.bufferLow },
    ],
    issues,
    healthy: issues.length === 0,
    updatedAt: s.updatedAt,
    isPlaceholder: true,
  };
}
