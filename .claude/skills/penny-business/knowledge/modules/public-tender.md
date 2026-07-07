# Module: Public Tender

Open competitive tendering mechanism for public procurement.

**Last updated:** 2026-05-14
**Source:** penny_features_roles.docx — April 2026 (bug tracker analysis). Status: unverified in test codebase.

---

## Purpose

Allows buyers to publish open tenders that any qualifying vendor can participate in, rather than inviting specific vendors directly. Used in public sector or regulated procurement where broad competition is required.

---

## Key capabilities

- Publish open tenders visible to any registered (or self-registered) vendor.
- Vendor self-registration for participation — vendors register interest directly from the tender listing.
- Sealed submission and evaluation — offers are locked until the bid-opening deadline.
- Award and Letter of Award (LOA) issuance after evaluation.

---

## How it differs from RFQ / RFP

| Dimension         | RFQ / RFP                        | Public Tender                         |
| ----------------- | -------------------------------- | ------------------------------------- |
| Vendor invitation | Buyer selects specific vendors   | Open to any vendor who self-registers |
| Visibility        | Invited vendors only             | Public listing                        |
| Submission        | Deadline-based                   | Deadline-based (sealed)               |
| Evaluation        | Buyer-driven (price / technical) | Formal evaluation with committee      |
| Award             | Award Recommendation → Order     | LOA issued to winning vendor          |

---

## Roles

| Role                            | What they do                                                      |
| ------------------------------- | ----------------------------------------------------------------- |
| **Procurement Manager / Admin** | Create and manage public tenders; configure evaluation; issue LOA |
| **Vendor**                      | Register interest; submit tender response                         |
| **Evaluator / Approver**        | Score and approve tender outcomes                                 |

---

## Variant notes

**Status: unverified** — the features_roles.docx lists Public Tender as a platform capability. It is not currently observed in the automated test codebase. Confirm with the team which variants support Public Tender before writing tests.

---

## Cross-references

- Letter of Award: `modules/contracts.md`
- Sealed bid mechanism: `modules/e-sourcing.md#sealed-bid`
- Scoring: `cross-cutting/scoring-and-awards.md`
