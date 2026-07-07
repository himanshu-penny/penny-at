# penny-business Knowledge — Navigation Guide

This is the **single source of truth** for Penny e-procurement business knowledge. Use this guide to find the right file fast.

## Provenance

Every fact-bearing entry carries one of these labels (see SKILL.md for the full convention):

- `**Verified:** <code reference>` — backed by code, tests, or constants
- `**Verified by user:** <date>` — confirmed by the user
- `**Source:** prior QA docs (unverified)**` — migrated, not re-verified
- `**Imported evidence:** <source reference>` — evidence path came from imported
  automated-test knowledge, not local `penny-at`
- `**Status: unverified**` — term appears in lore but not confirmed

If an entry has none of these, treat it as unverified. **Most content from the
initial 2026-05-13 migration is unverified** — see `_changelog.md`. Upgrade
entries to Verified as you confirm them. If an entry cites old paths such as
`tests/nhc-organization/...`, treat that as imported evidence from the source
knowledge base until the same rule is confirmed in local `penny-at`.

---

**Last updated:** 2026-06-14

---

## How to find what you need

| If you want to…                                                                         | Open this file                                                                   |
| --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Look up a single term (RFP, sealed bid, MFA contract, etc.)                             | `glossary.md`                                                                    |
| Understand one module deeply (requests, orders, bills, contracts, etc.)                 | `modules/<module>.md`                                                            |
| Trace the full procure-to-pay flow end-to-end                                           | `cross-cutting/procure-to-pay.md`                                                |
| Understand how approval routing works (any entity)                                      | `cross-cutting/approval-routing.md`                                              |
| Look up feature flags, HIGH RISK flags, QA testing protocol, or per-client flag configs | `cross-cutting/feature-flags.md`                                                 |
| Check the status of any entity and what transitions are allowed                         | `cross-cutting/state-transitions.md`                                             |
| Understand scoring, weighting, and award logic                                          | `cross-cutting/scoring-and-awards.md`                                            |
| Find out what's different between enterprise / rcmc / ewcf / sabil / nhc / others       | `variants/variant-matrix.md` (start here) then the specific `variants/<name>.md` |
| Understand who does what (roles and personas)                                           | `personas/buyer-roles.md` or `personas/vendor-roles.md`                          |
| Look up exactly what a specific role can do per module                                  | `personas/role-permissions-matrix.md`                                            |

---

## Folder structure

```
glossary.md                    Terminology A-Z, the most common entry point
modules/
  requests.md                  Purchase requisitions
  e-sourcing.md                RFQ + RFP + EOI + sealed bid (one module covers all)
  orders.md                    Purchase orders (direct, from-RFQ, from-catalog, bulk)
  grn.md                       Goods Receipt Note — delivery + inspection
  bills.md                     Invoices, proforma bills, matching, approval
  payments.md                  Payment creation, allocation, vendor notification
  contracts.md                 MFA contracts, vendor contracts, Letter of Award
  vendor-rfq-response.md       Vendor side of e-sourcing
  vendor-orders.md             Vendor side of orders, delivery, invoicing
  admin-users-roles.md         Users, roles, IAM, RBAC
  admin-workflows.md           Approval workflow configuration
  finance-budgets.md           Budgets and expense accounts
  catalog.md                   Product catalog, marketplace, bulk purchase
cross-cutting/
  procure-to-pay.md            End-to-end P2P stitched across modules
  approval-routing.md          How requests/sourcings/offers/bills route
  state-transitions.md         All entity statuses + allowed moves, one place
  scoring-and-awards.md        Technical + commercial scoring, award logic
  feature-flags.md             107 flags, HIGH RISK register, QA protocol, per-client configs
variants/
  variant-matrix.md            Feature × variant comparison (the headline doc)
  enterprise.md                Full P2P + workflows + budgets
  rcmc.md                      Org conversion, change requests, signIt
  ewcf.md                      Custom domain, partner portal, reSourceAfterReturn
  sabil.md                     Penny ↔ Sabil integration behavior
  nhc.md                       Marketplace-first, bulk purchase, PropPay
  voltalia.md                  Enterprise sub-client variant notes
  modern_mills.md              Modern Mills / MMC three-way matching notes
  tahakom.md                   Tahakom journal entry / order customization notes
personas/
  buyer-roles.md               Real per-module Penny role taxonomy (overview + approval eligibility)
  role-permissions-matrix.md   Full permission detail per role per module (the lookup table)
  vendor-roles.md              Vendor user, vendor manager, marketplace vendor (NHC)
```

---

## Reading conventions

- Module files describe the **default** behavior (typically what enterprise does). Variant deviations are noted inline with a link to the relevant `variants/*.md`.
- Cross-cutting files are **canonical** for things that span modules — module files reference them rather than duplicating content.
- The glossary holds **definitions only** — for full lifecycle or rule detail, follow its cross-references.

---

## Linking to automation skills

Every knowledge entry that describes a testable rule, flow, or state SHOULD end
with an "Automate this" line pointing at the relevant `.claude/skills/*` skill
so juniors can bridge from business rule to test scaffolding without asking:

```markdown
> **Automate this:** use `/penny-create-api-script` for API coverage or
> `/penny-create-web-script` for UI coverage. See `/penny-test-data-setup` for
> seed / cleanup patterns.
```

For rules that surface an existing schema, feature flag, or state-transition
table, also link the matching cross-cutting doc (e.g., `> See also:
cross-cutting/state-transitions.md#request-lifecycle`).

## Adding new knowledge

Do not edit this folder by hand for casual notes. Instead, invoke the `penny-business` skill — it knows the right file, keeps the formatting consistent, and confirms with the user. If you must edit directly:

- Pick the smallest correct file.
- Keep entries **business-only** — no code paths, no fixture references, no test infrastructure (those belong in `penny-api-sdet` and `penny-create-standard-code`).
- Add a cross-reference line at the bottom of any entry that relates to others.
- Update the "Last updated" date at the top of any file you touch substantially.

---

## What's NOT here

- Code patterns, fixtures, page-object signatures — see `penny-api-sdet` and `penny-create-standard-code`.
- Test infrastructure, CI, framework conventions — see `penny-api-sdet`, `penny-ci`, `penny-review-api-script`, `penny-review-web-script`, and `penny-review-framework-change`.
- One-off debug notes or personal preferences — those belong in user memory, not the SoT.
