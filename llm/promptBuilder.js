import fs from "fs";
import path from "path";
import url from "url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export function buildEnhancedPrompt(context, baselineCases) {
  const xpathRef = fs.readFileSync(
    path.join(__dirname, "../../reference/xpath-failsafe-reference.txt"),
    "utf8"
  );

  const testcasePatterns = fs.readFileSync(
    path.join(__dirname, "../../reference/testcase-patterns.txt"),
    "utf8"
  );

  const shadowRef = fs.readFileSync(
    path.join(__dirname, "../../reference/shadowdom-reference.txt"),
    "utf8"
  );

  return `
You MUST follow the following XPath, test-case, and shadow DOM reference patterns:

===== XPATH REFERENCE =====
${xpathRef}

===== TEST CASE PATTERNS =====
${testcasePatterns}

===== SHADOW DOM REFERENCE =====
${shadowRef}

-------------------------------------------------------------
# Current UI Context
Fields:
${context.fields.map(f => `- ${f.label} (${f.type})`).join("\n")}

Actions:
${context.actions.map(a => `- ${a}`).join("\n")}

Baseline Cases:
${baselineCases.map(tc => `- ${tc.title}`).join("\n")}

-------------------------------------------------------------

Generate:
1. Test cases
2. XPath locators using the reference above
3. CSS locators
4. Shadow DOM locators
5. Use XPath axes where possible
`;
}

export function buildTestCasePrompt(context) {
  return `
You are a QA expert.

Based ONLY on the provided data:
- Expand test cases
- Add edge, UX, and security scenarios
- Do NOT invent new fields or buttons
- Do NOT generate locators

Return YAML.

Context:
${JSON.stringify(context, null, 2)}
`;
}
