// recursiveExtractor.js
// Full DOM extraction with:
// - Deep recursion
// - Shadow DOM detection
// - Label → Input mapping
// - Normalized element metadata

export function extractDOM(root) {
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
