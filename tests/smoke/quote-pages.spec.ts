import { test, expect } from '@playwright/test';
import { BASE_URL, SERVICES } from '../helpers/constants';

test.describe('Quote Pages (Friendly URLs)', () => {
  for (const slug of SERVICES.slice(0, 5)) {
    test(`${slug} quote page loads with form`, async ({ page }) => {
      const url = `${BASE_URL}/quote/${slug}`;
      await page.goto(url, { waitUntil: 'networkidle' });
      
      await expect(page).not.toHaveTitle(/404|Not Found/);
      await expect(page.locator('#quote-book-form')).toBeVisible();
    });
  }
});
