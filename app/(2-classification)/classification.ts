import dotenvFlow from "dotenv-flow";
dotenvFlow.config();

import supportRequests from "./support_requests_multilanguage.json";
import { z } from "zod";
import { generateText, Output } from "ai";

async function main() {
  console.log("Asking AI to classify support requests...");

  const requestSchema = z.object({
    request: z.string().describe('The original support request text'),
    category: z
      .enum([
        // 'billing',
        'product_issues',
        'enterprise_sales',
        'account_issues',
        // 'product_feedback',
      ])
      .describe('The category that best fits this support request'),
    urgency: z
      .enum(['low', 'medium', 'high'])
      .describe(
        'Business urgency. high = the customer is blocked from working, at risk of churning, OR this is an inbound sales opportunity. medium = something is broken but there is a workaround. low = general question with no time pressure.'
      ),
    language: z
      .string()
      .describe('The full name of the language the request is written in, e.g. "German", "Spanish"'),
  });


  const { output } = await generateText({
    model: 'openai/gpt-4.1',
    prompt: `Classify each of the following support requests into exactly one category.

Support requests:
${JSON.stringify(supportRequests, null, 2)}`,
    output: Output.array({ element: requestSchema }),
  });

  console.log(JSON.stringify(output, null, 2));
  console.log(`\nClassified ${output.length} requests.`);
}

main().catch(console.error);
