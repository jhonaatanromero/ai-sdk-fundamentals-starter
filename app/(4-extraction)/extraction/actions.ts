'use server';

import { generateText, Output } from 'ai';
import { appointmentSchema } from './schemas';

export const extractAppointment = async (input: string) => {
    console.log('Extracting from:', input);
    const { output } = await generateText({
        model: 'openai/gpt-5-mini',
        prompt: `Extract the appointment details from this text: ${input}`,
        output: Output.object({ schema: appointmentSchema }),
    });
    console.log('Extracted:', output);
    return output;
};
