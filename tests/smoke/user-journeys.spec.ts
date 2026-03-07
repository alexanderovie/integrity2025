import { expect, test, type Page } from '@playwright/test';
import { BASE_URL } from '../helpers/constants';

const dismissCookieBannerIfPresent = async (page: Page): Promise<void> => {
  const rejectButton = page.getByRole('button', { name: /^Reject$/i });
  if (await rejectButton.isVisible({ timeout: 1500 }).catch(() => false)) {
    await rejectButton.click({ force: true });
  }
};

test.describe('Core User Journeys', () => {
  test('homepage CTA routes to quote flow', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await dismissCookieBannerIfPresent(page);

    await page.getByRole('link', { name: 'Get Your Free Quote' }).click();

    await expect(page).toHaveURL(/\/quote\//);
    await expect(page.locator('#quote-book-form')).toBeVisible();
  });

  test('header quote CTA routes to quote flow', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await dismissCookieBannerIfPresent(page);

    await page.getByRole('link', { name: 'Get a Quote' }).first().click();

    await expect(page).toHaveURL(/\/quote\//);
    await expect(page.locator('#quote-book-form')).toBeVisible();
  });

  test('site visit modal completes two-step flow and routes to quote service URL', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE_URL}/services/commercial-cleaning`, { waitUntil: 'domcontentloaded' });
    await dismissCookieBannerIfPresent(page);

    await page.getByRole('button', { name: 'Request a Site Visit' }).click();

    const modal = page.getByRole('dialog').first();
    await expect(modal).toBeVisible();
    await expect(modal.getByRole('heading', { name: 'Plan Your Site Visit' })).toBeVisible();

    await modal.getByLabel('Full name').fill('Smoke User');
    await modal.getByLabel('Phone number').fill('8009300532');
    await modal.getByLabel('Email address').fill('smoke@example.com');
    await modal.getByRole('button', { name: 'Continue' }).click();

    await expect(modal.getByRole('heading', { name: 'Schedule Your Visit' })).toBeVisible();
    await modal.getByLabel('Service Date').fill('2026-03-15');
    await modal.getByLabel('Time Slot').selectOption('morning');
    await modal.getByRole('button', { name: 'Request a Site Visit' }).click();

    await expect(page).toHaveURL(/\/quote\/commercial-cleaning/);
  });

  test('blog listing opens a post detail page', async ({ page }) => {
    await page.goto(`${BASE_URL}/blog`, { waitUntil: 'domcontentloaded' });
    await dismissCookieBannerIfPresent(page);

    const firstPostLink = page.locator('a[href^="/blog/"]').first();
    await expect(firstPostLink).toBeVisible();
    await firstPostLink.click();

    await expect(page).toHaveURL(/\/blog\/[^/]+$/);
  });

  test('footer legal links open terms, privacy and cookie pages', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await dismissCookieBannerIfPresent(page);
    const footer = page.locator('footer, [role="contentinfo"]').first();

    await expect(footer.locator('a[href="/terms-and-conditions"]').first()).toBeVisible();
    await expect(footer.locator('a[href="/privacy-policy"]').first()).toBeVisible();
    await expect(footer.locator('a[href="/cookie-policy"]').first()).toBeVisible();

    await page.goto(`${BASE_URL}/terms-and-conditions`, { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/terms-and-conditions$/);

    await page.goto(`${BASE_URL}/privacy-policy`, { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/privacy-policy$/);

    await page.goto(`${BASE_URL}/cookie-policy`, { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/cookie-policy$/);
  });
});
