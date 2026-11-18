import { describe, expect, it } from 'vitest';
import { clampPercent, formatBytes, formatUptime } from './format';

describe('format utilities', () => {
  it('formats byte values using readable units', () => {
    expect(formatBytes(18.4 * 1024 ** 3)).toBe('18.4 GB');
    expect(formatBytes(0)).toBe('0 B');
  });
  it('formats uptime as days or hours and minutes', () => {
    expect(formatUptime(3 * 60 * 60 + 42 * 60)).toBe('3h 42m');
    expect(formatUptime(26 * 60 * 60)).toBe('1d 2h');
  });
  it('keeps percentages within display bounds', () => {
    expect(clampPercent(-2)).toBe(0);
    expect(clampPercent(101)).toBe(100);
    expect(clampPercent(34.6)).toBe(35);
  });
});
