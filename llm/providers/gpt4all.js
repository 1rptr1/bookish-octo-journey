import { GPT4All } from "gpt4all";

export class GPT4AllClient {
    constructor(model = "ggml-gpt4all-j") {
        this.model = model;
    }

    async ask(prompt) {
        const gpt = new GPT4All(this.model);
        await gpt.init();
        await gpt.open();

        const output = await gpt.prompt(prompt);

        await gpt.close();
        return output;
    }
}
