import { runLLMEnhancedQA } from "./qa-orchestrator.js";
import { checkLLMHealth } from "./llm-health.js";

export async function runLLM({
    url,
    dom,
    signals,
    locators,
    testcases,
    provider,
    model
}) {
    const alive = await checkLLMHealth(provider, model);

    if (!alive) {
        console.log("\n⚠️  LLM not responding. Falling back to rule-based QA output.\n");
        return {
            enhanced: false,
            dom,
            signals,
            locators,
            testcases
        };
    }

    console.log("\n✨ LLM online. Enhancing QA results...\n");

    const enhanced = await runLLMEnhancedQA({
        url,
        dom,
        signals,
        locators,
        testcases,
        provider,
        model
    });

    return {
        enhanced: true,
        ...enhanced
    };
}
