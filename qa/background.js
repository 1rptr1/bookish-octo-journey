chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "qa-extract-now") {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "run-extraction" });
    });
  }
});
