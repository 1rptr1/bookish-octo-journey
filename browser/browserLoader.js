import { chromium } from 'playwright';

export async function loadPage(url, options = {}) {
  const { headless = true } = options;
  const browser = await chromium.launch({ headless });
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: 'domcontentloaded' });

  return { browser, page };
}
