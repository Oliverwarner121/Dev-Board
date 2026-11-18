import { describe, expect, it } from 'vitest';
import { buildMonth, greetingFor } from './calendar';

describe('buildMonth', () => {
  it('pads weeks so Monday is the first column', () => {
    // 1 November 2026 is a Sunday.
    const weeks = buildMonth(2026, 10);
    expect(weeks[0]).toEqual([null, null, null, null, null, null, 1]);
    expect(weeks.at(-1)?.filter(Boolean).at(-1)).toBe(30);
    expect(weeks.every((week) => week.length === 7)).toBe(true);
  });

  it('handles leap years', () => {
    expect(buildMonth(2028, 1).flat().filter(Boolean)).toHaveLength(29);
  });
});

describe('greetingFor', () => {
  it('follows the time of day', () => {
    expect(greetingFor(8)).toBe('Good morning');
    expect(greetingFor(14)).toBe('Good afternoon');
    expect(greetingFor(21)).toBe('Good evening');
  });
});
