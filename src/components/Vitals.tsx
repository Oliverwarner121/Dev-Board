import type { SnapshotState } from '../types/system';
import { clampPercent, formatBytes, formatUptime } from '../utils/format';
import { MetricBar } from './MetricBar';
import { Panel } from './Panel';

interface VitalRowProps {
  label: string;
  value: string;
  detail?: string;
  percent?: number;
  tone?: 'blue' | 'purple' | 'green';
}

function VitalRow({
  label,
  value,
  detail,
  percent,
  tone = 'blue',
}: VitalRowProps) {
  return (
    <li className="vital">
      <div className="vital-line">
        <span className="vital-label">{label}</span>
        <span className="vital-value">
          {value}
          {detail && <small> / {detail}</small>}
        </span>
      </div>
      {percent !== undefined && <MetricBar value={percent} tone={tone} />}
    </li>
  );
}

export function Vitals({ snapshot }: { snapshot: SnapshotState }) {
  const data = snapshot.status === 'ready' ? snapshot.data : undefined;
  const memoryPercent = data
    ? (data.memory.usedBytes / data.memory.totalBytes) * 100
    : 0;
  const diskPercent = data
    ? (data.disk.usedBytes / data.disk.totalBytes) * 100
    : 0;

  return (
    <Panel title="Computer vitals" eyebrow="SYSTEM">
      <ul className="vitals">
        <VitalRow
          label="CPU"
          value={data ? `${clampPercent(data.cpuUsage)}%` : '—'}
          percent={data?.cpuUsage ?? 0}
        />
        <VitalRow
          label="Memory"
          value={data ? formatBytes(data.memory.usedBytes) : '—'}
          detail={data ? formatBytes(data.memory.totalBytes, 0) : '—'}
          percent={memoryPercent}
          tone="purple"
        />
        <VitalRow
          label="Storage"
          value={data ? formatBytes(data.disk.usedBytes, 0) : '—'}
          detail={data ? formatBytes(data.disk.totalBytes, 0) : '—'}
          percent={diskPercent}
          tone="green"
        />
        <VitalRow
          label="Uptime"
          value={data ? formatUptime(data.uptimeSeconds) : '—'}
        />
      </ul>
    </Panel>
  );
}
