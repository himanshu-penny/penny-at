# Glossary — Penny Business Terminology

Alphabetical reference for every Penny business term. For full lifecycle or rule detail, follow the cross-references.

**Last updated:** 2026-06-14

---

## Module and Term Aliases

Quick routing table for shorthand and team vocabulary. Aliases route the question — they do not prove behavior. After routing, still check module, client, role, state, and flags.

**Verified by user:** 2026-05-31. Source: PennyGuard base-knowledge.

| Alias / shorthand                                            | Route to                                                 |
| ------------------------------------------------------------ | -------------------------------------------------------- |
| PR, requisition, purchase request                            | `modules/requests.md`                                    |
| PO, purchase order, direct order, UOO (Urgent/One-off Order) | `modules/orders.md`                                      |
| e-source, esource, sourcing, RFx, tender, bid                | `modules/e-sourcing.md`                                  |
| RFP committee, BOC, bid opening                              | `modules/e-sourcing.md` — sealed bid / committee section |
| receive, receiving, delivery note, GRN                       | `modules/grn.md`                                         |
| invoice, bill, payable                                       | `modules/bills.md`                                       |
| pay, payable settlement                                      | `modules/payments.md`                                    |
| budget, PAB (Post Allocated Budget), expense account         | `modules/finance-budgets.md`                             |
| LOA, letter of award, award letter                           | `modules/contracts.md`                                   |
| sign, signing, SignIt, DocuSign                              | `modules/contracts.md` — e-signature section             |
| vendor, supplier, VRF, registration                          | `modules/admin-users-roles.md`                           |
| AB, task board, pending actions                              | Action Board (cross-module inbox of tasks)               |
| roles, RBAC, permission, approver                            | `personas/buyer-roles.md`, `modules/admin-workflows.md`  |

---

## Permission Decision Rule

When a button or action is missing or a user cannot perform an expected action, check in this order:

1. **Role and permission** — does the user's assigned role grant this action?
2. **Workspace/org scope** — is the user scoped to the correct workspace?
3. **Record status/state** — is the entity in a state that allows this action?
4. **Required assignment** — does the action require event-level assignment (e.g. evaluator, committee member)?
5. **Feature flag/configuration** — is the feature enabled for this org/client?
6. **Client variant** — does the client's variant restrict or change this behavior?
7. **API response and audit/timeline** — confirm at the API/data layer before classifying as a bug.

Do not classify missing UI as a bug until all 7 layers are checked.

**Verified by user:** 2026-05-31. Source: PennyGuard base-knowledge.

---

## A

### AI Chatbot

A conversational AI assistant embedded in Penny that lets users query procurement data, create requests, and get workflow guidance using natural language. Role-based access control applies within the chat. Feature-flag controlled — not available in all organizations. See `modules/ai-features.md`.

### AI Negotiator

An AI-powered assistant that suggests optimized negotiated prices per line item during RFQ/RFP offer evaluation. Feature-flag controlled. See `modules/ai-features.md`.

### Approval Workflow

A configurable rule set that routes an entity (request, order, bill, offer) through one or more approvers before it becomes binding. Up to 5 sequential levels. Routing can branch by amount, workspace, category, expense account, or requester. See `cross-cutting/approval-routing.md`.

### Action Board

The landing page immediately after login. A personalised task dashboard showing all pending actions requiring the logged-in user's attention, grouped by procurement stage. Every role sees a different view — an approver sees pending approvals, a sourcing manager sees open RFQs, a warehouse receiver sees pending GRN confirmations. Items appear only when the workflow has routed an object to that user's level. See `modules/admin-users-roles.md`.

### Advance Bill

A bill created **before a GRN exists**, used in prepayment/advance payment scenarios where a vendor requires payment before delivery (e.g. 50% upfront before production begins). The remaining balance is billed as a Standard Bill against the GRN after delivery. Flag-controlled: "Allow creation of advance bill" must be ON. See `modules/bills.md`.

### Award

The buyer's final decision in an e-sourcing event selecting one or more winning vendor offers. Awarding creates (or readies the creation of) a purchase order. See `cross-cutting/scoring-and-awards.md`.

