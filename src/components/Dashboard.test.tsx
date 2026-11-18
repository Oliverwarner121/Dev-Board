import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Dashboard } from './Dashboard';

vi.mock('../services/system', () => ({
  getSystemSnapshot: vi.fn().mockResolvedValue({
    cpuUsage: 34,
    memory: { usedBytes: 18.4 * 1024 ** 3, totalBytes: 32 * 1024 ** 3 },
    disk: { usedBytes: 682 * 1024 ** 3, totalBytes: 1000 * 1024 ** 3 },
    uptimeSeconds: 3 * 60 * 60 + 42 * 60,
  }),
}));

describe('Dashboard', () => {
  it('renders the system metrics after loading', async () => {
    render(<Dashboard />);
    expect(await screen.findByText('34%')).toBeInTheDocument();
    expect(screen.getByText('18.4 GB')).toBeInTheDocument();
    expect(screen.getByText('3h 42m')).toBeInTheDocument();
  });
});
