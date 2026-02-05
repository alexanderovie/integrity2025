import { test, expect } from '@playwright/test';
import { BASE_URL, EXPECTED_TITLES, REQUIRED_CONTENT } from '../helpers/constants';

test.describe('Static Pages', () => {
  test('Homepage loads and has correct title', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page).toHaveTitle(EXPECTED_TITLES.home);
  });

  test('Homepage contains required content', async ({ page }) => {
    await page.goto(BASE_URL);
    const body = (await page.textContent('body'))?.toLowerCase() || '';
    for (const word of REQUIRED_CONTENT.home) {
      expect(body).toContain(word);
    }
  });

  test('About Us page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/about-us`);
    await expect(page).toHaveTitle(EXPECTED_TITLES.about);
  });

  test('Services page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/services`);
    await expect(page).toHaveTitle(EXPECTED_TITLES.services);
  });

  test('Contact Us page loads with phone', async ({ page }) => {
    await page.goto(`${BASE_URL}/contact-us`);
    await expect(page).toHaveTitle(EXPECTED_TITLES.contact);
    await expect(page.getByRole('link', { name: /\(800\) 930-0532/ })).toBeVisible();
  });

  test('Blog page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/blog`);
    await expect(page).toHaveTitle(EXPECTED_TITLES.blog);
  });

  test('Service Areas page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/service-areas`);
    await expect(page.locator('h1')).toContainText('Orlando');
  });

  test('Feedback page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/feedback`);
    await expect(page.locator('h1')).toContainText('Feedback');
  });

  test('Quote page loads with form', async ({ page }) => {
    await page.goto(`${BASE_URL}/quote`);
    await expect(page).toHaveTitle(EXPECTED_TITLES.quote);
    await expect(page.locator('#quote-book-form')).toBeVisible();
  });

  test('Privacy Policy page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/privacy-policy`);
    await expect(page.locator('h1')).toContainText('Privacy');
  });

  test('Terms & Conditions page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/terms-and-conditions`);
    await expect(page.locator('h1')).toContainText('Terms');
  });

  test('Cookie Policy page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/cookie-policy`);
    await expect(page.locator('h1')).toContainText('Cookie');
  });
});
