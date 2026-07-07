# Variant: Tahakom

A Penny enterprise client with specific customizations around financial journaling and order management.

**Last updated:** 2026-05-14
**Source:** penny_features_roles.docx — April 2026 (bug tracker analysis). **Status: unverified in automated test codebase** — no Tahakom-specific test files or page objects observed. All entries here should be treated as `**Source:** product docs (unverified)**` until verified in code or by user.

---

## What makes Tahakom distinct

| Feature                           | Detail                                                                                                                                                          |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Journal Entries (bulk upload)** | Tahakom requires bulk upload of journal entries for financial recording. This is a finance/accounting integration feature not present in base enterprise.       |
| **Orders customization**          | Tahakom has custom order-level configurations beyond the standard enterprise setup. Specifics **unverified** — confirm with the team before asserting behavior. |

---

## Assumed defaults (inherited from enterprise)

Unless documented otherwise, Tahakom inherits the full enterprise feature set:

- Standard RFQ / RFP / RFC / EOI
- Sealed bid + Bid Opening Committee
- MFA contracts / Vendor contracts / Letter of Award
- Budgets + expense accounts
- Approval workflows (up to 5 levels)
- Multiple workspaces
- GRN, Bills, Payments

---

## Known unknowns

The following are **unverified** for Tahakom — do not assert without user confirmation:

- Whether SAP integration is active for Tahakom
- Whether digital signature (DocuSign / SignIt) is configured
- Exact scope of "orders customization"
- Workspace limits
- Whether ProPay / Public Tender is available

---

## Cross-references

- Variant matrix: `variants/variant-matrix.md`
- Enterprise baseline: `variants/enterprise.md`
- Client-specific config context: `modules/integrations.md`
