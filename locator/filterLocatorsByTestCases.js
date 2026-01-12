export function filterLocatorsByTestCases(locators, testCases) {
  const used = new Set();

  testCases.forEach(tc => {
    (tc.steps || []).forEach(step => {
      const stepLower = String(step).toLowerCase();

      locators.forEach(loc => {
        const elementLower = String(loc.element || '').toLowerCase();
        const idLower = String(loc.id || '').toLowerCase();
        const labelLower = String(loc.label || '').toLowerCase();

        if (
          (elementLower && stepLower.includes(elementLower)) ||
          (idLower && stepLower.includes(idLower)) ||
          (labelLower && stepLower.includes(labelLower))
        ) {
          used.add(loc);
        }
      });
    });
  });

  return Array.from(used);
}
