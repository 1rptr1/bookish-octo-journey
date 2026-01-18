# Local LLM Provider Setup

This system supports three local LLM providers out of the box with automatic detection and health checks.

## 🦙 Ollama (Recommended - Auto-Start)

### Installation
```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Windows
# Download from https://ollama.ai/download
```

### Model Setup
```bash
# Pull recommended models
ollama pull qwen2.5
ollama pull llama3
ollama pull codellama
ollama pull mistral

# List available models
ollama list

# Test model
ollama run qwen2.5 "Hello, how are you?"
```

### Usage Commands
```bash
# Default (Ollama + qwen2.5)
node index.js https://example.com --qa

# Specific model
LLM_MODEL=llama3 node index.js https://example.com --qa

# Different model
LLM_MODEL=codellama node index.js https://example.com --qa

# Test with demo page
node index.js --demo --qa
```

## 🎨 LM Studio

### Installation
```bash
# Download from https://lmstudio.ai
# Install for your OS (Windows/Mac/Linux)
```

### Model Setup
```bash
# 1. Open LM Studio application
# 2. Download any GGUF model from the home tab
# 3. Go to "Server" tab
# 4. Start server (default port 1234)
# 5. Note the model name from the interface
```

### Usage Commands
```bash
# LM Studio with default model
LLM_PROVIDER=lmstudio node index.js https://example.com --qa

# LM Studio with specific model
LLM_PROVIDER=lmstudio LLM_MODEL="Mistral 7B Instruct" node index.js https://example.com --qa

# Test with demo page
LLM_PROVIDER=lmstudio node index.js --demo --qa
```

## 🤖 GPT4All

### Installation
```bash
# Install Node.js dependency
npm install gpt4all

# Or globally
npm install -g gpt4all
```

### Model Setup
```bash
# Models are downloaded automatically on first use
# Default model: ggml-gpt4all-j
# Additional models can be placed in ~/.cache/gpt4all/
```

### Usage Commands
```bash
# GPT4All with default model
LLM_PROVIDER=gpt4all node index.js https://example.com --qa

# GPT4All with specific model
LLM_PROVIDER=gpt4all LLM_MODEL=ggml-gpt4all-j node index.js https://example.com --qa

# Test with demo page
LLM_PROVIDER=gpt4all node index.js --demo --qa
```

## 🚀 Quick Start Commands

### Basic Usage
```bash
# Start with Ollama (recommended)
node index.js https://selectorshub.com/xpath-practice-page/ --qa

# Use demo playground
node index.js --demo --qa

# Test with different providers
LLM_PROVIDER=ollama node index.js https://example.com --qa
LLM_PROVIDER=lmstudio node index.js https://example.com --qa
LLM_PROVIDER=gpt4all node index.js https://example.com --qa
```

### Advanced Usage
```bash
# Custom model selection
LLM_PROVIDER=ollama LLM_MODEL=llama3 node index.js https://example.com --qa
LLM_PROVIDER=lmstudio LLM_MODEL="Custom Model Name" node index.js https://example.com --qa

# Environment variables in .env file
echo "LLM_PROVIDER=ollama" > .env
echo "LLM_MODEL=qwen2.5" >> .env

# Then run simply
node index.js https://example.com --qa
```

### Development & Testing
```bash
# Test LLM health check
node -e "
const { checkLLMHealth } = require('./llm/llm-health.js');
checkLLMHealth('ollama', 'qwen2.5').then(console.log);
"

# Test specific provider
LLM_PROVIDER=ollama node -e "
const { createLLMClient } = require('./llm/providers/client-factory.js');
const client = createLLMClient('ollama', 'qwen2.5');
client.ask('Hello').then(console.log);
"

# Run with debug output
DEBUG=* node index.js https://example.com --qa
```

## 📋 Environment Variables

| Variable | Default | Options | Description |
|----------|---------|---------|-------------|
| `LLM_PROVIDER` | `ollama` | `ollama`, `lmstudio`, `gpt4all` | LLM provider to use |
| `LLM_MODEL` | `qwen2.5` | Any model name | Model to load |
| `DEBUG` | - | `*`, `llm:*` | Enable debug logging |

### Example .env File
```bash
# .env
LLM_PROVIDER=ollama
LLM_MODEL=qwen2.5
# LLM_PROVIDER=lmstudio
# LLM_MODEL=Mistral 7B Instruct
# LLM_PROVIDER=gpt4all
# LLM_MODEL=ggml-gpt4all-j
```

## 🔧 Troubleshooting Commands

### Ollama Issues
```bash
# Check if Ollama is running
ollama list

# Start Ollama manually
ollama serve

# Check Ollama status
curl http://localhost:11434/api/tags

# Restart Ollama
pkill ollama && ollama serve
```

### LM Studio Issues
```bash
# Check if LM Studio server is running
curl http://localhost:1234/v1/models

# Check available models
curl http://localhost:1234/v1/models | jq

# Test chat endpoint
curl -X POST http://localhost:1234/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"default","messages":[{"role":"user","content":"Hello"}]}'
```

### GPT4All Issues
```bash
# Check GPT4All installation
npm list gpt4all

# Reinstall GPT4All
npm uninstall gpt4all && npm install gpt4all

# Check model cache
ls ~/.cache/gpt4all/
```

### General Issues
```bash
# Check Node.js dependencies
npm install

# Clear npm cache
npm cache clean --force

# Rebuild dependencies
npm rebuild

# Test with minimal setup
node index.js --demo --qa
```

## 🎯 Provider Comparison

| Provider | Auto-Start | Setup Time | Model Quality | Resource Usage |
|----------|------------|------------|---------------|----------------|
| **Ollama** | ✅ Yes | 5 min | ⭐⭐⭐⭐⭐ | Medium |
| **LM Studio** | ❌ No | 10 min | ⭐⭐⭐⭐⭐ | High |
| **GPT4All** | ❌ No | 2 min | ⭐⭐⭐ | Low |

## 🚀 Performance Tips

```bash
# Use lighter models for faster responses
LLM_MODEL=qwen2.5:7b node index.js https://example.com --qa

# Use quantized models for lower memory
LLM_MODEL=llama3:8b-instruct-q4_K_M node index.js https://example.com --qa

# Limit response tokens for faster processing
# (Edit in llm/qa-orchestrator.js)
max_tokens: 1024

# Use lower temperature for more deterministic output
temperature: 0.1
```

## 📊 Expected Output

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

## 🔍 Health Check System

The system automatically:
1. **Pings provider** on startup
2. **Auto-starts Ollama** if needed
3. **Falls back gracefully** if LLM is offline
4. **Provides clear error messages**
5. **Continues with rule-based QA** if enhancement fails

### Manual Health Check
```bash
# Test all providers
node -e "
const { checkLLMHealth } = require('./llm/llm-health.js');
['ollama', 'lmstudio', 'gpt4all'].forEach(async (provider) => {
  const healthy = await checkLLMHealth(provider, 'default');
  console.log(provider + ':', healthy ? '✅ Online' : '❌ Offline');
});
"
```
