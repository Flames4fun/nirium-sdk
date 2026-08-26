import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

export interface NiriumConfig {
  secretKey?: string;
  payTo?: string;
  network?: string;
  facilitatorApiKey?: string;
}

const CONFIG_FILE = path.join(os.homedir(), '.niriumrc.json');

export function loadConfig(customPath?: string): NiriumConfig {
  const filePath = customPath || CONFIG_FILE;
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(raw);
    }
  } catch {
    // Ignore read errors gracefully
  }
  return {};
}

export function saveConfig(config: NiriumConfig, customPath?: string): void {
  const filePath = customPath || CONFIG_FILE;
  try {
    fs.writeFileSync(filePath, JSON.stringify(config, null, 2), {
      encoding: 'utf8',
      mode: 0o600,
    });
    // Enforce permissions even on pre-existing files (writeFileSync mode
    // only applies when the file is created, not when it already exists).
    try {
      fs.chmodSync(filePath, 0o600);
    } catch {
      // best effort on platforms without POSIX permissions (e.g. some Windows setups)
    }
  } catch (err: any) {
    throw new Error(`Failed to save config to ${filePath}: ${err?.message || String(err)}`);
  }
}

export function maskSecret(secret?: string): string {
  if (!secret) return '(not set)';
  if (secret.length <= 8) return 'S****';
  return `${secret.slice(0, 4)}...${secret.slice(-4)}`;
}
