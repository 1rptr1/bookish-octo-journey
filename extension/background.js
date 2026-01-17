chrome.runtime.onInstalled.addListener(() => {
  console.log("QA Extension Installed");
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "LOG") {
    console.log("EXT LOG:", msg.data);
  }
  
  // Handle new QA extraction requests
  if (msg.action === "qa-extract-now") {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "run-extraction" });
    });
  }
  
  // Handle legacy QA analysis requests
  if (msg.action === "START_QA_ANALYSIS") {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "START_QA_ANALYSIS" });
    });
  }
});
