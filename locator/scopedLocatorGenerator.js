export function generateScopedLocators(elements) {
  const locators = [];

  elements.forEach(el => {
    const tag = el.tag;
    const id = el.id;

    if (!tag) return;
    if (!['input', 'button', 'textarea', 'select', 'a'].includes(tag)) return;

    if (id) {
      locators.push({
        element: tag,
        id,
        label: el.label || null,
        locator: `$("#${id}")`,
        confidence: 95
      });
    }
  });

  return locators;
}
