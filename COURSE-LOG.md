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
| 4 | Lesson 10 uses v0. The credit purchase dialog states *"Credit applied to v0 requires a paid v0 plan"*, so purchased AI Gateway credit may not be spendable there. | **Open** — revisit at Lesson 10 |
| 5 | AI Gateway credits **expire one year after purchase** (2027-09 for this account). | Confirmed |
| 6 | Same prompt, two models, same correct answer, **different output shape**: GPT-5 nano echoed the input before the labels; GPT-4.1 nano emitted only the labels. Prompting *suggests* format; it does not guarantee it. This is the concrete argument for `Output.object()`. | Confirmed |
| 7 | Lesson 2's Chain-of-Thought exercise pairs a **constraint-satisfaction math example** with an **open-ended business question**. There is no transferable reasoning pattern between them, so the exercise does not measure what it claims to. | Confirmed |
| 8 | Given the same deliberately-truncated CoT prompt, **GPT-5 nano repaired it** (completed the dangling example, correct arithmetic) while **GPT-4.1 nano surrendered** with *"your second question is incomplete"*. Robustness to malformed prompts varies enormously between models — and the failure was a **valid string, not an error**, so no `try/catch` or "did it respond?" check would catch it. | Confirmed |
| 9 | Few-shot examples stabilize behaviour **across different models**, not just output format. With examples, two model generations produced near-identical output; without them they diverged wildly (one sentence vs. a ~270-token report). Well-exemplified prompts are what make model swapping safe. | Confirmed |
| 10 | The starter repo's `main` ships **AI SDK v6**, while the course prose teaches **v7** and `Output.object()`. The v7 upgrade exists in the unmerged branch `chore/upgrade-ai-sdk-v7` (Eve Porcello, 2026-06-30) and **the course never mentions it**. Following the setup lesson literally installs v6 and then applies v7 instructions. Unmerged for ~3 months. | Confirmed → **worked around** |
| 11 | `package.json` scripts escape parentheses for POSIX shells (`tsx app/\\(1-extraction\\)/extraction.ts`). pnpm on Windows spawns via `cmd.exe`, where `\` is a path separator, not an escape. **`pnpm run extraction` is predicted to fail on Windows.** Workaround: `pnpm tsx "app/(1-extraction)/extraction.ts"`. The v7 branch did not fix this. **Confirmed in Lesson 4**: `pnpm extraction` fails with `/extraction.ts was unexpected at this time.` (exit 255) — a `cmd.exe` parser error, since `(` and `)` are grouping operators there and `\` does not escape them (cmd uses `^`). The quoted direct call works. **Every CLI lesson in this course needs this workaround on Windows.** | Confirmed |
| 12 | The course prompt says *"Extract all the names mentioned in this essay"* and the model returned **named entities, not person names**: companies (`YC`, `Airbnb`, `Apple`), a place (`Silicon Valley`) and a date (`September 2024`, which is not a name under any reading). "Names" is ambiguous and the model resolved it its own way — a live demonstration of Lesson 2's *"be specific and over-explain"*. The output is also an unparsed comma string, fragile to any name containing a comma. | Confirmed |

### Side note: measurement errors of our own

- The Lesson 2 few-shot "without examples" run was first executed as a **second
  turn in the same playground conversation**, so the examples were still in
  context. Result was void. Re-run in a fresh conversation, which produced
  Finding 9. *Lesson: the playground is a chat, not an isolated call.*
- Predicted that CoT would help the older model more than the newer one.
  **Wrong** — the older model did not engage with the prompt at all
  (Finding 8), so the hypothesis could not be tested.

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

### 3 — AI SDK Dev Setup · in progress
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

---

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
