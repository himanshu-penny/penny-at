# Variant: Voltalia

An enterprise-like Penny client with a complex conditional vendor/supplier registration portal.

**Last updated:** 2026-05-31
**Source:** PennyGuard base-knowledge (2026-05-30). **Verified by user:** pending — treat entries below as `**Source:** product docs (unverified)**` until confirmed in code or by user.

---

## What makes Voltalia distinct

| Feature                                    | Detail                                                                                                       |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| **Conditional vendor registration fields** | Vendor registration has many conditional paths — fields appear or hide based on earlier answers in the form. |
| **Supplier portal**                        | Voltalia's supplier portal stack/components may behave differently from the standard vendor portal.          |
| **Lazy-loaded form sections**              | Some form sections load lazily; tests must wait for section load before interacting.                         |

---

## Assumed defaults (inherited from enterprise)

Unless documented otherwise, Voltalia inherits the full enterprise feature set:

- Standard RFQ / RFP / RFC / EOI
- Sealed bid + Bid Opening Committee
- GRN, Bills, Payments
- Approval workflows
- Multiple workspaces

---

## Known unknowns

The following are **unverified** for Voltalia:

- Whether SAP integration is active
- Whether digital signature (DocuSign / SignIt) is configured
- Whether Arabic/RTL is required
- Workspace limits

---

## QA focus areas

- Conditional vendor registration field visibility (show/hide logic)
- Lazy-loaded sections — explicit wait conditions required
- Cross-browser supplier portal behavior
- Supplier portal login / session handling
- Data persistence after returning to or resubmitting the registration form

---

## Cross-references

- Variant matrix: `variants/variant-matrix.md`
- Enterprise baseline: `variants/enterprise.md`
- Vendor registration context: `modules/admin-users-roles.md`
