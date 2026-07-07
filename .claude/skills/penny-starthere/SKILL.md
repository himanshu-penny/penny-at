---
name: penny-starthere
description: First-stop router for anyone new to penny-at automation. Use when a user says "where do I start", "I'm new here", "onboard me", "which skill should I use for X", "help me get up to speed", or when a request is too broad to fit any single specialized skill. Points at ONBOARDING.md and delegates to the right skill.
---

# Penny — Start Here

You are lost, new, or don't know which skill to invoke. This is the router.
The real content lives in `ONBOARDING.md` at the repo root.

## What This Skill Does

- Points you at `ONBOARDING.md`.
- Answers "which skill should I use for X?".
- Nothing else. Every real task is handled by a specialized skill.

## When To Use

- First day on the framework.
- User says "where do I start", "onboarding", "help me get going", or similar.
- User asks a question that spans multiple skills and needs routing.
- User invokes `/penny-starthere` explicitly.

## Do Not Use For

- Any actual task once the right skill is identified — route and stop.
- Deep framework questions → route to `/penny-api-sdet`.
- Business questions → route to `/penny-business`.

## Behavior When Invoked

1. Read `ONBOARDING.md` if you haven't loaded it this session.
2. Ask the user which phase they're in:
   - "Just installed" → `/penny-setup`.
   - "Trying to understand what Penny is" → `/penny-business` + read
     `.claude/skills/penny-business/knowledge/README.md`.
   - "Writing my first test" → `/penny-create-standard-code` +
     `/penny-create-api-script` or `/penny-create-web-script`.
   - "A test is failing" → `/penny-debug-triage`.
   - "I need to review something" → `/penny-review-api-script`,
     `/penny-review-web-script`, or `/penny-review-framework-change`.
3. If they don't know, show them the skill map from `ONBOARDING.md` and stop.

## The One-Liner Router

If the user is impatient, paste this:

> Start at `/penny-setup`. Then read
> `.claude/skills/penny-business/knowledge/README.md`. Then use
> `/penny-create-api-script` or `/penny-create-web-script` with
> `/penny-create-standard-code` open. When a test breaks, use
> `/penny-debug-triage`.

## Full Skill Map

| I want to…                                   | Skill                            |
| -------------------------------------------- | -------------------------------- |
| Set up the repo, run tests, open reports     | `/penny-setup`                   |
| CLI recipes — grep, headed, debug, ports     | `/playwright-cli`                |
| Know what a Penny term means / business flow | `/penny-business`                |
| Understand the coding standard               | `/penny-create-standard-code`    |
| Write an API test                            | `/penny-create-api-script`       |
| Write a web test                             | `/penny-create-web-script`       |
| Review an API test                           | `/penny-review-api-script`       |
| Review a web test                            | `/penny-review-web-script`       |
| Design test data setup / cleanup             | `/penny-test-data-setup`         |
| Debug a red test / interpret a trace         | `/penny-debug-triage`            |
| Write a Node / shell utility                 | `/penny-create-utility-script`   |
| Add a new BaseApiClient subclass             | `/penny-create-api-client`       |
| Add / update a JSON schema                   | `/penny-schema`                  |
| Onboard a new client (tenant)                | `/penny-add-client`              |
| Configure CI                                 | `/penny-ci`                      |
| Review a framework-core change               | `/penny-review-framework-change` |
| Audit the framework as a whole               | `/penny-framework-health-check`  |
| Audit business knowledge for drift           | `/penny-knowledge-audit`         |
| Deep API framework reference                 | `/penny-api-sdet`                |

## Output Format

Keep it short. This skill's job is to route, not to explain.

1. **What phase they're in** — one sentence.
2. **Skill to use next** — one line, with a slash command.
3. **Optional: the one-liner router** if they seem overwhelmed.
4. **Do not run any tool calls other than reading `ONBOARDING.md` or the target
   skill's `SKILL.md`.**

## Quality Checklist

- Never do the target skill's job — always route.
- Never produce more than 10 lines of output unless the user asks for the full
  skill map.
- Never invent a skill that isn't in the map above.

## Do Not Do

- Do not write code from this skill.
- Do not run tests from this skill.
- Do not answer domain questions from this skill — route to `/penny-business`.
- Do not audit the framework from this skill — route to
  `/penny-framework-health-check`.

## Related Skills

Every specialized skill in the map above. This skill only points; specialized
skills do.
