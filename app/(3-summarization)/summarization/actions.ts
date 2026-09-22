'use server';

import { generateText, Output } from 'ai';
import { z } from 'zod';

const summarySchema = z.object({
    headline: z.string().describe('The main topic or title of the summary. Max 5 words.'),
    context: z.string().describe('Briefly explain the situation or background that led to this discussion. Max 2 sentences.'),
    discussionPoints: z.string().describe('Summarize the key topics discussed. Max 2 sentences.'),
    takeaways: z.array(z.string()).describe('The main decisions, action items or next steps. Include the name of the person assigned to each. One string per takeaway, max 3.'),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const generateSummary = async (comments: any[]) => {
    console.log('Generating summary for', comments.length, 'comments...');
    const { output: summary } = await generateText({
        model: 'openai/gpt-5-mini',
        prompt: `Please summarize the following comments concisely, focusing on key decisions and action items.
      Comments:
      ${JSON.stringify(comments)}`,
        output: Output.object({
            schema: summarySchema,
        }),
    });
    console.log('Summary generated:', summary);
    return summary;
};
