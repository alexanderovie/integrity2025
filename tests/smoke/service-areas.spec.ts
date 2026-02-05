import { test, expect } from '@playwright/test';
import { BASE_URL, SERVICE_AREAS } from '../helpers/constants';

test.describe('Service Area Pages', () => {
  for (const area of SERVICE_AREAS) {
    test(`${area} service area page loads`, async ({ page }) => {
      const url = `${BASE_URL}/service-areas/${area}`;
      await page.goto(url, { waitUntil: 'networkidle' });
      
      await expect(page).not.toHaveTitle(/404|Not Found/);
      
      const pageContent = await page.textContent('body');
      expect(pageContent?.toLowerCase()).toContain(area.toLowerCase());
    });
  }
});
