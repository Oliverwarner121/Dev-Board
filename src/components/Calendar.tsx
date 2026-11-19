import { useState } from 'react';
import { buildMonth } from '../utils/calendar';
import { Panel } from './Panel';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function Calendar({ today }: { today: Date }) {
  const [offset, setOffset] = useState(0);
  const shown = new Date(today.getFullYear(), today.getMonth() + offset, 1);
  const weeks = buildMonth(shown.getFullYear(), shown.getMonth());
  const isCurrentMonth = offset === 0;

  return (
    <Panel
      title={shown.toLocaleDateString([], { month: 'long', year: 'numeric' })}
      eyebrow="CALENDAR"
      action={
        <div className="calendar-nav">
          <button
            type="button"
            className="glass-lite glass-interactive"
            aria-label="Previous month"
            onClick={() => setOffset(offset - 1)}
          >
            ‹
          </button>
          <button
            type="button"
            className="glass-lite glass-interactive"
            aria-label="Current month"
            disabled={isCurrentMonth}
            onClick={() => setOffset(0)}
          >
            ●
          </button>
          <button
            type="button"
            className="glass-lite glass-interactive"
            aria-label="Next month"
            onClick={() => setOffset(offset + 1)}
          >
            ›
          </button>
        </div>
      }
    >
      <table className="calendar">
        <thead>
          <tr>
            {WEEKDAYS.map((day) => (
              <th key={day} scope="col">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, index) => (
            <tr key={index}>
              {week.map((day, column) => (
                <td key={column}>
                  {day && (
                    <span
                      className={
                        isCurrentMonth && day === today.getDate()
                          ? 'day today glass-lite glass-tint'
                          : 'day'
                      }
                      aria-current={
                        isCurrentMonth && day === today.getDate()
                          ? 'date'
                          : undefined
                      }
                    >
                      {day}
                    </span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}
