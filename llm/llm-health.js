import { createLLMClient } from "./providers/client-factory.js";

export async function checkLLMHealth(provider, model) {
    try {
        const client = createLLMClient(provider, model);
        const ping = await client.ask("ping");

        return ping.toLowerCase().includes("pong") ||
               ping.toLowerCase().includes("ping");
    } catch (err) {
        console.log("❌ LLM offline:", err.message);
        return false;
    }
}
