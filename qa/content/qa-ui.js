export function renderPopup() {
  const container = document.createElement("div");
  container.className = "qa-popup";
  container.innerHTML = `
    <div class="qa-header">QA Mode</div>

    <button id="qa-extract-btn" class="qa-btn">
      Extract Locators & Test Cases
    </button>

    <div id="qa-status" class="qa-status">Waiting for action...</div>
  `;

  document.body.appendChild(container);

  // Attach click handler
  document.getElementById("qa-extract-btn").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "qa-extract-now" });
    document.getElementById("qa-status").textContent = "Extracting...";
  });
}