---

## B

### Basic User

**Verified by user:** 2026-05-13. The default starter role. Can create and approve their own requests in the request module, and access products and catalogs they are assigned to. See `personas/buyer-roles.md`.

### Bid Bond

**Verified by user:** 2026-06-06. Source: RCMC BRD R4.
A financial guarantee that a vendor may be required to submit as part of their bid in an RFQ/RFP. The buyer requests a bid bond during RFQ/RFP creation. The vendor must include it in their submission. RCMC Phase 1 capability. See `variants/rcmc.md`.

### Bid Opening Committee

**Verified by user:** 2026-05-13. An E-Source committee role. Members can view and **unlock** RFxs (RFQ/RFP/sealed-bid events) they are assigned to. **This is the role that authorizes sealed-bid unlock** — what prior project notes called "gating committee" likely referred to this. See `personas/buyer-roles.md`, `modules/e-sourcing.md`.

### Bill

A vendor invoice received by the buyer. The buyer matches it against the related order (2-way) or order + GRN (3-way), resolves any discrepancies, and approves it for payment. Approving a bill consumes budget (moves from Booked to Spent). See `modules/bills.md`.

### Budget

A funding allocation, scoped to a workspace and optionally to an expense account, for a fiscal period. Formula: `Available = Total − Booked − Spent`. Enterprise-only concept; NHC has no budgets. See `modules/finance-budgets.md`.

### Bulk Purchase

An NHC-specific order flow where multiple buyers aggregate demand against a single vendor offer. See `variants/nhc.md`.

### Buyer

1. **As an organization**: the company using Penny to procure goods/services.
2. **As a role**: the user who creates requests and orders. Also called Requester. See `personas/buyer-roles.md`.

---

## C

### Catalog

A curated set of products with prices, specifications, and vendor associations. Buyers can create orders directly from catalog items. NHC's primary procurement mode is catalog-driven; in enterprise it is one of three order-creation methods. See `modules/catalog.md`.

### Change Request

**Verified by user:** 2026-06-06. Source: RCMC BRD R4.
An RCMC-specific module for **contract and order amendments**. When a contract or PO needs to be modified, the Business Owner initiates a Change Request (with justification, approved by Business Chief + Procurement Contract Director + Finance Group). A CR Committee and DOA validate and authorize. After approval, the Procurement Contract Specialist prepares an amendment draft; the supplier and DOA sign. Penny then creates a **new version** of the contract/PO document and replicates it to SAP. Finance is involved to release budget for the changes. **Not the same as a vendor data change — this is a procurement contract amendment flow.** Not available in other variants. See `variants/rcmc.md`.

### Commercial Scoring

The price-based component of an RFP evaluation. Combined with technical scoring using configurable weights. See `cross-cutting/scoring-and-awards.md`.

---

## D

### Direct Award

A sourcing decision to skip competitive bidding and award to a pre-selected vendor with justification. **Not the same as a direct order** — direct award is a _sourcing_ concept, direct order is an _order-creation method_.

In RCMC, Direct Award splits into two sub-types by value:

- **> 200,000 SAR**: Requires completing a **6-Point Justification Form** and routes to the CEO for approval via the Direct Award Committee.
- **< 200,000 SAR**: Fast-track lightweight process directly to a PO, no justification form required.

See `variants/rcmc.md`.

### Direct Award PR

**Verified by user:** 2026-06-06. Source: RCMC BRD R4.
An RCMC Purchase Requisition type for single-source procurement. The requester indicates a specific vendor. For amounts > 200K SAR, a 6-point justification form is mandatory and routes to CEO. For amounts < 200K SAR, a fast-track lightweight process applies. See `glossary.md#direct-award` and `variants/rcmc.md`.

### Direct Order

An order created without going through e-sourcing — manual entry of vendor, items, and prices. One of three order-creation methods (the others are from-RFQ and from-catalog). **Not the same as direct award**. See `modules/orders.md`.

---

## E

### EOI (Expression of Interest)

