# Variant: RCMC

**One-liner:** Variant for the Royal Commission for Makkah City and Holy Sites (RCMC) — government procurement with regulated sourcing routes, value-threshold-based PR types, multi-committee evaluation, SAP/P+/SignIt integrations, and contract change-request flows.

**Last updated:** 2026-06-06

---

## What's different from Enterprise

### 1. Org conversion (`rcmcOrgConversion` flag)

When this feature flag is enabled:

- Vendor invitation flows are altered (centralized vendor pool).
- **Commercial scoring moves out of the request form** and into the e-source phase.
- This is a UX/anchoring change, not a math change — scoring formulas remain the same. See `cross-cutting/scoring-and-awards.md`.

### 2. Change Requests (contract/order amendments)

RCMC has a dedicated **Change Request** module for **contract and order amendments** — any modification to a contract or PO initiates a change request routed through an approval workflow (Business Owner → Change Request Committee → DOA). Upon approval, Penny creates a **new version** of the contract/PO document and the change is replicated to SAP. Finance is involved to release budget for the changes. **No other variant has this.**

The change-request module is only fully configured on the `fb-242.tst` environment in current deployments.

**See also:** `glossary.md#change-request`

### 3. Digital signature on contracts (`draftWorkflowInSignIt` flag)

Contracts in RCMC can be sent through a **SignIt** digital-signature workflow before becoming binding. Enterprise/EWCF/NHC do not have this. Applies to:

- **Letter of Award** — e-signature generated within Penny, automatically distributed to vendor.
- **Contracts** — vendor e-signature workflow managed within Penny.

**High-risk areas:** JWT expiry on SignIt links, stuck signature status, resend/void/restart logic, `draftWorkflowInSignIt` flag on/off behavior. See `modules/contracts.md`.

### 4. Vendor portal URL scoping

The vendor portal uses a scoped URL: `vendor.{env}.penny.co`. (Enterprise uses the same baseline; RCMC enforces the scoped form more strictly.)

### 5. Vendor invoice list filter

The **requestor filter is disabled** on the vendor invoice list — a visibility-scope change for the vendor side.

---

## RCMC PR Types and Value Thresholds

**Verified by user:** 2026-06-06. Source: RCMC BRD R4.

RCMC classifies Purchase Requisitions into distinct types based on procurement value and method. Each type has its own approval route.

| PR Type                           | Value Threshold       | Sourcing Route                                      | Notes                                      |
| --------------------------------- | --------------------- | --------------------------------------------------- | ------------------------------------------ |
| **Public / Limited Tender — RFP** | > 1,000,000 SAR       | Full RFP with technical + commercial evaluation     | Requires Tender Plan (Phase 2)             |
| **Public / Limited Tender — RFQ** | 200,000–1,000,000 SAR | Competitive RFQ with bid opening committee          | Sealed bid; technical then commercial      |
| **Direct Award (PO/Contract)**    | > 200,000 SAR         | Single-source; 6-point justification + CEO approval | Direct Award Committee → CEO → Procurement |
| **Direct Award Fast-track**       | < 200,000 SAR         | Lightweight direct process to PO                    | Simplified approval; no justification form |
| **Work Order**                    | Any                   | Items from existing MFA/Framework Agreement         | Approval cycle is configurable             |
| **Project PR**                    | Any                   | PR tied to a specific Project Workspace             | Can be any of the above types              |

### PR creation workflow (all types)

Create PR → Add details and documents → Set up technical evaluation questionnaire and committee → Set up pre-qualification questionnaire → Add line item details → Submit for approval.

**Requester responsibilities:**

- Sets up the pre-qualification questionnaire on the PR.
- Sets up the technical evaluation questionnaire and assigns the technical evaluation committee.

### Approval cycles by PR type

**Direct Award PRs:**
Direct Award Committee → CEO approval (may or may not be required) → Procurement.

**Work Order / Limited / Public Tender PRs (sample):**
Department Head → Procurement → Budget Specialist → Budget Manager → Finance GM.

All approval cycles are fully configurable per PR type.

---

## 6-Point Justification Form (Direct Award > 200K SAR)

**Verified by user:** 2026-06-06. Source: RCMC BRD R4.

