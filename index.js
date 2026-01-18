#!/usr/bin/env node
import { loadPage } from "./browser/browserLoader.js";
import { extractSignals } from './dom/advancedSignalExtractor.js';
import { extractScopedSignals } from './dom/scopedSignalExtractor.js';
import { generateTestCases } from './testcase/advancedTestCaseGenerator.js';
import { generateScopedTestCases } from './testcase/scopedTestCaseGenerator.js';
import { generateLocators } from './locator/selenideLocatorGenerator.js';
import { generateScopedLocators } from './locator/scopedLocatorGenerator.js';
import { filterLocatorsByFields } from './locator/filterLocatorsByFields.js';
import { generateShadowLocator } from './locator/shadowLocatorGenerator.js';
import { injectOverlay } from './ui/injectOverlay.js';
import { captureSelection } from './ui/captureSelection.js';
import { callLocalLLM } from './llm/localLlmClient.js';
import { buildTestCasePrompt } from './llm/promptBuilder.js';
import { runLLM } from './llm/index.js';
import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';

// Load HTML reference for standalone demo
const referenceHTML = fs.readFileSync(
  path.join(process.cwd(), "reference/html/reference-playground.html"),
  "utf8"
);

const url = process.argv[2];
const demoMode = !url || process.argv.includes('--demo');

if (!url && !demoMode) {
  console.error('Usage: node index.js <url>');
  console.error('       node index.js --demo  (run with HTML reference playground)');
  process.exit(1);
}

const qaMode = process.argv.includes('--qa');
const llmMode = process.argv.includes('--llm');

// Handle demo mode
if (demoMode) {
  console.log('🧪 Running in demo mode with HTML reference playground...');
  console.log('✅ HTML reference loaded:', referenceHTML.length, 'characters');
  console.log('📝 Reference contains forms, tables, dynamic elements, shadow DOM, and interactive elements');
  
  console.log('\n🔧 To use the reference playground:');
  console.log('1. Open reference/html/reference-playground.html in your browser');
  console.log('2. Use the CLI with: node index.js <url-to-your-test-page>');
  console.log('3. Or run with QA mode: node index.js <url> --qa');
  process.exit(0);
}

const { browser, page } = await loadPage(url, { qa: qaMode });

try {
  if (qaMode) {
    console.log("Waiting for user trigger...");
    await page.waitForFunction(() => window.__runQAExtraction === true, { timeout: 0 });

    console.log("Trigger received. Collecting selection...");
    const selection = await page.evaluate(() => window.__qaSelection);

    console.log("Selected Element:", selection);
    
    // Continue with DOM extraction and locators
    const locator = generateShadowLocator(selection);
    console.log('Shadow-Aware Locator:', locator);

    const scopedSignals = extractScopedSignals([selection] || []);
    console.log('Scoped Signals:', scopedSignals);

    const scopedTestCases = generateScopedTestCases(scopedSignals);
    console.log('Scoped Test Cases:', JSON.stringify(scopedTestCases, null, 2));

    // Use NEW locator engine - get the actual selected element by CSS selector
    const filteredLocators = await page.evaluate((cssSelector) => {
      // Find the actual selected element using the CSS selector
      const selectedElement = document.querySelector(cssSelector);
      if (!selectedElement) return [];
      
      // Use the new locator engine on the selected element only
      return window.__buildFilteredLocators ? 
        window.__buildFilteredLocators(selectedElement) : 
        [];
    }, selection.cssPath);
    
    console.log('Filtered Locators:', filteredLocators);

    // -------------------------------------
    // LLM Activation Layer
    // -------------------------------------
    const enhanced = await runLLM({
        url,
        dom: selection,
        signals: scopedSignals,
        locators: filteredLocators,
        testcases: scopedTestCases,
        provider: process.env.LLM_PROVIDER || "ollama",
        model: process.env.LLM_MODEL || "qwen2.5"
    });

    console.log("\n==============================");
    console.log("     FINAL QA OUTPUT");
    console.log("==============================\n");

    console.log(JSON.stringify(enhanced, null, 2));
    process.exit();
  } else {
    const signals = await extractSignals(page);
    console.log('DOM Signals:', signals);
    const testCases = generateTestCases(signals);
    console.log('Test Cases:', JSON.stringify(testCases, null, 2));

    if (llmMode) {
      const llmContext = {
        scope: 'Selected Area',
        fields: (signals.fields || []).map(f => ({
          label: f.label,
          type: f.type,
          required: Boolean(f.required)
        })),
        actions: signals.actions || [],
        baseline_test_cases: testCases.map(tc => tc.test_case)
      };

      const prompt = buildTestCasePrompt(llmContext);
      const llmOutput = await callLocalLLM(prompt);

      console.log('LLM YAML Output:', llmOutput);
      try {
        const parsed = yaml.load(llmOutput);
        console.log('LLM Parsed YAML:', parsed);
      } catch (e) {
        console.error('Failed to parse LLM YAML:', e?.message || e);
      }
    }

    const locators = await generateLocators(page);

    console.log('Locators:', locators);
  }
} finally {
  await browser.close();
}
