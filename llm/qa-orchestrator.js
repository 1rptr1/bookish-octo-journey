import { createLLMClient } from "./providers/client-factory.js";
import { qaPromptTemplate } from "./prompts/qa.prompt.js";

export async function runLLMEnhancedQA({
    url,
    dom,
    signals,
    locators,
    testcases,
    provider,
    model
}) {
    const client = createLLMClient(provider, model);

    const prompt = qaPromptTemplate({
        url,
        domJSON: JSON.stringify(dom),
        signalsJSON: JSON.stringify(signals),
        locatorsJSON: JSON.stringify(locators),
        tcJSON: JSON.stringify(testcases)
    });

    const response = await client.ask(prompt, {
        temperature: 0.2,
        max_tokens: 2048
    });

    const parsed = JSON.parse(response);

    return {
        llm: true,
        refined_locators: parsed.locators,
        refined_testcases: parsed.testcases,
        insights: parsed.insights
    };
}
