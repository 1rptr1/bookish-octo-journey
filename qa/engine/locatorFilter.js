export function filterLocators(elements) {
  const results = [];

  for (const el of elements) {
    // 1. ID Based (strongest)
    if (el.id) {
      results.push({
        element: el.tag,
        id: el.id,
        label: el.label ?? null,
        locator: `$("#${el.id}")`,
        confidence: 95
      });
      continue;
    }

    // 2. Label based
    if (el.label) {
      results.push({
        element: el.tag,
        id: null,
        label: el.label,
        locator: `//label[normalize-space(text())="${el.label}"]/following::*[1]`,
        confidence: 90
      });
    }

    // 3. Class based
    if (el.className) {
      const firstClass = el.className.split(" ")[0];
      results.push({
        element: el.tag,
        id: null,
        label: el.label ?? null,
        locator: `//${el.tag}[contains(@class,"${firstClass}")]`,
        confidence: 75
      });
    }

    // 4. Text based (buttons, labels, spans)
    if (el.text && el.text.trim() !== "") {
      const clean = el.text.trim();
      if (clean.length <= 40) {
        results.push({
          element: el.tag,
          id: null,
          label: null,
          locator: `//${el.tag}[normalize-space(text())="${clean}"]`,
          confidence: 70
        });
      }
    }

    // 5. Generic fallback
    results.push({
      element: el.tag,
      id: null,
      label: el.label ?? null,
      locator: `(//${el.tag})[1]`,
      confidence: 40
    });
  }

  return results;
}
