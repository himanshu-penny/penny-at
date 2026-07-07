---
name: penny-business
description: Single source of truth for Penny e-procurement business knowledge — terminology, workflows, rules, personas, and project-variant differences (enterprise, rcmc, ewcf, sabil, nhc, voltalia, tahakom, modern mills). Use this skill whenever a chat mentions Penny business concepts (RFP, RFQ, RFC, EOI, sealed bid, gating committee, direct award, GRN, proforma, expense account, budget, approval workflow, workspace, requester, vendor, buyer, sourcing, P2P, procure-to-pay, payment, bill, order, request, scoring, award, negotiation, revision, change request, technical questions, commercial scoring, Sabil, EWCF, NHC, RCMC, enterprise variant), to answer questions about how Penny works, to validate user claims against the knowledge base, or to capture new business rules into the source of truth.
---

# penny-business — Penny E-Procurement Source of Truth

This skill is the **single authoritative reference** for everything about how the Penny e-procurement platform works as a business. It is **business-only** — no code paths, no fixture names, no test infrastructure. For code patterns, fixtures, page objects, and test infrastructure in this repo, use `penny-create-standard-code` and `penny-api-sdet` instead.

## penny-at local alignment

This framework imports the original business knowledge, but test generation must
still follow the current `penny-at` structure:

- Valid standalone `CLIENT` values are `ewcf`, `rcmc`, `enterprise`, and `sabil`.
- `srmg` and `voltalia` are enterprise subfolders or business variants, not
  top-level `CLIENT` values.
- Business knowledge may mention variants such as `nhc`, `tahakom`,
  `modern_mills`, and `voltalia`; do not convert those into framework clients
  unless the local config explicitly supports them.
- Do not create mobile tests, `@mobile` tags, or `TC_MOB` IDs.
- Use business knowledge to choose meaningful scenarios, then use
  `penny-create-standard-code` for folders, naming, tags, and implementation.

---

## What this skill knows

The `knowledge/` folder is organized as follows. Read on demand — never load everything.

```
knowledge/
  README.md              Navigation guide — read first when unsure where to look
  glossary.md            Terminology A-Z (RFP, RFQ, sealed bid, gating committee, etc.)
  modules/               One file per business module — owns workflow, rules, statuses, terms
  cross-cutting/         Topics that span multiple modules (P2P, approval routing, etc.)
  variants/              Differences between enterprise / rcmc / ewcf / sabil / nhc / others
  personas/              Buyer and vendor user roles
```

---

## When to invoke

Invoke this skill (or auto-invoke from the description trigger) when:

1. The user asks a question about a Penny business concept ("what is sealed bid?", "how does approval routing work?", "what does NHC support?").
2. The user states a business rule in passing while doing another task ("since gating committee triggers above $50K…", "after the order is approved the budget gets booked, right?").
3. The user is writing or planning a test that needs to model a business flow — consult the relevant module file to verify the flow before producing code (then hand off to `penny-create-standard-code` or `penny-api-sdet` for the code patterns).
4. The user explicitly asks for "penny-business", asks "what is X in Penny", or asks to add/update a business rule. (There is no slash command — invocation is by mentioning the skill or by auto-trigger on business terms.)

---

## Behavior when invoked

### 1. Answering questions

When the user asks about a Penny concept:

- Locate the relevant file (start with `knowledge/README.md` if unsure; jump straight to `knowledge/glossary.md` for term lookups; or go directly to the relevant `modules/` or `cross-cutting/` file).
- Quote the entry concisely. Cite the file path so the user can verify.
- If the knowledge folder does not contain the answer, **say so explicitly**. Do not invent rules. Offer to capture the missing information.

### 2. Validating user claims (the most important behavior)

When the user states a business rule in passing — even if their primary task is something else — compare it against the knowledge folder. Three outcomes:

- **Matches** → Continue silently. Do not interrupt the user's flow with confirmation.
- **Conflicts** → **Interrupt immediately**: "The penny-business SoT says X, but you said Y — which is correct?" Wait for the user's resolution before continuing the original task. On resolution, edit the knowledge folder if the SoT was wrong, or proceed if the user was misremembering.
- **Not present** → Ask: "I don't have a rule in penny-business about [specific topic]. Should I add this to [proposed file path]?" If yes, write the entry and confirm; if no, continue.

**Why this matters:** the SoT only stays current if every casual claim becomes either a confirmation, a correction, or a capture event. This is the maintenance mechanism — there are no hooks or scheduled audits.

### 3. Capturing new knowledge

Only edit the knowledge folder after the user confirms. When editing:

