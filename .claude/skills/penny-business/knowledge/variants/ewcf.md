# Variant: EWCF (eSports World Cup Foundation)

**One-liner:** Custom Penny instance for the eSports World Cup Foundation, with a fully branded domain and a few targeted bug-fix flags.

**Last updated:** 2026-06-14

---

## What's different from Enterprise

### 1. Custom domains

- **Buyer portal:** `https://procurement.esportsfoundation.com`
- **Vendor portal:** `https://vendor.procurement.esportsfoundation.com`
- **API:** `https://api.procurement.esportsfoundation.com`

These are fully branded — no `penny.co` reference in the URL the user sees.

### 2. `reSourceAfterReturn` flag

Enables re-sourcing after a returned/rejected award. Without this flag, an awarded event that gets returned cannot be re-sourced; with it enabled, the buyer can re-open and re-source the event. Bug fix originally introduced for EWCF use cases.

### 3. Offer remarks visibility fix

Minor UX fix: offer remarks made visible where they previously were not.

### 4. Technical tab lock icon

UI indicator on the e-source technical tab to clarify sealed-bid lock state. Functional behavior unchanged from enterprise; just better UX.

### 5. SAP PR Sync

**Verified by user:** 2026-06-14. Source: Feature Flag Bible v26.2.7.

EWCF has **active SAP PR sync** — purchase requests sync to SAP on approval. SAP sync must be tested in every EWCF sprint regression.

### 6. Budget enforcement flags (mandatory for EWCF sprints)

**Verified by user:** 2026-06-14. Source: Feature Flag Bible v26.2.7.

The following flags are **ON** for EWCF and must be tested in every sprint regression:

| Flag                                          | State | Testing note                                                                      |
| --------------------------------------------- | ----- | --------------------------------------------------------------------------------- |
| Show budget                                   | ON    | Budget enforcement active — mandatory test every EWCF sprint                      |
| Show budget to approver                       | ON    | Approvers see budget balance in approval view                                     |
| Approval before sending RFQs                  | ON    | Governance requirement — RFQs must pass internal approval before reaching vendors |
| Require Approval for Bank Information updates | ON    | Financial governance requirement                                                  |

### 7. Multi-level approval chain for high-value procurement

**Verified by user:** 2026-06-14. Source: Business Context Document v26.2.7 (EWCF scenario).

For purchases **above SAR 500,000**, EWCF triggers a 5-level approval chain. Each level has a defined role and SLA:

| Level | Approver                 | Review Focus                                       | SLA      |
| ----- | ------------------------ | -------------------------------------------------- | -------- |
| 1     | Department Head          | Technical justification, scope accuracy            | 24 hours |
| 2     | Procurement Manager      | Vendor selection rationale, RFQ process compliance | 24 hours |
| 3     | Finance Controller       | Budget allocation, SAP fund program selection      | 48 hours |
| 4     | CFO                      | High-value sign-off (threshold: >SAR 1,000,000)    | 48 hours |
| 5     | Board Approval Committee | Final authorisation (threshold: >SAR 3,000,000)    | 72 hours |

This is configured via Workflow Routing conditions using amount thresholds.

### 8. Performance Bonds

**Verified by user:** 2026-06-14. Source: Business Context Document v26.2.7.

EWCF requires Performance Bonds on high-value contracts (illustrated at 10% of contract value). The bond must be submitted before delivery begins. The system monitors bond validity and sends automatic reminders before expiry. See `modules/orders.md` for the Performance Bond lifecycle.

### 9. Test coverage scope

In automation, EWCF has minimal dedicated test coverage — most workflows use the shared test suite that runs against EWCF via the `@ewcf` tag.

---

## What's the same as Enterprise

Everything else: full P2P, e-sourcing, budgets, expense accounts, workspaces (≤ 10), multi-currency, approval workflows. The variant is essentially enterprise with custom branding, SAP sync, and a handful of targeted flags.

---

## Personas

Standard role model. No EWCF-specific personas beyond enterprise.

---

## Cross-references

- Variant matrix: `variants/variant-matrix.md`
- Glossary: EWCF
- Memory file for URLs: `reference_ewcf_urls.md` (in user memory, not in this knowledge folder)
