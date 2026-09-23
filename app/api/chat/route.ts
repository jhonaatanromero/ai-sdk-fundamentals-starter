import {
    streamText,
    convertToModelMessages,
    createUIMessageStreamResponse,
    toUIMessageStream,
} from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        const result = streamText({
            model: "openai/gpt-5-mini",
            messages: await convertToModelMessages(messages),
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
