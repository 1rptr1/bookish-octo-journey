import fetch from "node-fetch";
import { spawn } from "child_process";

export class OllamaClient {
    constructor(model = "qwen2.5") {
        this.model = model;
        this.base = "http://localhost:11434";
    }

    async ensureOllamaRunning() {
        try {
            const res = await fetch(`${this.base}/api/tags`);
            if (res.ok) return true;
        } catch (_) {}

        console.log("\n⚠️ Ollama is not running — attempting to start it...\n");

        spawn("ollama", ["serve"], {
            detached: true,
            stdio: "ignore"
        }).unref();

        await new Promise(r => setTimeout(r, 3000));
        return true;
    }

    async ask(prompt, options = {}) {
        await this.ensureOllamaRunning();

        const body = {
            model: this.model,
            prompt,
            stream: false,
            ...options
        };

        const res = await fetch(`${this.base}/api/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            throw new Error(`Ollama error: ${res.status}`);
        }

        const json = await res.json();
        return json.response;
    }
}
