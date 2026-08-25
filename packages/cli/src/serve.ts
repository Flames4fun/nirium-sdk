import express from 'express';
import { x402Serve } from '../../sdk/dist/index.js';
import { loadConfig } from './configStore.ts';
import http from 'node:http';

export interface ServeCommandOptions {
  price?: string;
  payTo?: string;
  port?: string | number;
  network?: string;
  route?: string;
  apiKey?: string;
  config?: string;
}

export async function executeServeCommand(options: ServeCommandOptions): Promise<{ app: express.Express; server: http.Server }> {
  const config = loadConfig(options.config);
  const payTo = options.payTo || process.env.NIRIUM_PAY_TO || config.payTo;
  const price = options.price || '$0.02';
  const port = Number(options.port || process.env.PORT || 3000);
  const network = (options.network || process.env.NIRIUM_NETWORK || config.network || 'stellar:testnet') as 'stellar:testnet' | 'stellar:pubnet';
  const routePath = options.route || '/api/v1/data';
  const facilitatorApiKey = options.apiKey || process.env.FACILITATOR_API_KEY || config.facilitatorApiKey;

  if (!facilitatorApiKey) {
    console.error('❌ Error: Missing facilitator API key.');
    console.error('Get a free key at https://channels.openzeppelin.com/testnet/gen (testnet)');
    console.error('or https://channels.openzeppelin.com/gen (mainnet), then pass it via');
    console.error('--api-key, FACILITATOR_API_KEY, or `nirium config set facilitatorApiKey ...`');
    process.exit(1);
  }

  if (!payTo) {
    console.error('❌ Error: Missing `--pay-to` Stellar address (G...).');
    console.error('Please specify a recipient address using `--pay-to G...` or setting `payTo` in config.');
    process.exit(1);
  }

  const app = express();
  app.use(express.json());

  // Mount x402 protection middleware using SDK x402Serve
  const middleware = x402Serve({
    payTo,
    network,
    facilitatorApiKey,
    routes: {
      [`GET ${routePath}`]: {
        price,
        description: 'Nirium CLI x402 Demo Endpoint',
      },
    },
  });

  app.use(middleware);

  // Demo protected endpoint handler
  app.get(routePath, (req, res) => {
    res.json({
      status: 'success',
      message: 'x402 Payment Verified! Access Granted.',
      endpoint: routePath,
      price,
      paidTo: payTo,
      timestamp: new Date().toISOString(),
      sampleData: {
        signal: 'CETES_REBALANCE_OPPORTUNITY',
        yieldApy: '5.57%',
        network,
      },
    });
  });

  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      console.log(`\n🚀 Nirium x402 Demo Server Listening on http://localhost:${port}`);
      console.log(`   Protected Route: http://localhost:${port}${routePath}`);
      console.log(`   Price:           ${price}`);
      console.log(`   Pay To:          ${payTo}`);
      console.log(`   Network:         ${network}\n`);
      console.log(`💡 Test this server using:`);
      console.log(`   nirium pay http://localhost:${port}${routePath} --secret S...\n`);
      resolve({ app, server });
    });

    server.on('error', (err) => {
      console.error(`❌ Server startup failed: ${err.message}`);
      reject(err);
    });
  });
}