- Pick the **smallest correct file**. A new term → `glossary.md`. A rule about RFP technical scoring → `modules/e-sourcing.md` (or `cross-cutting/scoring-and-awards.md` if it spans modules). A variant-specific behavior → the relevant `variants/*.md`.
- Keep entries **business-only**: no file paths, no function names, no fixture references. Use prose, tables, and lists.
- Add a **cross-reference line** at the bottom if the new entry relates to existing material ("See also: cross-cutting/approval-routing.md").
- After writing, confirm to the user with the file path and a one-line summary of what was added.

### 4. Hand-off to penny-at implementation skills

When the user's actual goal is to write or modify a test, this skill is consulted
for the business flow only. The moment the conversation moves into code
patterns, fixtures, API signatures, page objects, or test infrastructure, defer
to `penny-create-standard-code`, `penny-api-sdet`, or the relevant creation/review
skill. Do not pollute penny-business knowledge files with implementation
details.

### 5. Capturing rules discovered from code

The validation loop in section 2 covers user-stated claims. There is a parallel loop for **code-derived knowledge**:

- When you (or a downstream implementation skill) read code, tests, fixtures, or constants and discover a business rule **not** in the knowledge folder, propose capture: _"I noticed in `<file path>` that `<rule>`. This isn't in penny-business — should I add it?"_
- This applies especially when you read code to answer a question and the answer reveals a missing rule.
- Use the `**Verified:**` provenance label with the code reference.
- Quality filter: only propose business rules (workflow logic, state transitions, validation logic, variant flags, terminology). Do NOT propose code-style facts (function names, file paths, fixture shapes) — those belong in `penny-api-sdet` and `penny-create-standard-code`.

---

## Knowledge folder reading rules

- **Do not load everything at once.** Read only the file relevant to the current question.
- **Glossary is the entry point** for terminology questions. Modules and cross-cutting are the entry points for "how does X work" questions.
- **Variant-specific behavior** always lives in `variants/`. A module file describes the default (typically enterprise) behavior and points to `variants/` for deviations.
- **State transitions** for all entities are consolidated in `cross-cutting/state-transitions.md` to make cross-entity comparison easy. Module files describe state semantics but defer to cross-cutting for the master tables.

---

## Quality bar for edits

When asked to capture a rule:

- **Concrete over abstract**: "RFP requires at least 1 technical question" beats "RFPs have technical evaluation."
- **Why over what**: include the reason if the user knows it. Reasons survive refactors that may invalidate the exact mechanism.
- **No info > wrong info**: if you cannot verify a specific (a number, a state name, a threshold, a behavior), do NOT invent it. Either omit the specific, mark it `**Status: unverified**`, or ask the user.
- **Date your changes** at the top of the section if you edit something substantial. Top of file should carry a "Last updated: YYYY-MM-DD" line.
- **Log the edit** in `knowledge/_changelog.md` with a one-line entry per change.

---

## Provenance convention (required on fact-bearing entries)

Every entry that asserts a specific behavior, rule, threshold, or state MUST carry one of these labels:

| Label                                       | Meaning                                                                               | When to use                                                               |
| ------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `**Verified:** <evidence>`                  | The fact is backed by code, page objects, fixtures, or tests                          | Include a file path or constant name as evidence                          |
| `**Verified by user:** <date>`              | The user explicitly confirmed this fact                                               | Use when capturing user-provided knowledge during a conversation          |
| `**Source:** prior QA docs (unverified)**`  | The fact was migrated from older docs and not re-verified                             | Use during migration; should be upgraded to Verified or removed over time |
| `**Imported evidence:** <source reference>` | The evidence path came from imported automated-test knowledge, not local `penny-at`   | Use until the same rule is confirmed in this repo or by the user          |
| `**Status: unverified**`                    | The term appears in project lore but cannot be confirmed in code or with the user yet | Use as a placeholder when removing the fact entirely would lose context   |

When a fact-bearing entry has no label, treat it as unverified during review.

When you discover a contradiction between code and an existing entry, **trust the code**: update the entry with new evidence and bump its provenance label. Note the correction in `_changelog.md`.

---

## What this skill does NOT do

- Does **not** generate test code — use `penny-create-standard-code`, `penny-api-sdet`, or `penny-create-api-script`.
- Does **not** review test code — use `penny-review-api-script`.
- Does **not** debug failing tests — use the test-healing tools.
- Does **not** maintain an implementation map of "concept → file path." If a concept is needed in code, the consumer skill (`penny-api-sdet`, `penny-create-api-script`, `penny-create-web-script`) is responsible for grepping or knowing the implementation; penny-business stays pure.
