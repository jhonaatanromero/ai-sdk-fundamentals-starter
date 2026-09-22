import dotenvFlow from 'dotenv-flow';
dotenvFlow.config();

import { generateText } from 'ai';


const complexProblem = `
A company has 150 employees. They want to organize them into teams where:
- Each team has between 8-12 people
- No team should have exactly 10 people
- Teams should be as equal in size as possible
How should they organize the teams?
`;

async function compareFastVsReasoning() {
    console.log('🚀 Testing fast model (gpt-5-mini)...');
    const startFast = Date.now();

    const fastResult = await generateText({
        model: 'openai/gpt-5-mini',
        prompt: complexProblem,
    });

    const fastTime = Date.now() - startFast;
    console.log(`⏱️  Fast model time: ${fastTime}ms`);
    console.log('📝 Full result:\n', fastResult.text, '\n');
    console.log('🔢 Usage:', fastResult.usage);


    console.log('🧠 Testing reasoning model (gpt-5.2)...');
    const startReasoning = Date.now();

    const reasoningResult = await generateText({
        model: 'openai/gpt-5.2',
        prompt: complexProblem,
    });

    const reasoningTime = Date.now() - startReasoning;
    console.log(`⏱️  Reasoning model time: ${reasoningTime}ms`);
    console.log('📝 Full result:\n', reasoningResult.text, '\n');
    console.log('🔢 Usage:', reasoningResult.usage);


    console.log('📊 Performance Comparison:');
    console.log(`- Fast model: ${fastTime}ms`);
    console.log(`- Reasoning model: ${reasoningTime}ms`);
    console.log(`- Speed difference: ${reasoningTime - fastTime}ms slower for reasoning`);

    console.log('\n🎯 Key Observations:');
    console.log('- Fast models start responding immediately');
    console.log('- Reasoning models think before responding');
    console.log('- Both solve the problem, but with different approaches');
}

compareFastVsReasoning().catch(console.error);
