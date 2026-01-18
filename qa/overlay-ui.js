export function getOverlayScript() {
  return `
      (function() {
        window.__runQAExtraction = false;

        const btn = document.getElementById("qa-generate-btn");
        if (btn) {
          btn.addEventListener("click", () => {
            window.__runQAExtraction = true;
            console.log("QA Trigger Activated");
          });
        }
      })();
    `;
}
