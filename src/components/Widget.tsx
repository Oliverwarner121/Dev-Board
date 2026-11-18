import type { ReactNode } from 'react';

interface WidgetProps {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  className?: string;
}

export function Widget({
  title,
  eyebrow = 'SYSTEM',
  children,
  className = '',
}: WidgetProps) {
  return (
    <section className={`widget ${className}`}>
      <div className="widget-heading">
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  );
}
