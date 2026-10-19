import { expect, test } from '@playwright/test';

test('renders Reference Data through the federated remote entry', async ({ page }) => {
  const consoleErrors: string[] = [];
  const remoteEntries: { url: string; status: number }[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));
  page.on('response', (response) => {
    if (response.url().includes('referenceDataMfe') || response.url().includes('remoteEntry.js')) {
      remoteEntries.push({ url: response.url(), status: response.status() });
    }
  });

  await page.goto('/reference-data/datos-referencia');

  const remote = page.locator('[data-mfe="reference-data"]');
  await expect(remote).toBeVisible();
  await expect(remote.getByRole('heading', { level: 1 })).toContainText(/Parametrizaci.n/i);
  expect(remoteEntries.some((entry) => entry.url.includes('localhost:5105/remoteEntry.js') && entry.status === 200)).toBe(true);
  expect(consoleErrors.filter((error) => /cors|invalid hook call|remoteentry|federation/i.test(error))).toEqual([]);
});
