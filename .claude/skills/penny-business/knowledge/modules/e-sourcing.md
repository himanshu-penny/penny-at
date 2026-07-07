# Module: E-Sourcing (RFQ / RFP / EOI / Sealed Bid)

Competitive sourcing — the buyer invites multiple vendors to submit offers, compares them, and awards one or more winners.

**Last updated:** 2026-06-14

---

## Purpose

To drive better pricing, terms, and supplier choice through controlled competition. Created from an approved request (or, in some variants, directly).

---

## Sourcing event types

| Type                                 | Focus                | When to use                                                                                                                                    |
| ------------------------------------ | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **RFQ** (Request for Quotation)      | Price                | Standard goods/services with known specs                                                                                                       |
| **RFP** (Request for Proposal)       | Technical + Price    | Complex purchases needing technical evaluation                                                                                                 |
| **EOI** (Expression of Interest)     | Vendor qualification | Pre-qualify a vendor pool before a future RFQ/RFP                                                                                              |
| **RFC** (Request for Contract / MFA) | Framework agreements | Source goods/services under a Master Framework Agreement. Triggers MFA contract creation after award instead of a direct purchase order.       |
| **Public Tender**                    | Open competition     | Open tender visible to any registered vendor (not just invited). Requires "Allow Public Tenders" flag. Used for government/public procurement. |

**Sealed bid** is a _mode_ layered onto RFQ or RFP — see below.

**Open bid vs sealed bid distinction (Verified by user: 2026-06-14):**

- **Open bid**: supplier quotes visible to the buyer in real time as they arrive. Competitive pressure is transparent.
- **Sealed bid**: all quotes are hidden until the deadline — no supplier knows what competitors quoted. Prevents collusion. Required for high-value deals, government tenders, and sensitive contracts. After the deadline, the Bid Opening Committee unlocks the bids.

## RFC/MFA — Work Order Flow

**Verified by user:** 2026-06-14. Source: Platform Reference Documentation v26.2.7.

After an RFC sourcing event results in a signed Master Framework Agreement (MFA), ongoing orders are raised as **Work Orders** against the contract — without running a new sourcing event:

1. An RFC sourcing event is created and vendors are invited.
2. One or more vendors are awarded under the framework contract.
3. Contract documents are signed (DocuSign/Signit) and stored.
4. For ongoing needs, the operations team raises a **Work Order** linked to the existing framework contract.
5. No new sourcing required — pricing is already locked in the contract.
6. PO is issued directly from the contract. GRN confirms service/delivery completion. Bill and payment follow.
7. Budget Spent counter tracks cumulative contract spend.

This reduces sourcing time from 2+ weeks per event to less than 1 day per work order (for repeat procurement under an active framework).

## EOI + NDA Dependency Warning

⚠ **IMPORTANT** (Verified by user: 2026-06-14. Source: Feature Flag Bible v26.2.7):

If the "NDA mandatory for EOI" flag is turned **ON** and there is **no NDA document configured** in the system, every vendor who attempts to express interest will be **silently blocked**. The system does not display an informative error message — vendors simply cannot proceed past the EOI step. Always verify that an NDA document is uploaded in E-Source settings **before** enabling this flag.

---

## Lifecycle

`Draft → Published → Receiving Offers → Evaluating → Awarded → Closed`

Terminal off-path: `Cancelled`.

For the canonical state-transition table see `cross-cutting/state-transitions.md`.

---

## RFP-specific concepts

- **Technical questions** — a weighted questionnaire of capability/spec questions. Each question has a weight; weights must sum to 100% within the technical block.
- **Technical evaluation** — scorers or a committee rate vendor answers.
- **Commercial scoring** — price-based evaluation, weighted against technical.
- **Final score** — `(technical score × technical weight) + (commercial score × commercial weight)`. Common split: 70% technical / 30% commercial (configurable).
- See `cross-cutting/scoring-and-awards.md` for full formulas.

---

## Sealed bid

**Verified:** dedicated tests exist (`tests/shared/saas-modules/requests/sealed-bid.ts`, `rfp-sealed-bid.ts`, `rfp-sealed-bid-unlock-technical-evaluation.ts`).

A mode where vendor offers are **locked** on submission and not visible to the buyer until an explicit **unlock** event. After unlock, offers become visible and scoring begins. For sealed technical evaluation specifically, technical scoring is intended to complete before commercial offers become visible.

Used when impartiality must be demonstrable (regulated procurement, high-value RFP).

**Confidentiality scope (Verified by user: 2026-05-31):** Commercial data must not appear in **any** of the following before the relevant gate is unlocked: comparison tables, summaries, exports, emails, notifications, direct URLs, or API responses. A UI-only check is insufficient — all channels must be validated.

