import test from 'node:test';
import assert from 'node:assert/strict';
import { maskSecret, loadConfig, saveConfig } from '../src/configStore.ts';
import { executePayCommand } from '../src/pay.ts';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

test('configStore: masks secret keys safely', () => {
  assert.equal(maskSecret(undefined), '(not set)');
  assert.equal(maskSecret(''), '(not set)');
  assert.equal(maskSecret('SCX5QCL3IIQSFQZTKJVCKE4L6QZ3SXD3TXVY2AHDH4DYZKNOO7K77VVY'), 'SCX5...7VVY');
});

test('configStore: loads and saves custom config file', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nirium-config-test-'));
  const configPath = path.join(tmpDir, '.niriumrc.json');

  saveConfig({ secretKey: 'S_TEST_KEY', payTo: 'G_TEST_ADDRESS', network: 'stellar:testnet' }, configPath);

  const loaded = loadConfig(configPath);
  assert.equal(loaded.secretKey, 'S_TEST_KEY');
  assert.equal(loaded.payTo, 'G_TEST_ADDRESS');
  assert.equal(loaded.network, 'stellar:testnet');

  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('executePayCommand: rejects invalid Stellar secret key', async () => {
  let jsonOutput = '';
  const originalLog = console.log;
  console.log = (msg) => {
    jsonOutput += msg;
  };

  // Override process.exit temporarily
  const originalExit = process.exit;
  let exitCode;
  process.exit = (code) => {
    exitCode = code;
  };

  try {
    await executePayCommand('https://nirium-agent.fly.dev/api/v1/premium/signals', {
      secret: 'INVALID_SECRET_KEY',
      json: true,
    });
  } finally {
    console.log = originalLog;
    process.exit = originalExit;
  }

  assert.equal(exitCode, 1);
  assert.ok(jsonOutput.includes('Invalid Stellar secret key format'));
});
