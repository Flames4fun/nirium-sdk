# Nirium SDK

Open-source developer toolkit for **Nirium** — autonomous treasury and agentic payments on Stellar/Soroban.

This repository contains the TypeScript and Python SDKs, the MCP server, the CLI, examples and quickstarts that let any developer:

- **Get paid by AI agents** — put your own API behind an x402 pay-gate in one call with `x402Serve()`, or pay for someone else's with `initX402()`.
- **Automate on-chain treasury** — a Nirium agent moves idle capital into a CETES strategy (tokenized Mexican T-bills via Etherfuse) and back, on its own, over a vault **you** own.
- **Anchor immutable audit trails** — SHA-256 content hash pinned to IPFS, optionally carrying an ed25519 signature that proves *who* declared the fact, not just that it is unaltered.

Software-only and non-custodial: regulated partners execute settlement, the client signs every fund movement, and Nirium never holds client funds.

## Packages

| Package | Install | Version | Description |
|---|---|---|---|
| TypeScript SDK | `npm install nirium` | [![npm](https://img.shields.io/npm/v/nirium)](https://www.npmjs.com/package/nirium) | Client for the Nirium API, x402/MPP payments, signals, webhooks — plus `x402Serve()` to charge for your own API. |
| Python SDK | `pip install nirium` | [![PyPI](https://img.shields.io/pypi/v/nirium)](https://pypi.org/project/nirium/) | Async client with the same surface. |
| MCP server | `npx nirium-mcp` | [![npm](https://img.shields.io/npm/v/nirium-mcp)](https://www.npmjs.com/package/nirium-mcp) | 14 tools for Claude Desktop, Cursor, and any MCP-compatible IDE. |
| CLI | `npm install -g nirium-cli` | [![npm](https://img.shields.io/npm/v/nirium-cli)](https://www.npmjs.com/package/nirium-cli) | Scaffold and interact with Nirium from the terminal. |

> **Note on this repository's source:** the published packages move faster than this mirror. Install from npm/PyPI to get the current release; open PRs here. If a symbol exists on npm but not in `packages/` yet, that is the drift — say so in the issue and it gets synced.

## Quickstart — pay for an API (TypeScript)

```bash
npm install nirium
```

```ts
import { Agent } from 'nirium';

const agent = new Agent({ baseUrl: 'https://nirium-agent.fly.dev' });
const market = await agent.getMarket();
console.log(market);
```

## Quickstart — charge for *your* API

The other side of the counter. Wiring x402 by hand is ~25 lines of facilitator client, per-method auth headers, per-network scheme registration and a route table whose shape you have to reverse-engineer. This is the same thing with the defaults that already run in production:

```ts
import { x402Serve } from 'nirium';

app.use('/premium', x402Serve({
    payTo: 'G...',              // your Stellar address
    routes: { 'GET /signals': '$0.02' },
}));
```

Any AI agent can now pay for your endpoint in USDC — no account, no card, no subscription, no human awake.

See [`docs/`](./docs) for full quickstarts, including [**"Charge AI agents in 5 minutes"**](./docs/quickstart-x402.md), and [`examples/`](./examples) for runnable Express and Next.js integrations.

## Networks

Live on **both** Stellar networks — and they are not two copies of the same thing.

**Mainnet** (real value). The API box holds **no signing key** by design; a separate process with no HTTP surface signs autonomous rebalances, and clients sign their own fund movements.

| What | Verify |
|---|---|
| First real x402 payment | [`3134a51c…7558bc`](https://stellar.expert/explorer/public/tx/3134a51c66091fd7fbd85b38a4a6ec6cd432bb92c2450eac84ea7855cb7558bc) |
| Treasury vault deployed (client signs) | [`93ff6284…78416`](https://stellar.expert/explorer/public/tx/93ff6284cdf03706624c88434a79fba1b213ee547f58e09a9248f75373178416) |
| Autonomous invest (**the agent signs**) | [`82d73f53…6b3d4`](https://stellar.expert/explorer/public/tx/82d73f537e907140367f9343f63a36704c74a5286aced7a938cee8fffb56b3d4) |
| API | [`nirium-agent-mainnet.fly.dev/health`](https://nirium-agent-mainnet.fly.dev/health) |

That third transaction is the point: the agent moved funds it does not own, and the contract gave it no way to take them out. Nirium holds only the vault's `RebalanceManager` role, and `rebalance()` accepts no destination address — withdrawal is not *forbidden*, it is **inexpressible**.

**Testnet** (no real value — where the loop and the key live, and where you should build).

| Contract | ID |
|---|---|
| NiriumVault | [`CBTWMZCG3P72EHFAQ4ZLSEBIOFYJC244H5J6DHZIJ56FHFWJ2CFAWSZU`](https://stellar.expert/explorer/testnet/contract/CBTWMZCG3P72EHFAQ4ZLSEBIOFYJC244H5J6DHZIJ56FHFWJ2CFAWSZU) |
| NiriumProtocol | [`CC2TU5BDTKTPRRRQPEF77I54XYHFQ25XGIRO2TCWKSR7NRJDFR5L5NR5`](https://stellar.expert/explorer/testnet/contract/CC2TU5BDTKTPRRRQPEF77I54XYHFQ25XGIRO2TCWKSR7NRJDFR5L5NR5) |

API: [`nirium-agent.fly.dev/health`](https://nirium-agent.fly.dev/health) · node catalog: [`/api/nodes`](https://nirium-agent.fly.dev/api/nodes)

Nirium's own **NiriumVault** treasury contract stays on testnet and is audit-gated: no independent third-party audit has happened yet, and no client funds ever reach it. The mainnet treasury path runs over a **DeFindex** vault instead — a third-party contract audited by OtterSec (March 2025, 16 findings, all 13 vulnerabilities resolved) on a Blend V2 strategy.

## Contributing

Contributions welcome — examples, framework adapters, language bindings, docs and tests. Check the [open issues](../../issues) and look for `good first issue`.

This project participates in the **GrantFox** campaign, a community program run by Trustless Work. Rewards are decided by GrantFox after the campaign and are **not guaranteed** — a merged PR is not a payment. Apply to an issue and wait to be assigned before starting work.

## Disclaimer

Experimental software. Not financial advice, not an investment product, and no guarantee of yield, dividends or appreciation. Rate data (Blend supply rate, Etherfuse CETES rate) is public protocol information, not a projection. Smart contracts carry risk even when audited. XLM and Stellar assets are volatile.

## License

MIT — see [LICENSE](./LICENSE).