A vendor pre-qualification event. Vendors express interest and provide capability information before a full RFQ/RFP is issued. Used to qualify the vendor pool for a future sourcing event. ⚠ If "NDA mandatory for EOI" flag is ON but no NDA document is configured, all EOI expressions are silently blocked with no error message to vendors. See `modules/e-sourcing.md`.

### Expense Bill

A bill created for expense requests — items listed for vendor (or payee) review. Used in the employee expense reimbursement flow. Auto-created on Expense Request approval. Flag-controlled: "Allow creation of expense bill" must be ON. See `modules/bills.md`.

### Expense Request

A request type for employee expense reimbursement. After approval, an Expense Bill is automatically created. Payment goes to the employee's bank account (not a vendor). No Purchase Order and no GRN are involved. Requires "Allow Expense Request" feature flag ON. See `modules/requests.md`.

### Enterprise

The full-featured Penny variant for large B2B organizations. Default reference variant in this knowledge base. See `variants/enterprise.md`.

### EWCF

A custom Penny instance for the eSports World Cup Foundation. Uses custom domain `procurement.esportsfoundation.com` and the `reSourceAfterReturn` feature flag. See `variants/ewcf.md`.

### Expense Account

A chart-of-accounts entry used to classify procurement spend (e.g., 4100-IT Hardware). Budgets are allocated by expense account within a workspace. Enterprise-only. See `modules/finance-budgets.md`.

---

## G

### Gating Committee

**Likely an informal name for Bid Opening Committee.** "Gating committee" does not appear in code, but **Bid Opening Committee** is a verified Penny E-Source role responsible for unlocking sealed-bid events (verified from user-provided role spreadsheet, 2026-05-13). When someone says "gating committee", they almost certainly mean **Bid Opening Committee** — confirm with the user, then use the correct term. See `glossary.md#bid-opening-committee` and `personas/buyer-roles.md`.

### GDN (Goods Delivery Note)

The vendor's outbound shipping document, created in the vendor portal when goods are dispatched. Links to the buyer's GRN on receipt. See `modules/vendor-orders.md`.

### GRN (Goods Receipt Note)

The buyer-side record of receiving and inspecting delivered goods. Required for 3-way invoice matching. Supports partial receipts (multiple GRNs against one order) and per-line accept/reject. See `modules/grn.md`.

---

## L

### Letter of Award (LoA)

**Verified:** formal award document submitted when a buyer accepts a winning offer. Carries code, description, and a supporting Excel document. Submitting transitions the underlying offer to status `AWARD_SUBMITTED`. Acts as the formal precursor to MFA contract creation. See `modules/contracts.md`.

---

## M

### MFA (Master Framework Agreement)

**Verified:** MFA = Master Framework Agreement. A multi-transaction framework agreement created from an approved e-sourcing offer when the request type is `CONTRACT_REQUEST` (UI label: "RFC (MFA)"). Created via the "Create MFA" action on the approved offer page. States observed: **Drafted → Active**. Once active, ongoing orders are raised as Work Orders against the contract — no new sourcing required; pricing is already locked. In EWCF, MFA contracts carry a spend cap (`BY_VALUE`, `BY_QUANTITY`, or `NO_CAP`) with `spendCapValue`. See `modules/contracts.md`, `modules/e-sourcing.md`.

### Muqawil

**Partially verified:** in the NHC codebase, Muqawil appears as a sidebar label for the supply market (`/SupplyPro Market|Muqawil Marketplace/`). No dedicated page object or contractor verification flow exists in the test repo.

Per April 2026 product docs (**Source: product docs, unverified in code**): Muqawil is a broader contractor marketplace with vendor discovery, VRF (Vendor Registration Form) sourcing, and SCA (Saudi Contractors Authority) integration. Treat specifics beyond the sidebar label as unverified until confirmed. See `modules/integrations.md`.

---

## N

### Negotiation

A round-trip with a vendor to revise their submitted offer. The buyer requests a revision; the vendor can submit a new price and terms. Original offer is preserved in audit. See `modules/e-sourcing.md`.