When a requester specifies a single vendor on a Direct Award PR above 200,000 SAR, they must complete a **6-point justification form** explaining the sole-source rationale. The completed form triggers routing to the CEO for approval. This form is a Phase 1 RCMC customization.

---

## RCMC Sourcing Committees

**Verified by user:** 2026-06-06. Source: RCMC BRD R4.

RCMC uses four distinct sourcing committees (compared to enterprise's single Bid Opening Committee):

| Committee                           | Responsibility                                                                                                             | Notes                                                                                                     |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| **Pre-Qualification Committee**     | Evaluates pre-qualification questionnaire responses from vendors; qualifies/disqualifies vendors before or during sourcing | Two possible stages — see Pre-Qualification section below                                                 |
| **Bid Opening Committee**           | Unlocks both technical evaluation (Gate 1) and commercial evaluation (Gate 2) for sealed bids                              | Phase 1: assigned by buyer during RFP creation; Phase 2: automated assignment                             |
| **Technical Evaluation Committee**  | Evaluates and scores vendors' technical proposals                                                                          | In sealed bids, one evaluator **cannot see** other evaluators' scores — privacy is enforced by the system |
| **Commercial Evaluation Committee** | Evaluates commercial proposals after technical gate passes; scores and qualifies vendors; finalizes the awardee            | Only technically qualified vendors' commercial proposals are visible                                      |

**Technical evaluator privacy rule:** In a sealed bid, technical evaluators cannot see the scores or evaluation of other evaluators. This is a Phase 1 RCMC customization (SN 10 in the BRD). A UI-only check is insufficient — all channels must enforce this.

---

## Pre-Qualification of Vendors (Two Stages)

**Verified by user:** 2026-06-06. Source: RCMC BRD R4.

RCMC supports pre-qualification at two distinct points in the sourcing lifecycle:

1. **Before the RFQ/RFP is floated** — Pre-qualification questionnaire is sent to vendors; responses are evaluated by the Pre-Qualification Committee. Only vendors who pass are invited to the RFP. This acts as a gate before sourcing begins.

2. **Just before awarding a supplier** — Pre-qualification questionnaire is sent to the intended awardee. If the vendor fails, a different supplier can be awarded instead.

Both stages are Phase 1 RCMC customizations.

---

## Post-Award Letters

**Verified by user:** 2026-06-06. Source: RCMC BRD R4.

After awarding:

- The **Letter of Award (LOA)** is sent to the awarded vendor.
- **Regret letters** are sent to un-selected vendors.

**Timing differs by phase:**

- **Phase 1:** Letter of regret is sent **after** the LOA has been sent to the awarded vendor.
- **Phase 2:** Regret letters are sent to unawarded vendors only when an Order/Contract has been placed for **all items** in the RFQ/RFP.

---

## Bid Bonds

**Verified by user:** 2026-06-06. Source: RCMC BRD R4.

A **Bid Bond** is a financial guarantee sometimes required from vendors as part of their bid submission for an RFQ/RFP. The buyer can request a bid bond during RFQ/RFP creation. Vendors must submit the bond as part of their bid. Phase 1 RCMC capability.

---

## Performance Bonds

**Verified by user:** 2026-06-06. Source: RCMC BRD R4.

A **Performance Bond** is typically 5% of the awarded value and is valid for the duration of the project. It can be made a **mandatory pre-requisite** for signing a contract with an awarded vendor. There is a way to request this bond before contract signing. **Phase 2** RCMC capability.

---

## RCMC Contract Types

**Verified by user:** 2026-06-06. Source: RCMC BRD R4.

RCMC supports the following contract types (beyond the standard enterprise MFA/vendor contract):

| Contract Type                       | Description                                                                                                                      |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Standard Service Agreement          | Standard contracted service                                                                                                      |
| Operations and Maintenance Contract | Ongoing O&M scope                                                                                                                |
| MFA (Multi-supplier, shared cap)    | Multiple suppliers for a given set of items with individual prices but a **shared value cap** across all suppliers — **Phase 2** |
| Construction Contract               | Construction project scope                                                                                                       |
| Addendum                            | Amendment/addendum to an existing contract                                                                                       |

The MFA with a shared cap (multiple suppliers, shared consumption limit) is a **Phase 2** RCMC feature; Phase 1 supports individual contracts per supplier only.

---

## RCMC Workspace Types

**Verified by user:** 2026-06-06. Source: RCMC BRD R4.

RCMC uses two workspace categories:

1. **Project Workspaces** — Each workspace represents a P+ project. Two setup options:
   - **With P+ Integration**: Budget details pulled automatically from P+ on Project Charter approval. Orders and COCs created in Penny replicate to P+.
   - **Without P+ Integration (Manual)**: Workspace created manually to represent P+ projects when Masterworks API is unavailable.

2. **Department Workspaces** — Each workspace represents a department with its own users, approval workflows, and optional budget.

---

## RCMC System Integrations

**Verified by user:** 2026-06-06. Source: RCMC BRD R4.

### SAP (Yaseer) Integration

| Direction   | Trigger                        | Data                                                        |
| ----------- | ------------------------------ | ----------------------------------------------------------- |
| Penny → SAP | Penny PR approved              | PR replicated to SAP                                        |
| SAP → Penny | Finance approval step in Penny | Budget data pulled from SAP for line-item budget validation |
| Penny → SAP | PO approved in Penny           | PO replicated to SAP                                        |
| Penny → SAP | COC created in Penny           | Certificate of Completion replicated to SAP                 |
| Penny → SAP | Change request approved        | New contract/PO version reflected in SAP                    |

### P+ (Masterworks) Integration

| Direction  | Trigger                        | Data                                                     |
| ---------- | ------------------------------ | -------------------------------------------------------- |
| P+ → Penny | Project Charter approved in P+ | Workspace and budget created in Penny (with integration) |
| Penny → P+ | PO created in Penny            | PO replicated to P+                                      |
| Penny → P+ | COC created in Penny           | Certificate of Completion replicated to P+               |

### SignIt Integration

- LOA e-signature: generated within Penny, automatically sent to vendor via SignIt.
- Contract e-signature: vendor e-signature workflow managed within Penny via SignIt.

All integrations are contingent on API credential availability from RCMC.

---

## RCMC Phase 2 Features (not in Phase 1)

**Verified by user:** 2026-06-06. Source: RCMC BRD R4.

| Feature                                 | Notes                                                                                            |
| --------------------------------------- | ------------------------------------------------------------------------------------------------ |
| MFA with shared cap (multi-supplier)    | Multiple suppliers under one framework with shared consumption limit                             |
| Performance Bonds                       | 5% of awarded value; mandatory pre-requisite to signing                                          |
| Contract Information in Product Catalog | Shows whether a product has an active contract from one or more vendors                          |
| Contract Expiry Alerts                  | Per-contract notification period configuration for all vendors in an MFA                         |
| Request for Contract type               | A contract request as a PR type                                                                  |
| Vendor emails on contract creation      | System emails to vendors during contract creation                                                |
| Change Requests on contracts/orders     | Contract/order amendments with approval trail (the module exists but full automation is Phase 2) |
| Pre-defined Committees                  | Setting predefined committees for tech/commercial evaluation and automating assignment           |
| Tender Plan                             | Ability to prepare and execute a tender plan                                                     |
| Exceptions handling                     | Non-availability of budget and other exceptions                                                  |
| SLA tracking / Approval Reminders       | Visibility on all tasks pending approval, faster approvals                                       |
| Comparing first and last offer          | Visibility on initial vs. final offer during comparison                                          |
| Request for Information (RFI)           | Ability to send out an RFI                                                                       |

---

## What's the same as Enterprise

- Full RFQ + RFP + EOI + sealed bid + bid opening committee.
- All three order creation methods.
- GRN, bills, payments standard.
- Budgets and expense accounts.
- Workspaces (up to 10).
- Approval workflows up to 5 levels.

---

## Personas unique to RCMC

No new persona types beyond enterprise — RCMC uses the standard 7 roles (Admin, Finance, Manager, Buyer, Receiver, Viewer, Vendor). The differences are in workflow configuration and the change-request module's role assignments.

---

## Cross-references

- Variant matrix: `variants/variant-matrix.md`
- Glossary: RCMC, Change Request, Bid Bond, Performance Bond, Direct Award, Work Order
- Scoring shift detail: `cross-cutting/scoring-and-awards.md`
- E-sourcing module: `modules/e-sourcing.md`
- Contracts module: `modules/contracts.md`
- Requests module: `modules/requests.md`
