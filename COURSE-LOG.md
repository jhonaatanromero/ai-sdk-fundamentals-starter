# Course Log — Builders Guide to the AI SDK

Personal log for <https://vercel.com/academy/ai-sdk>.
Records what was actually done, what actually happened, and what went wrong.

**Rule:** failures are recorded as failures. No test, eval, or expectation is
ever relaxed just to make it pass.

- **Started:** 2026-09-21
- **Starter repo:** [vercel/ai-sdk-fundamentals-starter](https://github.com/vercel/ai-sdk-fundamentals-starter)
- **Fork:** `jhonaatanromero/ai-sdk-fundamentals-starter`

---

## Environment

| Item | Value |
|---|---|
| OS | Windows 11 Pro 26200 |
| Shell | PowerShell |
| Node | v24.16.0 (course requires v22+) |
| pnpm | 12.4.2 |
| Git | 2.55.0.windows.3 (upgraded from 2.36.1 on 2026-09-21) |
| Editor | VS Code |
| Vercel plan | Hobby |
| AI Gateway credits | $15 purchased (expire 2027-09) |
| Auth method | AI Gateway API key (not OIDC) |

---

## Setup decisions (deviations from the course)

| Decision | Course says | What we did | Why |
|---|---|---|---|
| Repo access | `git clone` upstream | **Fork, then clone the fork** | `origin` must be pushable to keep per-lesson commits |
| AI SDK version | v7 (in prose) | **Merged `upstream/chore/upgrade-ai-sdk-v7`** | `main` ships v6; see Finding 10 |
| Auth | OIDC or API key | **API key** | OIDC needs `vc deploy` (public URL) and expires every 12h |
| Build scripts | not mentioned | **Approved 4** via `pnpm approve-builds` | Recorded in `pnpm-workspace.yaml` |

`git merge upstream/chore/upgrade-ai-sdk-v7` resolved as a clean **fast-forward**
(`56055d8` → `645514f`), so history stayed linear.

Installed and verified on disk: **`ai@7.0.4`**.

---

## Findings

Numbered in the order they were discovered. Findings marked **open** are not yet
verified and must not be treated as fact.

| # | Finding | Status |
|---|---|---|
| 1 | The `o200k_base` tokenizer nearly closes the ES/EN gap. Measured on paired texts: **5.65 chars/token (ES) vs 5.89 (EN)** — only ~4% worse per character. Writing prompts in English to "save tokens" is not justified on modern models. | Confirmed |
| 2 | Lesson 1 quotes context windows of ~128k tokens. The models actually offered in the AI SDK Playground expose **1,000,000+**. Course material is outdated on this point. | Confirmed |
| 3 | `openai/gpt-5-mini` — the model in **every** course code sample — is gated behind **Vercel Pro**. The playground rejects it with an "Upgrade to Vercel Pro" modal, and **purchased AI Gateway credits do not unlock it**. This contradicts the AI Gateway pricing docs, which state that buying credits grants the full catalog. **Verified in Lesson 4: the API is NOT gated the same way.** The same model, called through the AI Gateway API from a Hobby account with purchased credits, worked on the first try. The pricing docs were right; the playground's `Pro` badge reflects *playground* access only. **Never infer API availability from the playground.** | Resolved — the predicted API failure did **not** happen |
| 4 | Lesson 10 uses v0. The credit purchase dialog states *"Credit applied to v0 requires a paid v0 plan"*, so purchased AI Gateway credit may not be spendable there. **Resolved at Lesson 10: not a blocker.** v0 required signing in with the existing Vercel account and then generated components with **no payment prompt, no credit counter and no upgrade wall**. The lesson is completable on the free tier. The dialog's caveat still holds — the $15 of AI Gateway credit cannot be spent on v0 — but it is irrelevant, because v0 has its own free allowance, separate from that balance. | Resolved — not a blocker |
| 5 | AI Gateway credits **expire one year after purchase** (2027-09 for this account). | Confirmed |
| 6 | Same prompt, two models, same correct answer, **different output shape**: GPT-5 nano echoed the input before the labels; GPT-4.1 nano emitted only the labels. Prompting *suggests* format; it does not guarantee it. This is the concrete argument for `Output.object()`. | Confirmed |
| 7 | Lesson 2's Chain-of-Thought exercise pairs a **constraint-satisfaction math example** with an **open-ended business question**. There is no transferable reasoning pattern between them, so the exercise does not measure what it claims to. | Confirmed |
| 8 | Given the same deliberately-truncated CoT prompt, **GPT-5 nano repaired it** (completed the dangling example, correct arithmetic) while **GPT-4.1 nano surrendered** with *"your second question is incomplete"*. Robustness to malformed prompts varies enormously between models — and the failure was a **valid string, not an error**, so no `try/catch` or "did it respond?" check would catch it. | Confirmed |
| 9 | Few-shot examples stabilize behaviour **across different models**, not just output format. With examples, two model generations produced near-identical output; without them they diverged wildly (one sentence vs. a ~270-token report). Well-exemplified prompts are what make model swapping safe. | Confirmed |
| 10 | The starter repo's `main` ships **AI SDK v6**, while the course prose teaches **v7** and `Output.object()`. The v7 upgrade exists in the unmerged branch `chore/upgrade-ai-sdk-v7` (Eve Porcello, 2026-06-30) and **the course never mentions it**. Following the setup lesson literally installs v6 and then applies v7 instructions. Unmerged for ~3 months. | Confirmed → **worked around** |
| 11 | `package.json` scripts escape parentheses for POSIX shells (`tsx app/\\(1-extraction\\)/extraction.ts`). pnpm on Windows spawns via `cmd.exe`, where `\` is a path separator, not an escape. **`pnpm run extraction` is predicted to fail on Windows.** Workaround: `pnpm tsx "app/(1-extraction)/extraction.ts"`. The v7 branch did not fix this. **Confirmed in Lesson 4**: `pnpm extraction` fails with `/extraction.ts was unexpected at this time.` (exit 255) — a `cmd.exe` parser error, since `(` and `)` are grouping operators there and `\` does not escape them (cmd uses `^`). The quoted direct call works. **Every CLI lesson in this course needs this workaround on Windows.** | Confirmed |
| 12 | The course prompt says *"Extract all the names mentioned in this essay"* and the model returned **named entities, not person names**: companies (`YC`, `Airbnb`, `Apple`), a place (`Silicon Valley`) and a date (`September 2024`, which is not a name under any reading). "Names" is ambiguous and the model resolved it its own way — a live demonstration of Lesson 2's *"be specific and over-explain"*. The output is also an unparsed comma string, fragile to any name containing a comma. | Confirmed |
| 13 | Lesson 5's `model-comparison.ts` opens with `import 'dotenv/config'`, which loads **only `.env`**. The key lives in `.env.local`, which only `dotenv-flow` loads — and Lesson 4's `extraction.ts` uses `dotenv-flow`. **The course is internally inconsistent between two consecutive lessons.** Fails with `GatewayAuthenticationError` before spending a token. Fix: use the `dotenv-flow` pattern. | Confirmed |
| 14 | **The lesson's central demo produces the opposite of its own thesis.** Same prompt, measured twice: `gpt-5-mini` ("fast model") took **31,523 ms**, then **38,077 ms**. `gpt-5.2` ("reasoning model") took **6,071 ms**, then **5,982 ms**. The "fast" model was consistently **5–6× slower**, and the numbers are stable, so this is not a fluke. Latency is not a static property of a model but of the **(model, task difficulty)** pair — the same `gpt-5-mini` answered Lesson 4's extraction almost instantly. The course's advice *"use fast models for chatbots, they respond in under 1 second"* would have left a user watching a blank screen for 38 seconds. | Confirmed |
| 15 | The comparison script **hardcodes its conclusions as static `console.log` strings** (*"Fast models start responding immediately"*, *"Reasoning models think before responding"*) and bakes the word "slower" into the delta line, so it printed `Speed difference: -32095ms slower for reasoning`. **The demo cannot contradict its lesson no matter what the data says.** An experiment whose result is written before it runs is not an experiment. | Confirmed |
| 16 | Answer quality inverted too, in the subtler direction. **Both models were correct.** `gpt-5-mini` enumerated **all three** balanced solutions — 13 teams (7×12 + 6×11), 17 teams (3×8 + 14×9), 18 teams (12×8 + 6×9) — verified exhaustive. `gpt-5.2` found only the 13-team one, after asserting *"the closest allowed consecutive sizes are 11 and 12"*, which is false: **8 and 9 are equally close**. So the model that was 6× faster was also **less complete**. Speed and thoroughness traded off in the direction opposite to the lesson's taxonomy. | Confirmed |
| 17 | **Token usage explains the inversion and reverses the cost story.** Identical 62-token prompt. `gpt-5-mini` emitted **3,000 output tokens — 376 visible + 2,624 hidden `reasoningTokens`**. `gpt-5.2` emitted **379, all visible, `reasoningTokens: 0`**. The "fast, cheap" model spent **7.9× more output tokens** on the same task. Break-even: `gpt-5-mini` is the cheaper choice only if its output price is under **12.6%** of `gpt-5.2`'s — i.e. `gpt-5.2` must cost **more than 7.9×** per token. **Price per token is not cost. Cost is price × tokens actually spent**, and reasoning tokens are invisible until you log `result.usage`. The course never mentions them. | Confirmed |
| 18 | **Same model, same prompt, different recommendation.** Across runs `gpt-5-mini` enumerated all three valid solutions every time, but recommended **13 teams** in one run and **17 teams** in the next, with different justifications ("largest allowed team sizes" vs "smallest variance around the average"). Lesson 1's *"probabilistic, not deterministic"* made concrete — a product built on this hands users different advice on different days. `gpt-5.2` was stable across runs: same answer, and the same blind spot (only ever considering 11 and 12). | Confirmed |
| 19 | **Prediction wrong — and how it was wrong matters more than the prediction.** The appointment text says *"tomorrow"*, and the code never passes today's date. Predicted the model would echo `"tomorrow"` or hallucinate a date. It returned **`"2026-09-23"` — correctly tomorrow** (run date 2026-09-22) and normalised `3pm` → `15:00` unprompted. The provider is evidently injecting the current date, which is **undocumented and lives entirely outside your code**. The field is therefore right **by accident**: change provider, change model, or have that injection change, and the same source silently starts emitting wrong dates. A test written today passes today and fails later for a reason invisible in the source. **Pass the date explicitly anyway** — not because the model hallucinates, but because correctness you cannot see in your own code is not correctness you can maintain. **Correction, noted at Lesson 9:** the course *does* teach this — Lesson 9 states that `.describe()` is where you supply context "like today's date". So this is **not a gap in the curriculum**; it is that the Lesson 6 scaffold lets you walk onto the mine three lessons before anyone explains it. The original framing here was unfair to the course. | Confirmed (prediction refuted) |
| 20 | **The course states the wrong expected output for its own comparison.** It claims plain `generateText` returns `"Guillermo, Lee, Sarah"` as a string. It actually returned a **multi-section markdown document**: a `Person names:` bullet list plus an unrequested `Organization / product:` section listing Vercel — the same over-broadening of "names" as Finding 12. `text.split(', ')` yields 3 clean names on the course's expected output and one useless blob on the real one. **Reality makes the lesson's own argument better than the lesson's example does.** | Confirmed |
| 21 | **Prediction confirmed exactly.** Input: *"Coffee with John **next Tuesday** at 2pm at Starbucks on Market St, discuss Q4 roadmap"*, run on **Tuesday 2026-09-22**, which makes *"next Tuesday"* genuinely ambiguous even between humans. The model returned `"2026-09-29"` with **no uncertainty signal anywhere in the output**. Six of seven fields were unambiguously present in the text (`eventTitle`, `time` → normalised `14:00`, `location`, `attendees`, `notes`; `duration` correctly `null`). The seventh was a **confident guess at an ambiguous input** — and the two kinds are **indistinguishable in shape, type and apparent confidence**. `eventDetails.date` reads exactly as trustworthy as `eventDetails.time`. This is the concrete price of structured output: the schema has no way to say *"I inferred this"*. The lesson lists *AI Transparency and User Trust* under further reading but never connects it to any code — **this is where it connects**: silently saving an inferred date is the transparency problem, in a single field. | Confirmed |
| 22 | **The transparency fix works — and its value is that nothing visible changed.** Adding `dateWasInferred: z.boolean()` plus an explicit *"Today is Tuesday, 2026-09-22"* inside the `date` field's own `.describe()` produced the **same** date, `2026-09-29`, now flagged `⚠️ Date was inferred`. The output is identical; **the reason it is correct moved from an undocumented provider injection into this project's own source**. That is the entire point: a change that alters no output and makes the system maintainable and testable. Caveat stated before the run and held after it: the model flagged an **obvious** inference. This does **not** establish that it is well calibrated on subtle ones, and one success is not evidence of reliability. | Confirmed |
| 23 | **The `secondBestCategory` ambiguity signal does not work as designed.** Control run on an unmistakable newsletter returned `secondBestCategory: "fyi"` instead of `null`. **2 of 2 emails produced a non-null second category — the field never abstains**, so the `⚠️ ambiguous` warning fires 100% of the time and is useless as a boolean gate. The prediction that the control would return `null` was **wrong**. But the *content* of the pair is still informative: `urgent ↔ action-required` are two categories that would route an email differently in a real system; `newsletter ↔ fyi` are two that would not. **The usable signal is not "is there a second choice?" but "would the second choice change what my system does?"** | Confirmed — technique refuted as designed |
| 24 | **The same email classified differently across two runs**, and this is the strongest evidence in the log for Finding 18. Identical input, model and schema. Run 1: `category: action-required`, `secondBest: urgent`, `estimatedResponseTime: under-30-min`. Run 2: **`category: urgent`, `secondBest: action-required`**, `estimatedResponseTime: under-5-min`. **Primary and secondary swapped places.** If `urgent` fires a push notification and `action-required` files a task, the same email reaches the user differently on different days. The flip also *proves the tie was real* — the model is not choosing, it is coin-flipping. **Running a classification twice and checking for a flip is a more honest ambiguity detector than asking the model to self-report one** — and far more expensive, which is the real trade-off nobody mentions. | Confirmed |
| 25 | **The Lesson 7 scaffold dictates an API that does not exist in v7.** Its TODO says `Output.object({ schema: yourSchema, mode: 'array' })`. Verified against `ai@7.0.4` type declarations: `Output.object` accepts only `{ schema, name, description }` — **there is no `mode`** — and the array form is `Output.array({ element, ... })`, whose parameter is **`element`, not `schema`**. The lesson prose says `Output.array()`, so **the scaffold and the lesson contradict each other and the scaffold is the stale one**. Same residue as Finding 10: the v7 branch bumped dependencies and never updated scaffold comments. | Confirmed |
| 26 | **A category with no true members attracted a false positive; removing it fixed the row and the output became stable.** Only 3 of the 5 enum categories have genuine members in `support_requests.json`. With all 5 offered, ticket 7 was classified `product_feedback` — wrong (Finding 27). With `billing` and `product_feedback` commented out and **nothing else changed**, ticket 7 became `product_issues` — defensible rather than wrong, though `enterprise_sales` still reads better — and **three consecutive runs returned byte-identical output for all 7 rows**. Practical rule: **do not offer categories your real data does not use**; each unused slot is an invitation to misfile. **Stated limit:** the 5-category configuration was only run once, so the enum reduction is not shown to have *caused* the stability — only that the 3-category configuration is stable. | Supported: 3/3 stable |
| 27 | **A clearly wrong classification passed every check the course teaches.** Ticket 7 — *"Do you offer technical support for self-hosted installations?"* — a pre-sales support question, was classified `product_feedback`. It is not feedback under any reading. `z.enum` validated it, TypeScript accepted it, nothing threw. A real routing system would file a self-hosted sales enquiry into the product-feedback queue, where it dies. **6 of 7 correct = 86% accuracy with no signal for which one is wrong** — so a human must read all 7, which is exactly the work the feature was meant to remove. **An accurate classifier without a confidence signal saves nothing.** This is the strongest single argument in the whole log for evaluation sets, and the course does not mention them. | Confirmed |
| 28 | The `request: z.string()` echo was **faithful in all 7 rows** — byte-identical to the input JSON. The design smell stands regardless: the schema pays output tokens to re-emit text the model already received, and uses free-form text as the join key back to the source data when the file already provides an `id`. Faithful today is not a guarantee. | Confirmed |
| 29 | **An undefined criterion gets filled with the model's own, and the output does not say which one.** The course's `urgency` field carries only `.describe('How urgently this request needs a response')` — it never defines what makes something urgent. Distribution came out 2 high / 4 medium / 1 low, so the model did use the full range (the "everything lands on medium" prediction was only half right). But look at *which* criterion it chose: it ranked **user distress**, not business value. Tickets 4 and 7 are both **inbound sales enquiries** — arguably the highest-value rows in the set — and landed `medium` and `low`. Meanwhile *"I'm having trouble cancelling my account"*, a customer actively leaving, landed `high`. A routing system built on this would put the sales queue below a churning user. **The `.describe()` is not documentation — it is where business logic gets defined**, and leaving it vague does not produce a neutral result, it produces someone else's. | Confirmed |
| 30 | **Defining the criterion worked surgically — and exposed that errors compound across fields.** Rewriting only the `urgency` `.describe()` to state the business rule (*"high = blocked, at risk of churning, OR an inbound sales opportunity"*) moved **exactly one row**: ticket 4, enterprise pricing, `medium` → `high`. Every other row was unchanged. **But ticket 7 — equally an inbound sales enquiry (self-hosted is an enterprise offering) — stayed `low`**, because the model had filed it as `product_issues` rather than `enterprise_sales`. From that category it is a support question, not a lead. **The earlier misclassification propagated into a second field.** This is the real hazard of extracting many fields in one call: one wrong field poisons the others, and the result is a perfectly valid object with two wrong values sharing a single root cause. Ticket 7 was flagged as debatable back in Finding 26; that unresolved doubt has now cost a second field. | Confirmed |
| 31 | **Classification held identical across five languages, including two non-Latin scripts.** `support_requests_multilanguage.json` is the same 7 tickets translated (German, Spanish, Chinese, Japanese, Italian), same order and ids — a clean control for meaning-held-constant. **All 7 rows returned the same `category` and `urgency` as the English run**, and `language` was identified correctly in all 7. The bet that Chinese and Japanese would drift was **wrong**. Practical consequence: **no translation step is needed ahead of classification** — no extra call, latency or cost in a multilingual support pipeline. Notably **ticket 7's error replicated identically in Spanish**, so the misclassification lives in the semantics, not the language, and can be fixed once instead of per-locale — a bias that appeared only in Japanese would be far worse, because nobody would see it. **Limit:** 7 tickets, one run, no human-written ground truth. A clean signal, not an evaluation. | Confirmed |
| 32 | **Measured: `POST /summarization 200 in 10176ms`** — 10.2 s for one summary of 20 comments, against `GET` requests of 116–267 ms on the same page. **97% of the wait is the model call.** Predicted 5–20 s. 10 s is the classic threshold at which users stop waiting and switch tasks, and the UI offers nothing but a button reading "Summarizing…" — no progress, no partial output. This is the concrete argument for streaming (Lesson 11): it does not make the response faster, it makes it *look alive* from the first token. | Confirmed |
| 36 | **The baseline with zero `.describe()` was already correct, which undercuts the lesson's own framing.** The course structures this lesson as *step 6: observe the poor baseline, step 7: refine with `.describe()`*. Run with a bare schema and the input *"Lunch with Ana and Carlos next Friday from 1 to 2:30 at Café Central"*, it returned `date: '2026-09-25'` (ISO 8601, **and "next Friday" resolved correctly** from Tuesday 2026-09-22), `startTime: '13:00'` (**inferred PM from the word "lunch"** and used 24-hour format), and `attendees: ['Ana','Carlos']` split into a real array. The prediction of format chaos was **wrong**. Explanation: **field names are already instructions.** `startTime` in a JSON schema implies a time format; `attendees`, plural and typed `z.array`, implies splitting. **A well-named schema is already prompt engineering.** `.describe()` earns its place when you need something *other* than the model's default, or to pin the default so it cannot drift — not to teach the obvious. | Confirmed (prediction refuted) |
| 37 | **The model abstained where the schema gave it no way to, and the distinction from Finding 21 is the useful part.** Input *"Standup with the team at 8"* carries no date at all, and `date` was declared `z.string()` — required, not nullable. Predicted it would fabricate today or tomorrow. **Wrong: it returned `''`.** Zod accepts an empty string, so nothing threw, and the UI's truthiness check (`appointment?.date ? … : null`) rendered "No date or time set" — correct output by accident. Contrast with Finding 21: given **partial** information (*"next Tuesday"*) the model **inferred confidently and silently**; given **no** information it **abstained**. **The dangerous zone is not missing data, it is partial data.** Practical fix is the type, not a `.describe()`: make the field `.nullable()` so abstaining is a legal move instead of something the model has to improvise. | Confirmed (prediction refuted) |
| 38 | **The UI fabricates data, after eight lessons of guarding against the model fabricating it.** `calendar-appointment.tsx` renders every attendee with a hardcoded address: `{attendee.toLowerCase().split(" ").join("_")}@company.com`. The model returned `attendees: ['the team']`, so the card displayed **"the team — the_team@company.com"** beside an avatar, indistinguishable from a real contact. Nothing in the pipeline produced that address. **The leak was in the React component, not the LLM.** Also in this run: `startTime: '08:00'` was extracted correctly and **never shown**, because the card only renders time when `date` is truthy — data correctly extracted, then discarded by render logic. | Confirmed |
| 39 | **The type fix worked where a `.describe()` alone would not have.** Making `date` `.nullable()` and describing *"return null if the text does not state a date"* turned the improvised `''` (Finding 37) into an honest `null`. Describing `attendees` as *"only actual personal names, never group references"* turned `['the team']` into `null`. Deleting the hardcoded `@company.com` line removed the fabricated contact (Finding 38). The card now reads "No date or time set" / "No attendees set" truthfully. **The lesson: abstention has to be legal in the type before any instruction can ask for it.** | Confirmed |
| 40 | **Supplying today's date does not stabilise a relative date, and the hypothesis that it did was wrong.** Same input, same code, `.describe()` carrying *"Today is Tuesday, 2026-09-22"*: run 1 returned `2026-10-02`, run 2 returned `2026-09-25` — **a week apart**. The initial reading, that the explicit date caused a considered shift to next week's Friday, was **refuted by one repeat run**. It simply coin-flips. **Giving the model today's date fixes what it *knows*; it does not fix how it *interprets* "next Friday".** Those are two different problems and only the first is a `.describe()`'s job. **There is no correct answer to pin**, because the phrase is ambiguous to humans too — so no amount of prompt engineering stabilises it. The only remaining fix is the one improvised in Lesson 6: a `dateWasInferred` flag and a confirmation step. **Do not guess better; admit you are guessing.** | Confirmed (hypothesis refuted) |
| 41 | **A precise prompt to v0 produced zero integration work.** The prompt carried the exact TypeScript interface, *"one row per array element"*, *"do not add any dependency beyond shadcn/ui and lucide-react"* and *"render only from its props, no hardcoded sample data"* — **each constraint written from a defect already recorded in this log** (34, and v0's habit of inlining demo data). The generated component honoured all of them, so swapping it in changed **exactly one line**, the import; `<SummaryCard {...summary} />` was untouched and `tsc --noEmit` passed. Had the prompt been vague and v0 invented its own prop names, the same swap would have needed an adapter. **Prompting a generator is the same discipline as prompting a model: the constraints worth writing are the ones that close the doors it would otherwise walk through.** | Confirmed |
| 42 | **The lesson prescribes dependencies for a component that does not exist yet.** It instructs `shadcn add card`, `shadcn add badge` and `pnpm add lucide-react`. `card` and `lucide-react` were **already in the repo**, and the generated component used lucide icons rather than `Badge`, so `badge` was installed and never used. **What you need to install depends on what v0 generates, which is unknowable before you prompt.** | Confirmed |
| 33 | **Confirmed: the `.describe()` instruction is what makes the summary actionable.** `takeaways` carries `'**Include names** for assigned tasks'`, and the output assigned work to Liam, Sophia, Emma and James by name. Without it the summary would read *"someone will prepare the slides"* — accurate and useless. The business requirement lives in the schema, not the prompt. | Confirmed |
| 34 | **The course's own summary card renders correct data incorrectly, because three layers disagree.** `takeaways` is declared `z.string()`, its `.describe()` asks for *"2-3 **bullet points**"*, and `summary-card.tsx` renders `<li>{takeaways}</li>` — a single list item. The model complied and emitted dashes; they render as literal `-` characters mid-paragraph. **A `z.string()` holding markdown is a type lying about its contents.** Fix: `z.array(z.string())` plus `.map()` in the component — and because `type Summary = Awaited<ReturnType<typeof generateSummary>>`, TypeScript flags the component *before* the code runs. Rule: **if the `.describe()` asks for a list, the schema must be a list.** | Confirmed |
| 35 | **A Server Action is a public HTTP endpoint, and the course treats it as a private function.** The dev log shows it plainly: `POST /summarization`. `generateSummary(comments: any[])` takes **unvalidated input straight into an LLM prompt** — no schema, no size limit, no shape check. Anyone who can reach the page can POST arbitrary content: unbounded input (burns credits), and prompt injection inside any `content` field. Harmless in this exercise, where the client sends a static JSON file — **but this is the pattern people copy into production**. The course teaches validating what comes **out** of the model and says nothing about validating what goes **in**. | Confirmed |

### Side note: measurement errors of our own

- The Lesson 2 few-shot "without examples" run was first executed as a **second
  turn in the same playground conversation**, so the examples were still in
  context. Result was void. Re-run in a fresh conversation, which produced
  Finding 9. *Lesson: the playground is a chat, not an isolated call.*
- Predicted that CoT would help the older model more than the newer one.
  **Wrong** — the older model did not engage with the prompt at all
  (Finding 8), so the hypothesis could not be tested.
- Predicted that the AI Gateway **API** would reject `openai/gpt-5-mini` because
  the playground did. **Wrong** — the API accepted it on the first call
  (Finding 3). Two different permission systems.
- Suspected `gpt-5.2` had answered incorrectly, based on a 200-character
  truncated preview that opened with *"the best equal-size option is 9"*.
  **Wrong** — the full output showed it was setting up a divisibility check and
  correctly ruled 9 out. *Lesson: never judge a model's answer from a truncated
  preview; print the whole thing before concluding.*
- Bet that the `secondBestCategory` control run on an obvious newsletter would
  return `null`. **Wrong** — it returned `"fyi"`. The field never abstained in
  any run (Finding 23). The control was worth running precisely because it
  refuted the technique rather than confirming it.

---

## Lesson log

### 1 — Introduction to LLMs · ✅
Conceptual, no code, no commit. Key takeaways: LLM-as-API, finite paid context,
probabilistic output (so no exact-match tests), confident hallucination, and the
shift from parsing prose to schema-validated structured output.
**Produced Findings 1, 2.**

### 2 — Prompting Fundamentals · ✅
Conceptual + 3 playground exercises. ICOD prompt structure; zero-shot, few-shot,
Chain-of-Thought. Exercises 1 and 2 run on GPT-5 nano vs GPT-4.1 nano in synced
panels. Exercise 3 (schema) **skipped** — deferred to Lesson 4 where it is done
in real code.
**Produced Findings 6, 7, 8, 9.**

### 3 — AI SDK Dev Setup · ✅
Forked, cloned, fast-forwarded to AI SDK v7, installed, approved 4 native build
scripts, configured `.env.local` with an AI Gateway API key, `env-check.ts`
passed.
**Produced Findings 10, 11.**

Course checklist (verbatim):
- [x] Repository cloned and dependencies installed
- [x] `.env.local` file created and configured
- [x] `env-check.ts` ran successfully
- [x] Ready to start building

### 4 — Data Extraction · ✅
First real LLM call. Added `generateText` to `app/(1-extraction)/extraction.ts`
against Paul Graham's *Founder Mode* essay.

- **`pnpm extraction` failed** → Finding 11 confirmed. Ran via
  `pnpm tsx "app/(1-extraction)/extraction.ts"` instead.
- **`openai/gpt-5-mini` worked** → Finding 3 resolved; the prediction that the
  API would reject it was wrong.
- Output: `September 2024, YC, Brian Chesky, Ron Conway, Airbnb, Steve Jobs,
  Apple, Silicon Valley, John Sculley` — see Finding 12.

**Challenge 1 (prompt swap → summarization).** Same function, same model, same
infrastructure; only the prompt string changed. Asked for 50 words, returned ~51
— unusually tight adherence to a word count. Summary was factually accurate.

**Bonus (fixing the ambiguous prompt).** Adding two constraint sentences —
*"only the names of people"* / *"do not include companies, organizations, places,
or dates"* — returned exactly `Brian Chesky, Ron Conway, Steve Jobs, John Sculley`.
Precision went from **4/9 (44%)** to **4/4 (100%)** with **zero code change**.
Finding 12 was a prompt defect, not a model defect — proven, not assumed.

Challenge 2 (model swap to `openai/gpt-5`) not run.

`extraction.ts` is committed with the corrected prompt rather than the course's
ambiguous one, because the corrected version is the one backed by evidence here.

**Produced Finding 12.**

### 5 — Model Types and Performance · ✅
Built `model-comparison.ts` at the repo root. The lesson's thesis is *fast models
vs reasoning models*. **Every axis measured came out against it.**

| | `gpt-5-mini` ("fast") | `gpt-5.2` ("reasoning") |
|---|---|---|
| Run 1 / 2 / 3 | 31,523 / 38,077 / 42,005 ms | 6,071 / 5,982 / 7,387 ms |
| Latency variance | ~21% | ~1.5% |
| Output tokens | **3,000** (376 text + 2,624 reasoning) | **379** (379 text + 0 reasoning) |
| Correct | ✅ | ✅ |
| Solutions found | 3 of 3 | 1 of 3 |
| Stable across runs | ❌ changed its recommendation | ✅ |

Deviations from the course: `dotenv-flow` instead of `dotenv/config`
(Finding 13); full output instead of 200-char previews; added `result.usage`
logging, which is what surfaced Finding 17.

**Produced Findings 13, 14, 15, 16, 17, 18.**

**Conclusion, against the lesson:** the fast/reasoning taxonomy no longer
describes these models. Both reason; they differ in *how many hidden tokens they
burn to get there*. The decision framework worth keeping is not "fast model vs
reasoning model" but **measure `usage` and latency on your own task**, because
neither is predictable from the label or the per-token price.

Open question, not chased: `outputTokens` was exactly **3,000** for
`gpt-5-mini` (376 + 2,624). A suspiciously round number — possibly a cap.
Logging `result.finishReason` (`stop` vs `length`) would settle it.


### 6 — Introduction to Invisible AI · ✅
`Output.object()` with Zod. Implemented `test-structured.ts` (text vs structured
comparison) and both functions in `invisible-ai-demo.ts`. Beyond the course:
`dateWasInferred` and `secondBestCategory` fields to surface uncertainty, plus an
explicit today's-date in a `.describe()`. The `secondBestCategory` idea was
**refuted by its own control run**.
**Produced Findings 19-24.**

### 7 — Text Classification · ✅
`Output.array({ element })` over `support_requests.json`, then `urgency`, then
the multilingual file. Four experiments, each changing one variable:

1. Baseline, 5 categories → ticket 7 misclassified as `product_feedback`.
2. Dropped the 2 unused categories → ticket 7 became defensible; 3/3 runs stable.
3. Defined the business criterion in `urgency`'s `.describe()` → moved exactly
   one row (ticket 4, `medium` → `high`) and exposed error compounding.
4. Switched to the multilingual file → all 7 rows identical to English.

**Produced Findings 25-31.**

---



### 8 — Automatic Summarization · ✅
First web lesson. Created `actions.ts` as a Server Action (`'use server'`) and
wired the button in `page.tsx`. 20 comments in, one structured summary out.

- `'use server'` is why the API key never reaches the browser — the architectural
  reason every previous lesson was CLI-only.
- No `dotenv-flow` here: Next.js loads `.env.local` for server code by itself.
- Measured 10,176 ms then 8,282 ms per summary, against 44–267 ms page loads.
- Fixed the course's `takeaways` field from `z.string()` to `z.array(z.string())`
  and updated `summary-card.tsx` to `.map()` over it. Changing the Zod schema
  raised a TypeScript error in the React component **before running anything** —
  the payoff of `type Summary = Awaited<ReturnType<typeof generateSummary>>`.
- Side observation, not established: after the array change each takeaway carried
  **full** names ("Liam Johnson") where the single-string version used first names
  only. Plausibly because one string per item leaves room to be self-contained,
  but a single run and non-determinism (Findings 18, 24) make this unproven.
- `headline` differed across runs — "Proceed to Next Phase" then "Client Call
  Prep". Both valid; same non-determinism as Finding 18.

**Produced Findings 32, 33, 34, 35.**

### 9 — Structured Data Extraction · ✅
Closes the Invisible AI section. Created `schemas.ts` and `actions.ts`, wired
`page.tsx`, ran a bare-schema baseline first, then broke it deliberately, then
fixed only what actually broke.

- **Baseline with zero `.describe()` was already correct** — ISO date, 24-hour
  time, PM inferred from "lunch", attendees split into an array (Finding 36).
  Field names carry more instruction than the course credits.
- *"Standup with the team at 8"* exposed two defects: a non-nullable `date` the
  model answered with `''` (Finding 37) and a React component fabricating email
  addresses (Finding 38).
- The fixes that mattered were a **type** change (`.nullable()`) and a **deletion**
  (the hardcoded `@company.com`), not extra prose in a `.describe()`.
- **Relative dates stayed unstable even after supplying today's date**:
  `2026-09-25` → `2026-10-02` → `2026-09-25` (Finding 40).

Three predictions in this lesson, **two refuted** (36, 40) and one confirmed (39).

**Produced Findings 36, 37, 38, 39, 40.**

### 10 — UI with v0 · ✅
Generated a `SummaryCard` in v0 and swapped it in for the hand-written one.
Division of labour: the prompt was written by hand, the plumbing (installing
`badge`, creating the file, rewiring the import) was mechanical.

- The prompt carried the exact TypeScript interface plus constraints drawn from
  earlier findings. Result: **one line changed** in `page.tsx` and `tsc --noEmit`
  passed with `<SummaryCard {...summary} />` untouched (Finding 41).
- `badge` was installed on the lesson's instruction and never used (Finding 42).
- **Finding 4 resolved**: v0 needs a login, not a paid plan.
- Deleted `app/(3-summarization)/summarization/summary-card.tsx`, now unreferenced.
  It remains in history at commit `d4bcada`.

**Produced Findings 41, 42. Resolved Finding 4.**

---

## Paused here

Stopped after Lesson 10 on **2026-09-22**. 10 of 16 done, 42 findings, nothing
uncommitted and no open findings.

**Resume at Lesson 11 — Basic Chatbot**: streaming, the `useChat` hook from
`@ai-sdk/react`, and a route handler instead of a Server Action. It is the lesson
that answers Finding 32 — the 10 seconds spent staring at a button.

On resuming: `pnpm install` if anything looks stale, then
`pnpm tsx env-check.ts` to confirm the API key is still live.
## Security ledger

| Item | Status |
|---|---|
| `.env.local` git-ignored | ✅ Verified via `git check-ignore` → `.gitignore:29:.env*.local` |
| API key `vck_0PE0…` | ⚠️ 20-char prefix leaked into a chat transcript → **rotated and revoked 2026-09-21** |
| Current API key | 🔓 Long-lived, does not expire — **rotate or delete at end of course** |
| Auto top-up | ✅ Disabled — the $15 balance is a hard ceiling |
| AI Gateway budget | ❓ $5 cap suggested — **not confirmed as set** |
| Public deployments | ✅ None. Chose API key auth specifically to avoid `vc deploy` |
| PowerShell history | ⚠️ Never type secrets in the terminal — `PSReadLine` stores input in plaintext at `$env:APPDATA\Microsoft\Windows\PowerShell\PSReadLine\ConsoleHost_history.txt`. Secrets are pasted in VS Code only. |

---

## End-of-course cleanup list

- [ ] Rotate or delete the AI Gateway API key
- [ ] Confirm auto top-up is still disabled
- [ ] Decide what to do with unused credits before 2027-09
- [ ] Check whether any Vercel deployment was created (should be none)
- [ ] Resolve open finding 4 (v0 paid-plan requirement) at Lesson 10

---

## Spoiler warning

Reference solutions live in git, not just on the course site:

- `513db73 Completed invisible ai section` — reverted by `56055d8`, still
  reachable via `git show 513db73`. Covers lessons 6–9.
- `upstream/01-fundamentals-complete` — completed Section 1.

Use them **after** attempting a lesson, to compare. Not before.
