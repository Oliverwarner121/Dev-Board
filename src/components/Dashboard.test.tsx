import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Dashboard } from './Dashboard';

const services = vi.hoisted(() => ({
  launchShortcut: vi.fn().mockResolvedValue(undefined),
  openProject: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../services/system', () => ({
  getSystemSnapshot: vi.fn().mockResolvedValue({
    cpuUsage: 34,
    memory: { usedBytes: 18.4 * 1024 ** 3, totalBytes: 32 * 1024 ** 3 },
    disk: { usedBytes: 682 * 1024 ** 3, totalBytes: 1000 * 1024 ** 3 },
    uptimeSeconds: 3 * 60 * 60 + 42 * 60,
  }),
}));

vi.mock('../services/launcher', () => ({
  listProjects: vi.fn().mockResolvedValue({
    windows: { projects: ['Dev-Board'], error: null },
    wsl: { projects: ['GetActive'], error: null },
  }),
  launchShortcut: services.launchShortcut,
  openProject: services.openProject,
}));

vi.mock('../services/weather', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../services/weather')>()),
  getWeather: vi.fn().mockResolvedValue({
    temperature: 10.8,
    feelsLike: 7.7,
    weatherCode: 3,
    windMph: 11.6,
    isDay: true,
    high: 12,
    low: 6.7,
    hourly: Array.from({ length: 24 }, (_, hour) => ({
      hour,
      temperature: 8,
      weatherCode: 3,
      isDay: hour > 6 && hour < 18,
      rainChance: 10,
    })),
  }),
}));

describe('Dashboard', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders vitals, weather, calendar, shortcuts and projects', async () => {
    render(<Dashboard />);
    expect(await screen.findByText('34%')).toBeInTheDocument();
    expect(screen.getByText('18.4 GB')).toBeInTheDocument();
    expect(screen.getByText('3h 42m')).toBeInTheDocument();
    expect(screen.getByText('SYSTEM MONITORING ACTIVE')).toBeInTheDocument();
    expect(await screen.findAllByText('11°C')).toHaveLength(2);
    expect(screen.getByText('Wheatley')).toBeInTheDocument();
    expect(screen.getByText('Wotton-under-Edge')).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
    for (const name of [
      /Outlook/,
      /Postman/,
      /HTTP Toolkit/,
      /Firefox/,
      /Vercel/,
      /Contentstack/,
    ]) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument();
    }
    expect(screen.queryByRole('button', { name: /Figma/ })).toBeNull();
    expect(
      await screen.findByRole('button', { name: /GetActive/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Dev-Board/ }),
    ).toBeInTheDocument();
  });

  it('launches shortcuts and opens projects in their own location', async () => {
    const user = userEvent.setup();
    render(<Dashboard />);
    await user.click(
      await screen.findByRole('button', { name: /VS Code Agents/ }),
    );
    expect(services.launchShortcut).toHaveBeenCalledWith('vscode-agents');
    await user.click(await screen.findByRole('button', { name: /GetActive/ }));
    expect(services.openProject).toHaveBeenCalledWith('wsl', 'GetActive');
    await user.click(screen.getByRole('button', { name: /Dev-Board/ }));
    expect(services.openProject).toHaveBeenCalledWith('windows', 'Dev-Board');
  });
});
