import OpenAI from "openai";
import { fetch as undiciFetch } from "undici";
import { checkUrl } from "./ssrf";
import { createSecureAgent } from "./secureAgent";

type AIRequest = {
    provider: string;
    model: string;
    apiKey: string;
    systemInstruction: string;
    endpoint_url: string;
    messages: {
        role: "user" | "assistant";
        content: string;
    }[];
    onChunk: (text: string) => void;
};

export async function runAI(
    request: AIRequest
): Promise<string> {
    const secureAgent = createSecureAgent();

    try {
        if(!await checkUrl(request.endpoint_url)){
            throw new Error('Endpoint is not allowed');
        }

        const client = new OpenAI({
            apiKey: request.apiKey,
            baseURL: request.endpoint_url,
            fetch: undiciFetch as unknown as typeof globalThis.fetch,
            fetchOptions: {
                dispatcher: secureAgent,
                redirect: "error"
            },
            maxRetries: 0
        })

        const messages: OpenAI.ChatCompletionMessageParam[] = [
            {
                role: "system",
                content: request.systemInstruction
            },
            ...request.messages
        ]

        const stream = await client.chat.completions.create(
            {
                model: request.model,
                messages,
                stream: true
            }
        )

        let fullResponse = "";

        for await(const chunk of stream){
            const text = chunk.choices[0]?.delta?.content ??"";
            if(text){
                request.onChunk(text);
                fullResponse += text
            }
        }

        return fullResponse;
    }
    catch(err: unknown){
        throw err;
    }
    finally{
        await secureAgent.close();
    }
}