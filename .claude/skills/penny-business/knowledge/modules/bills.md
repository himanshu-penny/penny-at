# Module: Bills (Invoice Processing)

Processing vendor invoices: matching, discrepancy resolution, and approval for payment.

**Last updated:** 2026-06-14

---

## Purpose

To ensure the buyer only pays for what was correctly ordered and (where applicable) received. Bill approval consumes budget (moves from Booked to Spent) and unlocks payment.

---

## Bill types

**Verified by user:** 2026-06-14. Source: Platform Reference Documentation v26.2.7 + Feature Flag Bible v26.2.7.

| Type              | Description                                                                                                                                                                         | Requires GRN? | Flag-controlled?                         |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ---------------------------------------- |
| **Standard Bill** | Regular post-delivery invoice from vendor. Created against an approved GRN.                                                                                                         | Yes           | No (core)                                |
| **Advance Bill**  | Bill created **before a GRN exists** — for prepayment/advance payment scenarios (e.g. vendor requires 50% upfront before production).                                               | No            | Yes — "Allow creation of advance bill"   |
| **Proforma Bill** | Pre-billing acknowledgement issued once the PO is submitted to or accepted by the vendor. Used when a vendor needs early invoice acknowledgement, not as an actual payment trigger. | No            | Yes — "Allow creation of proforma bills" |
| **Expense Bill**  | Bill created for expense requests. Items listed for vendor review. Used in the employee expense reimbursement flow.                                                                 | No            | Yes — "Allow creation of expense bill"   |
| **Credit Note**   | Created from an existing bill for discounts, returns, or error corrections.                                                                                                         | N/A           | Yes — flag-controlled                    |

**Advance Bill scenario example:** Vendor requires 50% advance payment before production. Finance creates an Advance Bill for 50% of the PO value before goods are delivered (no GRN yet). The remaining 50% is billed as a Standard Bill against the GRN after delivery. See `cross-cutting/procure-to-pay.md`.

**Auto-generate Bills:** A flag-controlled option whereby bills are automatically created when a GRN is completed, without requiring manual creation by the Finance team.

**Expense Reimbursement flow (no PO, no GRN):** When an Expense Request is approved, the system automatically creates an Expense Bill. Payment goes to the employee's bank account, not a vendor. No Purchase Order and no GRN are involved. See `modules/requests.md` for the expense request type.

---

## Lifecycle

`Draft → Submitted → Approved → Paid`

Off-paths: `Rejected`, `Disputed`.

For canonical state-transition tables see `cross-cutting/state-transitions.md`.

---

## Invoice matching

### 2-way matching (Order + Bill)

Used when no GRN is required. Verifies:

- Bill quantity ≤ order quantity
- Bill price = order price (or within tolerance)
- Bill total ≤ order total (within tolerance)

Tolerance is configurable (e.g., ±5%).

### 3-way matching (Order + GRN + Bill)

Default for most cases. Verifies:

- Bill quantity ≤ received quantity (per GRN)
- Bill price = order price
- Bill total matches received amounts

Stricter than 2-way — cannot invoice for goods that were not received.

---

## Discrepancy handling

| Discrepancy                    | Action                                           |
| ------------------------------ | ------------------------------------------------ |
| Quantity mismatch (bill ≠ GRN) | Flagged for finance review                       |
| Price mismatch (bill ≠ order)  | Flagged for finance review                       |
| Over-billing (bill > order)    | Blocked or requires explicit approval per config |
| Tax calculation error          | Flagged for finance review                       |

Discrepancies must be resolved before approval.

---

## Tax

`Tax = subtotal × tax rate`. `Bill total = subtotal + tax`. Tax accuracy is validated during matching.

---

## Business rules

1. Bill cannot exceed order amount unless overage is explicitly approved.
2. 3-way matching requires the GRN to exist first.
3. Bill amount must not exceed received amount (3-way) or ordered amount (2-way).
4. All discrepancies resolved before approval.
5. Approving a bill releases the corresponding Booked amount and increments Spent.

---

## Budget impact

Bill approval → **Spent += bill total**, **Booked -= corresponding order amount**.

See `modules/finance-budgets.md`.

---

## Approval

Bill approval routes through the configured bill-approval workflow (typically amount-based). See `cross-cutting/approval-routing.md`.

---

## Variant deviations

- **NHC**: prior project notes mention Saudi e-invoicing (Zatca) compliance requirements — **not verified in the test repo**. See `variants/nhc.md` and `glossary.md#zatca`.
- **RCMC**: requestor filter is disabled on the vendor invoice list (visibility scope difference). See `variants/rcmc.md`.

---

## Cross-references

- Glossary: Bill, Proforma Bill, Advance Bill, Expense Bill, Zatca, GRN, Budget
- Upstream: `modules/orders.md`, `modules/grn.md`
- Downstream: `modules/payments.md`
- Expense request flow: `modules/requests.md`
- Approval routing: `cross-cutting/approval-routing.md`
- State transitions: `cross-cutting/state-transitions.md`
- Feature flags: `cross-cutting/feature-flags.md` — Bills module flags

---

## High-risk regression areas

**Verified by user: 2026-05-31.** Always check these when bills code is touched:

- PO / GRN matching mismatch (2-way and 3-way)
- Duplicate invoice prevention
- Tax reconciliation at line and total level
- Approval workflow and state gates
- Payment downstream availability (bill must be fully approved)
- SAP/Odoo sync behavior
- Client-specific bill notification logic (Sabil bill-notification suppression)
