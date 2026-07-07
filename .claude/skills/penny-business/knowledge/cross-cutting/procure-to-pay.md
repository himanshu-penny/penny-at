# Cross-Cutting: Procure-to-Pay (P2P) End-to-End

The complete procurement lifecycle from a buyer's first need to the vendor's final payment.

**Last updated:** 2026-05-13

---

## The flow

```
Request → E-Sourcing → Order → GRN → Bill → Payment
   │          │          │       │      │       │
 Budget    Vendor      Budget  Receipt Budget  Cash
 Check    competition  Booked  proof   Spent   out
```

---

## Phase 1: Request

**Actor:** Requester (Buyer role).

1. Identify need.
2. Create request with line items, expense account allocations, attachments.
3. Submit for approval. Budget is **checked**: `request total ≤ available`.
4. Approval routes per workflow config. Approved → state `Approved`.

**Outcome:** Approved purchase request.

See `modules/requests.md`.

---

## Phase 2: E-Sourcing (optional)

**Actor:** Requester or Sourcing Manager.

Used when the buyer wants competitive offers. Skipped for direct orders.

1. Create RFQ / RFP / EOI from the approved request.
2. Invite vendors (≥ 2 for competitive).
3. Set deadline, T&Cs, scoring weights (RFP).
4. Publish → vendors notified.
5. Vendors submit offers; offers may be sealed.
6. After deadline: evaluate, possibly negotiate revisions.
7. Award one or more winners (split award allowed).

**Outcome:** Winning offer(s) ready to convert to order(s).

See `modules/e-sourcing.md`, `cross-cutting/scoring-and-awards.md`.

---

## Phase 3: Order

**Actor:** Buyer.

Order can be created three ways:

- From winning RFQ/RFP offer (auto-populated).
- From catalog.
- Direct (manual entry).

1. Create order with vendor, items, prices, delivery terms.
2. Submit for approval (if workflow requires).
3. Approval routes. Approval **books** the budget: `Booked += order total`.
4. Order sent to vendor.
5. Vendor accepts (commits to delivery) or rejects.

**Outcome:** Vendor-accepted order, budget booked.

See `modules/orders.md`.

---

## Phase 4: Vendor fulfillment

**Actor:** Vendor.

1. Prepare goods.
2. Create GDN (Goods Delivery Note) — quantities, tracking, ETA.
3. Ship.

**Outcome:** Goods en route, GDN visible to buyer.

See `modules/vendor-orders.md`.

---

## Phase 5: GRN (Goods Receipt)

**Actor:** Receiver.

1. Goods arrive at buyer location.
2. Inspect against order/GDN.
3. Record received quantities per line.
4. Accept, reject, or partial-accept each line.
5. Submit GRN.

**Outcome:** Order status moves to `Partially Received` or `Fully Received`. Inventory updated.

See `modules/grn.md`.

---

## Phase 6: Bill (Invoice)

**Actor:** Vendor creates, Finance/AP processes.

1. Vendor creates invoice referencing the order; auto-populated from order/GRN data; adds tax.
2. Vendor submits.
3. Buyer-side matching runs automatically:
   - **3-way**: order + GRN + bill (default).
   - **2-way**: order + bill (when GRN not required).
4. Discrepancies flagged; finance resolves.
5. Bill goes through bill-approval workflow.
6. Approval moves budget: `Spent += bill total`, `Booked -= related order amount`.

**Outcome:** Approved bill ready for payment.

See `modules/bills.md`.

---

## Phase 7: Payment

**Actor:** Finance.

1. Select approved bills (single or batched per vendor).
2. Pick method (bank transfer, check, online; PropPay in NHC).
3. Process payment via banking integration.
4. Record reference and date.
5. Mark bills as `Paid`.
6. Notify vendor.
7. Reconcile against bank statement.

**Outcome:** Vendor paid; transaction cycle complete.

See `modules/payments.md`.

---

## Variant impact on P2P

| Phase      | Enterprise      | RCMC                                           | EWCF                                       | NHC                              |
| ---------- | --------------- | ---------------------------------------------- | ------------------------------------------ | -------------------------------- |
| Request    | Full            | Full (scoring shifts if `rcmcOrgConversion`)   | Full                                       | Sourcing Request only            |
| E-Sourcing | RFQ + RFP + EOI | Same as enterprise + `rcmcOrgConversion` quirk | Same as enterprise + `reSourceAfterReturn` | None — catalog/direct only       |
| Order      | All 3 methods   | All 3 methods                                  | All 3 methods                              | Direct + Bulk Purchase + Catalog |
| GRN        | Full            | Full                                           | Full                                       | Full                             |
| Bill       | Full            | Requester filter disabled                      | Full                                       | Zatca-mandatory                  |
| Payment    | Standard        | Standard                                       | Standard                                   | PropPay                          |

See `variants/variant-matrix.md` for the full feature matrix.

---

## Cross-references

- Glossary: P2P, Request, RFQ, RFP, Order, GRN, Bill, Payment, Budget
- Phase-by-phase detail: respective files in `modules/`
- State transitions across the whole chain: `cross-cutting/state-transitions.md`
- Approval routing per phase: `cross-cutting/approval-routing.md`
