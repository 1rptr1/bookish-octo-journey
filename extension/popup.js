// Handle extract button click
document.getElementById("qa-extract-btn").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  // Update status
  document.getElementById("qa-status").textContent = "Extracting...";
  
  // Send extraction request
  chrome.tabs.sendMessage(tab.id, { action: "qa-extract-now" });
});

// Listen for results coming from content script
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "qa-output") {
    document.getElementById("qa-status").textContent = "Extraction complete!";
    document.getElementById("output").textContent = JSON.stringify(msg.data, null, 2);
  }
  
  if (msg.action === "QA_RESULTS") {
    document.getElementById("qa-status").textContent = "Analysis complete!";
    document.getElementById("output").textContent = JSON.stringify(msg.payload, null, 2);
  }
  
  if (msg.payload && msg.payload.error) {
    document.getElementById("qa-status").textContent = "Error: " + msg.payload.error;
    document.getElementById("qa-status").style.background = "#ffebee";
    document.getElementById("qa-status").style.color = "#c62828";
  }
});
