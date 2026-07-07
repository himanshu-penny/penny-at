# Variant: Sabil

An enterprise-like Penny client with Arabic/RTL UI requirements and SAP/bill-notification-specific behavior.

**Last updated:** 2026-05-31
**Source:** PennyGuard base-knowledge (2026-05-30). **Verified by user:** pending — treat entries below as `**Source:** product docs (unverified)**` until confirmed in code or by user.

---

## What makes Sabil distinct

| Feature                                      | Detail                                                                                                                                                              |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Arabic / RTL layout**                      | Sabil requires Arabic language and RTL text alignment validation. Layout and text direction must be tested explicitly.                                              |
| **SAP integration**                          | SAP-related sync behavior appears in source material. Details of PO write-back or GRN sync scope are **unverified** — confirm with team before asserting specifics. |
| **Bill submission notification suppression** | Bill submission notifications may be suppressed for Sabil as a client-specific config. **Unverified** in test codebase.                                             |
| **LCGPA / feature flag**                     | Disabled LCGPA feature logic should not run when the flag is off. Sabil-specific; must not affect other clients.                                                    |

---

## Assumed defaults (inherited from enterprise)

Unless documented otherwise, Sabil inherits the full enterprise feature set:

- Standard RFQ / RFP / RFC / EOI
- Sealed bid + Bid Opening Committee
- GRN, Bills, Payments
- Approval workflows
- Multiple workspaces

---

## Known unknowns

The following are **unverified** for Sabil:

- Exact scope of SAP integration (PO sync, GRN sync, bill sync)
- Whether digital signature (DocuSign / SignIt) is configured
- Whether Zatca billing compliance applies
- Workspace limits

---

## QA focus areas

- RTL layout and text alignment across all screens
- SAP/bill sync and notification behavior
- GRN and bill lifecycle
- LCGPA flag-off behavior (disabled feature should be inert)
- Ensure Sabil-specific code does not affect other clients (isolation regression)

---

## Cross-references

- Variant matrix: `variants/variant-matrix.md`
- Enterprise baseline: `variants/enterprise.md`
- SAP integration context: `modules/integrations.md`
