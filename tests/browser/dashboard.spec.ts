import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    let requests = 0;
    Object.defineProperty(window, '__TAURI_INTERNALS__', {
      value: {
        invoke: async (command: string) => {
          if (command !== 'get_system_snapshot') {
            throw new Error(`Unexpected command: ${command}`);
          }
          requests += 1;
          if (requests === 3) throw new Error('Test collector unavailable');
          return {
            cpuUsage: requests === 1 ? 34 : 51,
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
  await page.clock.install({ time: new Date('2026-01-01T09:00:00Z') });
  await page.clock.pauseAt(new Date('2026-01-01T09:00:01Z'));
  await page.goto('/');
  await expect(page.getByText('34%', { exact: true })).toBeVisible();
});

test('renders metrics and glass surfaces without clipping', async ({
  page,
}, testInfo) => {
  for (const title of ['CPU usage', 'Memory', 'Storage', 'Uptime']) {
    await expect(
      page.getByRole('heading', { name: title, exact: true }),
    ).toBeVisible();
  }
  await expect(
    page.getByText('18.4 GB / 32 GB', { exact: true }),
  ).toBeVisible();
  await expect(page.getByText('3h 42m', { exact: true })).toBeVisible();
  const layout = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('.widget')];
    return {
      overflowing: document.documentElement.scrollWidth > window.innerWidth,
      clippedCards: cards.some((card) => card.scrollWidth > card.clientWidth),
      columns: getComputedStyle(
        document.querySelector('.widget-grid')!,
      ).gridTemplateColumns.split(' ').length,
      blur: getComputedStyle(cards[0]).backdropFilter,
    };
  });
  expect(layout.overflowing).toBe(false);
  expect(layout.clippedCards).toBe(false);
  expect(layout.columns).toBe(testInfo.project.name === 'desktop' ? 4 : 1);
  expect(layout.blur).toContain('blur(');
  await testInfo.attach('dashboard', {
    body: await page.screenshot({ fullPage: true, animations: 'disabled' }),
    contentType: 'image/png',
  });
});

test('refreshes metrics, shows failures, and recovers using the keyboard', async ({
  page,
}) => {
  const refresh = page.getByRole('button', { name: 'Refresh system metrics' });
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