---

## P (continued)

### Performance Bond

**Verified by user:** 2026-06-14. Source: Platform Reference Documentation v26.2.7; RCMC BRD R4.
A financial guarantee submitted by an awarded vendor before work begins on a high-value contract. Percentage of contract value varies by context: typically **10%** (general enterprise), **5%** (RCMC Phase 2). In RCMC, can be made a **mandatory pre-requisite** for signing the contract. 5-stage lifecycle: Draft → Requested → Submitted → Approved → Expired (+ Resubmission Requested). System automatically monitors validity and sends reminders before expiry. See `modules/orders.md`, `variants/rcmc.md`, `modules/contracts.md`.

### NHC

Saudi-specific Penny variant for SMB community marketplace procurement. Catalog-first, no RFQ/RFP, no budgets, mandatory Zatca e-invoicing. See `variants/nhc.md`.

---

## O

### Offer

A vendor's response to an RFQ or RFP — line-item pricing, delivery terms, payment terms, technical answers (for RFP), supporting documents. States: Draft → Submitted → Under Review → Awarded / Not Awarded. See `modules/vendor-rfq-response.md`.

### Order (Purchase Order)

The buyer's binding commitment to purchase from a specific vendor. Created from a winning offer, from the catalog, or directly. Order approval books budget. See `modules/orders.md`.

---

## P

### Public Tender

An open competitive tendering mechanism where buyers publish tenders that any qualifying vendor can participate in via self-registration, rather than direct invitation. Used for public/regulated procurement. **Status: unverified in automated test codebase.** See `modules/public-tender.md`.

### P2P (Procure-to-Pay)

The end-to-end procurement lifecycle: Request → Sourcing → Order → GRN → Bill → Payment. See `cross-cutting/procure-to-pay.md`.

### Payment

The financial settlement of an approved bill. Can be by bank transfer, check, online payment, or (in NHC) PropPay. See `modules/payments.md`.

### Proforma Bill

A pre-delivery vendor invoice. Used when buyer needs to pay in advance or to commit before goods ship. Approved via the same workflow as a standard bill. See `modules/bills.md`.

### ProPay (PropPay)

**Verified in NHC codebase:** a **vendor financing module** — buy-now-pay-later solution that allows approved buyers to access financing for orders with deferred payment. Page link `clickPropayLink()` opens the "ProPay" module; tests live in `tests/nhc-organization/admin-modules/propay/`. A `propayMarkupDetails` constant exists with type `'propay'`.

**Per April 2026 product docs (Source: product docs, unverified outside NHC):** ProPay capabilities include finance request creation, approval workflow, active financing badge on dashboard, finance solution card display, and payment processing. The variant-matrix lists it as NHC-only — confirm with the team before asserting ProPay on other variants. See `modules/propay.md`.

---

## R

### RCMC

A Penny variant for vendor network centralization. Unique features: org conversion (`rcmcOrgConversion` flag moves commercial scoring from request form to e-source), change requests, vendor-scoped portal URL (`vendor.{env}.penny.co`), `draftWorkflowInSignIt` digital signatures. See `variants/rcmc.md`.

### Request (Purchase Request / Requisition)

The buyer's formal need-to-purchase, submitted for approval before any sourcing or ordering happens. States: Draft → Submitted → Approved → Sourcing → Closed. See `modules/requests.md`.

### Requester

The user who creates a purchase request. Also called a Buyer (role). See `personas/buyer-roles.md`.

### Revision (Offer Revision)

A vendor's resubmission of an offer in response to a buyer's negotiation request. The original offer remains in audit. See `modules/e-sourcing.md`.

### RFC (Request for Contract / MFA)

**Verified:** appears in code as `requestType.CONTRACT_REQUEST` displayed as `"RFC (MFA)"`. RFC stands for **Request for Contract** — also called **MFA (Master Frame Agreement)**. A request type used to source goods/services under a framework agreement rather than as a one-off purchase. Triggers the MFA contract creation flow after offer award (rather than a direct purchase order). Tagged `@rfc-mfa` in shared tests across requests, e-source, orders, and vendor modules.

