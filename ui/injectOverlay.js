export async function injectOverlay(page) {
  await page.evaluate(() => {
    if (window.__qaOverlayInjected) return;
    window.__qaOverlayInjected = true;

    const style = document.createElement('style');
    style.innerHTML = `
      .qa-highlight {
        outline: 2px solid #ff4d4f !important;
        cursor: crosshair !important;
      }
      .qa-popup {
        position: fixed;
        top: 10px;
        right: 10px;
        z-index: 999999;
        background: #111;
        color: #fff;
        padding: 10px;
        font-family: monospace;
        font-size: 12px;
        border-radius: 6px;
        max-width: 40vw;
        max-height: 60vh;
        overflow: auto;
        white-space: pre-wrap;
      }
    `;
    document.head.appendChild(style);

    const popup = document.createElement('div');
    popup.className = 'qa-popup';
    popup.innerText = 'QA Mode: Click an element';
    document.body.appendChild(popup);

    document.addEventListener('mouseover', e => {
      e.target?.classList?.add('qa-highlight');
    });

    document.addEventListener('mouseout', e => {
      e.target?.classList?.remove('qa-highlight');
    });
  });
}
