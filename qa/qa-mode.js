export function getQAScript() {
  return `
      (function() {
        let selectedElement = null;
        let highlightBox = null;

        // Create QA panel UI (button will come from overlay-ui.js)
        if (!window.__qaPanelAdded) {
          window.__qaPanelAdded = true;
          const panel = document.createElement('div');
          panel.id = 'qa-panel';
          panel.style.cssText = "position:fixed;top:10px;right:10px;background:#1e1e1e;color:#fff;padding:10px;border-radius:6px;z-index:999999;font-family:sans-serif;";
          panel.innerHTML = '<button id="qa-generate-btn" style="padding:6px 12px;border:none;background:#00b4d8;color:#fff;border-radius:4px;cursor:pointer;">Generate QA</button>';
          document.body.appendChild(panel);
        }

        // Highlight hover
        document.addEventListener('mouseover', function(e) {
          if (!highlightBox) {
            highlightBox = document.createElement('div');
            highlightBox.style.position = 'fixed';
            highlightBox.style.border = '2px solid #00b4d8';
            highlightBox.style.pointerEvents = 'none';
            highlightBox.style.zIndex = 999998;
            document.body.appendChild(highlightBox);
          }
          const rect = e.target.getBoundingClientRect();
          highlightBox.style.left = rect.left + 'px';
          highlightBox.style.top = rect.top + 'px';
          highlightBox.style.width = rect.width + 'px';
          highlightBox.style.height = rect.height + 'px';
        });

        // Capture selected element
        document.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          selectedElement = e.target;

          window.__qaSelection = {
            tag: selectedElement.tagName.toLowerCase(),
            outerHTML: selectedElement.outerHTML,
            text: selectedElement.innerText,
            cssPath: getCssPath(selectedElement)
          };

          console.log("Selected:", window.__qaSelection);
        });

        function getCssPath(el) {
          if (!(el instanceof Element)) return "";
          const path = [];
          while (el.nodeType === Node.ELEMENT_NODE) {
            let selector = el.nodeName.toLowerCase();
            if (el.id) {
              selector += "#" + el.id;
              path.unshift(selector);
              break;
            } else {
              path.unshift(selector);
              el = el.parentNode;
            }
          }
          return path.join(" > ");
        }
      })();
    `;
}