**Verified by user:** 2026-05-14 — user confirmed RFC = "Request for Contract"; MFA is another name for the same thing. The prior label "Request for Catalogue" was incorrect.

See `modules/contracts.md`.

### RFP (Request for Proposal)

A sourcing event with **technical evaluation** in addition to price. Vendors answer a questionnaire and submit a commercial offer. Final score is weighted technical + commercial. See `modules/e-sourcing.md` and `cross-cutting/scoring-and-awards.md`.

### RFQ (Request for Quotation)

A competitive sourcing event focused on **price**. Vendors submit per-line-item pricing. Lowest qualified bid typically wins. See `modules/e-sourcing.md`.

---

## S

### Savings Tracking

The platform's mechanism for measuring and reporting procurement savings — the difference between the baseline (estimated) value and the final awarded price across RFQ / RFP / RFC events and negotiations. Savings are reflected in reports and the dashboard. Key scenario categories that savings must cover: Basic Purchase (single/multi-item), Tax & Price Variations, Shipping & Commercial Terms, RFQ/Offer Type Variations, Negotiation & Offer Lifecycle, Order Conversion, Approval & Exception Handling, Reporting & Visibility. **Verified by user: 2026-05-14 (KT Session March 2026).** See `modules/finance-budgets.md`.

### Sealed Bid

A sourcing mode where vendor offers are **locked** on submission and not visible to the buyer until a designated unlock event (authorized by the **Bid Opening Committee** — see that entry). Used when impartiality must be demonstrable (government procurement, high-value contracts, regulated tenders). Distinct from open bidding (offers visible immediately) and from direct award (no bidding). After the deadline, the Bid Opening Committee unlocks the bids; no supplier knows what competitors quoted until reveal. See `modules/e-sourcing.md`.

### Open Bid

**Verified by user:** 2026-06-14. Source: Plain English Guide v26.2.7.
A sourcing mode where supplier quotes are visible to the buyer in real time as they arrive. Creates competitive pressure — suppliers can sharpen prices knowing the deadline is approaching. Good for routine purchases, standard goods, internal procurement. Contrast with **Sealed Bid** where all quotes are hidden until deadline.

### Three-Way Matching

**Verified by user:** 2026-06-14. Source: Platform Reference Documentation v26.2.7.
A financial control where Penny compares three documents before payment can be released: (1) the **Purchase Order** (what was ordered), (2) the **GRN** (what was received), and (3) the **Bill** (what the supplier is charging). All three must align before payment proceeds. The strictest matching mode — cannot invoice for goods that were not received. See `modules/bills.md`.

### Sourcing Request

NHC's analogue to RFQ/RFP. Category-based, manual products only, simplified workflow. Not available in enterprise. See `variants/nhc.md`.

### Super Approve

A Super Admin proxy approval. The Super Admin checks a "super-approve-checkbox" on the entity and approves on behalf of the configured approver at the current level. Goes _through_ each level (does not skip them), unlike Skip Approval. See `cross-cutting/approval-routing.md`.

---

## T

### Tender Plan

**Verified by user:** 2026-06-06. Source: RCMC BRD R4.
An RCMC Phase 2 feature that allows a buyer to prepare and execute a formal tender plan for a PR before floating the RFQ/RFP. The plan is approved by the Requester's Director and Procurement Director. In Phase 1, no tender plan step exists — buyers go directly from approved PR to RFP preparation. See `variants/rcmc.md`.

### Tahakom

A Penny enterprise client variant with additional financial features: bulk upload of journal entries and custom order-level configurations. **Status: unverified in automated test codebase** — no Tahakom-specific test files observed. Treat all details as `Source: product docs (unverified)` until confirmed. See `variants/tahakom.md`.

### Technical Approver

**Verified by user:** 2026-05-13. An E-Source committee role. Can approve or reject technical evaluations for RFxs they are assigned to. Distinct from Technical Evaluator — the Approver makes the final call on technical pass/fail; the Evaluator does the rating. See `personas/buyer-roles.md`.

