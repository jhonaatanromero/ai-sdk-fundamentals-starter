import dotenvFlow from "dotenv-flow";
dotenvFlow.config();
import { generateText, Output } from "ai";
import { z } from "zod";

// Example: Smart form filling from natural language
async function smartFormFill(userInput: string) {
  console.log("\n🤖 Invisible AI: Smart Form Filling\n");
  console.log(`User types: "${userInput}"\n`);

  const eventSchema = z.object({
    eventTitle: z.string().describe('The title or purpose of the event'),
    date: z.string().describe('The date of the event in YYYY-MM-DD format. Today is Tuesday, 2026-09-22.'),
    dateWasInferred: z.boolean().describe('True if the date was NOT stated explicitly and had to be inferred from a relative expression like "next Tuesday" or "tomorrow"'),
    time: z.string().nullable().describe('The time of the event'),
    duration: z.string().nullable().describe('How long the event will last'),
    location: z.string().nullable().describe('Where the event will take place'),
    attendees: z.array(z.string()).nullable().describe('People attending'),
    notes: z.string().nullable().describe('Additional notes or agenda items'),
  });

  const { output: eventDetails } = await generateText({
    model: 'openai/gpt-5-mini',
    prompt: `Extract calendar event details from: "${userInput}"`,
    output: Output.object({ schema: eventSchema }),
  });

  console.log('✨ AI automatically fills your form:\n');
  console.log(`📅 Event: ${eventDetails.eventTitle}`);
  console.log(`📆 Date: ${eventDetails.date}`);
  if (eventDetails.dateWasInferred) console.log(`   ⚠️  Date was inferred — ask the user to confirm`);
  if (eventDetails.time) console.log(`⏰ Time: ${eventDetails.time}`);
  if (eventDetails.location) console.log(`📍 Location: ${eventDetails.location}`);
  if (eventDetails.attendees) console.log(`👥 Attendees: ${eventDetails.attendees.join(', ')}`);
  if (eventDetails.notes) console.log(`📝 Notes: ${eventDetails.notes}`);

  console.log('\n✅ Form ready to save - no manual input needed!');
}

// Example: Smart email categorization
async function smartEmailTriage(emailSubject: string, emailPreview: string) {
  console.log("\n📧 Invisible AI: Email Smart Triage\n");
  console.log(`Subject: ${emailSubject}`);
  console.log(`Preview: ${emailPreview}\n`);

  const emailSchema = z.object({
    category: z
      .enum(['urgent', 'action-required', 'fyi', 'spam', 'newsletter'])
      .describe('The single best category for this email'),
    secondBestCategory: z
      .enum(['urgent', 'action-required', 'fyi', 'spam', 'newsletter'])
      .nullable()
      .describe('A second category that fits almost as well. Null if one category is clearly correct.'),
    priority: z
      .enum(['high', 'medium', 'low'])
      .describe("How soon this needs the recipient's attention"),
    suggestedFolder: z
      .string()
      .describe('A short folder name to file this email under, e.g. "Finance" or "Newsletters"'),
    requiresResponse: z
      .boolean()
      .describe('True if the sender is expecting a reply from the recipient'),
    estimatedResponseTime: z
      .enum(['under-5-min', 'under-30-min', 'over-30-min'])
      .nullable()
      .describe('Rough effort to write a reply. Null if requiresResponse is false.'),
  });

  const { output: triage } = await generateText({
    model: 'openai/gpt-5-mini',
    prompt: `Triage this email.

Subject: ${emailSubject}
Preview: ${emailPreview}`,
    output: Output.object({ schema: emailSchema }),
  });

  console.log('🗂️  Triage result:\n');
  console.log(`🏷️  Category: ${triage.category}`);
  if (triage.secondBestCategory) {
    console.log(`   ⚠️  Also fits "${triage.secondBestCategory}" — classification is ambiguous`);
  }
  console.log(`🔥 Priority: ${triage.priority}`);
  console.log(`📂 Folder: ${triage.suggestedFolder}`);
  console.log(`↩️  Requires response: ${triage.requiresResponse ? 'yes' : 'no'}`);
  if (triage.estimatedResponseTime) {
    console.log(`⏳ Response effort: ${triage.estimatedResponseTime}`);
  }

  console.log('\n✅ Email triaged - inbox stays organized!');
}

async function runExamples() {
  // Smart form example
  await smartFormFill(
    "Coffee with John next Tuesday at 2pm at Starbucks on Market St, discuss Q4 roadmap",
  );

  console.log("\n" + "=".repeat(60));

  // Email triage example
  await smartEmailTriage(
    "Re: Q4 Budget Approval Needed by EOD",
    "Hi team, I need your approval on the attached Q4 budget proposal by end of day today. Please review the highlighted sections...",
  );

  console.log("\n" + "=".repeat(60));

  // Control: an email with no plausible second category
  await smartEmailTriage(
    "Your weekly Vercel digest",
    "Here's what shipped this week: new AI Gateway models, faster builds, and three community templates. Unsubscribe at any time.",
  );
}

runExamples().catch(console.error);
