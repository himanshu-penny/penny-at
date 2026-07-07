# penny-business Changelog

One line per change. Newest at the top. Append, don't rewrite history.

Format: `YYYY-MM-DD — <file edited> — <one-sentence summary> [author]`

`author` is either `user` (explicit `/penny-business-update` or chat capture), `code` (discovered from codebase), or `migration` (initial seed from prior QA docs).

---

## 2026-07-01

### NHC catalog-cart-to-sourcing-request flow (live UI walkthrough)

- 2026-07-01 — `modules/catalog.md` — Added verified NHC checkout detail: marketplace products are typed "Standard purchase" or "RFQ" (banner CSS class `product-type-banner--rfq`); RFQ-type products checkout via cart into a Sourcing Request (`from=cart&mode=rfq`), not just Direct Order/Bulk Purchase. Confirmed the wizard's Add Products step pre-populates cart product(s) in a side list alongside the manual-entry form (in-app navigation only — hard reload loses the handoff). Marked Standard-purchase checkout path as still unverified. [user]
- 2026-07-01 — `variants/nhc.md` — Added §11: catalog products can route into a Sourcing Request via the RFQ cart (`data-test-id="open-rfq-cart-button"` / `cart-create-order-button`). Corrected §1 wording — Sourcing Requests are no longer manual-products-only. [user]
- 2026-07-01 — `modules/requests.md` — Corrected NHC variant deviation line: removed "manual products only" claim; added the catalog-cart creation path alongside the existing manual/category-based path. [user]

---

## 2026-06-14

### Major update from four v26.2.7 internal documents (Feature Flag Bible, Master KB, Business Context, Plain English Guide)

