import {
    streamText,
    convertToModelMessages,
    createUIMessageStreamResponse,
    toUIMessageStream,
} from 'ai';
import { getWeather } from './tools';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        const result = streamText({
            model: "openai/gpt-5-mini",
            instructions: `You are a support assistant for TechCorp's cloud platform.

Only answer questions about TechCorp's cloud platform: deployment issues, API usage, and account settings. You may also look up the current weather for a city when asked, using your weather tool.

If the user asks about anything else - even if you know the answer perfectly well - do NOT answer it. Politely say it is outside TechCorp support and redirect them to contact@techcorp.com.

Keep every answer under 150 words unless the user explicitly asks for more detail. Link to docs.techcorp.com when relevant.`,
            messages: await convertToModelMessages(messages),
            tools: { getWeather },
        });

        return createUIMessageStreamResponse({
            stream: toUIMessageStream({ stream: result.stream }),
        });
    } catch (error) {
        console.error("Chat API error:", error);

        return new Response(
            JSON.stringify({
                error: "Failed to process chat request",
                details: error instanceof Error ? error.message : "Unknown error",
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            },
        );
    }
}
