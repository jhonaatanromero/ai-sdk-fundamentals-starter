import dotenvFlow from 'dotenv-flow';
dotenvFlow.config();
import fs from 'fs';
import { generateText } from 'ai';

const essay = fs.readFileSync('app/(1-extraction)/essay.txt', 'utf-8');

async function main() {
  const result = await generateText({
    model: 'openai/gpt-5-mini',
    prompt: `Extract only the names of people mentioned in this essay.
    Do not include companies, organizations, places, or dates.
    List them separated by commas.

    Essay:
    ${essay}`,

  });

  console.log('\n--- AI Response ---');
  console.log(result.text);
  console.log('-------------------');
}

main().catch((error) => {
  console.error('❌ Extraction failed:', error.message);
  console.log('\n💡 Common issues:');
  console.log('  - Check your .env.local file has valid API keys');
  console.log('  - Verify essay.txt exists at app/(1-extraction)/essay.txt');
  console.log('  - Ensure you have internet connectivity for API calls');
  process.exit(1);
});
