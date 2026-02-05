import { test, expect } from '@playwright/test';
import { BASE_URL, SERVICES } from '../helpers/constants';

test.describe('Service Pages', () => {
  for (const slug of SERVICES) {
    test(`${slug} page loads correctly`, async ({ page }) => {
      const url = `${BASE_URL}/services/${slug}`;
      await page.goto(url, { waitUntil: 'networkidle' });
      
      await expect(page).not.toHaveTitle(/404|Page Not Found|Not Found/);
      
      const content = await page.textContent('body');
      expect(content?.toLowerCase()).toContain('cleaning');
    });
  }
});
