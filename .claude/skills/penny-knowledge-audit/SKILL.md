---
name: penny-knowledge-audit
description: Periodic drift audit between .claude/skills/penny-business/knowledge and current penny-at code. Use when the user asks to check whether documented business rules still match implementation, upgrade "unverified" entries, catch stale variant flags, or produce a punch list of knowledge entries that need re-confirmation.
---

# Penny Knowledge Audit

Keep `penny-business/knowledge/**/*.md` honest. The SoT only stays current if
someone occasionally cross-checks documented rules against code and against
newer team knowledge. This skill runs that audit and produces a punch list —
not code changes. For capturing a single new rule as it surfaces mid-conversation,
use `/penny-business` (its validate-user-claims loop).

## When To Use

- Quarterly audit before a release.
- After a large refactor that touched fixtures, transport, or client-config.
- When onboarding a new senior QA who spot-checks documentation.
- When `_changelog.md` has been quiet for a while — silence often means drift.
- After adding a new client (via `/penny-add-client`) — variant docs need review.

## Do Not Use For

- Capturing a single rule the user just stated → `/penny-business` handles that.
- Rewriting the whole knowledge folder — this skill produces a punch list only.
- Reviewing framework code changes → `/penny-review-framework-change`.

## Required Inputs

- **Scope** — full audit, or a specific area (glossary, one module, one variant,
  personas).
- **How aggressive** — surface only High-priority drift, or catalogue every
  unverified entry.
- **Reference date** — usually "since the last `_changelog.md` entry".

## Repository Review Before Action

Read (as needed, on demand):

- `.claude/skills/penny-business/knowledge/README.md` — folder structure + rules.
- `.claude/skills/penny-business/knowledge/_changelog.md` — last-touched dates.
- `.claude/skills/penny-business/knowledge/glossary.md`.
- `.claude/skills/penny-business/knowledge/modules/*.md`.
- `.claude/skills/penny-business/knowledge/cross-cutting/*.md`.
- `.claude/skills/penny-business/knowledge/variants/*.md`.
- `.claude/skills/penny-business/knowledge/personas/*.md`.

Cross-check against code as needed:

- `src/config/client-config.ts` — actual client + env list.
- `src/core/constants/urls.ts`, `src/core/constants/routes.ts`.
- `src/tests/{client}/**` — which flows are actually covered.
- Any fixture / factory / helper that encodes a rule.

## Step-By-Step Workflow

1. **Skim `_changelog.md`.** Which files haven't been touched in months? Those
   are drift candidates.
2. **Provenance sweep.** List every entry whose provenance label is
   `**Status: unverified**` or `**Source:** prior QA docs (unverified)`. These
   are backlog.
3. **Client list check.** Compare `client-config.ts` `ClientName` union +
   `CLIENT_NAMES` array against `variants/variant-matrix.md`. Any mismatch =
   drift.
4. **Feature-flag check.** `cross-cutting/feature-flags.md` — pick five
   flag-gated rules and grep the code / tests for the flag string. Any
   mismatches?
5. **State-transition check.** `cross-cutting/state-transitions.md` vs any
   `enum` in code (schemas, types). Mismatched statuses = drift.
6. **Persona / role check.** `personas/role-permissions-matrix.md` vs current
   fixture roles (`adminAccessToken`, `userAccessToken`). Are the roles
   currently tested a strict subset of the matrix?
7. **Variant deltas.** For each `variants/<client>.md`, spot-check three claims
   against the client's live `src/tests/{client}/**` specs.
8. **Cross-reference sanity.** For each module doc, check it links to the
   canonical cross-cutting docs where relevant.
9. **Produce the punch list.** Group by drift severity; propose the next
   `_changelog.md` entry format.

## Provenance Upgrade Rules

- `**Status: unverified**` → `**Verified by user:** <date>` when the user
  confirms in this session.
- `**Source:** prior QA docs (unverified)` → `**Verified:** <code reference>`
  when the audit finds the fact in code.
- Any entry disproved by code → correct the entry + bump provenance +
  `_changelog.md` line.
- Never silently delete a provenance label; either upgrade or downgrade with a
  changelog note.

## Output Format

1. **Scope** — what was audited.
2. **Drift findings** — highest severity first:
   - **Entry:** file:section
   - **Documented:** what the SoT says
   - **Observed:** what the code / tests / user says
   - **Evidence:** file paths / commands / user quotes
   - **Recommended action:** upgrade provenance / correct entry / remove /
     capture new rule
   - **Priority:** High / Medium / Low
3. **Provenance backlog** — count and list of entries still tagged
   `Status: unverified` or `Source: prior QA docs (unverified)`.
4. **Coverage gaps** — knowledge described but not tested; tests without
   knowledge coverage.
5. **Proposed `_changelog.md` entry** — one line per applied change.
6. **Assumptions / blockers** — usually "user needed to confirm rule X".

## Quality Checklist

- Every finding names the specific knowledge file + section.
- Every finding cites either a code reference, a user quote, or an existing
  code test.
- Findings ordered by drift severity, not by folder.
- Provenance upgrades are proposed with the exact label to change to.
- The final punch list fits on one page — this is a review, not a rewrite.
- Never asserts a business rule the audit itself invented.

## Do Not Do

- Do not edit knowledge files as part of the audit — the skill produces a punch
  list. Applying the edits is a separate action, gated on user confirmation.
- Do not delete "unverified" entries wholesale — many are legitimate lore that
  needs upgrading, not removing.
- Do not cross the line into code review — that's `/penny-review-framework-change`.
- Do not make new business rules up from code observation without asking the
  user to confirm the rule matches business intent (code can be wrong too).

## Related Skills

- `/penny-business` — captures the _outcome_ of an audit's approved changes.
- `/penny-framework-health-check` — the code-side companion audit.
- `/penny-review-framework-change` — when code changes triggered a knowledge
  drift.
- `/penny-add-client` — adds a new variant doc that this audit will check.
