# locator-gen

A Node.js + Playwright utility to extract DOM signals, generate baseline test cases and Selenide locators, and (optionally) enhance test cases using a local LLM (Ollama).

## Dependencies

Install Node dependencies:

```bash
npm install
```

Notes:
- Interactive selection mode (`--qa`) requires a GUI (non-headless browser).
- LLM mode (`--llm`) requires Ollama running locally at `http://localhost:11434`.

## Commands

### Run (non-interactive)

```bash
node index.js <url>
```

Example:

```bash
node index.js https://selectorshub.com/xpath-practice-page/
```

### Run with local LLM enhancement (non-interactive)

```bash
node index.js <url> --llm
```

### Run interactive selection mode

```bash
node index.js <url> --qa
```

### Run interactive selection mode + local LLM enhancement

```bash
node index.js <url> --qa --llm
```
