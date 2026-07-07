# Module: Requests (Purchase Requisitions)

The buyer's formal need-to-purchase, submitted for approval before any sourcing or ordering happens.

**Last updated:** 2026-07-01

---

## Purpose

A request captures _what is needed_, _for which expense account / budget_, and _why_. It routes through one or more approvers, then becomes the basis for either an e-sourcing event or a direct order. Every PO, GRN, Bill, and Payment in Penny traces back to a Purchase Request (PR).

## Request types

**Verified by user:** 2026-06-14. Source: Platform Reference Documentation v26.2.7.

| Type                      | Description                                                                                                                                                       | Next step after approval              |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| **Standard Request (PR)** | Product or service procurement request. Standard competitive sourcing.                                                                                            | Create E-Source (RFQ/RFP) event       |
| **RFP Request**           | Request for Proposal — formal structured sourcing with technical + commercial evaluation stages.                                                                  | Create RFP event                      |
| **RFC (MFA)**             | Request for Contract — awards a contract to one or multiple vendors. Supports Master Framework Agreement.                                                         | Create RFC/contract via E-Source      |
| **Expense Request**       | Request for expense reimbursement — generates an expense bill on approval. Requires "Allow Expense Request" flag ON.                                              | Expense bill auto-created on approval |
| **Reimbursement**         | Personal expense reimbursement request. Separate from the Expense Request flow.                                                                                   | Payment to employee bank account      |
| **Direct Award**          | Emergency/sole-source procurement to a specific vendor with mandatory justification. Bypasses competitive sourcing **only** — all financial controls still apply. | PO created directly (no E-Source)     |

**Critical clarification on Direct Award:** Direct Award is **NOT a bypass of financial controls**. It is a different routing for urgent/sole-source procurement. The approval chain, budget check, PO creation, GRN, and payment all still occur. The **only** thing bypassed is the competitive bidding phase (RFQ/RFP). A mandatory justification field is required. This is audited and traceable.

---

## Key concepts

- **Line items** — each request has at least one line item with: description, quantity, unit price (estimated), delivery date, specifications.
- **Expense account allocation** — each line item must be allocated to one or more expense accounts; allocations must sum to 100%. Enterprise-only requirement; NHC has no expense accounts.
- **Budget check** — on submission, the system verifies `request total ≤ available budget` for each allocated expense account. Enterprise-only.
- **Attachments** — specs, justifications, quotes, supporting documents.
- **Categories** — request category (CAPEX, OPEX, services, goods, etc.) for reporting.

---

## Lifecycle

`Draft → Submitted → Approved → Sourcing → Closed`

Terminal off-paths: `Rejected`, `Cancelled`.

For the canonical state-transition table see `cross-cutting/state-transitions.md`.

---

## Business rules

1. At least one line item is required.
2. Each line item must have description (≥ 3 chars), quantity (> 0), and unit price (≥ 0).
3. Expense account allocations must sum to 100% per line item (enterprise).
4. Budget must be available on submit (enterprise) — blocked or escalated based on overspend configuration.
5. Approver cannot be the requester (separation of duties).
6. Requests are immutable once submitted; rejected requests can be edited and resubmitted.
7. Approved requests cannot have line items edited — only cancelled or progressed.
8. Approval routing is amount-based; see `cross-cutting/approval-routing.md`.

---

## Edit restrictions by state

| State     | Editable?                          |
| --------- | ---------------------------------- |
| Draft     | Yes — anything                     |
| Submitted | No — locked during approval        |
| Rejected  | Yes — edit and resubmit            |
| Approved  | No — line items locked; can cancel |
| Sourcing  | No — RFQ/RFP in flight             |
| Closed    | No — read-only                     |

---

## Watchers

**Verified by user:** 2026-06-06. Source: Penny KB.

The **Watcher** feature allows the requester or workflow approvers to add users to follow a PR's progress and receive notifications on key events.

**Notifications sent to watchers:**

- PR passes through each request approver
- PR is returned to requester
- PR is rejected
- PR is submitted for sourcing

**Constraints:**

- Only users who **belong to the same workspace** as the PR can be selected as watchers.
- Selection is done by the requester or any approver in the workflow.

---

## Variant deviations

- **NHC**: requests are called **Sourcing Requests**, no expense account allocation. Two creation paths: manual/category-based (buyer describes a need, vendors matching the category respond) **and** catalog-cart-based (RFQ-type marketplace products added to cart → "Create sourcing request" pre-seeds the same wizard). **Verified by user: 2026-07-01** for the cart path — see `variants/nhc.md` §11 and `modules/catalog.md`. The "manual products only" characterization no longer holds now that the cart path is confirmed.
- **RCMC** with `rcmcOrgConversion` flag: commercial scoring moves _out_ of the request form into the e-source phase. See `variants/rcmc.md`.

---

## Integration

- Upstream: Workspaces, Users, Categories, Expense Accounts, Budgets.
- Downstream: E-Sourcing (if the buyer chooses to compete the request) or Orders (direct order from approved request).

---

## Cross-references

- Glossary: Request, Requester, Expense Account, Budget, Workspace
- Approval routing: `cross-cutting/approval-routing.md`
- End-to-end flow: `cross-cutting/procure-to-pay.md`
- State transitions: `cross-cutting/state-transitions.md`
