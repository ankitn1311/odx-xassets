'use client';
import { useState } from 'react';
import { useAccount, useDisconnect, useSwitchChain } from 'wagmi';
import { useCopyToClipboard } from 'usehooks-ts';
import { toast } from 'sonner';
import { Copy, ExternalLink, Power } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import ConnectWallet from '@/components/common/connect-wallet';
import { DemoAlert } from '@/components/common/demo-alert';
import { TermsDialog } from '@/components/common/terms-dialog';
import { StagingSettings } from '@/components/ui/base-url-settings';
import { useAppStore } from '@/stores/app-store';
import { shortenAddress } from '@/utils/crypto';
import { NETWORKS } from '@/config/placeholders';
import { cn } from '@/lib/utils';

const isStaging = process.env.NEXT_PUBLIC_ENV === 'staging';
const SUPPORT = [
  { label: 'Docs', href: 'https://docs.odx.so' },
  { label: 'Discord', href: 'https://discord.gg/9r7sU8H23H' },
  { label: 'X', href: 'https://x.com/ODXLabs' },
  { label: 'Telegram', href: 'https://t.me/odxlabs' },
];

export default function SettingsPage() {
  const { address, chainId, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: switching } = useSwitchChain();
  const [, copy] = useCopyToClipboard();
  const { slippage, setSlippage, hideTestAssets, setHideTestAssets, hasAcceptedTerms } = useAppStore();
  const [slippageDraft, setSlippageDraft] = useState(String(slippage));
  const [termsOpen, setTermsOpen] = useState(false);

  const saveSlippage = () => {
    const v = parseFloat(slippageDraft);
    if (isNaN(v) || v < 0.1 || v > 2) return toast.error('Slippage must be between 0.1% and 2%');
    setSlippage(v);
    toast.success(`Slippage set to ${v}%`);
  };

  return (
    <div className="flex h-full w-full max-w-3xl flex-col items-stretch gap-4 px-4 py-4 pb-[4.5rem] md:py-8 md:pb-8">
      <section className="flex flex-col gap-1 px-1 pt-2">
        <h1 className="text-2xl font-medium tracking-[-0.02em]">Settings</h1>
        <p className="text-sm text-muted-foreground">Wallet, network, trading preferences, legal and support.</p>
      </section>

      {/* Wallet */}
      <Section title="Wallet">
        {isConnected && address ? (
          <Row label="Connected address">
            <span className="flex items-center gap-2">
              <span className="font-mono text-sm">{shortenAddress(address)}</span>
              <button type="button" aria-label="Copy address" onClick={() => { copy(address); toast.success('Address copied'); }} className="text-muted-foreground hover:text-foreground">
                <Copy className="h-3.5 w-3.5" />
              </button>
              <a href={`https://sonicscan.org/address/${address}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground" aria-label="View on Sonicscan">
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <Button variant="outline" size="sm" onClick={() => disconnect()} className="ml-2">
                <span className="flex items-center gap-1.5">
                  <Power className="h-3.5 w-3.5" /> Disconnect
                </span>
              </Button>
            </span>
          </Row>
        ) : (
          <Row label="No wallet connected"><ConnectWallet /></Row>
        )}
        <Row label="Terms of Service">
          <span className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">{hasAcceptedTerms(address) ? 'Accepted for this wallet' : 'Not accepted yet'}</span>
            <Button variant="secondary" size="sm" onClick={() => setTermsOpen(true)}>View terms</Button>
          </span>
        </Row>
      </Section>

      {/* Network */}
      <Section title="Network">
        <div className="flex flex-col gap-2 py-4">
          {NETWORKS.map(n => {
            const active = n.live && chainId === n.id;
            return (
              <div key={n.name} className={cn('flex items-center justify-between rounded-xl px-4 py-3', active ? 'bg-secondary' : 'border border-border')}>
                <span className="flex items-center gap-2 text-sm font-medium">
                  <span className={cn('h-2 w-2 rounded-full', active ? 'bg-success' : n.live ? 'bg-muted-foreground/40' : 'bg-border')} />
                  {n.name}
                  {!n.live && (
                    <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-normal text-muted-foreground">
                      Coming soon <DemoAlert className="h-3 w-3" note="Whitechain is not deployed yet" />
                    </span>
                  )}
                </span>
                {n.live && !active && isConnected && (
                  <Button variant="secondary" size="sm" disabled={switching} onClick={() => switchChain({ chainId: n.id })}>
                    {switching ? 'Switching…' : 'Switch'}
                  </Button>
                )}
                {active && <span className="text-xs text-muted-foreground">Connected</span>}
                {!n.live && <span className="text-xs text-muted-foreground">Not available</span>}
              </div>
            );
          })}
        </div>
      </Section>

      {/* Trading */}
      <Section title="Trading">
        <Row label="Slippage tolerance" hint="Orders revert if the price moves against you by more than this.">
          <span className="flex items-center gap-2">
            <Input value={slippageDraft} onChange={e => setSlippageDraft(e.target.value)} inputMode="decimal" className="h-9 w-20 text-right font-mono text-sm" aria-label="Slippage percent" />
            <span className="text-sm text-muted-foreground">%</span>
            <Button size="sm" variant="secondary" onClick={saveSlippage} disabled={slippageDraft === String(slippage)}>Save</Button>
          </span>
        </Row>
        <Row label="Hide test assets" hint="Hides assets flagged as test listings from Markets and Portfolio.">
          <Switch checked={hideTestAssets} onCheckedChange={setHideTestAssets} aria-label="Hide test assets" />
        </Row>
        {isStaging && (
          <Row label="Staging overrides" hint="API base URL, WebSocket URL and contract addresses.">
            <StagingSettings />
          </Row>
        )}
      </Section>

      {/* Legal and support */}
      <Section title="Legal and support">
        <Row label="Legal">
          <span className="flex gap-4 text-sm">
            <a href="https://docs.odx.so" target="_blank" rel="noopener noreferrer" className="hover:underline">Terms of Service ↗</a>
            <a href="https://docs.odx.so" target="_blank" rel="noopener noreferrer" className="hover:underline">Privacy Policy ↗</a>
          </span>
        </Row>
        <Row label="Support">
          <span className="flex flex-wrap gap-4 text-sm">
            {SUPPORT.map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="hover:underline">{s.label} ↗</a>
            ))}
          </span>
        </Row>
      </Section>

      <TermsDialog open={termsOpen} onOpenChange={setTermsOpen} readOnly />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <h2 className="border-b border-border px-5 py-4 text-base font-medium">{title}</h2>
      <div className="flex flex-col divide-y divide-border px-5">{children}</div>
    </Card>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
      <span className="flex flex-col">
        <span className="text-sm font-medium">{label}</span>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </span>
      {children}
    </div>
  );
}
