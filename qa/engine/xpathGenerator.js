// xpathGenerator.js
// Generates: ID, class, text, label-relative, axes, indexed locators

export function generateXPathFor(element) {
  const results = [];
  const tag = element.tag?.toLowerCase() || "*";

  // 1. ID based (highest confidence)
  if (element.id) {
    results.push({
      xpath: `//*[@id="${element.id}"]`,
      confidence: 100,
      reason: "Unique ID"
    });
  }

  // 2. Label-based
  if (element.label) {
    results.push({
      xpath: `//label[normalize-space(text())="${element.label}"]/following::*[1][self::${tag}]`,
      confidence: 95,
      reason: "Label association"
    });

    results.push({
      xpath: `//label[contains(., "${element.label}")]/following-sibling::${tag}[1]`,
      confidence: 90,
      reason: "Label following-sibling"
    });
  }

  // 3. Placeholder / aria-label
  if (element.placeholder) {
    results.push({
      xpath: `//${tag}[@placeholder="${element.placeholder}"]`,
      confidence: 90,
      reason: "Placeholder"
    });
  }

  if (element.ariaLabel) {
    results.push({
      xpath: `//${tag}[@aria-label="${element.ariaLabel}"]`,
      confidence: 90,
      reason: "ARIA label"
    });
  }

  // 4. Class-based (first class heuristic)
  const className = element.className?.split(" ")[0];
  if (className) {
    results.push({
      xpath: `//${tag}[contains(@class,"${className}")]`,
      confidence: 80,
      reason: "Class match"
    });
  }

  // 5. Text content
  if (element.text && element.text.length < 40) {
    results.push({
      xpath: `//${tag}[normalize-space(text())="${element.text}"]`,
      confidence: 75,
      reason: "Exact text"
    });
  }

  // 6. Axe-based (parent, ancestor, following, preceding)
  results.push({
    xpath: `//${tag}[parent::*]`,
    confidence: 60,
    reason: "Parent axis"
  });

  results.push({
    xpath: `//${tag}[ancestor::*]`,
    confidence: 60,
    reason: "Ancestor axis"
  });

  results.push({
    xpath: `//${tag}/following-sibling::*`,
    confidence: 55,
    reason: "Following-sibling"
  });

  results.push({
    xpath: `//${tag}/preceding-sibling::*`,
    confidence: 55,
    reason: "Preceding-sibling"
  });

  // 7. Nth-child index (last fallback)
  results.push({
    xpath: `(//${tag})[1]`,
    confidence: 40,
    reason: "Nth child fallback"
  });

  return results;
}
