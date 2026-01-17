console.log("Content script loaded. Waiting for QA trigger…");

// Store selected element for extraction
let qaSelectedElement = null;

// Element picker functionality
document.addEventListener("click", e => {
  if (!window.qaPicking) return;

  e.preventDefault();
  e.stopPropagation();

  qaSelectedElement = e.target;
  window.qaPicking = false;

  highlight(qaSelectedElement);
});

// Highlight selected element
function highlight(element) {
  // Remove previous highlights
  document.querySelectorAll('.qa-highlighted').forEach(el => {
    el.classList.remove('qa-highlighted');
  });
  
  // Add highlight to selected element
  element.classList.add('qa-highlighted');
}

// Add highlight styles
const style = document.createElement('style');
style.textContent = `
  .qa-highlighted {
    outline: 3px solid #4CAF50 !important;
    background-color: rgba(76, 175, 80, 0.1) !important;
    box-shadow: 0 0 5px rgba(76, 175, 80, 0.3) !important;
  }
`;
document.head.appendChild(style);

// Message listeners
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "qa-enable-picker") {
    window.qaPicking = true;
    console.log("Element picker enabled - click any element to select it");
  }

  if (msg.action === "qa-extract") {
    if (!qaSelectedElement) {
      alert("Pick an element first.");
      return;
    }

    const extracted = window.__extractElement(qaSelectedElement);

    chrome.runtime.sendMessage({
      action: "qa-output",
      data: extracted
    });
  }
  
  // Keep existing functionality
  if (msg.action === "START_QA_ANALYSIS") {
    console.log("%cStarting QA Mode Analysis…", "color: green;");
    startAnalysisSafely();
  }
  
  if (msg.action === "run-extraction") {
    console.log("%cRunning QA Extraction…", "color: blue;");
    runExtraction();
  }
});


// =========================================================
// EXTRACTION FUNCTION
// =========================================================
function runExtraction() {
  const selected = window.__qaSelectedElement;
  if (!selected) {
    chrome.runtime.sendMessage({
      action: "qa-output",
      data: { error: "No element selected! Ctrl+Click to select an element first." }
    });
    return;
  }

  // Process selected element
  const result = processElement(selected);
  console.log("Extraction Result:", result);

  // Send result to popup
  chrome.runtime.sendMessage({
    action: "qa-output",
    data: result
  });
}

function processElement(element) {
  // Basic element processing
  return {
    tagName: element.tagName.toLowerCase(),
    id: element.id || null,
    className: element.className || null,
    text: element.innerText?.trim() || "",
    attributes: {
      type: element.getAttribute?.("type") || null,
      placeholder: element.getAttribute?.("placeholder") || null,
      name: element.getAttribute?.("name") || null,
      value: element.value || null,
      required: element.hasAttribute?.("required") || false,
      role: element.getAttribute?.("role") || null
    },
    locators: generateLocators(element),
    timestamp: new Date().toISOString()
  };
}

function generateLocators(element) {
  const locators = [];
  
  // ID based
  if (element.id) {
    locators.push({
      type: "css",
      value: `#${element.id}`,
      confidence: 95
    });
  }
  
  // Class based
  if (element.className) {
    const firstClass = element.className.split(" ")[0];
    locators.push({
      type: "css",
      value: `.${firstClass}`,
      confidence: 80
    });
  }
  
  // Tag based fallback
  locators.push({
    type: "xpath",
    value: `//${element.tagName.toLowerCase()}`,
    confidence: 40
  });
  
  return locators;
}

// =========================================================
// SAFE EXECUTION: Prevent issues on SSO/Login/Redirect pages
// =========================================================
function isSSOPage() {
  const url = window.location.href;

  const suspicious = ["login", "auth", "signin", "oauth", "sso"];

  if (suspicious.some((x) => url.toLowerCase().includes(x))) return true;

  if (document.querySelector("input[type='password']")) return true;

  return false;
}


// =========================================================
// MAIN SAFE ANALYSIS FUNCTION
// =========================================================
async function startAnalysisSafely() {
  try {
    if (isSSOPage()) {
      return chrome.runtime.sendMessage({
        action: "QA_RESULTS",
        payload: {
          error: "SSO/Login flow detected. QA mode disabled on this page."
        }
      });
    }

    // Extract DOM using new recursive extractor
    const pageDOM = document.body;
    const nodes = extractDOM(pageDOM);
    
    // Apply locator filter for better fallback handling
    const filteredLocators = filterLocators(nodes);

    // Optional: highlight elements for UX
    highlightElements(filteredLocators);

    chrome.runtime.sendMessage({
      action: "QA_RESULTS",
      payload: {
        elements: nodes,
        locators: filteredLocators
      }
    });

  } catch (err) {
    chrome.runtime.sendMessage({
      action: "QA_RESULTS",
      payload: { error: "Analysis failed " + err }
    });
  }
}


// =========================================================
// LOCATOR FILTER FUNCTION
// =========================================================
function filterLocators(elements) {
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

// =========================================================
// QA MODE IMPLEMENTATION (inline for now)
// =========================================================
function extractDOM(root) {
  const output = [];

  function walk(node, shadowPath = []) {
    if (!node) return;

    const isShadow = node instanceof ShadowRoot;
    if (isShadow) {
      [...node.childNodes].forEach(child => walk(child, shadowPath));
      return;
    }

    if (node.nodeType === 1) {
      const tag = node.tagName.toLowerCase();

      const record = {
        tag,
        id: node.id || null,
        className: node.className || null,
        type: node.getAttribute?.("type") || null,
        required: node.hasAttribute?.("required") || false,
        role: node.getAttribute?.("role") || null,
        placeholder: node.getAttribute?.("placeholder") || null,
        ariaLabel: node.getAttribute?.("aria-label") || null,
        label: null,
        text: node.innerText?.trim() || "",
        shadowPath: [...shadowPath]
      };

      // Label → input binding
      if (tag === "label") {
        record.label = node.innerText.trim();
      }

      // Shadow host
      if (node.shadowRoot) {
        output.push(record);
        [...node.shadowRoot.childNodes].forEach(child =>
          walk(child, [...shadowPath, tag])
        );
      }

      output.push(record);
    }

    [...node.children].forEach(child => walk(child, shadowPath));
  }

  walk(root);
  return output;
}

function generateXPathFor(element) {
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

function runQAMode(pageDOM) {
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

function highlightElements(locators) {
  // Optional: highlight elements with high confidence locators
  locators
    .filter(loc => loc.confidence >= 75) // Lower threshold for better coverage
    .slice(0, 15) // Increase limit for more elements
    .forEach(loc => {
      try {
        let element;
        
        // Handle different locator types
        if (loc.locator.startsWith("$")) {
          // CSS selector
          const cssSelector = loc.locator.replace("$", "");
          element = document.querySelector(cssSelector);
        } else if (loc.locator.startsWith("//")) {
          // XPath selector
          const elements = document.evaluate(loc.locator, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
          element = elements.singleNodeValue;
        }
        
        if (element) {
          element.style.border = "2px solid #4CAF50";
          element.style.backgroundColor = "rgba(76, 175, 80, 0.1)";
          element.style.boxShadow = "0 0 5px rgba(76, 175, 80, 0.3)";
        }
      } catch (e) {
        // Ignore selector evaluation errors
        console.warn("Failed to highlight element:", e.message);
      }
    });
}
