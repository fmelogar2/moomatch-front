import { expect, test } from '@playwright/test';

test.describe('Login screen', () => {
  test('renders the sign-in form and SSO options', async ({ page }) => {
    await page.goto('/login');

    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Access Terminal' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continue with Microsoft' })).toBeVisible();
  });

  test('blocks submission when email/password are empty (HTML5 required)', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('button', { name: 'Access Terminal' }).click();

    // A native "required" validation failure keeps us on /login rather than attempting a call.
    await expect(page).toHaveURL(/\/login$/);
    const emailValidity = await page.locator('#email').evaluate((el: HTMLInputElement) => el.validity.valid);
    expect(emailValidity).toBe(false);
  });

  test('shows the invalid-credentials error for a bad real sign-in attempt', async ({ page }) => {
    await page.goto('/login');

    await page.locator('#email').fill('no-such-user@moomatch-e2e.test');
    await page.locator('#password').fill('definitely-wrong-password');
    await page.getByRole('button', { name: 'Access Terminal' }).click();

    await expect(page.getByText('Incorrect email or password.')).toBeVisible({ timeout: 15_000 });
    await expect(page).toHaveURL(/\/login$/);
  });
});