**Unlock authorization (verified by user, 2026-05-13):** the **Bid Opening Committee** is the role that can unlock a sealed-bid RFx. Members are assigned to the specific RFx and can view + perform the unlock action. (Prior project notes called this a "gating committee" — that's an informal name for the same thing.) See `personas/buyer-roles.md#bid-opening-committee` and `glossary.md#bid-opening-committee`.

**Two-gate mechanism — Verified by user: 2026-05-14 (KT Session March 2026):**

Sealed bids use a strict two-stage gating process:

| Gate       | Trigger                                                               | Effect                                                                                          |
| ---------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| **Gate 1** | Bid opener unlocks the RFP after the bid deadline                     | Technical evaluation begins. Only Technical Evaluators/Approvers can see technical information. |
| **Gate 2** | Bid opener opens the second gate after Technical Approval is complete | Commercial evaluation begins. Both technical and commercial information become visible.         |

The Bid Opening Committee is responsible for both gates. **A Technical Approver must be present for sealed bids** to provide a clear trigger for Gate 2 — without them, there is no defined end to the technical phase.

**Roles involved in sealed-bid evaluation:**

- **Bid Opening Committee** — authorizes both Gate 1 and Gate 2 unlocks.
- **Bid Opening Committee** — authorizes both Gate 1 and Gate 2 unlocks. Event-level authority; does not gain full E-Source Manager permissions automatically.
- **Technical Evaluator** — performs the technical evaluation after Gate 1 unlock. **Cannot unlock sealed bid gates** unless also assigned to Bid Opening Committee. **Cannot approve technical stage** unless also assigned as Technical Approver.
- **Technical Approver** — approves or rejects the technical evaluation; their approval triggers Gate 2 eligibility. Cannot perform commercial approval unless separately assigned.
- **E-Source Manager** — owns the event lifecycle (create, edit, accept offers, modify committees); can see all evaluator scores at any time. **Does not automatically gain sealed-bid unlock authority** — committee assignment on the specific event is still required.

**Bid Opening Committee — scope and limits (Verified by user: 2026-05-31):**

What the Bid Opening Committee **can** do:

- Unlock sealed-bid stages where configured and assigned to the specific event.
- Perform authorized bid-opening actions after the deadline.
- Allow technical/commercial stage visibility based on the configured gate sequence.

What the Bid Opening Committee **cannot** do:

- Does **not** automatically gain full E-Source Manager permissions.
- Cannot bypass workflow/policy constraints outside their assigned event scope.
- Cannot score technical or commercial evaluations unless they are also separately assigned to those evaluator roles.

**Scope and gating prerequisites:**

- The committee role must be mapped to the specific event — it is event-level authority, not workspace-wide.
- Unlock availability depends on configured close/open logic and gate state.
- Some client configurations allow auto-open behavior when no committee path is configured.

**Common failure modes:**

- Role assigned but user not mapped to the specific event or workspace.
- Unlock attempted before the policy deadline has passed.
- Stage appears locked because a prior stage approval is still pending.

---

## Single vs. multiple vendor selection

**Verified by user:** 2026-05-14 — from KT Session March 2026.

The number of vendors selected at the start of sourcing changes which actions are available:

| Vendor count         | Available actions                                                                                                      |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Single vendor**    | (1) Create an Order directly — skips the RFQ entirely. (2) Send an RFQ — normal sourcing flow. Both options presented. |
| **Multiple vendors** | Send RFQ only. The "Submit Order" button is hidden — direct order is not available when multiple vendors are involved. |

---

## Vendor offer rules

- All line items must be priced.
- Offers must be submitted before the deadline; late submissions can be allowed by configuration.
- After submission, offers cannot be edited unless the buyer requests a revision (negotiation).
- Vendor cannot see other vendors' offers.

---

## Negotiation and revision

The buyer can request a revised offer from any vendor. Vendor submits a new offer; the original is preserved in audit. See **Negotiation** and **Revision** in `glossary.md`.

---

## Award rules

- At least one offer must be selected to award.
- For RFQ: lowest qualified price typically wins; can award higher with justification.
- **Split award**: can award multiple vendors with partitioned quantities. Total awarded quantity ≤ original event quantity.
- Award creates (or readies the creation of) one or more orders.
- Awarded events cannot be cancelled.

---

## Minimum vendor requirements

- Competitive RFQ/RFP: ≥ 2 vendors invited.
- Direct sourcing (single vendor, with justification): 1 vendor — see **Direct Award** in `glossary.md`.

---

## Deadlines

- Response deadline must be in the future. Minimum typically 24 hours, configurable.
- Deadline can be extended before expiry. After expiry, late submissions optional per configuration.

---

## Variant deviations

- **NHC**: no RFQ/RFP. Uses **Sourcing Requests** — category-based, manual products. See `variants/nhc.md`.
- **RCMC** with `rcmcOrgConversion`: commercial scoring is anchored to the e-source phase, not the request form. See `variants/rcmc.md`.
- **EWCF**: `reSourceAfterReturn` flag enables re-sourcing after a returned/rejected award (bug fix). See `variants/ewcf.md`.

---

## Cross-references

- Glossary: RFP, RFQ, EOI, RFC, Sealed Bid, Open Bid, Gating Committee, Negotiation, Revision, Award, Offer, MFA Contract, Letter of Award, Public Tender
- **Contracts (when request type is CONTRACT_REQUEST):** `modules/contracts.md`
- Scoring formulas: `cross-cutting/scoring-and-awards.md`
- Approval routing for offers/awards: `cross-cutting/approval-routing.md`
- State transitions: `cross-cutting/state-transitions.md`
- Vendor perspective: `modules/vendor-rfq-response.md`
- Feature flags: `cross-cutting/feature-flags.md` — E-Source module flags
