chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "run-extraction") {
    runExtraction();
  }
});

function runExtraction() {
  import("./qa-extractor.js")
    .then(mod => mod.extractSelection())
    .catch(err => console.error("QA Extraction Error:", err));
}
