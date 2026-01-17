document.getElementById("pick-element").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "qa-enable-picker" });
  });
});

document.getElementById("extract-now").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "qa-extract" });
  });
});
    
chrome.runtime.onMessage.addListener(msg => {
  if (msg.action === "qa-output") {
    document.getElementById("qa-output").textContent =
      JSON.stringify(msg.data, null, 2);
  }
});
