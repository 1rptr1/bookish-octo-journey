export async function captureSelection(page) {
  return await page.evaluate(() => {
    function getShadowPath(el) {
      const path = [];
      let current = el;

      while (current) {
        if (current.parentNode instanceof ShadowRoot) {
          const host = current.parentNode.host;
          path.unshift({
            type: 'shadow-host',
            tag: host.tagName.toLowerCase(),
            id: host.id || null,
            className: host.className || null
          });
          current = host;
        } else {
          current = current.parentNode;
        }
      }

      return path;
    }

    function getCss(el) {
      if (el.id) return `#${el.id}`;
      if (el.className) {
        const cls = String(el.className)
          .trim()
          .split(/\s+/)
          .filter(Boolean)
          .join('.');
        if (cls) return `${el.tagName.toLowerCase()}.${cls}`;
      }
      return el.tagName.toLowerCase();
    }

    function getLabelText(el) {
      const ariaLabel = el.getAttribute?.('aria-label');
      if (ariaLabel && ariaLabel.trim()) return ariaLabel.trim();

      const labelledBy = el.getAttribute?.('aria-labelledby');
      if (labelledBy) {
        const labelEl = document.getElementById(labelledBy);
        const txt = labelEl?.innerText?.trim();
        if (txt) return txt;
      }

      if (el.id) {
        const labelEl = document.querySelector(`label[for="${el.id}"]`);
        const txt = labelEl?.innerText?.trim();
        if (txt) return txt;
      }

      const wrappedLabel = el.closest?.('label');
      const wrappedTxt = wrappedLabel?.innerText?.trim();
      if (wrappedTxt) return wrappedTxt;

      return null;
    }

    function serializeElement(el) {
      return {
        tag: el.tagName.toLowerCase(),
        id: el.id || null,
        className: el.className || null,
        type: el.type || null,
        required: Boolean(el.required || el.hasAttribute?.('required')),
        label: getLabelText(el),
        role: el.getAttribute?.('role') || null,
        text: el.innerText?.slice(0, 100) || ''
      };
    }

    return new Promise(resolve => {
      document.addEventListener(
        'click',
        e => {
          e.preventDefault();
          e.stopPropagation();

          const el = e.target;

          const scopeEls = [el, ...Array.from(el.querySelectorAll('*'))];
          const serializedScope = scopeEls.map(serializeElement);

          resolve({
            tag: el.tagName.toLowerCase(),
            css: getCss(el),
            shadowPath: getShadowPath(el),
            text: el.innerText?.slice(0, 100) || '',
            elements: serializedScope
          });
        },
        { once: true, capture: true }
      );
    });
  });
}