- 2026-06-14 — `cross-cutting/feature-flags.md` — **NEW FILE**: Complete feature flag reference (107 flags, 15 modules). Two-tier config system (Security/Module/Workspace). Module Master Toggle behavior. HIGH RISK flag register (15 flags). QA testing protocol (5-step + 4-layer flag-off rule). Key flag interactions (NDA+EOI silent block, Workflows/Budgets master toggle risks). Per-client tenant flag configurations (RCMC, EWCF, Snoonu/Sabil, NHC). Post-hotfix verification checklist. [user]
- 2026-06-14 — `personas/buyer-roles.md` — **Expanded** to full 27-role catalog from Master KB v26.2.7: added cross-module platform roles (Super User, Orgs Admin, Admin, Procurement Manager, Procurement Officer, Finance Manager, Approver, Warehouse/Receiver). Added "Roles are NOT scoped to individual workspaces" principle. Clarified Payments Manager (cannot create bills), Bills Manager (cannot process payments), Technical Evaluator (exclusive to RFP), Sourcing Manager = E-Source Manager alias, Reports Manager (new). [user]
- 2026-06-14 — `modules/orders.md` — Added Performance Bond lifecycle (5 statuses: Draft/Requested/Submitted/Approved/Expired + Resubmission Requested); auto-monitoring of bond validity with configurable reminder period; flag-controlled features (PO in vendor currency, LOA, Order Tags, GL codes, custom title). [user]
- 2026-06-14 — `modules/bills.md` — **Expanded bill types**: added Advance Bill (before GRN, prepayment), Expense Bill (expense requests), Credit Note (from existing bill), Auto-generate Bills flag. Corrected Proforma Bill definition (acknowledgement, not payment trigger). Added Expense Reimbursement flow explanation. [user]
- 2026-06-14 — `modules/grn.md` — Added GRN status lifecycle (Draft → Submitted → Accepted/Rejected). Added key concepts: Negative GRNs (product returns, flag-controlled), GRN Bulk Upload (Excel, flag-controlled), Edit GRN (allowed until bill raised, flag-controlled), Show supplier info on print (flag-controlled). [user]
- 2026-06-14 — `modules/admin-workflows.md` — Expanded configurable workflow object types to all 6 (Requests, Sourcings, Received Offers, Awards, Orders, Bills). Added Sequential vs Parallel Approval options, Can Add Next Level, Default Workflow concept. Added no-match bypass risk (no routing condition + no default = objects bypass approval). Added Workflows Master Toggle critical risk section. [user]
- 2026-06-14 — `modules/requests.md` — Added all 6 request types table (Standard, RFP, RFC/MFA, Expense, Reimbursement, Direct Award). Added critical clarification: Direct Award is NOT a bypass of financial controls — only bypasses competitive bidding; all financial controls (approval, budget, PO, GRN, payment) still apply. [user]
- 2026-06-14 — `modules/e-sourcing.md` — Added Public Tender as sourcing event type. Added open bid vs sealed bid distinction. Added RFC/MFA Work Order Flow (ongoing orders against framework without new sourcing). Added EOI + NDA silent blocking warning section. [user]
- 2026-06-14 — `variants/ewcf.md` — **Major expansion**: added SAP PR sync (§5), budget enforcement flags mandatory for EWCF sprints (§6), 5-level approval chain with SAR thresholds (>500K triggers 5 levels; >1M CFO; >3M Board; §7), Performance Bonds at 10% of contract value (§8). [user]
- 2026-06-14 — `modules/finance-budgets.md` — Added precise budget formula symbols (T/B/S/A/LB + ΣA/ΣB/ΣS). Added Payment Summary Metrics (Paid/Due/Outstanding/Total). Added Budget Creation Wizard fields. Added Budget Lock (red padlock icon per entity). Added Budgets Master Toggle critical risk section. [user]
- 2026-06-14 — `modules/admin-users-roles.md` — Added Vendor Bank Information critical rule (must always have "Require Approval for Bank Information updates" ON in production — fraud risk). Added Vendor Performance Tracking metrics (Overall Time, Delivery Time, Response Time). Added Auto-registration as 4th onboarding method. [user]
- 2026-06-14 — `variants/nhc.md` — Added Workspace Abbreviation in PO IDs (§9, e.g. NHC-FIN-0001, flag ON for NHC). Added Public Tenders must never be enabled on NHC (§10). [user]
- 2026-06-14 — `glossary.md` — Added: Action Board, Advance Bill, Expense Bill, Expense Request, Open Bid, Three-Way Matching, Work Order (general — not RCMC-specific). Updated: MFA entry (now Master Framework Agreement with Work Order flow). Updated: Performance Bond (10% general, 5% RCMC; 5-stage lifecycle). Updated: Sealed Bid (added "no supplier knows what competitors quoted" distinction). Updated: EOI (added NDA silent block warning). Added Work Order (general) alongside existing Work Order PR (RCMC). [user]

---

## 2026-06-06

### Updates from RCMC BRD R4 and Penny KB (user-provided documents)

- 2026-06-06 — `variants/rcmc.md` — **Major rewrite**: added RCMC PR types with SAR value thresholds, 6-point justification form, 4-committee structure (Pre-Qual/Bid Opening/Tech Eval/Commercial Eval), technical evaluator privacy in sealed bids, pre-qualification two stages, post-award letter timing Phase 1 vs Phase 2, bid bonds, performance bonds, RCMC contract types, Project vs Department workspace types, SAP/P+/SignIt integration specifics, Phase 2 feature list. [user]
- 2026-06-06 — `glossary.md` — **Corrected** Change Request definition (was "vendor data change request", now correctly "contract/order amendment creating new version"). Added: Bid Bond, Performance Bond, Tender Plan, Direct Award PR, Work Order PR, 6-Point Justification Form. Updated: Direct Award entry with RCMC sub-types. Updated: Workspace entry with RCMC Project vs Department types. [user]
- 2026-06-06 — `modules/contracts.md` — Added RCMC contract types, expanded Change Request section with 25% cap rule, 75% committee voting threshold, Finance-cannot-reject rule, SAP sync only on PO submission, cancellation rules, contract eligibility by deliverables not expiry. [user]
- 2026-06-06 — `modules/contracts.md` — Expanded Performance Bond section with 5-stage request lifecycle, blocking rule, status states, fixed/% auto-calculation, expiry monitoring, system location. [user]
- 2026-06-06 — `modules/contracts.md` — Added MFA Work Orders detailed rules: ONE parent MFA from RFC, spend cap formula, workspace validation, single-agreement-per-WO rule, date locking after first agreement. [user]
- 2026-06-06 — `modules/finance-budgets.md` — Added Post Allocated Budget (PAB) reallocation section: offer blocked when exceeds PR budget, E-Source Manager requests reallocation, original approval chain including Finance, three outcomes. [user]
- 2026-06-06 — `modules/requests.md` — Added Watchers section: PR-level observers notified on approvals/returns/rejections; workspace-scoped selection. [user]
- 2026-06-06 — `cross-cutting/approval-routing.md` — Added workspace scoping rule: approver not in the PR's workspace is automatically skipped. [user]

