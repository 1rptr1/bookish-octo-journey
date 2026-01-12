import { loadPage } from './browser/browserLoader.js';
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
import yaml from 'js-yaml';

const url = process.argv[2];
if (!url) {
  console.error('Usage: node index.js <url>');
  process.exit(1);
}

const qaMode = process.argv.includes('--qa');
const llmMode = process.argv.includes('--llm');
const { browser, page } = await loadPage(url, { headless: !qaMode });

try {
  if (qaMode) {
    await injectOverlay(page);
    const selection = await captureSelection(page);
    console.log('Selection:', selection);
    const locator = generateShadowLocator(selection);
    console.log('Shadow-Aware Locator:', locator);

    const scopedSignals = extractScopedSignals(selection.elements || []);
    console.log('Scoped Signals:', scopedSignals);

    const scopedTestCases = generateScopedTestCases(scopedSignals);
    console.log('Scoped Test Cases:', JSON.stringify(scopedTestCases, null, 2));

    const scopedLocators = generateScopedLocators(selection.elements || []);
    const filteredLocators = filterLocatorsByFields(
      scopedLocators,
      scopedSignals.fields
    );
    console.log('Filtered Locators:', filteredLocators);
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
