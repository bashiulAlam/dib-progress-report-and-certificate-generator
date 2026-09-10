import fs from 'fs/promises';
import path from 'path';
import { AppConfig } from './types';

const configPath = path.join(process.cwd(), 'data', 'config.json');

export async function getAppConfig(): Promise<AppConfig> {
  try {
    const fileData = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(fileData) as AppConfig;
  } catch (error) {
    throw new Error(`Failed to read configuration file at ${configPath}: ${error}`);
  }
}

export async function saveAppConfig(newConfig: AppConfig): Promise<void> {
  try {
    await fs.writeFile(configPath, JSON.stringify(newConfig, null, 2), 'utf-8');
  } catch (error) {
    throw new Error(`Failed to save configuration file: ${error}`);
  }
}