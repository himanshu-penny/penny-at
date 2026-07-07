# Cross-Cutting: State Transitions

Master reference for every entity's lifecycle states and allowed transitions.

**Last updated:** 2026-05-13

---

## Request

| State     | Means                                 | Allowed transitions                        |
| --------- | ------------------------------------- | ------------------------------------------ |
| Draft     | Saved by requester, not yet submitted | Submitted, Cancelled                       |
| Submitted | Sent for approval                     | Approved, Rejected, Cancelled              |
| Approved  | Cleared all approval tiers            | Sourcing, Closed, Cancelled                |
| Sourcing  | RFQ/RFP in flight                     | Closed (after award), Cancelled            |
| Rejected  | Terminal off-path                     | (resubmit creates new Draft from existing) |
| Cancelled | Terminal                              | —                                          |
| Closed    | Terminal                              | —                                          |

**Edit rules:** Draft is fully editable. Submitted is locked. Rejected can be edited and resubmitted. Approved cannot edit line items; can cancel. Closed is read-only.

See `modules/requests.md`.

---

## E-Sourcing event (RFQ / RFP / EOI)

| State            | Means                                 | Allowed transitions         |
| ---------------- | ------------------------------------- | --------------------------- |
| Draft            | Being created                         | Published, Cancelled        |
| Published        | Sent to vendors, awaiting submissions | Receiving Offers, Cancelled |
| Receiving Offers | Vendors actively submitting           | Evaluating, Cancelled       |
| Evaluating       | Comparing, negotiating, selecting     | Awarded, Cancelled          |
| Awarded          | Winner(s) selected                    | Closed                      |
| Closed           | Terminal                              | —                           |
| Cancelled        | Terminal off-path                     | —                           |

**Edit rules:** Draft is editable. Once Published, cannot modify — must cancel and recreate. Awarded cannot be cancelled.

See `modules/e-sourcing.md`.

---

## Vendor offer

| State        | Means                    | Allowed transitions               |
| ------------ | ------------------------ | --------------------------------- |
| Draft        | Vendor preparing         | Submitted                         |
| Submitted    | Sent to buyer            | Under Review                      |
| Under Review | Buyer evaluating         | Awarded, Not Awarded, Negotiating |
| Negotiating  | Buyer requested revision | Submitted (revised)               |
| Awarded      | Selected by buyer        | (terminal)                        |
| Not Awarded  | Not selected             | (terminal)                        |

See `modules/vendor-rfq-response.md`.

---

## Order (Purchase Order)

| State              | Means                                       | Allowed transitions                           |
| ------------------ | ------------------------------------------- | --------------------------------------------- |
| Draft              | Being created                               | Submitted, Cancelled                          |
| Submitted          | Sent for approval                           | Approved, Rejected, Cancelled                 |
| Approved           | Workflow cleared; vendor not yet engaged    | Sent to Vendor, Cancelled                     |
| Sent to Vendor     | In vendor portal awaiting acceptance        | In Progress, Cancelled                        |
| In Progress        | Vendor accepted, fulfillment underway       | Partially Received, Fully Received, Cancelled |
| Partially Received | Some GRN done                               | Fully Received, Completed                     |
| Fully Received     | All items received via GRN                  | Completed                                     |
| Completed          | Terminal — all received and bills processed | —                                             |
| Rejected           | Workflow rejection                          | —                                             |
| Cancelled          | Terminal off-path                           | —                                             |

**Edit rules:** Draft is fully editable. Submitted is locked. Approved cannot edit amounts/quantities — use a Change Order. Completed is read-only.

See `modules/orders.md`.

---

## Bill (Invoice)

| State     | Means                               | Allowed transitions                     |
| --------- | ----------------------------------- | --------------------------------------- |
| Draft     | Vendor preparing                    | Submitted, Cancelled                    |
| Submitted | Sent to buyer for matching/approval | Approved, Rejected, Disputed, Cancelled |
| Disputed  | Buyer flagged discrepancies         | Submitted (if resolved), Rejected       |
| Approved  | Cleared workflow; ready for payment | Paid                                    |
| Rejected  | Terminal off-path                   | —                                       |
| Paid      | Terminal — settled                  | —                                       |

See `modules/bills.md`.

---

## Payment

| State      | Means                                | Allowed transitions          |
| ---------- | ------------------------------------ | ---------------------------- |
| Pending    | Created but not yet processed        | Processed, Cancelled         |
| Processed  | Sent via banking/payment integration | Reconciled, Failed           |
| Reconciled | Matched to bank statement            | (terminal)                   |
| Failed     | Banking integration error            | Pending (retry) or Cancelled |
| Cancelled  | Terminal off-path                    | —                            |

See `modules/payments.md`.

---

## GRN

GRN does not typically have a multi-step approval lifecycle by default. The GRN is created, line-by-line decisions are made (Accept / Reject / Partial Accept), submitted, and it then updates the parent order's received status.

See `modules/grn.md`.

---

## Common rules across all entities

1. **No backwards transitions** to non-adjacent states. Approved → Draft is not allowed; the entity must be cancelled and a new one created.
2. **Terminal states** (Closed, Completed, Paid, Reconciled, Cancelled, Rejected) cannot transition out.
3. **Cancellation eligibility** narrows as the entity progresses. Once a downstream entity depends on this one, cancellation usually requires cancelling/reverting the downstream first.
4. **Audit trail** is preserved through all transitions — including who made the transition and when.

---

## Cross-references

- Glossary: definitions of each entity
- Per-entity detail: corresponding `modules/*.md`
- Approval routing (when transitions are caused by an approver action): `cross-cutting/approval-routing.md`
