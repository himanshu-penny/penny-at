# Module: Vendor RFQ Response

The vendor side of e-sourcing — viewing RFQs and submitting competitive offers.

**Last updated:** 2026-05-13

---

## Purpose

To let invited vendors view sourcing events from buyers, prepare competitive offers, and submit them before the deadline.

---

## What the vendor sees

- Received RFQs/RFPs/EOIs with full requirements.
- Technical questions (for RFP).
- Required line items and quantities.
- Response deadline.
- Buyer-provided attachments (specs, T&Cs).
- Award status after buyer evaluation.

**Privacy guarantee:** vendors cannot see other vendors' offers — even after award.

---

## Vendor offer composition

- Per line-item pricing.
- Delivery timeline (lead time).
- Payment terms (e.g., Net 30).
- Warranty terms.
- Technical answers (for RFP).
- Supporting documents (certifications, datasheets, etc.).
- Validity period.
- Optional: alternative product proposals (if buyer allows).

---

## Offer lifecycle

`Draft → Submitted → Under Review → Awarded` or `Not Awarded`.

Negotiation branch: `Under Review → Negotiating → Submitted` (vendor's revised offer).

For canonical state-transition tables see `cross-cutting/state-transitions.md`.

---

## Business rules

1. Vendor must be invited to see the event.
2. All line items must be priced.
3. No negative prices.
4. Offer must be submitted before the deadline (late submissions optional by buyer config).
5. After submission, vendor cannot edit unless buyer requests a revision (negotiation).
6. Vendor may submit only one offer per event, but can revise during negotiation.
7. Vendor can withdraw before deadline if buyer config allows.

---

## Sealed bid behavior (vendor side)

When the event is sealed bid:

- Vendor still submits offers normally.
- The offer is encrypted/hidden on the buyer side until the gating committee unlocks.
- Vendor sees own offer as submitted; cannot see whether buyer has viewed it.

See `modules/e-sourcing.md` and `glossary.md#sealed-bid`.

---

## Variant deviations

- **NHC**: no RFQ/RFP — vendor responds to **Sourcing Requests** which are category-based with manual products. See `variants/nhc.md`.
- **RCMC**: vendor portal URL is scoped (`vendor.{env}.penny.co`). See `variants/rcmc.md`.
- **EWCF**: vendor portal at `vendor.procurement.esportsfoundation.com`. See `variants/ewcf.md`.

---

## Cross-references

- Glossary: Offer, RFP, RFQ, EOI, Sealed Bid, Negotiation, Revision, Vendor Portal
- Buyer counterpart: `modules/e-sourcing.md`
- Award: `cross-cutting/scoring-and-awards.md`
- State transitions: `cross-cutting/state-transitions.md`
