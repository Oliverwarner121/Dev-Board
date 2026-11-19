interface MetricBarProps {
  value: number;
  tone?: 'blue' | 'purple' | 'green';
}

export function MetricBar({ value, tone = 'blue' }: MetricBarProps) {
  return (
    <div className="metric-track" aria-hidden="true">
      <div
        className={`metric-fill ${tone}`}
        style={{
          transform: `scaleX(${Math.min(100, Math.max(0, value)) / 100})`,
        }}
      />
    </div>
  );
}
