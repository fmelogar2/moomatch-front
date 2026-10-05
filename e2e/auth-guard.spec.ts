import { expect, test } from '@playwright/test';

test.describe('Route guard', () => {
  test('redirects an unauthenticated visitor from a protected route to /login', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('button', { name: 'Access Terminal' })).toBeVisible();
  });

  test('redirects the root path to /login when signed out', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL(/\/login$/);
  });
});