---

## 2026-05-31

### Updates from PennyGuard base-knowledge (2026-05-30 export)

- 2026-05-31 — `variants/sabil.md` — **New file**: Sabil variant (Arabic/RTL, SAP sync, bill-notification suppression, LCGPA flag). [user]
- 2026-05-31 — `variants/modern_mills.md` — **New file**: Modern Mills / MMC variant (three-way matching, OpenText, SAP integration). [user]
- 2026-05-31 — `variants/voltalia.md` — **New file**: Voltalia variant (conditional vendor registration, lazy-loaded portal sections). [user]
- 2026-05-31 — `variants/variant-matrix.md` — Added Sabil, Modern Mills, Voltalia rows and routing hints. [user]
- 2026-05-31 — `modules/e-sourcing.md` — Added Bid Opening Committee "cannot do" list, event-level scope rules, and common failure modes. [user]
- 2026-05-31 — `glossary.md` — Added module/term aliases routing table (UOO, BOC, PAB, RFx, etc.) and 7-step permission decision rule. [user]
- 2026-05-31 — `personas/role-permissions-matrix.md` — Added role scope model table (own/assigned workspace/assigned event/all workspaces/workflow assigned) and detailed profiles with can-do/cannot-do/common-blockers for 15+ roles. [user]
- 2026-05-31 — `modules/e-sourcing.md` — Added sealed bid confidentiality scope (exports/emails/API/notifications, not just UI); added Technical Evaluator and E-Source Manager "cannot do" limits. [user]
- 2026-05-31 — `modules/admin-workflows.md` — Added 4-layer flag-off completeness rule (UI, API, background jobs, notifications). [user]
- 2026-05-31 — `cross-cutting/approval-routing.md` — Added segregation-of-duties rule (self-approval blocked) and common approval blockers troubleshooting table. [user]
- 2026-05-31 — `modules/orders.md`, `bills.md`, `payments.md`, `grn.md`, `contracts.md` — Added "High-risk regression areas" section to each module. [user]

---

## 2026-05-14

### Updates from Penny_Feature_Reference.docx (KT Session March 2026) + penny_features_roles.docx (April 2026 bug tracker analysis)

**Corrections:**

- 2026-05-14 — `glossary.md` — **Corrected RFC acronym**: "Request for Catalogue" → "Request for Contract". RFC = Request for Contract, another name for MFA. Prior label was wrong. **Verified by user.** [user]
- 2026-05-14 — `modules/e-sourcing.md` — Corrected RFC row in sourcing event types table (Catalogue → Contract). [user]
- 2026-05-14 — `personas/buyer-roles.md` — Clarified E-Source Manager role: it encompasses the decision-maker, commercial evaluator, and commercial approver capabilities mentioned in KT docs. These are not separate platform roles. **Verified by user.** [user]

**New business rules added to existing files:**

