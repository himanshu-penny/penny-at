# Module: Orders (Purchase Orders)

The buyer's binding commitment to purchase from a specific vendor.

**Last updated:** 2026-06-14

---

## Purpose

A formal purchase order (PO) that commits the buyer to a specific vendor, items, quantities, prices, and delivery terms. Approving the order **books** the budget (reserves it) until the bill is approved and the spend is realized.

---

## Order creation methods

1. **From RFQ/RFP** — auto-populated from the winning offer. Order amount must be ≤ offer amount (cannot increase).
2. **From Catalog** — buyer selects products and quantities from the curated catalog at catalog prices.
3. **Direct Order** — manual entry of vendor, items, prices. Subject to budget.

**Bulk Purchase** is a separate NHC-specific flow — see `variants/nhc.md`.

---

## Lifecycle

`Draft → Submitted → Approved → Sent to Vendor → In Progress → Completed`

Branches: `Partially Received`, `Fully Received`, `Cancelled`, `Rejected`.

For canonical state-transition tables see `cross-cutting/state-transitions.md`.

---

## Key concepts

- **Vendor acceptance** — vendor receives the order in their portal and accepts or rejects. Acceptance commits to delivery terms.
- **Delivery terms** — Incoterms (FOB, CIF, etc.) optional. Delivery address and date are required.
- **Payment terms** — must be specified (e.g., Net 30).
- **Change orders** — amendments to an approved order. Require approval.
- **PO in vendor currency** — flag-controlled; buyers can issue POs in the vendor's quoted currency rather than the workspace default (SAR).
- **Letter of Award (LOA)** — flag-controlled; an order manager can issue a formal Letter of Award to the vendor before issuing the full PO or contract. Acts as a softer commitment between award and PO.
- **Order Tags** — flag-controlled; users can assign pre-configured tags to POs for categorisation and filtering.
- **Chart of Accounts (GL codes)** — flag-controlled; buyers can assign GL codes to individual order line items.
- **Custom Order Title** — flag-controlled; users can define a custom title for each PO (vs system-generated name).

---

## Business rules

1. Vendor must be Active.
2. Delivery address required; delivery date must be in the future.
3. Order total cannot exceed available budget (enterprise) — blocked or escalated per overspend config.
4. Orders from RFQ must match offer amounts or be lower.
5. Approved orders cannot have amounts or quantities edited — use a change order.
6. Cancellation before vendor acceptance: free. After acceptance: requires vendor agreement or cancellation fee. After delivery: not cancellable — use returns/credit notes.

---

## Budget impact

Order approval → **Booked** (reserved). Bill approval will later move it to **Spent**.

See `modules/finance-budgets.md` for the full budget formula.

---

## Variant deviations

- **NHC**: Direct Orders and Bulk Purchase are first-class flows. No budget booking. See `variants/nhc.md`.
- **EWCF**: standard enterprise behavior, with `reSourceAfterReturn` affecting re-sourcing after order return. See `variants/ewcf.md`.

---

## Approval

Order approval routes through the configured workflow (typically amount-based). See `cross-cutting/approval-routing.md`.

---

## Performance Bonds

**Verified by user:** 2026-06-14. Source: Platform Reference Documentation v26.2.7.

Performance Bonds provide financial assurance from vendors on high-value contracts. The buyer configures the bond requirement; the vendor submits documentation through the vendor portal.

| Status                     | Description                                         |
| -------------------------- | --------------------------------------------------- |
| **Draft**                  | Bond configured by buyer but not yet sent to vendor |
| **Requested**              | Bond request sent to vendor; awaiting submission    |
| **Submitted**              | Vendor has submitted bond documentation             |
| **Approved**               | Bond documentation approved by buyer                |
| **Expired**                | Bond validity period has elapsed                    |
| **Resubmission Requested** | Buyer has requested revised bond documentation      |

The system **automatically monitors bond validity periods** and sends reminder notifications before expiry (configurable reminder period — e.g. 30 days before expiry). Performance Bonds are tracked under Orders → Performance Bonds.

A performance bond is typically a percentage of the contract value (commonly 10%; in RCMC Phase 2, 5%). It can be made a mandatory prerequisite for signing a contract with an awarded vendor.

**See also:** `modules/contracts.md`, `variants/rcmc.md`

---

## Cross-references

- Glossary: Order, Direct Order, Direct Award, Bulk Purchase, Budget, Letter of Award, MFA Contract, Performance Bond
- E-sourcing source: `modules/e-sourcing.md`
- **Contracts (RFC / MFA / Letter of Award):** `modules/contracts.md`
- Downstream: `modules/grn.md`, `modules/bills.md`
- State transitions: `cross-cutting/state-transitions.md`
- Procure-to-pay end-to-end: `cross-cutting/procure-to-pay.md`
- Feature flags: `cross-cutting/feature-flags.md` — Orders module flags

---

## High-risk regression areas

**Verified by user: 2026-05-31.** Always check these when orders code is touched:

- Budget booking on approval, and reversal on cancel/reject
- Approval workflow routing and state gates
- Vendor portal order visibility and send-to-vendor behavior
- GRN and bill downstream availability (order must be in receivable state)
- SAP / signature integration state gating downstream movement
- Three-way matching impact (Modern Mills client)
