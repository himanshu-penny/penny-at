# Personas: Vendor-Side Roles

Who does what on the vendor (supplier) side of Penny.

**Last updated:** 2026-05-13

---

## Vendor User

The primary vendor portal persona. Covers what most vendor org users do day-to-day.

**Who:** Vendor sales reps, account managers, vendor operations staff.

**Goals:** Respond to RFQs quickly, win business, fulfill orders, get paid faster.

**Key responsibilities:**

- **RFQ/RFP response**: view received sourcing events, prepare and submit competitive offers, upload supporting documents, respond to negotiation rounds.
- **Order management**: receive new orders, accept/reject within SLA, prepare for fulfillment.
- **Delivery**: create Goods Delivery Notes (GDN), update tracking and ETA, monitor buyer GRN status.
- **Invoicing**: create standard or proforma invoices, attach invoice PDFs, submit to buyer, track approval status.
- **Payment tracking**: view invoice approval state and payment status, confirm payment receipt.

**Permission level:** Full access to the vendor portal for their vendor organization.

**Cannot do:**

- Cannot see other vendors' offers.
- Cannot access the buyer's internal data (budgets, approvals, other orders).
- Cannot edit orders once the buyer has created them.
- Cannot invoice for goods that haven't been delivered (no GRN).

---

## Vendor Manager (Vendor Admin)

A senior vendor-side role. In practice this is the vendor's user-with-admin-permissions inside their own vendor org.

**Who:** Vendor sales managers, vendor account directors.

**Goals:** Manage the vendor team, monitor fulfillment, review performance.

**Key responsibilities:**

- Manage vendor team members (within the vendor's own organization).
- Update company profile.
- Maintain vendor catalog (if catalog-publishing enabled).
- Review vendor performance metrics.
- Oversee RFQ response strategy.

**Cannot do:** Anything outside their own vendor organization. Cannot see other vendors. Cannot see buyer internal data.

---

## NHC-specific vendor persona

### Marketplace Vendor

NHC-only. Vendor with an active catalog presence in the NHC marketplace.

**Goals:** Publish products, fulfill direct and bulk orders.

**Distinctive responsibilities:**

- Publish and maintain a catalog of products with pricing and specifications.
- Fulfill **direct orders** placed against catalog items.
- Fulfill **bulk purchase** flows where multiple buyers aggregate demand.
- Submit **Zatca-compliant invoices** (mandatory).
- Use **Muqawil** verification (for contractors).

See `variants/nhc.md`.

---

## Privacy and isolation guarantees

These apply to all vendor personas:

1. **Vendor cannot see other vendors' offers** — even after award. A vendor only sees its own submissions.
2. **Vendor cannot see buyer-internal data**: budgets, approval status, other vendor orders, other buyer-side users.
3. **Vendor data isolation across organizations**: vendor users in vendor org A cannot see anything from vendor org B.

---

## Vendor portal URL by variant

| Variant    | Vendor portal URL                          |
| ---------- | ------------------------------------------ |
| Enterprise | `vendor.{env}.penny.co` (baseline)         |
| RCMC       | `vendor.{env}.penny.co` (scoped)           |
| EWCF       | `vendor.procurement.esportsfoundation.com` |
| NHC        | per env                                    |

---

## Cross-references

- Glossary: Vendor, Vendor Portal, GDN, Offer
- Vendor modules: `modules/vendor-rfq-response.md`, `modules/vendor-orders.md`
- Buyer-side counterparts: `personas/buyer-roles.md`
- NHC marketplace: `variants/nhc.md`
