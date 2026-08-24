import { loadConfig, saveConfig, maskSecret, NiriumConfig } from './configStore.ts';

export function executeConfigCommand(action?: string, key?: string, value?: string): void {
  const currentConfig = loadConfig();

  if (!action || action === 'list') {
    console.log('⚙️ Nirium CLI Configuration:');
    console.log(`   secretKey:          ${maskSecret(currentConfig.secretKey)}`);
    console.log(`   payTo:              ${currentConfig.payTo || '(not set)'}`);
    console.log(`   network:            ${currentConfig.network || '(default: stellar:testnet)'}`);
    console.log(`   facilitatorApiKey:  ${maskSecret(currentConfig.facilitatorApiKey)}`);
    return;
  }

  if (action === 'get') {
    if (!key) {
      console.error('❌ Error: Please specify a configuration key (e.g. `nirium config get secretKey`)');
      process.exit(1);
    }
    const val = (currentConfig as any)[key];
    if (key.toLowerCase().includes('secret') || key.toLowerCase().includes('key')) {
      console.log(`${key}: ${maskSecret(val)}`);
    } else {
      console.log(`${key}: ${val || '(not set)'}`);
    }
    return;
  }

  if (action === 'set') {
    if (!key || value === undefined) {
      console.error('❌ Error: Usage: `nirium config set <key> <value>` (e.g., `nirium config set secretKey S...`)');
      process.exit(1);
    }

    const updatedConfig: NiriumConfig = {
      ...currentConfig,
      [key]: value,
    };
    saveConfig(updatedConfig);
    console.log(`✅ Configuration updated: ${key} set successfully.`);
    return;
  }

  if (action === 'delete' || action === 'remove') {
    if (!key) {
      console.error('❌ Error: Please specify a configuration key to delete.');
      process.exit(1);
    }
    delete (currentConfig as any)[key];
    saveConfig(currentConfig);
    console.log(`✅ Removed ${key} from configuration.`);
    return;
  }

  console.error(`❌ Unknown config action: ${action}. Use set, get, list, or delete.`);
  process.exit(1);
}
