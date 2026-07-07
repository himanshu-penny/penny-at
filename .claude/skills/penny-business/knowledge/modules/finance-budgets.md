# Module: Budgets & Expense Accounts

Financial control: budget allocation, consumption tracking, and chart of accounts.

**Last updated:** 2026-06-14

---

## Purpose

To enforce spending controls at request, order, and bill time, and to classify spend into expense accounts for accounting.

**Enterprise-only.** NHC does **not** have budgets or expense accounts. See `variants/nhc.md`.

---

## The budget formula

**Verified by user:** 2026-06-14. Source: Platform Reference Documentation v26.2.7.

```
Available (A) = Total Budget (T) − Booked (B) − Spent (S)
Locked Budget (LB) = Total Available (ΣA) − Total Booked (ΣB) − Total Spent (ΣS)
```

| Symbol     | Term            | Meaning                                                                                                                         |
| ---------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **T**      | Total Budget    | The total allocated budget amount for the period. Set during budget creation and allocation.                                    |
| **B / ΣB** | Total Booked    | Amount committed in approved but unfulfilled requests and POs. **Increases when PO is issued. Decreases when payment is made.** |
| **S / ΣS** | Total Spent     | Amount actually paid to vendors. Increases when payment is completed.                                                           |
| **A / ΣA** | Total Available | Total allocated budget amount. T at the org/workspace level.                                                                    |
| **LB**     | Locked Budget   | Available minus Booked — the remaining spendable budget that has not been committed.                                            |

**Payment Summary Metrics** (visible in Payments module):

- **Paid**: total amount already paid to vendor
- **Due**: remaining amount due (total bill value minus paid)
- **Outstanding**: total outstanding across all approved, unpaid bills
- **Total**: total payment transaction amount

---

## Budget consumption events

1. **Request submitted** → system checks `Available ≥ request amount`. If not, blocked, warned, or escalated per overspend config.
2. **Order approved** → `Booked += order amount`. Available decreases.
3. **Bill approved** → `Spent += bill amount`, `Booked -= related order amount`. Available unchanged net.

---

## Budget structure

```
Organization
└── Workspace budgets
    └── Expense account allocations
```

- Workspace budgets cannot exceed the org budget.
- Expense account allocations within a workspace must not exceed the workspace budget.

---

## Expense accounts (chart of accounts)

Hierarchical: **Group → Type → Account**.

**Pre-defined groups:**

- Current Assets
- Fixed Assets
- Current Liabilities
- Expenses (most procurement)
- Tax

**Account fields:** code, name, type, group, description, active/inactive.

Each line item on a request must be allocated to one or more expense accounts; allocation percentages must sum to 100%.

---

## Overspend behavior

Configurable per organization:

- **Block** — submission rejected if budget exceeded.
- **Warn** — submission allowed with a warning banner.
- **Require approval** — additional approval level engaged.

---

## Budget Creation Wizard

**Verified by user:** 2026-06-14. Source: Platform Reference Documentation v26.2.7.

| Field             | Step | Description                                                                              |
| ----------------- | ---- | ---------------------------------------------------------------------------------------- |
| Budget Name       | 1    | Required. Free-text name (e.g. "Q3 2026 Operations Budget")                              |
| Start Date        | 1    | Budget validity start date. Defaults to today.                                           |
| End Date          | 1    | Budget validity end date. Budget expires automatically on this date.                     |
| Budget Currency   | 1    | Defaults to workspace currency (SAR). Can be changed.                                    |
| Remarks           | 1    | Rich-text internal notes — useful for board resolution references.                       |
| Entity Allocation | 2    | Set Total Budget (T) per entity/cost centre.                                             |
| Budget Lock       | 2    | When locked (🔒 red padlock icon), the entity's budget is frozen and cannot be exceeded. |

## Business rules

1. `Total budget ≥ 0`. Cannot allocate negative amounts.
2. Workspace budget cannot exceed organization budget.
3. Cannot reduce a workspace budget below `Booked + Spent` for that period.
4. Budget reallocation requires approval (audit trail).
5. Transactions must fall within the budget period.

## Budgets Master Toggle — Critical Risk

**Verified by user:** 2026-06-14. Source: Feature Flag Bible v26.2.7.

⚠ If the **Budgets master toggle** is turned **OFF**: ALL budget enforcement checks stop running everywhere. The `Show budget`, `Show budget to approver`, and `Show budget to requestor` flags in Requests become dormant. Requestors can raise PRs of unlimited value with **no financial guardrails**. Must never be turned off on production environments with active budget management.

---

## Reallocation

Mid-period, finance can move budget between workspaces if one has surplus and another deficit. Requires approval. New available amounts recomputed immediately.

---

## Post Allocated Budget (PAB) Reallocation

**Verified by user:** 2026-06-06. Source: Penny KB (RCMC context).

A mechanism for when an accepted supplier offer **exceeds the originally approved PR budget** during sourcing.

### How it works

1. Finance allocates budget to each PR line item during approval (selecting Fund Program and Expense Account from SAP).
2. The approved budget is the **maximum spending limit** for that PR — POs and accepted offers must not exceed it.
3. Offer ≤ approved PR budget → accepted immediately, no extra steps.
4. Offer **exceeds** approved PR budget → **offer acceptance is blocked**. Awarding is prevented until additional budget is approved.

### Requesting a reallocation

- The **E-Source Manager** submits a PAB reallocation request with original value, requested new value, and additional budget needed.
- Routes through the **original approval workflow** — all original approvers (including Finance) must approve.
- Finance can review and update Fund Program and Expense Account allocation per line item.
- Approvers see: original approved value, requested value, additional amount.

### Outcomes

| Decision     | Result                                                                        |
| ------------ | ----------------------------------------------------------------------------- |
| **Approved** | PR budget updated; offer can be awarded; procurement continues to PO/contract |
| **Returned** | Goes back to E-Source Manager to modify and resubmit                          |
| **Rejected** | Sourcing closes; offer cannot be accepted                                     |

### Key rules

- Offers exceeding the approved PR budget **cannot be accepted** until reallocation is approved.
- Finance retains control of SAP account selection during reallocation.
- Full audit trail maintained for all budget increase requests and approvals.
- Eliminates the need to create a new PR when supplier pricing exceeds the original estimate.

---

## Variant deviations

- **NHC**: no budgets, no expense accounts, no allocation requirement on requests.
- **Enterprise / RCMC / EWCF**: full budget + expense account model.

---

## Cross-references

- Glossary: Budget, Expense Account, Workspace
- Consumption events: `modules/requests.md`, `modules/orders.md`, `modules/bills.md`
- Variants: `variants/variant-matrix.md`
