import { OllamaClient } from "./ollama.js";
import { LMStudioClient } from "./lmstudio.js";
import { GPT4AllClient } from "./gpt4all.js";

export function createLLMClient(provider, model) {
    switch (provider) {
        case "ollama":
            return new OllamaClient(model);

        case "lmstudio":
            return new LMStudioClient(model);

        case "gpt4all":
            return new GPT4AllClient(model);

        default:
            throw new Error(`Unknown provider: ${provider}`);
    }
}
