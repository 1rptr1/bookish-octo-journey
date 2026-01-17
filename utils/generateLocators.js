export function generateLocators(el) {
  const results = [];

  const getText = e => (e.textContent || "").trim().replace(/\s+/g, " ");

  const all = el.querySelectorAll("*");

  all.forEach(node => {
    const tag = node.tagName.toLowerCase();
    const id = node.id || null;
    const name = node.getAttribute("name");
    const type = node.getAttribute("type");
    const label = getLabel(node);
    const text = getText(node);

    let locators = [];

    // 1. ID based
    if (id) {
      locators.push({
        strategy: "id",
        locator: `#${id}`,
        confidence: 95
      });
    }

    // 2. Name
    if (name) {
      locators.push({
        strategy: "name",
        locator: `[name="${name}"]`,
        confidence: 90
      });
    }

    // 3. Label mapping
    if (label) {
      locators.push({
        strategy: "label",
        locator: `//label[normalize-space()="${label}"]/following::*[1]`,
        confidence: 85
      });
    }

    // 4. Text-based (buttons, spans, links)
    if (text && tag !== "input" && text.length < 80) {
      locators.push({
        strategy: "text",
        locator: `//*[normalize-space()="${text}"]`,
        confidence: 80
      });
    }

    // 5. Class-based unique detection
    const className = node.className?.toString().trim();
    if (className && className.split(/\s+/).length < 3) {
      const css = "." + className.split(/\s+/).join(".");
      if (document.querySelectorAll(css).length === 1) {
        locators.push({
          strategy: "unique-class",
          locator: css,
          confidence: 70
        });
      }
    }

    // 6. XPath Axes (following-sibling, parent, nth-child)
    locators.push({
      strategy: "axes",
      locator: buildAxesXPath(node),
      confidence: 70
    });

    // 7. CSS nth-child fallback
    locators.push({
      strategy: "nth-child",
      locator: getCssPath(node),
      confidence: 60
    });

    if (locators.length > 0) {
      results.push({
        element: tag,
        id,
        label,
        text,
        locators
      });
    }
  });

  return results;
}

// ---------- Helper Functions ----------
function getLabel(el) {
  if (!el.id) return null;

  const lbl = document.querySelector(`label[for="${el.id}"]`);
  return lbl ? lbl.textContent.trim() : null;
}

function buildAxesXPath(el) {
  const tag = el.tagName.toLowerCase();
  return [
    `//${tag}[normalize-space()="${el.textContent.trim()}"]`,
    `${buildDomXPath(el)}`,
    `${buildDomXPath(el)}/following-sibling::*[1]`,
    `${buildDomXPath(el)}/preceding-sibling::*[1]`,
    `${buildDomXPath(el)}/parent::*` 
  ];
}

function buildDomXPath(node) {
  if (node.parentNode === document) return "/" + node.tagName.toLowerCase();

  const index =
    [...node.parentNode.children].indexOf(node) + 1;

  return buildDomXPath(node.parentNode) +
    "/" +
    node.tagName.toLowerCase() +
    `[${index}]`;
}

function getCssPath(el) {
  if (!el) return "";
  const stack = [];

  while (el.parentNode) {
    let sel = el.nodeName.toLowerCase();

    if (el.id) {
      sel += `#${el.id}`;
      stack.unshift(sel);
      break;
    }

    let sib = el;
    let nth = 1;
    while ((sib = sib.previousElementSibling)) nth++;

    sel += `:nth-child(${nth})`;
    stack.unshift(sel);

    el = el.parentNode;
  }

  return stack.join(" > ");
}
