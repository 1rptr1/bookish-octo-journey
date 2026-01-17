// Import the comprehensive locator generator
// This will be bundled or injected for production use

window.__extractElement = function (el) {
  // Use the new comprehensive locator generator
  const locators = window.__generateLocators ? 
    window.__generateLocators(document.body) : 
    generateFallbackLocators(el);
  
  // Extract element details
  const elementDetails = {
    tagName: el.tagName.toLowerCase(),
    id: el.id || null,
    className: el.className || null,
    name: el.getAttribute("name") || null,
    type: el.getAttribute("type") || null,
    text: (el.textContent || "").trim().replace(/\s+/g, " "),
    placeholder: el.getAttribute("placeholder") || null,
    required: el.hasAttribute("required") || false,
    role: el.getAttribute("role") || null
  };
  
  // Find locators for this specific element
  const elementLocators = locators.find(item => 
    item.element === elementDetails.tagName && 
    (item.id === elementDetails.id || 
     item.text === elementDetails.text ||
     item.label === getLabelForElement(el))
  );
  
  return {
    selection: elementDetails,
    locators: elementLocators ? elementLocators.locators : generateFallbackLocators(el),
    allLocators: locators,
    timestamp: new Date().toISOString()
  };
};

// Fallback locator generation for individual elements
function generateFallbackLocators(el) {
  const locators = [];
  const tag = el.tagName.toLowerCase();
  
  // ID based
  if (el.id) {
    locators.push({
      strategy: "id",
      locator: `#${el.id}`,
      confidence: 95
    });
  }
  
  // Name based
  if (el.getAttribute("name")) {
    locators.push({
      strategy: "name",
      locator: `[name="${el.getAttribute("name")}"]`,
      confidence: 90
    });
  }
  
  // Class based
  if (el.className) {
    locators.push({
      strategy: "class",
      locator: `.${el.className.split(" ").join(".")}`,
      confidence: 80
    });
  }
  
  // Tag fallback
  locators.push({
    strategy: "tag",
    locator: tag,
    confidence: 40
  });
  
  return locators;
}

function getLabelForElement(el) {
  if (!el.id) return null;
  const lbl = document.querySelector(`label[for="${el.id}"]`);
  return lbl ? lbl.textContent.trim() : null;
}

// Inline version of the locator generator for immediate use (BULLETPROOF)
window.__generateLocators = function(el) {
  const results = [];
  const getText = e => (e.textContent || "").trim().replace(/\s+/g, " ");
  const all = el.querySelectorAll("*");

  all.forEach(node => {
    const tag = node.tagName.toLowerCase();
    const id = node.id || null;
    const name = node.getAttribute("name");
    const type = node.getAttribute("type");
    const label = getLabelForElement(node);
    const text = getText(node);

    let locators = [];

    // 1. ID based (BULLETPROOF)
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

    // 2. Name (BULLETPROOF)
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
        if (isValidSelector(css) && document.querySelectorAll(css).length === 1) {
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
};

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
  const index = [...node.parentNode.children].indexOf(node) + 1;
  return buildDomXPath(node.parentNode) + "/" + node.tagName.toLowerCase() + `[${index}]`;
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
