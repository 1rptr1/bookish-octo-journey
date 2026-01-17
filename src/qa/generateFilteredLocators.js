import { generateLocators } from "./generateLocators.js";

export function buildFilteredLocators(selection) {
  console.log("Running NEW locator engine!");
  
  const list = generateLocators(selection);

  // Choose the cleanest locator per element
  return list.map(item => {
    const best = item.locators.sort((a, b) => b.confidence - a.confidence)[0];

    return {
      element: item.element,
      id: item.id,
      label: item.label,
      text: item.text,
      locator: best.locator,
      confidence: best.confidence
    };
  });
}