- 2026-05-14 — `modules/e-sourcing.md` — Added single vs. multiple vendor selection logic (single: direct order OR RFQ; multiple: RFQ only, Submit Order hidden). [user — KT March 2026]
- 2026-05-14 — `modules/e-sourcing.md` — Added two-gate sealed bid mechanism (Gate 1: bid opener unlocks after deadline → tech eval; Gate 2: bid opener opens after tech approval → commercial eval). [user — KT March 2026]
- 2026-05-14 — `cross-cutting/scoring-and-awards.md` — Added 3 commercial scoring types (Lowest Quoted/Highest Score, Radio Selection, Manual Score). [user — KT March 2026]
- 2026-05-14 — `cross-cutting/scoring-and-awards.md` — Added evaluator visibility rules (open bid vs sealed bid; curtains-open rule after eval ends). [user — KT March 2026]
- 2026-05-14 — `cross-cutting/scoring-and-awards.md` — Added no-approver and no-evaluator behavior for technical phase. [user — KT March 2026]
- 2026-05-14 — `cross-cutting/scoring-and-awards.md` — Added: Commercial Approver is not mandatory; approved/rejected submissions can be flipped. [user — KT March 2026]
- 2026-05-14 — `modules/admin-users-roles.md` — Added organisation creation workflow (CS Admin → Org → Super Admin → feature flags → welcome email). [user — KT March 2026]
- 2026-05-14 — `modules/admin-users-roles.md` — Added vendor onboarding 4 methods (Manual Entry, Bulk Upload, Email Invite, Public Link). [user — KT March 2026]

**New files created:**

- 2026-05-14 — `modules/public-tender.md` — **CREATED**: open competitive tendering, self-registration, sealed evaluation, LOA. Status: unverified in test codebase. [product docs — April 2026]
- 2026-05-14 — `modules/ai-features.md` — **CREATED**: AI Chatbot (NL queries, request creation, role-based, deleted-record security) + AI Negotiator (per-line-item price suggestions). Status: unverified in test codebase. [product docs — April 2026]
- 2026-05-14 — `modules/integrations.md` — **CREATED**: SAP integration (Sabil), Muqawil Marketplace (expanded), Digital Signature (DocuSign/SignIt), Mobile App. [product docs — April 2026]
- 2026-05-14 — `variants/tahakom.md` — **CREATED**: Tahakom client variant — journal entries bulk upload + orders customization. Status: unverified in test codebase. [product docs — April 2026]

**Glossary additions/updates:**

- 2026-05-14 — `glossary.md` — Added: AI Chatbot, AI Negotiator, Public Tender, Savings Tracking, Tahakom. [product docs — April 2026]
- 2026-05-14 — `glossary.md` — Expanded: ProPay entry with business definition from product docs. [product docs — April 2026]
- 2026-05-14 — `glossary.md` — Expanded: Muqawil entry with broader marketplace context from product docs (code evidence still limited to sidebar label). [product docs — April 2026]

**Variant matrix updates:**

- 2026-05-14 — `variants/variant-matrix.md` — Added Tahakom to variant glance table. [product docs — April 2026]
- 2026-05-14 — `variants/variant-matrix.md` — Added rows: SAP Integration, Public Tender, AI Chatbot, AI Negotiator, Journal Entries (Tahakom). [product docs — April 2026]
- 2026-05-14 — `variants/variant-matrix.md` — Added routing hints for Tahakom, SAP, AI features, Public Tender. [product docs — April 2026]

---

## 2026-05-13

### Vestigial knowledge layer removed

- 2026-05-13 — Deleted `.claude/knowledge/` (9 files, ~5,894 lines) and the 3 superseded `.claude/agents/playwright-test-{planner,generator,healer}.md` agents. Also removed the now-empty `.claude/agents/` dir. Reason: no `penny-*` skill referenced this folder; the only consumers were the generic playwright agents which the Penny-specific skills (penny-sdet, penny-create-test, penny-review) supersede. [user]

### Slash command removed

- 2026-05-13 — Deleted `.claude/commands/penny-business-update.md` (and its empty parent dir). Reason: duplicated capture-protocol instructions that already live in `SKILL.md` section 3, creating drift risk. Capture is now done by invoking the `penny-business` skill directly (auto-trigger or explicit "capture this in penny-business" / `/penny-business`). Updated `penny-sdet/SKILL.md` and `penny-create-test/SKILL.md` to drop the slash-command reference. [user]

### Role taxonomy correction (from user-provided spreadsheet)

