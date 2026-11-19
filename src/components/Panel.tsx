import type { ReactNode } from 'react';
import { useRefraction } from '../hooks/useRefraction';

interface PanelProps {
  title: string;
  eyebrow: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function Panel({
  title,
  eyebrow,
  children,
  action,
  className = '',
}: PanelProps) {
  const [ref, refraction] = useRefraction<HTMLElement>();
  return (
    <section ref={ref} className={`panel glass ${className}`}>
      {refraction}
      <div className="panel-heading">
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h2>{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
