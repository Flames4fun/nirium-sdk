import test from 'node:test';
import assert from 'node:assert/strict';
import { maskSecret, loadConfig, saveConfig } from '../dist/configStore.js';
import { executePayCommand } from '../dist/pay.js';
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

// File-permission test: config containing a secretKey must be written 0600.
// Skipped on Windows where POSIX file modes don't apply.
test('configStore: saves config with owner-only permissions (0o600)', { skip: process.platform === 'win32' }, () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nirium-perm-test-'));
  const configPath = path.join(tmpDir, '.niriumrc.json');

  saveConfig({ secretKey: 'SNOTAREALSECRETBUTLONGENOUGH1234567890ABCDEFGHIJK' }, configPath);

  const stat = fs.statSync(configPath);
  // On POSIX, mode includes file-type bits in the upper half.
  // Mask with 0o777 to isolate permission bits.
  const permBits = stat.mode & 0o777;
  assert.equal(permBits, 0o600, `Expected 0600 but got ${permBits.toString(8)}`);

  fs.rmSync(tmpDir, { recursive: true, force: true });
});

// --- serve command tests ---
import { executeServeCommand } from '../dist/serve.js';

test('executeServeCommand: rejects missing facilitator API key at startup', async () => {
  const errors = [];
  const originalError = console.error;
  console.error = (msg) => { errors.push(msg); };

  const originalExit = process.exit;
  let exitCode;
  process.exit = (code) => {
    exitCode = code;
    throw new Error(`PROCESS_EXIT_${code}`);
  };

  // Clear env vars that could provide a key
  const savedKey = process.env.FACILITATOR_API_KEY;
  delete process.env.FACILITATOR_API_KEY;

  const tmpConfig = path.join(os.tmpdir(), 'nonexistent-nirium-config-test.json');

  try {
    await executeServeCommand({
      payTo: 'GD5AFNPTKVZPNWZWKLOULOE7BN4E7ZC73WV5YMBCULYQXWFCGDESUNOZ',
      config: tmpConfig,
      // intentionally no apiKey
    });
  } catch (err) {
    // expected process.exit throw
  } finally {
    console.error = originalError;
    process.exit = originalExit;
    if (savedKey !== undefined) process.env.FACILITATOR_API_KEY = savedKey;
  }

  assert.equal(exitCode, 1, 'should exit with code 1 when facilitatorApiKey is missing');
  assert.ok(
    errors.some(e => typeof e === 'string' && e.includes('Missing facilitator API key')),
    'should print a clear error about the missing facilitator API key'
  );
});

test('executeServeCommand: rejects missing payTo address at startup', async () => {
  const errors = [];
  const originalError = console.error;
  console.error = (msg) => { errors.push(msg); };

  const originalExit = process.exit;
  let exitCode;
  process.exit = (code) => {
    exitCode = code;
    throw new Error(`PROCESS_EXIT_${code}`);
  };

  // Clear env vars
  const savedPay = process.env.NIRIUM_PAY_TO;
  delete process.env.NIRIUM_PAY_TO;

  const tmpConfig = path.join(os.tmpdir(), 'nonexistent-nirium-config-test.json');

  try {
    await executeServeCommand({
      apiKey: 'test-key-for-validation',
      config: tmpConfig,
      // intentionally no payTo
    });
  } catch (err) {
    // expected process.exit throw
  } finally {
    console.error = originalError;
    process.exit = originalExit;
    if (savedPay !== undefined) process.env.NIRIUM_PAY_TO = savedPay;
  }

  assert.equal(exitCode, 1, 'should exit with code 1 when payTo is missing');
  assert.ok(
    errors.some(e => typeof e === 'string' && e.includes('Missing `--pay-to`')),
    'should print a clear error about the missing payTo address'
  );
});
