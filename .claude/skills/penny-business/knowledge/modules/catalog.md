# Module: Product Catalog & Marketplace

Product master data and catalog-driven procurement.

**Last updated:** 2026-07-01

---

## Purpose

To maintain reusable product/service definitions with pricing, specifications, and vendor associations — enabling fast repeat ordering and catalog-driven sourcing.

---

## Two perspectives

1. **Buyer catalog** — products the buyer organization can purchase. Curated internally. Used in catalog-based orders.
2. **Vendor catalog** — products a vendor offers. Maintained by the vendor; visible in RFQ responses and in the marketplace.

---

## Product fields

- Product code / SKU
- Name and description
- Category (from Item Categories)
- Unit of measure (Each, Box, KG, etc.)
- Price (can have tiered pricing)
- Vendor association
- Specifications
- Images
- Stock status (if inventory tracked)
- Variants (size, color, etc.)

---

## How catalogs are used

- **Orders from catalog** — buyer selects products and quantities; order auto-populated from catalog data.
- **RFCs (Request for Catalogue, under MFA)** — note: in Penny, `RFC` is a request type that triggers the **MFA contract** flow (see `modules/contracts.md`), not generic catalog sourcing. The name is historical.
- **Vendor RFQ response** — vendor can offer catalog products against an RFQ.

---

## NHC: marketplace-first

NHC's primary procurement model is **catalog and marketplace**, not RFQ/RFP as a competitive-bidding module.

- Vendors publish their catalog of products.
- Buyers browse and purchase directly (Direct Order) or aggregate demand (Bulk Purchase).
- Payments flow through PropPay.

**Verified by user: 2026-07-01** — marketplace products carry a per-product purchase-type banner (`product-type-banner--rfq` CSS class, text "Standard purchase - RFQ") that determines the checkout path:

- **RFQ-type products** — added to a distinct cart (buyer-facing label "RFQ cart") — checkout out of that cart creates a **Sourcing Request** pre-seeded with the cart's catalog product(s), landing on the same "Create Sourcing Request" wizard used for the manual/category-based flow (see `modules/requests.md`), reached via a URL carrying `from=cart&mode=rfq`. This is a second, catalog-driven path into Sourcing Requests, distinct from the manual/category-based path.
- **Standard-purchase-type products** — presumed to go to Direct Order instead. **Status: unverified** — not yet confirmed by walking the checkout for a non-RFQ product.

**Verified by user: 2026-07-01** — the wizard's "Add Products" step (step 2) when landing from the cart: cart product(s) appear pre-populated in a collapsible side list (with quantity, editable) alongside the normal "Add Manually" form — the two coexist, so the buyer can add further manual line items to the same sourcing request in addition to the cart product(s). "Submit Sourcing Request" is enabled once at least one item (cart or manual) is present. This pre-population only happens via an in-app navigation (clicking "Create sourcing request" from the cart drawer inside the running SPA) — a hard page reload/direct URL navigation to `/en/sourcing/create?from=cart&mode=rfq` loses the in-memory cart-to-wizard handoff and shows 0 items, since the cart's pending-checkout state lives in client-side app state, not fully reconstructable from the URL alone.

Still unverified: whether "Standard-purchase-type" products go through Direct Order (not yet walked). (Earlier note about a missing-delivery-location blocker was a dropdown-loading timing artifact during manual exploration, not a real app state — the buyer org's existing delivery location is selected from the dropdown same as the manual flow.)

See `variants/nhc.md` for the full NHC marketplace model.

---

## Bulk Purchase (NHC-specific)

A flow where multiple buyer organizations aggregate demand against a single vendor catalog offer — enabling volume pricing. First-class order type in NHC; not available in enterprise.

---

## Business rules

1. Product code must be unique within the catalog.
2. Inactive products cannot be added to new orders or offers.
3. Vendor must be active to publish a vendor-catalog entry.
4. Price changes do not retroactively affect existing orders.

---

## Variant deviations

- **NHC**: catalog is the core. Marketplace + bulk purchase + PropPay. See `variants/nhc.md`.
- **Enterprise / RCMC / EWCF**: catalog is one of three order-creation paths (alongside from-RFQ and direct).

---

## Cross-references

- Glossary: Catalog, Bulk Purchase, PropPay
- Order creation methods: `modules/orders.md`
- NHC marketplace: `variants/nhc.md`
