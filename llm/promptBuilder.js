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
