# nirium-cli

CLI tool for autonomous Stellar DeFi agents — pay x402 endpoints, spin up protected mock APIs, run diagnostics, and scaffold agent projects.

```bash
npm install -g nirium-cli
```

---

## 💳 Pay x402 Endpoints (`nirium pay`)

Pay any x402-protected endpoint straight from the terminal. Automatically handles the 402 challenge negotiation, signs Soroban authorization entries using a configured secret key, and prints the response alongside on-chain transaction references.

```bash
# Pay live Nirium testnet endpoint
nirium pay https://nirium-agent.fly.dev/api/v1/premium/signals --secret S...

# Output as JSON for scripting
nirium pay https://nirium-agent.fly.dev/api/v1/premium/signals --secret S... --json
```

### Options:
- `<url>`: URL of the x402-protected HTTP resource.
- `-s, --secret <secretKey>`: Stellar secret key (`S...`) used for signing authorization entries.
- `-n, --network <network>`: Network CAIP-2 ID (`stellar:testnet` or `stellar:pubnet`, default: `stellar:testnet`).
- `-c, --config <path>`: Custom path to a configuration file or `.env`.
- `--json`: Output execution summary as JSON.

---

## 🚀 Spin Up x402 Protected Endpoint (`nirium serve`)

Spin up a local x402-protected HTTP server powered by `x402Serve()` so developers can test `nirium pay` locally without writing boilerplate.

```bash
nirium serve --price "$0.02" --pay-to G... --port 3000
```

### Options:
- `-p, --price <price>`: Price per request (default: `"$0.02"`).
- `-P, --pay-to <address>`: Recipient Stellar public key (`G...`).
- `-port, --port <port>`: Port number to listen on (default: `3000`).
- `-n, --network <network>`: CAIP-2 network ID (default: `stellar:testnet`).
- `-r, --route <route>`: Route path to protect (default: `/api/v1/data`).
- `-k, --api-key <key>`: Facilitator API key.

---

## ⚙️ Configuration Store (`nirium config`)

Manage local defaults (`~/.niriumrc.json`) safely without exposing secret keys in logs or shell history.

```bash
# Save default secret key and recipient address
nirium config set secretKey S...
nirium config set payTo G...
nirium config set network stellar:testnet

# List configuration (secrets masked automatically as S***...XXXX)
nirium config list
```

---

## 🩺 Preflight Diagnostics (`nirium doctor`)

Run preflight checks against Horizon RPC nodes, payTo accounts, and OpenZeppelin facilitator keys.

```bash
nirium doctor --network stellar:testnet
```

<details>
<summary>Example output</summary>

```text
🩺 Nirium Doctor — x402/MPP Diagnostic Report
Target Network: stellar:testnet
Timestamp:      2026-08-24T00:10:00.000Z
--------------------------------------------------
✔ [PAYTO] payTo address is a valid Stellar public key (GBRP...CCHX)
❌ [FACILITATOR] facilitatorApiKey is missing — OpenZeppelin Channels facilitator rejects unauthenticated requests
   💡 Fix: Get a free testnet key at https://channels.openzeppelin.com/testnet/gen and set X402_FACILITATOR_API_KEY in .env
✔ [NETWORK] Soroban RPC endpoint operational for stellar:testnet
--------------------------------------------------
❌ Diagnostic failed. See fix suggestions above.
```

`--json` gives the same report as a structured `{ ok, network, checks: [...] }` object for CI.

</details>

---

## 🔎 Audit Log Verifier (`nirium verify`)

Verify IPFS audit log CIDs and cryptographic Ed25519 signatures independently — recomputes the SHA-256 hash of the embedded record and independently verifies the Ed25519 signature over `nirium-audit-v1:<content_sha256>` using the signer's Stellar public key (`G...`), without trusting any Nirium backend.

```bash
nirium verify bafkreibm5j7w... [--gateway https://gateway.pinata.cloud] [--json]
```

<details>
<summary>Example output</summary>

```text
🔍 Nirium Audit Verifier
CID:            QmSSZdtt3dQ8BqUm62zrKQ85E4BUHYiVfvDgZmHfJsqU1U
--------------------------------------------------
✔ HASH:        MATCH (ab44f8883af819f7...)
✔ SIGNATURE:   VALID (Signed by GD5AFNPTKVZPNWZWKLOULOE7BN4E7ZC73WV5YMBCULYQXWFCGDESUNOZ)
   Statement:  nirium-audit-v1:ab44f8883af819f7496f2cef29eaea0651f6d97af78aa8088fd8ef4dc4b753c9
   Agent ID:   arcusx-dispute-resolver
--------------------------------------------------
✅ VERIFICATION PASSED
```

</details>

---

## 🧬 Project Scaffolding (`nirium create`)

```bash
# Create an x402 API server
nirium create x402 --name my-paid-api

# Create a signal listener bot
nirium create bot --name my-agent -t ts    # TypeScript
nirium create bot --name my-agent -t py    # Python
```

For the `x402` template, fill two values in the generated `.env` before `npm run dev`:

| Variable | Where it comes from |
|---|---|
| `STELLAR_PAY_TO` | the Stellar account that receives payments (`G...`) |
| `X402_FACILITATOR_API_KEY` | free at [channels.openzeppelin.com/gen](https://channels.openzeppelin.com/gen) |

The API key is not optional — the facilitator rejects unauthenticated servers on
testnet as well as mainnet, so without it your routes never get as far as
offering a 402. Once it's set, everything under `/premium` bills before it
answers: a caller without payment gets a 402 carrying the terms, one that pays
gets the data, and the transfer settles on Stellar before your handler
returns. The generated server is about ten lines, because `x402Serve()` from
the [`nirium`](https://www.npmjs.com/package/nirium) SDK carries the
facilitator client, the scheme registration and the route shape.

For the `bot` template, it connects to a Nirium agent and prints incoming
signals — defaults to `https://nirium-agent.fly.dev` (testnet); set
`NIRIUM_API_URL` and `NIRIUM_API_KEY` in `.env` to point somewhere else.

## Options

| Option | Values | Default |
|---|---|---|
| `-n, --name <name>` | project directory name | `nirium-bot-v1` |
| `-t, --template <template>` | `ts` or `py` — `bot` only | `ts` |

## Links

- [nirium.xyz](https://nirium.xyz)
- [TypeScript SDK](https://www.npmjs.com/package/nirium)
- [GitHub Repository](https://github.com/nirium-protocol/nirium-sdk)

## License

Apache 2.0 — Nirium Protocol
