# Cross-Cutting: Scoring & Awards

How offers are evaluated, scored, and selected as winners in e-sourcing events.

**Last updated:** 2026-05-13

---

## Where this applies

Primarily to **RFP** (Request for Proposal) which has technical + commercial scoring. RFQs are typically commercial-only (lowest qualified price wins). EOI is qualification-only — no award.

For the broader e-sourcing context, see `modules/e-sourcing.md`.

---

## RFQ scoring (commercial-only)

- Each vendor submits a per-line-item price.
- Lowest qualified price wins by default.
- Buyer can award higher prices with justification (audit trail).
- **Split award** allowed: divide quantities across multiple winners. Total awarded quantity ≤ original event quantity.

---

## RFP scoring (technical + commercial)

### Technical scoring

- The RFP includes a **technical questionnaire** — a set of weighted questions.
- Weights within the technical block sum to 100%.
- Scorers (individuals or a committee) rate each vendor's answers per question.
- Technical score per vendor = `sum(question rating × question weight)`.
- A **technical pass threshold** may be required — vendors below the threshold are eliminated before commercial scoring opens.

### Commercial scoring

**Three scoring types — Verified by user: 2026-05-14 (KT Session March 2026):**

| Type                              | How it works                                                                                     |
| --------------------------------- | ------------------------------------------------------------------------------------------------ |
| **Lowest Quoted / Highest Score** | Auto-scored based on vendor pricing. Lowest price = highest score; others scaled proportionally. |
| **Radio Selection**               | Auto-scored to zero if the vendor's option is not selected by the buyer.                         |
| **Manual Score**                  | Evaluators enter a score, remarks, and can attach supporting files.                              |

### Final score

```
Final score = (Technical score × Technical weight)
            + (Commercial score × Commercial weight)
```

- Technical weight + Commercial weight = 100%.
- **Common split:** 70% technical / 30% commercial.
- Configurable per RFP.

### Evaluator visibility rules

**Verified by user: 2026-05-14 (KT Session March 2026):**

| Context                                                              | What evaluators can see                                                                                  |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Open bid — during evaluation**                                     | Any evaluator can see other evaluators' scores at any time.                                              |
| **Sealed bid — during evaluation**                                   | Evaluators **cannot** see each other's scores while evaluation is in progress (technical or commercial). |
| **E-Source Manager**                                                 | Can always see all evaluator scores regardless of bid type.                                              |
| **After evaluation ends** (offer accepted or submitted for approval) | All scores become visible to all parties — evaluators stop scoring. This is the "curtains open" rule.    |

### Technical evaluation — no approver / no evaluator behavior

**Verified by user: 2026-05-14 (KT Session March 2026):**

- **No Technical Approver assigned:** technical evaluation runs in **parallel** with commercial evaluation and stops automatically when an offer is accepted.
- **No Technical Evaluator assigned at all:** the technical phase does not appear in the UI.
- **Sealed bid:** a Technical Approver **must** be assigned — this provides the definitive end-of-technical-phase trigger needed to open Gate 2. (Enforcement is a planned enhancement — see note below.)

### Commercial Approver — not mandatory

Unlike the Technical Approver (required for sealed bids), a **Commercial Approver is optional**. If none is configured, commercial evaluation continues until an offer is accepted.

### Approval actions within evaluation

- An approver can approve or reject individual vendor submissions.
- An **approved** submission can subsequently be **rejected**.
- A **rejected** submission can subsequently be **re-approved**.
- Visual tick/cross indicators on the comparison table show current approval status (enhancement in progress as of March 2026).

### Sealed technical evaluation

For sealed bid RFPs:

1. Both technical and commercial offers are locked on submission.
2. After Gate 1 unlock (Bid Opening Committee), **technical scoring must complete before commercial offers become visible** (Gate 2 not yet open).
3. After Technical Approver approves, the Bid Opening Committee opens Gate 2 — commercial evaluation begins.
4. This two-gate structure prevents commercial bias during technical evaluation.

See `glossary.md#sealed-bid`, `modules/e-sourcing.md#sealed-bid`, and the two-gate mechanism documented there.

---

## Award rules

1. **At least one offer must be selected** to award the event.
2. **Single award**: one vendor takes the full event.
3. **Split award**: multiple vendors share the event with quantity partitioning.
4. **Awarded events cannot be cancelled** — proceed to order creation or formal closure.
5. **Non-winning vendors must be notified** (sent automatically).

---

## Award approval

In some configurations, awarding itself goes through an approval workflow before the order is created. This is configurable per organization.

- Variant note: a placeholder for award approval exists in workflow config UI but is **not currently configured** in any variant. Award currently happens directly after evaluation.

See `modules/admin-workflows.md`.

---

## Negotiation impact

Negotiation rounds can change a vendor's offer:

- Buyer requests revision with comments.
- Vendor submits revised offer.
- Original offer preserved in audit; revised offer becomes the active offer for scoring.
- Negotiation can repeat (multiple rounds, "final and best offer").

See `glossary.md#negotiation`.

---

## Variant deviations

- **RCMC** with `rcmcOrgConversion`: commercial scoring is **anchored to the e-source phase** rather than the request form. Functionally same scoring math; just different UX location.
- **NHC**: no RFQ/RFP scoring — sourcing requests are matched to vendors by category, not bid.
- **EWCF**: `reSourceAfterReturn` allows re-sourcing after a returned award (bug fix).

---

## Cross-references

- Glossary: RFP, RFQ, EOI, Award, Negotiation, Revision, Sealed Bid, Gating Committee, Technical Questions, Commercial Scoring
- E-sourcing module: `modules/e-sourcing.md`
- Vendor side: `modules/vendor-rfq-response.md`
- Approval routing for award (where applicable): `cross-cutting/approval-routing.md`
