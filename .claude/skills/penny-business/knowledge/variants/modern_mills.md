# Variant: Modern Mills (MMC)

An enterprise-like Penny client with three-way matching focus and OpenText/SAP integration.

**Last updated:** 2026-05-31
**Source:** PennyGuard base-knowledge (2026-05-30). **Verified by user:** pending — treat entries below as `**Source:** product docs (unverified)**` until confirmed in code or by user.

---

## What makes Modern Mills distinct

| Feature                          | Detail                                                                                                                        |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Three-way matching**           | PO ↔ GRN ↔ Bill matching is a confirmed focus. Over-billing or under-receipt mismatches are key test scenarios.               |
| **OpenText vendor registration** | OpenText integration for vendor registration and sync appears in source material. Details **unverified** — confirm with team. |
| **SAP PO write-back**            | SAP PO integration/reference handling may apply where configured. **Unverified** — confirm scope.                             |

---

## Assumed defaults (inherited from enterprise)

Unless documented otherwise, Modern Mills inherits the full enterprise feature set:

- Standard RFQ / RFP / RFC / EOI
- Sealed bid + Bid Opening Committee
- GRN, Bills, Payments
- Approval workflows
- Multiple workspaces

---

## Known unknowns

The following are **unverified** for Modern Mills:

- Whether digital signature (DocuSign / SignIt) is configured
- Whether Zatca billing compliance applies
- Full scope of OpenText integration (registration only vs. ongoing sync)
- Workspace limits

---

## QA focus areas

- PO → GRN → Bill three-way matching
- Over-billing / under-receipt mismatch handling
- OpenText vendor registration and sync
- SAP/external reference handling
- Client-isolated integration changes (no leakage to other clients)

---

## Cross-references

- Variant matrix: `variants/variant-matrix.md`
- Enterprise baseline: `variants/enterprise.md`
- Integration context: `modules/integrations.md`
- Bills module: `modules/bills.md`
