# Module: Payments

Settling approved bills with the vendor.

**Last updated:** 2026-05-13

---

## Purpose

To release funds against approved bills, notify vendors, and reconcile with bank records.

---

## Key concepts

- **Payment methods** — Bank transfer, check, online payment, cash (rare).
- **Batch payment** — multiple approved bills for the same vendor settled in one transaction.
- **Partial payments** — allowed if configured. Bill remains Approved (not Paid) until fully settled.
- **Reconciliation** — matching processed payments to bank statement entries.

---

## Lifecycle

`Pending → Processed → Reconciled`

Off-paths: `Failed`, `Cancelled`.

For canonical state-transition tables see `cross-cutting/state-transitions.md`.

---

## Business rules

1. Bill must be in `Approved` state before payment can be created.
2. Payment amount ≤ bill amount.
3. Payment method is required; for bank transfer the vendor's bank details must be on file.
4. Batched bills must all be approved and all belong to the same vendor.
5. Payment terms from the order/bill should be honored (e.g., Net 30 — pay within 30 days of bill date).

---

## Vendor notification

Once a payment is processed, the vendor is notified through their portal with payment reference, amount, and method.

---

## Variant deviations

- **NHC**: NHC has a dedicated **ProPay** financing module (verified — tests under `tests/nhc-organization/admin-modules/propay/`). Its exact role in the payment flow is **unverified here**; do not assert specifics. See `variants/nhc.md`.
- **Enterprise / RCMC / EWCF**: standard payment methods via configured banking integration.

---

## Cross-references

- Glossary: Payment, PropPay, Bill
- Upstream: `modules/bills.md`
- Budget context: `modules/finance-budgets.md`
- State transitions: `cross-cutting/state-transitions.md`

---

## High-risk regression areas

**Verified by user: 2026-05-31.** Always check these when payments code is touched:

- Duplicate payment prevention
- Failed external sync and retry behavior
- Bill status reconciliation after payment (partial vs. fully paid)
- Partial payment remaining balance accuracy
- Reporting and financial reconciliation consistency
