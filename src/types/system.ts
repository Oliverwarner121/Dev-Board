export interface SystemSnapshot {
  cpuUsage: number;
  memory: { usedBytes: number; totalBytes: number };
  disk: { usedBytes: number; totalBytes: number };
  uptimeSeconds: number;
}

export type SnapshotState =
  | { status: 'loading' }
  | { status: 'ready'; data: SystemSnapshot }
  | { status: 'unavailable'; message: string };
