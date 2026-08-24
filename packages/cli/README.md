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

---

## 🔎 Audit Log Verifier (`nirium verify`)

Verify IPFS audit log CIDs and cryptographic Ed25519 signatures independently.

```bash
nirium verify bafkreibm5j7w...
```

---

## 🧬 Project Scaffolding (`nirium create`)

```bash
# Create an x402 API server
nirium create x402 --name my-paid-api

# Create a signal listener bot
nirium create bot --name my-agent -t ts
```

---

## Links

- [nirium.xyz](https://nirium.xyz)
- [TypeScript SDK](https://www.npmjs.com/package/nirium)
- [GitHub Repository](https://github.com/nirium-protocol/nirium-sdk)

## License

Apache 2.0 — Nirium Protocol
