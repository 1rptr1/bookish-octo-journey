import { extractDOM } from "./engine/recursiveExtractor.js";
import { generateXPathFor } from "./engine/xpathGenerator.js";

export function runQAMode(pageDOM) {
  const nodes = extractDOM(pageDOM);

  const allLocators = nodes.flatMap(n => {
    const locs = generateXPathFor(n);
    return locs.map(x => ({
      element: n.tag,
      id: n.id,
      label: n.label,
      ...x
    }));
  });

  return {
    elements: nodes,
    locators: allLocators
  };
}
