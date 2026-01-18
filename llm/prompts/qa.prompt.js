export const qaPromptTemplate = ({
    url,
    domJSON,
    signalsJSON,
    locatorsJSON,
    tcJSON
}) => `
You are an expert QA engineer.

Analyze the following webpage:
URL: ${url}

DOM: ${domJSON}
Extracted Signals: ${signalsJSON}
Locators: ${locatorsJSON}
TestCases: ${tcJSON}

TASK:
1. Improve locators using XPath, CSS, Shadow DOM path, Axes, Best Practices.
2. Fix missing or incorrect locators.
3. Expand test cases with:
   - happy paths
   - negative scenarios
   - edge cases
   - accessibility checks
4. Add insights like missing validation, UX issues, broken hierarchy.

Respond in JSON only:
{
 "locators": [...],
 "testcases": [...],
 "insights": [...]
}
`;
