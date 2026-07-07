# Variant: NHC (Network Hub Community / National Housing Company)

**One-liner:** Saudi-specific community marketplace variant for SMB procurement — catalog-first, no RFQ/RFP, no budgets, mandatory Zatca compliance.

**Last updated:** 2026-07-01

---

## What's fundamentally different from Enterprise

### 1. No RFQ / RFP / EOI

NHC does **not** have competitive bidding modules. Instead, procurement happens through:

- **Sourcing Requests** — created either manually (category-based, manual products) or from the marketplace cart (catalog-based, see §11). Buyers describe what they need or select cart products; vendors who match respond.
- **Direct Orders** — straight order against a catalog product or vendor.
- **Bulk Purchase** — aggregation flow where multiple buyers combine demand against a single vendor offer.

### 2. Catalog is the core

Marketplace-driven: vendors publish catalogs, buyers browse and purchase. Catalog is not just one of three order creation methods (as in enterprise) — it's _the_ primary path.

### 3. No budgets, no expense accounts

NHC has **no budget control** and **no expense-account allocation**. Requests don't validate against budgets; orders don't book budget; bills don't move budget from booked to spent. This is a hard architectural difference.

### 4. PropPay (ProPay) financing module

**Verified:** NHC has a dedicated **ProPay** financing module accessible from the sidebar. Tests live under `tests/nhc-organization/admin-modules/propay/`. A `propayMarkupDetails` constant exists with type `'propay'`. The exact financing semantics and full role in the P2P flow are **not yet captured here** — ask the user to confirm before asserting behavior.

### 5. Zatca e-invoicing

**Status: unverified in test repository.** Prior project notes describe Zatca (Saudi e-invoicing compliance) as mandatory for NHC bills, but **no code, page object, fixture, or constant references "Zatca" in the test repo**. May be backend-only, may have been renamed, may not be in current scope. Ask the user to confirm before asserting Zatca behavior.

### 6. Muqawil Marketplace

**Verified (limited):** Muqawil appears as an alternate sidebar label for the NHC supply market — `module: /SupplyPro Market|Muqawil Marketplace/`. **No dedicated verification flow, page object, or contractor-onboarding logic** is observed in code. Earlier characterization as a "contractor verification system" is **unverified**.

### 7. Currency and tax

- **Currency:** SAR (Saudi Riyal) only — no multi-currency.
- **Tax:** 15% Saudi VAT.

### 8. Workspace limit

**Single workspace** — hard limit of 1 workspace per NHC organization.

### 9. Workspace Abbreviation in PO IDs

**Verified by user:** 2026-06-14. Source: Feature Flag Bible v26.2.7.

The flag **"Use Workspace Abbreviation and Workspace Order ID"** is **enabled on NHC** (and disabled on `test.penny.co`). When active, PO IDs use the workspace's unique abbreviation plus a serialised number instead of the global org-level ID format. Example: `NHC-FIN-0001` (workspace abbreviation "FIN", serial 0001). Verify PO ID format in every NHC regression.

### 10. Public Tenders — must never be enabled

**Verified by user:** 2026-06-14. Source: Feature Flag Bible v26.2.7.

The **"Allow Public Tenders"** flag **must never be enabled** on NHC. NHC has strict vendor vetting requirements — exposing sourcing events to unvetted vendors would violate procurement controls. This is a HIGH RISK flag for NHC tenants.

### 9. Different API endpoints

Several modules use different backend endpoints than enterprise (e.g., `productsV2`, `ordersV2`, `bulk-purchase`). This is technical detail, captured here only because it is commonly noticed; for code-level specifics in this framework, use `penny-api-sdet` and `penny-create-standard-code`.

### 10. Vendor portal control differences

In some places the vendor portal uses different UI controls (e.g., select-box vs list-item for tax options). Functional behavior is equivalent.

### 11. Catalog products can route into a Sourcing Request via the cart

**Verified by user: 2026-07-01**, live walkthrough on `community-test.penny.co` (NHC org).

Marketplace products are typed as either "Standard purchase" or "RFQ" (visible product banner, CSS class `product-type-banner--rfq`). RFQ-type products go into a cart (buyer-facing "RFQ cart", `data-test-id="open-rfq-cart-button"`); the cart drawer's **"Create sourcing request"** action (`data-test-id="cart-create-order-button"`) opens the standard "Create Sourcing Request" wizard pre-seeded with the cart's products, at a URL carrying `from=cart&mode=rfq`.

This means catalog products are **not** limited to Direct Order/Bulk Purchase in NHC (contradicts the prior simplification in §1/§2 above and in `modules/catalog.md`) — RFQ-typed catalog products flow into Sourcing Requests instead. See `modules/catalog.md` NHC section for the full breakdown and what remains unverified (Standard-purchase-type checkout path, exact "Add Products" step behavior, no-delivery-location blocking behavior).

---

## What's the same as Enterprise

- GRN flow (delivery + inspection + accept/reject).
- Bill matching concepts (2-way / 3-way), once Zatca fields are added.
- Approval workflows (simpler in practice, but same configuration model).
- Standard 7 user roles.

---

## NHC-specific personas

In addition to the standard roles:

- **Marketplace vendor** — vendor publishing a catalog and fulfilling direct/bulk orders.
- **SCA buyer** (Supply Chain Aggregator) — user who can run bulk-purchase flows.

See `personas/buyer-roles.md` and `personas/vendor-roles.md`.

---

## Cross-references

- Variant matrix: `variants/variant-matrix.md`
- Glossary: NHC, Sourcing Request, Bulk Purchase, PropPay, Zatca, Muqawil
- Affected modules: `modules/catalog.md`, `modules/orders.md`, `modules/bills.md`, `modules/payments.md`
- What's NOT in NHC: see `modules/e-sourcing.md`, `modules/finance-budgets.md`
