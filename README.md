# locator-gen

A Node.js + Playwright utility to extract DOM signals, generate baseline test cases and Selenide locators, and (optionally) enhance test cases using multiple local LLM providers (Ollama, LM Studio, GPT4All).

## Dependencies

Install Node dependencies:

```bash
npm install
```

Notes:
- Interactive selection mode (`--qa`) requires a GUI (non-headless browser).
- LLM enhancement supports multiple providers with auto-detection and fallback.
- Ollama includes auto-start functionality.

## LLM Provider Setup

### 🦙 Ollama (Recommended - Auto-Start)
```bash
# Install Ollama
# macOS: brew install ollama
# Linux: curl -fsSL https://ollama.ai/install.sh | sh
# Windows: Download from https://ollama.ai/download

# Pull models
ollama pull qwen2.5
ollama pull llama3

# Run (auto-starts if needed)
node index.js https://example.com --qa
```

### 🎨 LM Studio
```bash
# Download from https://lmstudio.ai
# Start server in app (port 1234)
# Download GGUF models

LLM_PROVIDER=lmstudio node index.js https://example.com --qa
```

### 🤖 GPT4All
```bash
# Install dependency
npm install gpt4all

LLM_PROVIDER=gpt4all node index.js https://example.com --qa
```

## Commands

### Basic Usage

```bash
# Run (non-interactive)
node index.js <url>

# Example
node index.js https://selectorshub.com/xpath-practice-page/
```

### LLM-Enhanced QA Mode (Recommended)

```bash
# Default (Ollama + qwen2.5)
node index.js <url> --qa

# Custom provider/model
LLM_PROVIDER=ollama LLM_MODEL=llama3 node index.js <url> --qa
LLM_PROVIDER=lmstudio LLM_MODEL="Mistral 7B" node index.js <url> --qa
LLM_PROVIDER=gpt4all node index.js <url> --qa
```

### Demo Mode

```bash
# Test with built-in playground
node index.js --demo --qa
```

### Environment Variables

```bash
# LLM Configuration
LLM_PROVIDER=ollama          # ollama, lmstudio, gpt4all
LLM_MODEL=qwen2.5           # Model name

# Example .env file
echo "LLM_PROVIDER=ollama" > .env
echo "LLM_MODEL=qwen2.5" >> .env
```

## Features

### 🎯 QA Mode with LLM Enhancement
- **Element Selection**: Click any element to extract locators
- **Focused Analysis**: Processes only selected element (not entire page)
- **Multiple Providers**: Ollama, LM Studio, GPT4All support
- **Auto-Start**: Ollama starts automatically if not running
- **Health Check**: Verifies LLM availability before enhancement
- **Graceful Fallback**: Uses rule-based QA if LLM is offline

### 🧠 LLM Enhancement Features
- **Improved Locators**: XPath, CSS, Shadow DOM optimization
- **Expanded Test Cases**: Happy paths, negative scenarios, edge cases
- **Accessibility Checks**: ARIA attributes and role-based testing
- **Intelligent Insights**: Missing validation, UX issues, hierarchy problems

### 📊 Output Format

```json
{
  "enhanced": true,
  "llm": true,
  "refined_locators": [
    {
      "element": "input",
      "locator": "#username",
      "confidence": 95,
      "strategy": "id"
    }
  ],
  "refined_testcases": [
    {
      "description": "Verify username input accepts valid email",
      "steps": ["Enter valid email", "Verify format"],
      "expected": "Input accepts email format"
    }
  ],
  "insights": [
    "Missing email validation",
    "Consider adding input masking"
  ]
}
```

## Provider Comparison

| Provider | Auto-Start | Setup Time | Model Quality | Resource Usage |
|----------|------------|------------|---------------|----------------|
| **Ollama** | ✅ Yes | 5 min | ⭐⭐⭐⭐⭐ | Medium |
| **LM Studio** | ❌ No | 10 min | ⭐⭐⭐⭐⭐ | High |
| **GPT4All** | ❌ No | 2 min | ⭐⭐⭐ | Low |

## Troubleshooting

### LLM Issues
```bash
# Check Ollama
ollama list
curl http://localhost:11434/api/tags

# Check LM Studio
curl http://localhost:1234/v1/models

# Check GPT4All
npm list gpt4all
```

### General Issues
```bash
# Reinstall dependencies
npm install

# Test with demo
node index.js --demo --qa

# Check all providers
node -e "
const { checkLLMHealth } = require('./llm/llm-health.js');
['ollama', 'lmstudio', 'gpt4all'].forEach(async (provider) => {
  const healthy = await checkLLMHealth(provider, 'default');
  console.log(provider + ':', healthy ? '✅ Online' : '❌ Offline');
});
"
```

## Advanced Usage

### Performance Optimization
```bash
# Use lighter models
LLM_MODEL=qwen2.5:7b node index.js https://example.com --qa

# Use quantized models
LLM_MODEL=llama3:8b-instruct-q4_K_M node index.js https://example.com --qa
```

### Development Mode
```bash
# Enable debug logging
DEBUG=* node index.js https://example.com --qa

# Test specific provider
LLM_PROVIDER=ollama node -e "
const { createLLMClient } = require('./llm/providers/client-factory.js');
const client = createLLMClient('ollama', 'qwen2.5');
client.ask('Hello').then(console.log);
"
```

## Architecture

- **Browser Automation**: Playwright for DOM extraction
- **Element Selection**: Interactive overlay for precise targeting
- **Locator Engine**: Bulletproof CSS selector generation
- **LLM Integration**: Multi-provider support with health checks
- **Fallback System**: Graceful degradation when LLM unavailable

For detailed LLM setup instructions, see [llm/README.md](./llm/README.md).
