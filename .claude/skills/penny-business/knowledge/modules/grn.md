# Module: GRN (Goods Receipt Notes)

The buyer-side record of receiving and inspecting delivered goods.

**Last updated:** 2026-06-14

---

## Purpose

To document what was delivered, what was accepted, and what was rejected — enabling 3-way invoice matching and inventory accuracy.

---

## Key concepts

- **GRN line items** — mirror the order's line items; receiver records actual quantities received per line.
- **Per-line decision** — Accept (meets spec), Reject (does not meet spec, with reason), or Partial Accept (some accepted, some rejected).
- **Partial receipts** — multiple GRNs can be created against one order across deliveries (phased delivery). PO status changes to `Partially Received` until all items are received, then moves to `Received`.
- **Link to GDN** — when the vendor created a Goods Delivery Note, the GRN can reference it.
- **Inspection notes and photos** — supporting evidence captured per line item.
- **Edit GRN** — flag-controlled; users can edit a GRN after creation **as long as no bill has been raised against it**. Once a bill is created against the GRN, it becomes immutable.
- **Negative GRNs** — flag-controlled; create reverse/negative GRNs for product returns.
- **GRN Bulk Upload** — flag-controlled; upload GRN data in bulk via Excel template.
- **Show supplier information while printing** — flag-controlled; vendor name, address, and contact details appear on GRN print/PDF output.

---

## Lifecycle

`Draft → Submitted → Accepted / Rejected`

GRNs are typically created and submitted in a single sitting — they describe what physically happened. There is no separate approval workflow for GRNs in the default configuration; the GRN updates the order's received status.

**Accepted:** GRN accepted — confirms delivery. Billing becomes available.
**Rejected:** GRN rejected — goods may have been damaged or wrong items delivered. Investigate and re-submit or return.

**Order status updates on GRN:**

- `In Progress → Partially Received` (some items received, more pending)
- `Partially Received → Fully Received` (or directly `In Progress → Fully Received`)

For canonical state-transition tables see `cross-cutting/state-transitions.md`.

---

## Business rules

1. GRN requires an approved order in `Approved` or `In Progress` state.
2. Cannot receive more than ordered: `received ≤ ordered` per line. Over-receipt is blocked or requires approval per configuration.
3. Rejected quantities do **not** count as received.
4. Partial receipts are allowed; the system tracks cumulative received vs ordered.
5. GRN is a prerequisite for 3-way bill matching (see `modules/bills.md`).

---

## Variant deviations

GRN behavior is consistent across enterprise, RCMC, EWCF, and NHC. NHC supports the same flow.

---

## Cross-references

- Glossary: GRN, GDN
- Upstream: `modules/orders.md`
- Downstream: `modules/bills.md` (3-way matching)
- Vendor counterpart (GDN creation): `modules/vendor-orders.md`
- Feature flags: `cross-cutting/feature-flags.md` — GRN module flags

---

## High-risk regression areas

**Verified by user: 2026-05-31.** Always check these when GRN code is touched:

- Over-receipt prevention (received qty/value must not exceed PO remaining)
- Partial receipt math and remaining quantity tracking
- Bill matching impact (3-way match must wait for GRN)
- PO receiving status update (Partially Received / Fully Received)
- SAP/Odoo GRN sync behavior
- Disabled feature algorithms must not run for wrong client (Sabil isolation)
