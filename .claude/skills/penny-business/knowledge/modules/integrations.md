# Module: Integrations & Mobile

Third-party system integrations and the mobile application.

**Last updated:** 2026-05-14
**Source:** penny_features_roles.docx — April 2026 (bug tracker analysis). Muqawil also partially verified in codebase (sidebar label only — see note). Digital Signature verified for RCMC (SignIt) and EWCF (DocuSign) in codebase.

---

## SAP Integration (Sabil)

Bi-directional sync between Penny and SAP ERP for the **Sabil** client.

### Key capabilities

| Direction   | What syncs                    |
| ----------- | ----------------------------- |
| SAP → Penny | Purchase Requisitions (PR)    |
| Penny → SAP | Purchase Order (PO) approvals |
| Penny ↔ SAP | GRN status, Bills             |

- **SAP PO ID retrieval** — Penny displays the SAP-assigned PO ID once sync completes.
- **Sync banner statuses:** `Pending` / `Success` / `Error` — shown inline on orders and bills.
- **Duplicate sync prevention** — the integration guards against re-syncing the same record.

### Roles

| Role                      | Access                                                 |
| ------------------------- | ------------------------------------------------------ |
| **Buyer / Order Manager** | Initiate and monitor SAP sync; view sync status banner |
| **Finance Officer**       | View SAP-synced bills and POs                          |
| **Admin**                 | Configure SAP integration; manage sync settings        |

### Notes

- SAP integration is **Sabil-specific** — not available on other variants unless configured.
- **Status: unverified in automated test suite** — no SAP-specific test files observed.

---

## Muqawil Marketplace

Integration with the Muqawil contractor marketplace for sourcing and vendor discovery.

### What is Muqawil

**Partially verified:** in the NHC codebase, Muqawil appears as a **sidebar label** for the supply market (`/SupplyPro Market|Muqawil Marketplace/`). No dedicated contractor verification flow or page object exists in the test repo.

Per the April 2026 product docs, Muqawil is a broader marketplace platform offering:

- Contractor search and discovery
- Vendor Registration Form (VRF) sourced from Muqawil listings
- Sourcing event creation from marketplace results
- **SCA (Saudi Contractors Authority)** integration for contractor qualification

### Roles

| Role                                | Access                                       |
| ----------------------------------- | -------------------------------------------- |
| **Buyer / Procurement Manager**     | Search and invite marketplace contractors    |
| **Marketplace Vendor / Contractor** | Maintain listing; respond to sourcing events |
| **Admin**                           | Configure marketplace integration and access |

### Notes

- Primarily associated with NHC variant but may be broader — **confirm before asserting**.
- Treat any Muqawil business logic beyond the sidebar label as **Status: unverified** until verified in code or by user.

---

## Digital Signature (DocuSign / SignIt)

E-signature workflows for contracts, allowing parties to sign digitally via email links.

### Verified integrations

| Integration  | Variant | Flag                                 |
| ------------ | ------- | ------------------------------------ |
| **SignIt**   | RCMC    | `draftWorkflowInSignIt` feature flag |
| **DocuSign** | EWCF    | Feature flag (name unverified)       |

### Key capabilities

- Send contracts for signature via email link.
- Multi-signatory support — multiple parties can sign in sequence.
- Signer receives an email with the contract amount summary.
- Signature status tracking (pending / signed / declined).
- Pending signature email reminders.

### Roles

| Role                         | Access                                                   |
| ---------------------------- | -------------------------------------------------------- |
| **Buyer / Contract Manager** | Initiate signature request; track signing status         |
| **Vendor / Signatory**       | Receive signature request email; sign contract digitally |
| **Admin**                    | Configure DocuSign / SignIt integration settings         |

---

## Mobile Application (iOS / Android)

Core procurement capabilities optimized for mobile screens.

**Last updated:** 2026-05-14
**Source:** penny_features_roles.docx — April 2026. Status: unverified in automated test suite (no mobile-specific test files observed).

### Key capabilities

- Purchase request creation and submission.
- Approval actions: approve / return / reject.
- AI Chatbot access (see `modules/ai-features.md`).
- Push notifications.
- Order viewing and management.
- CTA actions work without chat overlay obstruction.

### Notes

- Role-based access mirrors the web platform — same permissions, mobile-optimized UI.
- All standard buyer-side roles apply.

---

## Cross-references

- SAP sync affects: `modules/orders.md`, `modules/grn.md`, `modules/bills.md`
- Digital Signature: `modules/contracts.md`
- Muqawil in NHC context: `variants/nhc.md`
- RCMC SignIt: `variants/rcmc.md`
- EWCF DocuSign: `variants/ewcf.md`
- AI Chatbot (mobile): `modules/ai-features.md`
