# Module: Vendor Orders (Acceptance, Delivery, Invoicing)

The vendor's order-fulfillment lifecycle on the vendor portal.

**Last updated:** 2026-05-13

---

## Purpose

To let vendors accept buyer orders, ship goods, and invoice for payment. Covers three sub-flows: order acceptance, delivery (GDN creation), and invoicing.

---

## 1. Order acceptance

When the buyer publishes an order, the vendor receives it in the portal.

**Vendor actions:**

- Review order: items, quantities, delivery address/date, payment terms, total.
- **Accept** — commits to delivery terms.
- **Reject** — must provide a reason.

**Rules:**

- SLA: typically accept/reject within 24–48 hours.
- Once accepted, vendor cannot edit order details.
- Late or no response may affect vendor performance ratings.

**Vendor-side status:** `New → Accepted → In Preparation → Shipped → Delivered`. Off-path: `Rejected`.

---

## 2. Delivery (GDN creation)

The vendor creates a **Goods Delivery Note (GDN)** when shipping.

**GDN content:**

- Order reference.
- Delivery date.
- Shipped quantities per line.
- Tracking number and carrier.
- Estimated arrival.
- Driver/delivery contact (optional).

**Rules:**

- Must ship by the agreed delivery date.
- Partial shipments allowed if the buyer accepts them.
- Tracking information required.
- GDN is the basis for the buyer's GRN.

**Vendor delivery states:** `Draft → Shipped → In Transit → Delivered`. Off-paths: `Partially Received`, `Rejected` (after the buyer's GRN rejects items).

---

## 3. Invoicing

After delivery (and ideally after the buyer's GRN), the vendor creates an invoice.

**Invoice content:**

- Order reference.
- Delivered items + quantities (auto-populated where possible).
- Tax (VAT / sales tax).
- Validity period and payment terms.
- Attached invoice document (PDF) + supporting documents.

**Invoice types:**

- **Standard Invoice** — post-delivery.
- **Proforma Invoice** — pre-delivery.

**Rules:**

1. Vendor can only invoice delivered items (GRN exists).
2. Invoice amount must match order prices.
3. Tax calculations must be accurate.
4. Cannot invoice more than the ordered quantity.

**Vendor invoice states:** `Draft → Submitted → Under Review → Approved → Paid`. Off-paths: `Rejected`, `Disputed`.

---

## Variant deviations

- **NHC**: vendor portal uses different controls in some places (e.g., select-box vs list-item for tax options). Invoices must be Zatca-compliant. See `variants/nhc.md`.
- **EWCF**: vendor portal at `vendor.procurement.esportsfoundation.com`. See `variants/ewcf.md`.
- **RCMC**: vendor portal scoped at `vendor.{env}.penny.co`. See `variants/rcmc.md`.

---

## Cross-references

- Glossary: Order, GDN, GRN, Bill, Proforma Bill, Zatca, Vendor Portal
- Buyer counterparts: `modules/orders.md`, `modules/grn.md`, `modules/bills.md`
- State transitions: `cross-cutting/state-transitions.md`
- Personas: `personas/vendor-roles.md`
