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
    fs.writeFileSync(filePath, JSON.stringify(config, null, 2), 'utf8');
  } catch (err: any) {
    throw new Error(`Failed to save config to ${filePath}: ${err?.message || String(err)}`);
  }
}

export function maskSecret(secret?: string): string {
  if (!secret) return '(not set)';
  if (secret.length <= 8) return 'S****';
  return `${secret.slice(0, 4)}...${secret.slice(-4)}`;
}
