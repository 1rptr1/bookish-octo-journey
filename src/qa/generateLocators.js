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
      const idSelector = `#${id}`;
      if (isValidSelector(idSelector)) {
        locators.push({
          strategy: "id",
          locator: idSelector,
          confidence: 95
        });
      }
    }

    // 2. Name
    if (name) {
      const nameSelector = `[name="${name}"]`;
      if (isValidSelector(nameSelector)) {
        locators.push({
          strategy: "name",
          locator: nameSelector,
          confidence: 90
        });
      }
    }

    // 3. Label mapping
    if (label) {
      const labelSelector = `//label[normalize-space()="${label}"]/following::*[1]`;
      locators.push({
        strategy: "label",
        locator: labelSelector,
        confidence: 85
      });
    }

    // 4. Text-based (buttons, spans, links)
    if (text && tag !== "input" && text.length < 80) {
      const textSelector = `//*[normalize-space()="${text}"]`;
      locators.push({
        strategy: "text",
        locator: textSelector,
        confidence: 80
      });
    }

    // 5. Class-based unique detection (BULLETPROOF)
    const className = resolveClass(node);
    if (className && className.split(/\s+/).length < 3) {
      const css = "." + className.split(/\s+/).join(".");
      try {
        if (isValidSelector(css) && el.querySelectorAll(css).length === 1) {
          locators.push({
            strategy: "unique-class",
            locator: css,
            confidence: 70
          });
        }
      } catch (e) {
        // Skip invalid CSS selectors
      }
    }

    // 6. XPath Axes (following-sibling, parent, nth-child)
    locators.push({
      strategy: "axes",
      locator: buildAxesXPath(node),
      confidence: 70
    });

    // 7. CSS nth-child fallback (BULLETPROOF)
    const cssPath = getCssPath(node);
    if (isValidSelector(cssPath)) {
      locators.push({
        strategy: "nth-child",
        locator: cssPath,
        confidence: 60
      });
    }

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

// ---------- SAFETY FUNCTIONS ----------
function resolveClass(el) {
  try {
    if (!el.className) return null;
    if (typeof el.className === "string") return el.className;

    // For SVG
    if (el.className.baseVal) return el.className.baseVal;

    return null;
  } catch {
    return null;
  }
}

function isValidSelector(sel) {
  if (!sel) return false;
  if (sel.includes("undefined")) return false;
  if (sel.includes("[object")) return false;

  try {
    document.querySelectorAll(sel);
    return true;
  } catch {
    return false;
  }
}

// ---------- Helper Functions ----------
function getLabel(el) {
  if (!el.id) return null;

  const lbl = el.querySelector(`label[for="${el.id}"]`);
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