- 2026-05-13 — `personas/buyer-roles.md` — **REWROTE** from scratch. Replaced false "7 generic roles" model (Admin/Finance/Manager/Buyer/Receiver/Viewer/Vendor) with the **real per-module Penny role taxonomy** (Basic User, Request Manager, E-Source Viewer/User/Manager, Bid Opening Committee, Technical Evaluator, Technical Approver, Order Viewer/Manager, Catalog/Products Managers, GRN User/Manager/Super Admin, Bills Manager/Super Admin, Payments Manager/Super Admin, Vendors Manager, WS Viewer/Manager/Admin, Budget Manager/Reader, Settings Manager/Super Admin, Reports Super Admin, Workflow Viewer/Manager, Super Admin). [user-spreadsheet]
- 2026-05-13 — `personas/role-permissions-matrix.md` — **CREATED** full per-module permission matrix for every role. [user-spreadsheet]
- 2026-05-13 — `glossary.md` — Added `Basic User`, `Bid Opening Committee`, `Technical Evaluator`, `Technical Approver`, `Super Admin` entries. [user-spreadsheet]
- 2026-05-13 — `glossary.md` — **Resolved gating-committee mystery**: it's an informal name for **Bid Opening Committee** (verified Penny role). Updated entry to point to the correct term. [user-spreadsheet]
- 2026-05-13 — `modules/e-sourcing.md` — Replaced "unlock authorization unverified" with verified Bid Opening Committee, plus list of all sealed-bid roles (Technical Evaluator, Technical Approver). [user-spreadsheet]
- 2026-05-13 — `cross-cutting/approval-routing.md` — Updated example to use real Penny role names; added eligibility table for which roles can approve which entity. [user-spreadsheet]
- 2026-05-13 — `modules/admin-users-roles.md` — Replaced "7 built-in roles" summary with actual per-module role taxonomy. [user-spreadsheet]

### Earlier 2026-05-13 changes (contracts module + audit)

- 2026-05-13 — `modules/contracts.md` — Created module from code evidence: MFA = Master Frame Agreement, Letter of Award, vendor contracts; states Drafted → Active; EWCF spend cap. [code]
- 2026-05-13 — `glossary.md` — Added `Letter of Award`, `MFA Contract`. [code]
- 2026-05-13 — `glossary.md` — Corrected `RFC` entry — it relates to MFA contracts (Request for Catalogue under MFA), not generic catalog sourcing. [code]
- 2026-05-13 — `glossary.md` — Stripped unverified specifics from `Gating Committee` (term not in code anywhere) — marked `Status: unverified`. [code]
- 2026-05-13 — `glossary.md` — Corrected `PropPay` — it's an NHC **financing module**, not a payment integration. [code]
- 2026-05-13 — `glossary.md` — Corrected `Muqawil` — it's only a sidebar label for NHC supply market, not a contractor verification system. [code]
- 2026-05-13 — `glossary.md` — Stripped unverified specifics from `Zatca` (term not in test repo) — marked `Status: unverified`. [code]
- 2026-05-13 — `modules/e-sourcing.md` — Removed gating committee specifics from sealed-bid section; replaced with "authorization mechanism unverified". [code]
- 2026-05-13 — `modules/bills.md` — Softened NHC Zatca claim to "unverified". [code]
- 2026-05-13 — `modules/payments.md` — Corrected PropPay description (financing module, not payment integration). [code]
- 2026-05-13 — `modules/catalog.md` — Corrected RFC note (under MFA, not generic catalog). [code]
- 2026-05-13 — `variants/nhc.md` — Corrected PropPay (financing), Muqawil (marketplace label), Zatca (unverified). [code]
- 2026-05-13 — `variants/variant-matrix.md` — Added MFA contracts / Vendor contracts / Letter of Award rows; corrected PropPay; marked Zatca unverified. [code]
- 2026-05-13 — `SKILL.md` — Added Provenance Convention (Verified / Verified by user / Source / Status: unverified labels). [migration]
- 2026-05-13 — `SKILL.md` — Added Section 5: capturing rules discovered from code (code → SoT loop). [migration]
- 2026-05-13 — Initial seed from `.claude/qa-knowledge/` and `.claude/knowledge/business-domain/` (now deleted). All entries from this batch should be treated as `**Source:** prior QA docs (unverified)**` until re-verified. [migration]
