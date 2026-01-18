import fetch from "node-fetch";

export class LMStudioClient {
    constructor(model = "default") {
        this.base = "http://localhost:1234/v1"; 
        this.model = model;
    }

    async ask(prompt, options = {}) {
        const res = await fetch(`${this.base}/chat/completions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: this.model,
                messages: [{ role: "user", content: prompt }],
                max_tokens: options.max_tokens || 2048,
                temperature: options.temperature || 0.2
            })
        });

        const json = await res.json();
        return json.choices[0].message.content;
    }
}