### Technical Evaluator

**Verified by user:** 2026-05-13. An E-Source committee role. Can perform technical evaluation on RFxs they are assigned to. **Cannot reassign** the evaluation to another user regardless of privilege. See `personas/buyer-roles.md`.

### Technical Questions / Technical Evaluation

RFP-specific questionnaire of weighted technical criteria. Vendors answer; **Technical Evaluators** rate the answers and **Technical Approvers** approve/reject the evaluation; technical score combines with commercial score for the final ranking. Required for RFP, not available for RFQ. See `cross-cutting/scoring-and-awards.md` and the **Technical Evaluator** / **Technical Approver** entries above.

---

## S (continued)

### Super Admin

**Verified by user:** 2026-05-13. The top-tier god-role that has all permissions across all modules, expanded to all workspaces. Also the role that can perform **Super Approve** (proxy approval) and **Skip Approval**. See `personas/buyer-roles.md` and `cross-cutting/approval-routing.md`.

---

## V

### Vendor

1. **As an organization**: the supplier doing business with the buyer.
2. **As a user role**: a user on the vendor portal who views RFQs, submits offers, accepts orders, ships goods, and submits invoices. See `personas/vendor-roles.md`.

### Vendor Portal

The vendor-facing interface for responding to RFQs, managing orders, creating GDNs, and invoicing. Per-variant URL: enterprise per env; EWCF on `vendor.procurement.esportsfoundation.com`; RCMC on `vendor.{env}.penny.co`. See `personas/vendor-roles.md`.

---

## W

### Work Order

**Verified by user:** 2026-06-14. Source: Platform Reference Documentation v26.2.7; Plain English Guide v26.2.7.
A purchase request that references an **existing contract or Master Framework Agreement (MFA)** instead of triggering a new competitive sourcing event. The requester selects line items from the existing framework; pricing is already locked. A PO is issued directly from the contract. No new RFQ/RFP required. Penny deducts the work order value from the framework agreement balance. The approval cycle is configurable. Reduces sourcing time from weeks to hours for repeat procurement under an active framework. See `modules/e-sourcing.md`, `modules/contracts.md`.

### Work Order PR (RCMC-specific)

**Verified by user:** 2026-06-06. Source: RCMC BRD R4.
An RCMC Purchase Requisition type where the requester selects line items from an **existing Master Framework Agreement (MFA)** and submits them for approval. See `variants/rcmc.md` and `modules/contracts.md`.

### 6-Point Justification Form

**Verified by user:** 2026-06-06. Source: RCMC BRD R4.
A mandatory form in RCMC that a requester must complete when specifying a single vendor on a **Direct Award PR above 200,000 SAR**. The six-point structure justifies the sole-source decision. After completion, the PR is routed to the CEO for approval via the Direct Award Committee. RCMC Phase 1 customization. See `variants/rcmc.md`.

### Workspace

A logical division of an organization (department, location, cost center, project) with its own users, budget, and approval workflow. Enterprise allows up to 10; NHC is capped at 1.

In **RCMC**, workspaces come in two types:

- **Project Workspaces**: Represent P+ projects. Can be auto-created from P+ Project Charter approval (with P+ integration) or created manually (without integration).
- **Department Workspaces**: Represent organizational departments with independent users and workflows.

See `modules/admin-users-roles.md` and `variants/rcmc.md`.

---

## Z

### Zatca

**Status: unverified in code.** Term that appears in prior project notes referring to Saudi e-invoicing compliance. **No code, page object, fixture, or constant references "Zatca" anywhere in the test repository.** May be backend-only, may have been renamed, or may not be implemented in the current tested scope. Specifics like UUID, QR code, hash, cleared status — **all unverified**. Ask the user to confirm before asserting Zatca behavior.

---

## Cross-cutting references

- For end-to-end procurement flow: `cross-cutting/procure-to-pay.md`
- For all entity status tables: `cross-cutting/state-transitions.md`
- For scoring formulas and award logic: `cross-cutting/scoring-and-awards.md`
- For variant feature comparison: `variants/variant-matrix.md`
