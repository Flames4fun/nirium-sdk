import SdkModule from '../../sdk/dist/index.js';
const Agent = (SdkModule as any).Agent || (SdkModule as any).default || SdkModule;
import { loadConfig, maskSecret } from './configStore.ts';
import { Keypair } from '@stellar/stellar-sdk';

export interface PayCommandOptions {
  secret?: string;
  network?: string;
  config?: string;
  amount?: string;
  json?: boolean;
}

export async function executePayCommand(url: string, options: PayCommandOptions): Promise<void> {
  const config = loadConfig(options.config);
  const secretKey = options.secret || process.env.NIRIUM_SECRET_KEY || config.secretKey;
  const network = options.network || process.env.NIRIUM_NETWORK || config.network || 'stellar:testnet';

  if (!secretKey) {
    const errorMsg =
      'Missing secret key for x402 payment authorization.\n' +
      'Please provide a secret key using:\n' +
      '  - `--secret S...` option\n' +
      '  - `NIRIUM_SECRET_KEY` environment variable\n' +
      '  - `nirium config set secretKey S...`';

    if (options.json) {
      console.log(JSON.stringify({ status: 'error', error: errorMsg }));
      process.exit(1);
    }
    console.error(`❌ Error: ${errorMsg}`);
    process.exit(1);
  }

  // Validate secret key format
  let publicKey = '';
  try {
    const kp = Keypair.fromSecret(secretKey);
    publicKey = kp.publicKey();
  } catch (err: any) {
    const invalidMsg = `Invalid Stellar secret key format: ${err?.message || 'must start with S'}`;
    if (options.json) {
      console.log(JSON.stringify({ status: 'error', error: invalidMsg }));
      process.exit(1);
    }
    console.error(`❌ Error: ${invalidMsg}`);
    process.exit(1);
  }

  if (!options.json) {
    console.log(`⚡ Initiating x402 Payment Request`);
    console.log(`   Target URL: ${url}`);
    console.log(`   Network:    ${network}`);
    console.log(`   Payer Key:  ${publicKey}`);
    console.log(`   Secret:     ${maskSecret(secretKey)}\n`);
  }

  try {
    const agent = new Agent({ apiKey: 'nirium-cli-pay' });
    agent.initX402({
      secretKey,
      network,
    });

    const startTime = Date.now();
    const response = await agent.x402Fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Nirium-CLI-Pay/1.0',
      },
    });
    const durationMs = Date.now() - startTime;

    const responseHeaders = Object.fromEntries(response.headers.entries());
    const paymentResponseHeader =
      response.headers.get('payment-response') ||
      response.headers.get('x-payment-response') ||
      response.headers.get('payment-tx-hash') ||
      '';

    let txHash = '';
    let paymentMeta: any = null;

    if (paymentResponseHeader) {
      try {
        if (paymentResponseHeader.startsWith('{')) {
          const parsed = JSON.parse(paymentResponseHeader);
          txHash = parsed.txHash || parsed.transactionHash || parsed.hash || '';
          paymentMeta = parsed;
        } else {
          txHash = paymentResponseHeader;
        }
      } catch {
        txHash = paymentResponseHeader;
      }
    }

    let responseBody: any;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      responseBody = await response.json();
    } else {
      responseBody = await response.text();
    }

    if (options.json) {
      console.log(
        JSON.stringify(
          {
            status: response.ok ? 'success' : 'failed',
            statusCode: response.status,
            durationMs,
            payer: publicKey,
            network,
            txHash: txHash || undefined,
            paymentMeta: paymentMeta || undefined,
            headers: responseHeaders,
            data: responseBody,
          },
          null,
          2
        )
      );
      return;
    }

    console.log(`✅ Payment Negotiated & Request Completed (${response.status} ${response.statusText})`);
    console.log(`   Response Time: ${durationMs}ms`);
    if (txHash) {
      console.log(`   Tx Reference:  ${txHash}`);
      if (network.includes('testnet')) {
        console.log(`   Explorer:      https://stellar.expert/explorer/testnet/tx/${txHash}`);
      } else {
        console.log(`   Explorer:      https://stellar.expert/explorer/public/tx/${txHash}`);
      }
    }
    console.log(`\n--- Response Payload ---`);
    console.log(typeof responseBody === 'object' ? JSON.stringify(responseBody, null, 2) : responseBody);
  } catch (err: any) {
    const errorDetail = err?.message || String(err);
    if (options.json) {
      console.log(
        JSON.stringify({
          status: 'error',
          error: errorDetail,
          payer: publicKey,
          network,
        })
      );
      process.exit(1);
    }
    console.error(`❌ Payment Failed: ${errorDetail}`);
    process.exit(1);
  }
}
