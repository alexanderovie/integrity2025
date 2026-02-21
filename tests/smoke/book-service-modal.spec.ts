import { test, expect, type Page } from '@playwright/test';
import { BASE_URL } from '../helpers/constants';

test.describe('Book Service Modal E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  });

  const openBookServiceModal = async (page: Page) => {
    await page.locator('button:has(img[alt="menu-icon"])').first().click();
    await page.getByRole('button', { name: /book a service/i }).click();
    return page.getByRole('dialog').first();
  };

  test('step 1 keeps Continue disabled until valid inputs', async ({ page }) => {
    const modal = await openBookServiceModal(page);
    await expect(modal).toBeVisible();

    const continueButton = modal.getByRole('button', { name: 'Continue' });
    await expect(continueButton).toBeDisabled();

    await modal.getByLabel('Full name').fill('Smoke User');
    await modal.getByLabel('Phone number').fill('8009300532');
    await modal.getByLabel('Email address').fill('alexanderovie@gmail.com');

    await expect(continueButton).toBeEnabled();
  });

  test('selected service in step 2 routes to matching quote URL', async ({ page }) => {
    const modal = await openBookServiceModal(page);
    await expect(modal).toBeVisible();

    await modal.getByLabel('Full name').fill('Smoke User');
    await modal.getByLabel('Phone number').fill('8009300532');
    await modal.getByLabel('Email address').fill('alexanderovie@gmail.com');
    await modal.getByRole('button', { name: 'Continue' }).click();

    await modal.locator('#svc-deep-cleaning').check();
    await expect(modal.locator('#svc-deep-cleaning')).toBeChecked();

    await modal.getByRole('button', { name: /get started today/i }).click();
    await expect(page).toHaveURL(/\/quote\/deep-cleaning/);
  });
});
