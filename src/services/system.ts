import { invoke } from '@tauri-apps/api/core';
import type { SystemSnapshot } from '../types/system';

const browserSnapshot: SystemSnapshot = {
  cpuUsage: 34,
  memory: { usedBytes: 18.4 * 1024 ** 3, totalBytes: 32 * 1024 ** 3 },
  disk: { usedBytes: 682 * 1024 ** 3, totalBytes: 1000 * 1024 ** 3 },
  uptimeSeconds: 3 * 60 * 60 + 42 * 60,
};

export async function getSystemSnapshot(): Promise<SystemSnapshot> {
  try {
    return await invoke<SystemSnapshot>('get_system_snapshot');
  } catch (error) {
    if (import.meta.env.DEV) return browserSnapshot;
    throw new Error(`System metrics unavailable: ${String(error)}`);
  }
}
