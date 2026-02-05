/**
 * Professional Smoke Tests for Production
 * Uses Playwright for robust E2E testing
 *
 * Install: npm install -D playwright
 * Run: npx playwright install chromium && npx tsx smoke-tests.ts
 */

import { chromium, type Browser, type Page } from "playwright";

const BASE_URL = "https://integritycleansolutions.com";
const API_BASE = `${BASE_URL}/api`;

interface TestResult {
  name: string;
  status: "PASS" | "FAIL" | "SKIP";
  duration: number;
  error?: string;
  details?: string;
}

const results: TestResult[] = [];

async function testPage(
  browser: Browser,
  name: string,
  url: string,
  options: {
    checkTitle?: boolean;
    titleContains?: string;
    checkContent?: string[];
    waitForSelector?: string;
  } = {}
): Promise<TestResult> {
  const start = Date.now();
  const page: Page = await browser.newPage();

  try {
    const response = await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });

    if (response?.status() !== 200) {
      return {
        name,
        status: "FAIL",
        duration: Date.now() - start,
        error: `HTTP ${response?.status()}`,
      };
    }

    if (options.checkTitle && options.titleContains) {
      const title = await page.title();
      if (!title.toLowerCase().includes(options.titleContains.toLowerCase())) {
        return {
          name,
          status: "FAIL",
          duration: Date.now() - start,
          error: `Title mismatch: "${title}"`,
        };
      }
    }

    if (options.checkContent) {
      const bodyText = await page.textContent("body");
      for (const content of options.checkContent) {
        if (!bodyText?.includes(content)) {
          return {
            name,
            status: "FAIL",
            duration: Date.now() - start,
            error: `Missing content: "${content}"`,
          };
        }
      }
    }

    if (options.waitForSelector) {
      await page.waitForSelector(options.waitForSelector, { timeout: 10000 });
    }

    return {
      name,
      status: "PASS",
      duration: Date.now() - start,
    };
  } catch (err) {
    return {
      name,
      status: "FAIL",
      duration: Date.now() - start,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  } finally {
    await page.close();
  }
}

async function testApi(name: string, url: string, expectedStatus = 200): Promise<TestResult> {
  const start = Date.now();
  try {
    const res = await fetch(url);
    if (res.status !== expectedStatus) {
      return { name, status: "FAIL", duration: Date.now() - start, error: `Got ${res.status}` };
    }
    return { name, status: "PASS", duration: Date.now() - start };
  } catch (err) {
    return {
      name,
      status: "FAIL",
      duration: Date.now() - start,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

async function runTests(): Promise<void> {
  console.log("🧪 Integrity Clean Solutions - Professional Smoke Tests");
  console.log("=".repeat(60));

  const browser = await chromium.launch({ headless: true });

  try {
    console.log("\n📄 Testing Static Pages...");
    const staticPages = [
      { name: "Homepage", url: BASE_URL, checkTitle: true, titleContains: "Integrity" },
      { name: "About Us", url: `${BASE_URL}/about-us`, checkContent: ["cleaning", "Orlando"] },
      { name: "Services", url: `${BASE_URL}/services`, checkContent: ["Cleaning"] },
      { name: "Contact Us", url: `${BASE_URL}/contact-us`, checkContent: ["4700 Millenia"] },
      { name: "Blog", url: `${BASE_URL}/blog`, checkContent: ["Cleaning"] },
      { name: "Service Areas", url: `${BASE_URL}/service-areas`, checkContent: ["Orlando"] },
      { name: "Feedback", url: `${BASE_URL}/feedback`, checkContent: ["feedback"] },
      { name: "Quote Page", url: `${BASE_URL}/quote`, waitForSelector: "#quote-book-form" },
    ];

    for (const p of staticPages) {
      results.push(await testPage(browser, p.name, p.url, p));
    }

    console.log("\n🏠 Testing Service Pages...");
    const services = [
      "regular-cleaning",
      "deep-cleaning",
      "move-in-out-cleaning",
      "carpet-cleaning",
      "airbnb-cleaning",
      "commercial-cleaning",
    ];

    for (const slug of services) {
      results.push(
        await testPage(browser, `Service: ${slug}`, `${BASE_URL}/services/${slug}`, {
          checkContent: ["Cleaning"],
        })
      );
    }

    console.log("\n📍 Testing Service Areas...");
    const areas = ["orlando", "kissimmee", "winter-park"];
    for (const area of areas) {
      results.push(
        await testPage(browser, `Area: ${area}`, `${BASE_URL}/service-areas/${area}`, {
          checkContent: ["Cleaning"],
        })
      );
    }

    console.log("\n🔗 Testing Quote URLs (Friendly)...");
    const quoteServices = ["regular-cleaning", "deep-cleaning"];
    for (const slug of quoteServices) {
      results.push(
        await testPage(browser, `Quote: ${slug}`, `${BASE_URL}/quote/${slug}`, {
          waitForSelector: "#quote-book-form",
        })
      );
    }

    console.log("\n🔧 Testing APIs...");
    const apis = [
      ["Catalog API", `${API_BASE}/catalog`],
      ["Addons API", `${API_BASE}/addons`],
      ["Prices API", `${API_BASE}/prices`],
    ];

    for (const [name, url] of apis) {
      results.push(await testApi(name, url));
    }

    console.log("\n📊 Sitemap & SEO...");
    results.push(await testApi("Sitemap", `${BASE_URL}/sitemap.xml`));
    results.push(await testApi("Robots.txt", `${BASE_URL}/robots.txt`));
    results.push(await testApi("Manifest", `${BASE_URL}/manifest.json`));

  } finally {
    await browser.close();
  }

  console.log("\n" + "=".repeat(60));
  console.log("📋 RESULTS");
  console.log("=".repeat(60));

  const passed = results.filter(r => r.status === "PASS").length;
  const failed = results.filter(r => r.status === "FAIL").length;
  const total = results.length;
  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / total;

  console.log(`Total: ${total} | ✅ ${passed} | ❌ ${failed} | ⏱️ ${(avgDuration / 1000).toFixed(2)}s avg\n`);

  const failures = results.filter(r => r.status === "FAIL");
  if (failures.length > 0) {
    console.log("❌ FAILURES:");
    for (const r of failures) {
      console.log(`  • ${r.name}: ${r.error}`);
    }
  }

  console.log("\n" + "=".repeat(60));

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error("Test runner failed:", err);
  process.exit(1);
});
