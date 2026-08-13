# Devlog

Real findings from running Nirium in production. No marketing copy here, just what broke, how we found it, and where it stands.

## 2026-08-13: A rejected x402 payment settled anyway (upstream facilitator)

**What we found.** On 5 August 2026, our mainnet x402 endpoint returned HTTP 402 with an empty body to a payment retry, meaning we told the caller their payment was rejected. About 30 seconds later, that same payment settled on-chain anyway, from a different account in the facilitator's relayer pool than the one that settled the caller's second, separate attempt. Net effect: the caller was charged for a request we had already told them failed, and received nothing for that charge.

**How we diagnosed it.** The report came from a third-party integrator, AgentLedger (agentpayments.fi), testing our x402 endpoint from a real client. When we investigated, they independently tested our endpoint alongside two unrelated x402 sellers on Stellar pubnet and found the same failure signature across all three: 402 with an empty `payment-required` challenge, zero settlement, and no `payment-error` header despite it being advertised in `access-control-expose-headers`. Reproducible with a plain curl request against a rejected or missing payment, no signed transaction required. That cross-vendor consistency is what pointed at the facilitator layer (we use `@x402/express`'s `paymentMiddlewareFromConfig` against OpenZeppelin Channels, and never call verify or settle ourselves) rather than at any single integration, including ours.

We filed the missing `payment-error` header as an issue against the upstream SDK:
https://github.com/x402-foundation/x402/issues/3148

**Where it stands today.** We cannot fix a race condition inside a facilitator we do not operate. What we built instead is `GET /api/reporting/reconcile`, which compares on-chain settlements to the treasury against payment receipts our own route handlers logged. Read honestly: it currently reports `matchable: false` for most of its history, because our receipts did not record the settlement transaction hash until we built this endpoint, so most existing receipts cannot be matched to a specific on-chain payment one to one. It compares totals in the meantime and will match individually going forward as receipts carry the hash. That gap is not fixed yet. It is the next thing to close.
