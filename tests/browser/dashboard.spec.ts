import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    let snapshots = 0;
    const calls: unknown[][] = [];
    Object.defineProperty(window, '__calls', { value: calls });
    Object.defineProperty(window, '__TAURI_INTERNALS__', {
      value: {
        invoke: async (command: string, args?: unknown) => {
          if (command === 'list_projects') {
            return {
              windows: { projects: ['Dev-Board', 'Portfolio'], error: null },
              wsl: { projects: ['GetActive'], error: null },
            };
          }
          if (command === 'launch_shortcut' || command === 'open_project') {
            calls.push([command, args]);
            return null;
          }
          if (command !== 'get_system_snapshot') {
            throw new Error(`Unexpected command: ${command}`);
          }
          snapshots += 1;
          if (snapshots === 3) throw new Error('Test collector unavailable');
          return {
            cpuUsage: snapshots === 1 ? 34 : 51,
            memory: {
              usedBytes: 18.4 * 1024 ** 3,
              totalBytes: 32 * 1024 ** 3,
            },
            disk: {
              usedBytes: 682 * 1024 ** 3,
              totalBytes: 1000 * 1024 ** 3,
            },
            uptimeSeconds: 13320,
          };
        },
      },
    });
  });
  await page.route('https://api.open-meteo.com/**', (route) =>
    route.fulfill({
      json: {
        current: {
          temperature_2m: 10.8,
          apparent_temperature: 7.7,
          weather_code: 3,
          wind_speed_10m: 11.6,
          is_day: 1,
        },
        daily: { temperature_2m_max: [12], temperature_2m_min: [6.7] },
        hourly: {
          time: Array.from(
            { length: 24 },
            (_, hour) => `2026-01-01T${String(hour).padStart(2, '0')}:00`,
          ),
          temperature_2m: Array(24).fill(8),
          weather_code: Array(24).fill(3),
          is_day: Array(24).fill(1),
          precipitation_probability: Array(24).fill(10),
        },
      },
    }),
  );
  await page.clock.install({ time: new Date('2026-01-01T09:00:00Z') });
  await page.clock.pauseAt(new Date('2026-01-01T09:00:01Z'));
  await page.goto('/');
  await expect(page.getByText('34%', { exact: true })).toBeVisible();
});

test('renders the glass sections without clipping', async ({
  page,
}, testInfo) => {
  for (const title of [
    'Computer vitals',
    'Weather',
    'Shortcuts',
    'WSL projects',
    'Windows projects',
  ]) {
    await expect(
      page.getByRole('heading', { name: title, exact: true }),
    ).toBeVisible();
  }
  await expect(page.getByText('Wheatley')).toBeVisible();
  await expect(page.getByText('Wotton-under-Edge')).toBeVisible();
  await expect(page.getByText('11°C')).toHaveCount(2);
  await expect(page.getByLabel('Hourly forecast')).toHaveCount(2);
  await expect(page.getByText('SYSTEM MONITORING ACTIVE')).toBeVisible();
  await expect(page.getByText('LOCAL MACHINE')).toHaveCount(0);
  await expect(
    page.getByRole('heading', { name: 'January 2026' }),
  ).toBeVisible();
  await expect(page.getByText('18.4 GB / 32 GB')).toBeVisible();
  await expect(page.getByText('3h 42m', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Portfolio' })).toBeVisible();
  const layout = await page.evaluate(() => {
    const panels = [...document.querySelectorAll('.panel')];
    return {
      overflowing: document.documentElement.scrollWidth > window.innerWidth,
      clippedPanels: panels.some(
        (panel) => panel.scrollWidth > panel.clientWidth,
      ),
      columns: getComputedStyle(
        document.querySelector('.layout')!,
      ).gridTemplateColumns.split(' ').length,
      blur: getComputedStyle(panels[0]).backdropFilter,
    };
  });
  expect(layout.overflowing).toBe(false);
  expect(layout.clippedPanels).toBe(false);
  expect(layout.columns).toBe(testInfo.project.name === 'desktop' ? 2 : 1);
  expect(layout.blur).toContain('blur(');
  await testInfo.attach('dashboard', {
    body: await page.screenshot({ fullPage: true, animations: 'disabled' }),
    contentType: 'image/png',
  });
});

test('shortcuts and projects call the launcher', async ({ page }) => {
  await page.getByRole('button', { name: /Terminal/ }).click();
  await page.getByRole('button', { name: /GetActive/ }).click();
  const calls = await page.evaluate(
    () => (window as unknown as { __calls: unknown[] }).__calls,
  );
  expect(calls).toEqual([
    ['launch_shortcut', { id: 'terminal' }],
    ['open_project', { kind: 'wsl', name: 'GetActive' }],
  ]);
});

test('refreshes metrics, shows failures, and recovers using the keyboard', async ({
  page,
}) => {
  const refresh = page.getByRole('button', { name: 'Refresh dashboard' });
  await page.keyboard.press('Tab');
  await expect(refresh).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByText('51%', { exact: true })).toBeVisible();
  await refresh.click();
  await expect(page.getByRole('alert')).toContainText(
    'Test collector unavailable',
  );
  await refresh.click();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.getByText('51%', { exact: true })).toBeVisible();
});

test('respects reduced transparency and motion preferences', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const client = await page.context().newCDPSession(page);
  await client.send('Emulation.setEmulatedMedia', {
    features: [
      { name: 'prefers-reduced-transparency', value: 'reduce' },
      { name: 'prefers-reduced-motion', value: 'reduce' },
    ],
  });
  const styles = await page.locator('.refresh').evaluate((button) => {
    const style = getComputedStyle(button);
    return {
      blur: style.backdropFilter,
      background: style.backgroundColor,
      transition: style.transitionDuration,
    };
  });
  expect(styles.blur).toBe('none');
  expect(styles.background).toBe('rgb(24, 34, 50)');
  expect(styles.transition).toBe('0s');
});
