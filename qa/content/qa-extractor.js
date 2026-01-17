export function extractSelection() {
  const selected = window.__qaSelectedElement;
  if (!selected) {
    alert("No element selected yet!");
    return;
  }

  // your existing extraction code:
  const result = processElement(selected);

  console.log("Extraction Result:", result);

  // Optionally show output in popup
  chrome.runtime.sendMessage({
    action: "qa-output",
    data: result
  });
}

function processElement(element) {
  // Basic element processing - can be enhanced
  return {
    tagName: element.tagName.toLowerCase(),
    id: element.id || null,
    className: element.className || null,
    text: element.innerText?.trim() || "",
    attributes: {
      type: element.getAttribute?.("type") || null,
      placeholder: element.getAttribute?.("placeholder") || null,
      name: element.getAttribute?.("name") || null,
      value: element.value || null
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
