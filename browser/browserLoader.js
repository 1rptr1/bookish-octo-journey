import puppeteer from "puppeteer";
import { getQAScript } from "../qa/qa-mode.js";
import { getOverlayScript } from "../qa/overlay-ui.js";

export async function loadPage(url, flags) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: "networkidle2" });

  // Inject scripts
  if (flags.qa) {
    await page.evaluate(getQAScript());
    await page.evaluate(getOverlayScript());
  }

  return { browser, page };
}
