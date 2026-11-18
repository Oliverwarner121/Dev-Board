import { useEffect, useState } from 'react';
import { useSystemSnapshot } from '../hooks/useSystemSnapshot';
import { clampPercent, formatBytes, formatUptime } from '../utils/format';
import { MetricBar } from './MetricBar';
import { Widget } from './Widget';

function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <time dateTime={now.toISOString()}>
      {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    </time>
  );
}

export function Dashboard() {
  const snapshot = useSystemSnapshot();
  const isReady = snapshot.status === 'ready';
  const data = isReady ? snapshot.data : undefined;
  const memoryPercent = data
    ? (data.memory.usedBytes / data.memory.totalBytes) * 100
    : 0;
  const diskPercent = data
    ? (data.disk.usedBytes / data.disk.totalBytes) * 100
    : 0;

  return (
    <main className="dashboard">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">›_</span>
          <span>DEVBOARD</span>
        </div>
        <div className="topbar-meta">
          <span className="status-dot" /> LOCAL MACHINE{' '}
          <span className="separator">/</span> <Clock />
        </div>
      </header>
      <div className="intro">
        <div>
          <p className="eyebrow">OVERVIEW</p>
          <h1>Good morning, developer.</h1>
          <p className="subtitle">Your workspace at a glance.</p>
        </div>
        <button
          className="refresh"
          onClick={snapshot.refresh}
          type="button"
          aria-label="Refresh system metrics"
        >
          ↻ <span>Refresh</span>
        </button>
      </div>
      {snapshot.status === 'unavailable' && (
        <div className="notice" role="alert">
          {snapshot.message}
        </div>
      )}
      <div className="widget-grid">
        <Widget title="CPU usage">
          <div className="metric-value">
            {data ? `${clampPercent(data.cpuUsage)}%` : '—'}
          </div>
          <MetricBar value={data?.cpuUsage ?? 0} />
          <p className="metric-caption">Current processor load</p>
        </Widget>
        <Widget title="Memory" className="accent-purple">
          <div className="metric-value">
            {data ? formatBytes(data.memory.usedBytes) : '—'}{' '}
            <small>
              / {data ? formatBytes(data.memory.totalBytes, 0) : '—'}
            </small>
          </div>
          <MetricBar value={memoryPercent} tone="purple" />
          <p className="metric-caption">
            {isReady
              ? `${clampPercent(memoryPercent)}% allocated`
              : 'Waiting for system data'}
          </p>
        </Widget>
        <Widget title="Storage" className="accent-green">
          <div className="metric-value">
            {data ? formatBytes(data.disk.usedBytes, 0) : '—'}{' '}
            <small>/ {data ? formatBytes(data.disk.totalBytes, 0) : '—'}</small>
          </div>
          <MetricBar value={diskPercent} tone="green" />
          <p className="metric-caption">
            {isReady
              ? `${clampPercent(diskPercent)}% used on primary disk`
              : 'Waiting for system data'}
          </p>
        </Widget>
        <Widget title="Uptime">
          <div className="metric-value">
            {data ? formatUptime(data.uptimeSeconds) : '—'}
          </div>
          <p className="metric-caption">Since last restart</p>
        </Widget>
      </div>
      <footer className="footer">
        <span>
          <span className="live-dot" /> SYSTEM MONITORING ACTIVE
        </span>
        <span>
          DEVBOARD <strong>v0.1.0</strong>
        </span>
      </footer>
    </main>
  );
}
