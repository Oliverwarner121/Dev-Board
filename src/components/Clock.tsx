import { useNow } from '../hooks/useNow';
import { useRefraction } from '../hooks/useRefraction';

const pad = (value: number) => String(value).padStart(2, '0');

export function Clock() {
  const now = useNow(1000);
  const [ref, refraction] = useRefraction<HTMLElement>();

  return (
    <section ref={ref} className="clock panel glass" aria-label="Clock">
      {refraction}
      <time dateTime={now.toISOString()}>
        <span className="clock-hm">
          {pad(now.getHours())}
          <span className="clock-colon">:</span>
          {pad(now.getMinutes())}
        </span>
        <span className="clock-seconds">{pad(now.getSeconds())}</span>
      </time>
      <p className="clock-date">
        {now.toLocaleDateString([], {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })}
      </p>
    </section>
  );
}
