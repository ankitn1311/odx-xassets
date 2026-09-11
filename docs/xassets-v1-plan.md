# xAssets v1 Build Plan

> Draft · 10 Sep 2026 · Next 14 · wagmi 2 · UniswapX V2 orders
> Live version: https://claude.ai/code/artifact/d8369d2a-885c-419f-80c0-1139f7e4f9fe

We are turning today's trading app (markets, one buy/sell card, reserves, explorer, leaderboard) into the 13-surface v1 product: **one Mint page for wraps and xCASH, a public Reserves page that ships with it, then Redeem, Portfolio and Earn.** The order-signing engine and the swap step machine carry over. Most other code is either legacy or hardcoded to Sonic, and several v1 surfaces need backend endpoints that don't exist yet.

**Data status legend** used below:

- `exists`: works today
- `fix`: exists, needs rework
- `new API`: backend work needed
- **S / M / L**: frontend effort

---

## Contents

- [Milestones](#milestones)
- [Decisions needed](#decisions-needed)
- [What exists today](#what-exists-today)
- [Architecture](#architecture)
- [Backend contract](#backend-contract)
- [M0: Foundation](#m0-foundation)
- [M1: Mint & trust](#m1-mint--trust)
- [M2: Exit & account](#m2-exit--account)
- [M3: Earn](#m3-earn)
- [Defects to fix along the way](#defects-to-fix-along-the-way)
- [Legacy redirects](#legacy-redirects)
- [Testing & release](#testing--release)

---

## Milestones

Your spec says to ship Reserves with Mint, so M1 is the first public release. Each milestone has a release gate that must be met before the next one starts shipping. Backend endpoints for M1 and M2 should be agreed during M0 so frontend and backend can build in parallel against a typed contract.

| Milestone | Scope | Size | Release gate |
|---|---|---|---|
| **M0 Foundation** | Chain + asset registry (M), extract order engine (M), new shell + nav (S), routing/middleware (S), delete legacy (S), API contract signed off | — | The current buy/sell flow still works on the new engine, and slippage is actually applied to orders. |
| **M1 Mint & trust** | Mint (L), Token picker (S), Reserves (M), Home (M), Asset (M), Connect & legal (M), Status banner (S) | first public release | Reserves shows attested custody, never supply copied into the custody column. |
| **M2 Exit & account** | Redeem (L), Portfolio (M), Activity (M), Settings (S) | — | Queued redeems are visible on Redeem, Portfolio and the Home banner, and all three read from the same source. |
| **M3 Earn** | Earn (S), Vault detail (M), xCASH `launched` flag on (S), Status page (S) | — | NAV, APY and allocation come from the vault endpoint, and the KYC gate is confirmed with counsel. |

The Mint page supports xCASH from M1: it is in the registry and handled as a fund-type asset. Because unlaunched assets are hidden, users won't see it until M3 flips its flag. The delayed swap via Cork, which the spec hides until *product* phase 4, is built behind a feature flag and is not scheduled in these milestones.

---

## Decisions needed

These can't be answered from the code. Each one blocks a specific page, and the first five block M1.

| # | Question | Why it matters | Blocks | Owner |
|---|---|---|---|---|
| D1 | **Where does custody data come from?** Custodian API or attestation file, update cadence, attestation link. | Today `/reserves` shows total supply in both the "minted" and "in reserve" columns and hardcodes the ratio to 100%. The trust page can't ship that way. | **Reserves · M1** | Backend / Ops |
| D2 | **Quote API shape.** We need units out, spread in bps, ETA (instant / T+0 / T+1), min and max size, and expiry. | Today the quote is calculated in the browser from the Crypto.com mark price, so there's no spread, ETA or size limit. | **Mint · M1** | Backend |
| D3 | **Ticker naming.** Is `xXRP` just a display name for the existing `x2XRP` contract, or a new deployment? xBTC, xDOGE and HYPE aren't in the token list yet. | Sets the asset registry, the deep-link keys and the icon files. | **All · M0** | Product / Contracts |
| D4 | **Whitechain in v1?** Chain ID, RPC, explorer, which contracts are deployed, and whether WhiteSwap pools are live. | The code only knows about Sonic (146 and testnet 57054). This decides whether we need a network switcher and a second address set. | Settings, Asset pools | Contracts |
| D5 | **Stablecoin inputs.** The USDT address on each chain, and whether USDC.e and USDT have the same quote and fill path. | The From field on Mint. | **Mint · M1** | Contracts |
| D6 | **How does Redeem work?** Instant means the filler buys back through the existing sell path. Is Queue a backend queue or an on-chain `burnXAsset`? How are "haircut" and "fee" defined? Can a queued item be cancelled? | The `burnXAsset` function in the contract ABI is never called today. Only the sell order exists. | Redeem · M2 | Product / Backend |
| D7 | **What is xCASH on-chain?** Is it an ERC-4626 vault or a token the filler mints? Is subscribing a UniswapX order or a direct deposit? Where do NAV, APY, AUM and allocation come from? | Decides whether Mint has one execution path or two. | Earn · M3 | Product / Contracts |
| D8 | **KYC and terms.** Which series need KYC, which vendor, and do we store terms acceptance per address (and on the backend)? | Spec: no KYC for trading xXRP in v1 if counsel agrees; fund shares may require it. | Connect · M1, xCASH · M3 | Legal |
| D9 | **Invite gate.** Does the invite cookie in middleware come off at M1? | It currently gates `/reserves`, which contradicts "public, no wallet required". | **Reserves · M1** | Product |

---

## What exists today

The only transaction path that really works is a UniswapX V2 Dutch order: the user signs a Permit2 message off-chain, the backend cosigns it, a filler executes it, and the app polls for status. Keep that engine and replace most of what surrounds it.

| Verdict | What | Where | Becomes |
|---|---|---|---|
| reuse | Order engine: build the Dutch order, cosign, sign Permit2, submit, poll status | `hooks/mutations/use-xasset-signature.tsx` | `lib/orders/*`, pure functions plus one hook |
| reuse | Step machine and the Initial/Review/Pending/Success/Failed screens | `stores/token-swap-store.ts`, `components/x-assets/*` | Mint and Redeem flows |
| reuse | Permit2 allowance check, `QuoteTimerContext`, `SlippageSettings` | `components/x-assets/` | Mint and Redeem |
| reuse | Wallet popover with balances, chain switch and disconnect | `components/portfolio.tsx`, `components/common/connect-wallet.tsx` | Starting point for the Portfolio page and the header wallet button |
| reuse | Price, ticker and candle hooks | `hooks/mutations/use-trade-quote.ts`, `hooks/queries/use-crypto-chart.ts` | Home, Asset (remove the random-data fallback) |
| reuse | Sortable table, `command.tsx` (cmdk), global dialog, banner, staging overrides | `app/(main)/x-assets/data-table.tsx`, `components/ui`, `app/app-banner.tsx` | Earn, Activity, picker, status banner, Settings |
| rewrite | Reserves table | `app/(main)/reserves/reservers-table.tsx` | Server-rendered, reads real custody data |
| rewrite | Balance reads (one ethers call per token) | `hooks/queries/use-token-balance.tsx` | `useBalances` via wagmi multicall |
| rewrite | Header nav, middleware, `/` (currently an unreachable shadcn demo) | `app/app-header.tsx`, `middleware.ts`, `app/page.tsx` | v1 shell |
| delete | Leaderboard, points, score popup, invite, faucet, OTP login, the Cosmos protobuf client, TON/Suiet/Polygon icons, `page2.tsx`, mock data, `AssetCard`, `UpgradeOverlay`, `utils/weekly-rank-36.ts` | many; see M0 | Also drop the unused packages `protobufjs`, `long`, `crypto-js`, `jose`, `pino-pretty` and `react-hot-toast` |
| keep aside | Tokens dashboard (internal) | `app/(main)/tokens-dashboard` | Out of scope, but its password is hardcoded in client code. Move it behind server auth. |

---

## Architecture

Every page reads from a single asset registry and a handful of shared hooks. Modals are not routes. Reserves and Status render on the server so they work without a wallet.

### Routes

```
app/
  (app)/layout.tsx        header · status banner · footer
  (app)/page.tsx          Home
  (app)/mint/page.tsx     ?to=xXRP&from=USDC
  (app)/redeem/page.tsx   ?asset=xXRP
  (app)/earn/page.tsx
  (app)/earn/[vault]/     xcash
  (app)/asset/[symbol]/   xXRP · 404 unknown
  (app)/portfolio/
  (app)/activity/
  (app)/settings/
  (public)/reserves/      RSC, revalidate 60s
  (public)/status/        RSC
  loading.tsx · error.tsx · not-found.tsx
```

### Shared modules

```
config/
  chains.ts     sonic 146, sonicTestnet 57054,
                whitechain (defineChain), explorerTx()
  assets.ts     symbol, display, kind: wrap|fund|stable,
                underlying, address[chain], decimals,
                launched, test, backing: custody|nav, icon
lib/orders/     build · cosign · sign · submit · poll
hooks/
  useBalances         multicall, all registry assets
  useQuote            new /quote, auto-refresh, expiry
  useSubmitOrder      wraps lib/orders + step machine
  useProtocolStatus   banner, Mint, Redeem, /status
  useRedeemQueue      Redeem, Portfolio, Home
  useVault(id)        Earn, Vault, Mint, Portfolio
  useReserves         Reserves, Asset PoR snippet
stores/
  picker-store · app-store (slippage, hideTest)
```

### Mint lifecycle

| Step | What happens | Status |
|---|---|---|
| 1. Pick | Choose From and To (picker). The deep link fills both. | `exists` |
| 2. Quote | Units out, spread, ETA, backing. Refreshes every 10s. | `new API` |
| 3. Approve | Permit2 allowance, once per stablecoin. | `exists` |
| 4. Sign | Dutch order with `minOut` set from slippage. | `fix` |
| 5. Submit | `/cosign` then `POST /`, which returns an execution ID. | `exists` |
| 6. Settle | Poll `/status/{id}`, refresh balances, write to Activity. | `exists` |

### Redeem routing (automatic, shown to the user)

| Condition | Route | Behaviour |
|---|---|---|
| amount ≤ instant buffer | **Instant** | Paid from the buffer. Receive USDC.e minus the fee. Same order path as today's sell. |
| amount > buffer | **Queue** | Show queue position and ETA. The item appears on Redeem, Portfolio and the Home banner until it's filled. |
| flag `cork_delayed_swap` | **Delayed swap (Cork)** | Built behind a flag and hidden until product phase 4. |

---

## Backend contract

Agree these shapes in M0. The frontend builds against typed fixtures in development only, and **production must never fall back to mock data** (two hooks do that today).

| Endpoint | Returns | Used by | Status |
|---|---|---|---|
| `GET /quote` | amountOut, spreadBps, eta, route, minSize/maxSize, fee, haircut, expiresAt. Takes from, to, amount, side. | Mint, Redeem | `new API` |
| `POST /cosign` · `POST /` · `GET /status/{id}` | Cosignature, execution ID, fill status | Mint, Redeem | `exists` |
| `GET /cdc/get-valuations` · `get-tickers` · `get-candlestick` | Price, 24h change, candles | Home, Asset, Portfolio | `exists` |
| `GET /reserves` | Per asset: minted, inCustody, custodian, updatedAt, attestationUrl | Reserves, Asset | `new API` |
| `GET /status` | mintPaused, redeemPaused, oracleStale, bufferLow, overall and per asset | Banner, Mint, Redeem, /status | `new API` (pause state can be read on-chain from `isPaused`) |
| `GET /redeem/queue?address` | id, asset, amount, position, eta, status, claimable | Redeem, Portfolio, Home | `new API` |
| `GET /vaults` · `/vaults/{id}` | aum, apy30d, nav, navHistory, allocation[], bufferAvailable, redeemTerms, docs | Earn, Vault, Mint, Portfolio, Home | `new API` |
| `GET /activity?address&type` | mint, redeem, queue_filled, quote_failed, with txHash and chainId | Activity | `fix`: `/swapper/{addr}` has trades, but no queue or quote-failed events |

---

## M0: Foundation

No visible pages. Makes everything after it cheaper to build.

### Build

- **Registry:** `config/chains.ts` and `config/assets.ts`. Replace the chain IDs and `sonicscan.org` links hardcoded in about 8 places.
- **Order engine:** move it out of the 600-line hook into `lib/orders/`. Apply slippage to `minOut`, and fix the balance cache-key mismatch.
- **Balances:** one wagmi `useReadContracts` multicall for every registry asset.
- **Shell:** nav Home · Mint · Earn · Portfolio · Reserves. Wallet button, a banner slot, and a footer with Reserves, Status and Legal. Add `loading`, `error` and `not-found` pages.
- **Routing:** remove or narrow the invite gate (D9), replace `/`, and add the [legacy redirects](#legacy-redirects).
- **Status hook:** `useProtocolStatus`, wired to the banner slot.

### Clean up

- **Secrets:** move the Alchemy RPC key and WalletConnect ID into env vars and add `.env.example`. **Rotate the Alchemy key**: it's in git history, and a `NEXT_PUBLIC_` var is still visible in the browser, so restrict it by domain or proxy it.
- **Delete:** leaderboard, points, invite, faucet, OTP login (unless D8 needs email), `utils/chain-client/` except the ABIs, provider and constants, TON/Suiet/Polygon code, and the dead x-assets files.
- **Remove** the alpha limit that forces USDC amounts between 5 and 10 (`components/x-assets/TokenSwapCard.tsx:49-65`). Sizes come from `/quote` instead.
- **Tests:** add Vitest for `lib/` (deep-link parsing, redeem route selection, order `minOut` math, registry filters).

---

## M1: Mint & trust

First public release. Reserves ships with Mint.

### Mint: `/mint` · M1 · L

**Job:** A universal swap: one screen for both wraps and cash.

**Build**
- **From:** USDC.e (default) or USDT. **To:** opens the picker (wraps and xCASH).
- **Quote panel:** units out, spread in bps, an ETA chip (instant / T+0 / T+1).
- **Backing chip:** "1 xXRP = 1 XRP in custody" for wraps, "NAV $1.012" for xCASH. Driven by the registry's `backing` field.
- Slippage and Max. The Mint button runs the step machine: approve, review, sign, pending, then success or failure.
- Footer link "Redeem anytime" goes to `/redeem?asset=…`.
- **Deep link** `/mint?to=xXRP&from=USDC`: case-insensitive, `USDC` means USDC.e, unknown values fall back to defaults. Changing a field updates the URL with `replace`.
- If they pick xCASH they stay on this page. Its kind is `fund`: NAV backing chip, and a KYC gate if that series requires it (D8).

**Data**
- `new API`: `/quote` with spread and ETA (D2)
- `exists`: cosign, submit and status. Permit2 check.
- `fix`: slippage applied to `minOut`
- `new API`: `/status`. Mint paused disables the button and shows the reason.

**Done when:** deep links survive a round trip, the signed order contains `minOut`, an expired quote refreshes before signing, and a paused asset can't be minted.

### Token picker: modal · M1 · S

**Job:** Pick an asset in one step. It's a modal, not a route.

**Build**
- Two sections: **Wraps** (BTC ETH SOL XRP DOGE HYPE…) and **Earn** (xCASH).
- Search by symbol, name or underlying. Hides `launched: false`, and hides `test` assets when that setting is on.
- Shows the balance on each row when a wallet is connected. Built on cmdk inside Dialog for keyboard navigation.
- `picker-store` opens it and returns the selection, so Mint and Redeem share one component.

**Data**
- `exists`: `components/ui/command.tsx`
- `fix`: registry from M0 (D3 decides the list)

**Done when:** it replaces the current `<Select>` in `components/x-assets/TokenInput.tsx` and works with only the keyboard.

### Reserves: `/reserves` · M1 · M

**Job:** The trust page. Public, and no wallet required.

**Build**
- **Table:** asset · minted · in custody · ratio · custodian · updated. A link to the attestation.
- Server component. Minted comes from on-chain `totalSupply` via a viem public client, and custody comes from `/reserves`. Revalidates every 60s and needs no wallet.
- A ratio below 100% is shown honestly, with a warning. An update older than the agreed cadence gets a "stale" badge.
- Rows are matched to tokens by address, not array position, which fixes the bug where the xADA row showed XRP supply.

**Data**
- `new API`: `/reserves` custody feed (D1)
- `exists`: on-chain total supply
- **Blocker:** invite middleware gates this route (D9)

**Done when:** it loads in a private window with no wallet and no cookie, and the custody column comes from the custodian, not from supply.

### Home: `/` · M1 · M

**Job:** One number, two actions.

**Build**
- **Total USD** = wrap balances × price, plus xCASH shares × NAV.
- **Buttons:** Mint and Earn.
- **Rows:** the top 4 assets (xXRP, xDOGE, xBTC, xCASH), each with balance and 24h change.
- **Banner** only when the user has a queued redeem or mint is paused.
- **Empty state** (no wallet or zero balance): "Mint XRP on this chain" with 3 logos, linking to `/mint?to=xXRP`.
- Not on this page: strategy farm, or a chain switcher in the hero.

**Data**
- `fix`: `useBalances` (multicall)
- `exists`: price and 24h from CDC tickers
- `new API`: xCASH NAV (`/vaults`) and redeem queue

**Done when:** the total matches Portfolio to the cent, and a disconnected wallet sees the empty state rather than $0.00.

### Asset: `/asset/[symbol]` · M1 · M

**Job:** Everything about one wrap, and proof that it's backed.

**Build**
- Price, a 1:1 (or NAV) indicator, and your balance.
- Mint, Redeem, and Add to wallet (wagmi `useWatchAsset`).
- **PoR snippet:** units minted vs units in custody, linking to `/reserves`.
- **Pools** (WhiteSwap xXRP/USDC.e) shown only if the registry lists one. No pool data source exists today (D4).
- A "Not a yield vault" note on wraps. `/asset/xCASH` redirects to `/earn/xcash`, and unknown symbols return 404.

**Data**
- `exists`: price and candles (`TokenChart`)
- `fix`: remove the random-candle fallback in `useCryptoChart`
- `new API`: `/reserves` for the PoR snippet, pool list

**Done when:** it replaces `/x-assets` as the landing page for a single asset, and a chart failure shows an error rather than made-up candles.

### Connect & legal: modals · M1 · M

**Job:** Get a wallet connected and terms accepted, with the least friction the law allows.

**Build**
- Connect wallet: keep the existing RainbowKit modal.
- A one-time ToS modal before the first mint, including "this is a receipt, not the underlying". Acceptance is stored per address.
- **KYC gate** only at Mint or Redeem submit, and only for series that require it (fund shares). No KYC for trading xXRP in v1, pending counsel (D8).
- Fix the dialog store's dynamic `max-w-[…]` class, which Tailwind never generates.

**Data**
- `exists`: RainbowKit, `dialog-store`
- `new API`: terms acceptance record, KYC status (if required)

**Done when:** a fresh wallet can mint xXRP after one terms modal and no KYC, while xCASH shows the KYC gate if its series requires one.

### Status banner: shell · M1 · S

**Job:** Tell users about mint paused, stale oracle or low buffer before they hit an error.

**Build**
- Reuse `app/app-banner.tsx` in the layout's banner slot, driven by `useProtocolStatus`.
- Show the most severe message first. Dismissal is remembered for the session, per message.

**Data**
- `new API`: `/status`; `isPaused` on-chain works as a stopgap

**Done when:** pausing an asset on staging shows the banner and disables Mint for that asset within one poll interval.

---

## M2: Exit & account

Users can get out, and see everything they hold and have done.

### Redeem: `/redeem` · M2 · L

**Job:** Turn any wrap or xCASH back into USDC.e, choosing the route automatically.

**Build**
- Asset (picker) and amount. The route is chosen for the user: **Instant** from the buffer, otherwise **Queue** with position and ETA. **Delayed swap (Cork)** stays behind a flag.
- You receive USDC.e. The fee and haircut are shown on separate lines before the Burn button.
- A pending queue list with the same component as Portfolio. Cancel if D6 allows it.
- Deep link `/redeem?asset=xXRP`.

**Data**
- `exists`: sell order path (xAsset → USDC)
- `new API`: `/quote` with route, fee and haircut, and `/redeem/queue`
- `fix`: `burnXAsset` is in the ABI but never called (D6)

**Done when:** an amount larger than the buffer switches the route to Queue with an ETA, and the queued item shows on Redeem, Portfolio and the Home banner.

### Portfolio: `/portfolio` · M2 · M

**Job:** Everything the wallet holds or has in flight.

**Build**
- **Wraps:** balance, price, value, 24h change.
- **xCASH:** shares, NAV, $ value, estimated APY.
- **Pending** mints and redeems, with a Claim button on queue items that are ready.
- Add token per row. Disconnected users see a connect prompt, not zeros.

**Data**
- `exists`: starting point is the `components/portfolio.tsx` popover
- `new API`: `/vaults` (NAV and APY), `/redeem/queue`

**Done when:** the total equals the Home total, and a claim clears the item everywhere.

### Activity: `/activity` · M2 · M

**Job:** A history of the wallet's events.

**Build**
- Event types: mint, redeem, queue filled, failed quote. Filter by type. Each row has an explorer link built by `explorerTx(chainId, hash)`.
- Reuse the explorer data table. Decide whether the protocol-wide feed from `/explorer` survives as a public tab.

**Data**
- `fix`: `/swapper/{addr}.userTrades` covers part of it
- `new API`: `/activity` with queue and quote-failed events

**Done when:** every submitted order, successful or not, appears here within one poll interval.

### Settings: `/settings` · M2 · S

**Job:** Preferences that change how every other page behaves.

**Build**
- Wallet (address, disconnect). Network: Sonic or Whitechain (`useSwitchChain`), if D4 says yes.
- Slippage (the value already in `app-store`), hide test assets, legal, support.
- The staging overrides panel (`components/ui/base-url-settings.tsx`) moves here, and only appears in the staging environment.

**Data**
- `exists`: `app-store` (persisted)

**Done when:** hiding test assets removes them from the picker, Home and Portfolio.

---

## M3: Earn

Launch xCASH. The table is laid out like BounceBit's, with no BTC "strategies".

### Earn: `/earn` · M3 · S

**Job:** Compare yield products at a glance, then subscribe.

**Build**
- **Columns:** asset · AUM · 30D APY · NAV · redeem terms · Subscribe.
- One row in v1: xCASH (USYC plus buffer). Subscribe goes to `/mint?to=xCASH`, and clicking the row opens `/earn/xcash`.
- Rows come from config, so later sleeves (USYC, syrup) need no code change.

**Data**
- `new API`: `/vaults` (D7)
- `exists`: sortable data table

**Done when:** the APY shown here matches Vault detail and Portfolio, since all three read the same source.

### Vault detail: `/earn/[vault]` · M3 · M

**Job:** Everything someone needs to trust xCASH before subscribing.

**Build**
- APY, a NAV sparkline (recharts), AUM.
- **Allocation donut** from data, e.g. USYC 60 / syrup 0 / buffer 15 / …. The legend lists every slice, including zero.
- Mint and Redeem buttons that deep-link with `xCASH` preselected.
- **Docs:** what backs it, who custodies it, the maximum instant redeem (= current buffer).
- **Risk:** T-bill issuer risk and the redemption queue.

**Data**
- `new API`: `/vaults/xcash` with NAV history, allocation and buffer

**Done when:** the allocation adds up to 100%, the maximum instant redeem matches the threshold Redeem uses, and the risk copy has legal sign-off.

### Status: `/status` · M3 · S

**Job:** A tiny public page: per-asset mint and redeem state, oracle freshness, buffer level.

**Build**
- A server-rendered list of the same flags the banner uses, each with a last-updated time. The footer links here.
- Optional: the banner alone meets the spec. Build this page only once there's something to show beyond the banner.

**Data**
- `new API`: `/status` (same as the banner)

**Done when:** it loads with no wallet and agrees with the banner.

---

## Defects to fix along the way

Existing bugs that would undermine v1 if they carried over. Each is assigned to the milestone that touches that code.

> **Two of these are trust problems for a product whose core promise is backing:** Reserves doesn't read custody data at all, and two hooks quietly return random data when an API fails. Both must be fixed in M1.

| Defect | Where | Fix in |
|---|---|---|
| "In reserve" equals total supply, and the ratio is hardcoded to `'100%'` | `app/(main)/reserves/reservers-table.tsx:44-46` | M1 |
| Random candles or trades returned when an API fails | `hooks/queries/use-crypto-chart.ts`, `hooks/queries/use-trade-search.tsx` | M1 |
| Slippage shown in the UI but never applied to the order | `hooks/mutations/use-xasset-signature.tsx:478-490` | M0 |
| Alchemy key and WalletConnect ID in client source; dashboard password and invite code hardcoded | `utils/chain-client/common/provider.ts`, `app/providers.tsx:18`, `app/(main)/tokens-dashboard/page.tsx:31`, `app/(other)/invite/redeem-invite.tsx:38` | M0 |
| xADA and xXRP share one contract address, so the ADA row shows XRP supply | `hooks/queries/use-all-tokens.tsx:32,68` | M0 |
| Supply matched to tokens by array index | `app/(main)/reserves/reservers-table.tsx:31-35` | M1 |
| Balance cache lookup always misses (cache key mismatch) | `hooks/mutations/use-xasset-signature.tsx:559-578` | M0 |
| Alpha limit forces USDC amounts between 5 and 10 | `components/x-assets/TokenSwapCard.tsx:49-65` | M0 |
| "Volume (30D)" is lifetime volume × 2 | `app/(main)/markets/analytics-card.tsx:12-13` | M0 (page removed) |
| Dynamic Tailwind class `max-w-[${…}]` is never generated | `components/common/global-dialog.tsx:38` | M1 |
| The transaction button links to the Sepolia explorer | `components/view-transaction.button.tsx` | M0 |

---

## Legacy redirects

Permanent redirects in `next.config.mjs`. The query-string mapping for `/x-assets` lives in middleware.

| From | To | Note |
|---|---|---|
| `/markets` | `/` | Home replaces the market list |
| `/x-assets?selected-token=x2XRP` | `/mint?to=xXRP` | Uses the ticker mapping from D3 |
| `/explorer` | `/activity` | Explorer was protocol-wide; Activity is per wallet |
| `/leaderboard`, `/invite`, `/maintenance` | `/` | Removed |

---

## Testing & release

The repo has no tests today. Start small, and put them where money moves.

### Automated

- **Vitest, from M0:** order `minOut` math, deep-link parsing, redeem route selection, registry filters (launched / test).
- **Playwright smoke, from M1:** `/reserves` with no wallet, `/mint` deep links, and every legacy redirect.
- Add `lint`, `format:check`, `tsc` and the tests to CI. No CI exists today.

### Every release

- Staging mint and redeem for each launched asset, using real small amounts.
- Pause an asset on staging and confirm the banner, the disabled Mint button and `/status`.
- Check that Reserves ratios match the latest attestation by hand.
- Legal copy review: terms modal, "receipt, not the underlying", xCASH risk section.
