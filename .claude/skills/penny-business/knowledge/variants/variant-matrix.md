# Variant Matrix — Feature × Variant Comparison

The headline reference for "what's different between enterprise / rcmc / ewcf / nhc". Start here when triaging variant-specific bugs or planning cross-variant tests.

**Last updated:** 2026-05-13

---

## Variants at a glance

| Variant                | One-liner                                                                                                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Enterprise**         | Full-featured P2P for large B2B organizations. Default reference.                                                                                |
| **RCMC**               | Vendor network centralization variant; unique org-conversion + change requests + signIt.                                                         |
| **EWCF**               | Custom instance for eSports World Cup Foundation; custom domain + partner portal.                                                                |
| **NHC**                | Saudi SMB marketplace variant; catalog-first, no RFQ/RFP, no budgets, mandatory Zatca.                                                           |
| **Tahakom**            | Enterprise client with journal entries (bulk upload) + orders customization. **Status: unverified in test codebase.** See `variants/tahakom.md`. |
| **Sabil**              | Enterprise client with Arabic/RTL UI, SAP sync, and bill-notification suppression. See `variants/sabil.md`.                                      |
| **Modern Mills (MMC)** | Enterprise client with three-way matching (PO↔GRN↔Bill) and OpenText/SAP integration. See `variants/modern_mills.md`.                            |
| **Voltalia**           | Enterprise client with complex conditional vendor registration portal and lazy-loaded form sections. See `variants/voltalia.md`.                 |

---

## Feature × variant matrix

| Feature                                         | Enterprise                                 | RCMC                                                  | EWCF                                       | NHC                                                              |
| ----------------------------------------------- | ------------------------------------------ | ----------------------------------------------------- | ------------------------------------------ | ---------------------------------------------------------------- | --------------------------------------- |
| **Requests (standard)**                         | ✅                                         | ✅ (commercial scoring shifts if `rcmcOrgConversion`) | ✅                                         | Sourcing Requests only                                           |
| **RFQ**                                         | ✅                                         | ✅                                                    | ✅                                         | ❌                                                               |
| **RFP w/ technical questions**                  | ✅                                         | ✅                                                    | ✅                                         | ❌                                                               |
| **EOI**                                         | ✅                                         | ✅                                                    | ✅                                         | ❌                                                               |
| **Sealed bid + gating committee**               | ✅                                         | ✅                                                    | ✅                                         | ❌                                                               |
| **Orders (from RFQ)**                           | ✅                                         | ✅                                                    | ✅                                         | ❌                                                               |
| **Orders (from catalog)**                       | ✅                                         | ✅                                                    | ✅                                         | ✅                                                               |
| **Direct orders**                               | ✅                                         | ✅                                                    | ✅                                         | ✅                                                               |
| **Bulk Purchase**                               | ❌                                         | ❌                                                    | ❌                                         | ✅                                                               |
| **GRN**                                         | ✅                                         | ✅                                                    | ✅                                         | ✅                                                               |
| **Bills (standard)**                            | ✅                                         | ✅                                                    | ✅                                         | ✅                                                               |
| **Bills (Zatca compliance)**                    | ❌                                         | ❌                                                    | ❌                                         | ⚠️ unverified — see `glossary.md#zatca`                          |
| **Payments (standard)**                         | ✅                                         | ✅                                                    | ✅                                         | ✅                                                               |
| **ProPay financing module**                     | ❌                                         | ❌                                                    | ❌                                         | ✅ (separate module, financing not payments)                     |
| **MFA contracts**                               | ✅                                         | ✅                                                    | ✅ (+ spend cap)                           | ❌                                                               |
| **Vendor contracts**                            | ✅                                         | ✅                                                    | ✅ (+ spend cap)                           | ❌                                                               |
| **Letter of Award**                             | ✅                                         | ✅                                                    | ✅                                         | ❌                                                               |
| **Budgets**                                     | ✅                                         | ✅                                                    | ✅                                         | ❌                                                               |
| **Expense accounts**                            | ✅                                         | ✅                                                    | ✅                                         | ❌                                                               |
| **Approval workflows (≤5 levels)**              | ✅                                         | ✅                                                    | ✅                                         | ✅ (simpler)                                                     |
| **Multiple workspaces**                         | ≤ 10                                       | ≤ 10                                                  | ≤ 10                                       | 1 (hard cap)                                                     |
| **Change requests**                             | ❌                                         | ✅ (unique)                                           | ❌                                         | ❌                                                               |
| **Digital signature (`draftWorkflowInSignIt`)** | ❌                                         | ✅                                                    | ❌                                         | ❌                                                               |
| **Muqawil marketplace label**                   | ❌                                         | ❌                                                    | ❌                                         | ✅ (sidebar alias for supply market — not a verification system) |
| **Catalog/marketplace primary**                 | ❌                                         | ❌                                                    | ❌                                         | ✅                                                               |
| **Multi-currency**                              | ✅                                         | ✅                                                    | ✅                                         | ❌ (SAR only)                                                    |
| **SAP integration**                             | ❌                                         | ❌                                                    | ❌                                         | ❌                                                               | Sabil-specific — not a standard variant |
| **Public Tender**                               | ⚠️ unverified                              | ⚠️ unverified                                         | ⚠️ unverified                              | ⚠️ unverified                                                    |
| **AI Chatbot**                                  | ⚠️ feature-flag                            | ⚠️ feature-flag                                       | ⚠️ feature-flag                            | ⚠️ feature-flag                                                  |
| **AI Negotiator**                               | ⚠️ feature-flag                            | ⚠️ feature-flag                                       | ⚠️ feature-flag                            | ❌                                                               |
| **Journal Entries (bulk upload)**               | ❌                                         | ❌                                                    | ❌                                         | ❌                                                               | Tahakom-specific                        |
| **Vendor portal URL**                           | per env (`vendor.{env}.penny.co` baseline) | `vendor.{env}.penny.co` (scoped)                      | `vendor.procurement.esportsfoundation.com` | per env                                                          |
| **Custom domain (buyer)**                       | per env                                    | per env                                               | `procurement.esportsfoundation.com`        | per env                                                          |

---

## Feature flags by variant

| Flag                    | Variant | Effect                                                                            |
| ----------------------- | ------- | --------------------------------------------------------------------------------- |
| `rcmcOrgConversion`     | RCMC    | Vendor invitation enabled; commercial scoring moves from request form to e-source |
| `draftWorkflowInSignIt` | RCMC    | Digital signature on contracts                                                    |
| `reSourceAfterReturn`   | EWCF    | Allows re-sourcing after a returned/rejected award                                |

---

## How to use this matrix

- A test fails on NHC but passes on enterprise → check whether NHC even has the feature (often it doesn't — NHC lacks RFQ/RFP, budgets, etc.).
- A user mentions **"change request"** → that's RCMC-only.
- A user mentions **"ProPay/PropPay"**, **"Muqawil"**, **"bulk purchase"**, **"sourcing request"** → NHC.
- A user mentions **"Zatca"** → likely NHC (Saudi e-invoicing) but **not verified in test repo** — ask the user to confirm.
- A user mentions **"MFA contract"**, **"RFC"**, **"Letter of Award"** → contracts module — enterprise/RCMC/EWCF, **not NHC**. See `modules/contracts.md`.
- A user mentions **"Tahakom"** or **"journal entries bulk upload"** → Tahakom variant. See `variants/tahakom.md`. Details are unverified — ask the user.
- A user mentions **"SAP"**, **"sync banner"**, **"PO ID"** → SAP integration (Sabil client). See `modules/integrations.md`.
- A user mentions **"AI Chatbot"**, **"AI Negotiator"** → AI features. See `modules/ai-features.md`. These are feature-flag controlled.
- A user mentions **"Sabil"**, **"Arabic"**, **"RTL"**, **"LCGPA"** → Sabil variant. See `variants/sabil.md`.
- A user mentions **"Modern Mills"**, **"MMC"**, **"OpenText"**, **"three-way match"** → Modern Mills variant. See `variants/modern_mills.md`.
- A user mentions **"Voltalia"**, **"conditional registration fields"**, **"supplier portal lazy load"** → Voltalia variant. See `variants/voltalia.md`.
- A user mentions **"Public Tender"** → see `modules/public-tender.md`. Variant availability unverified.
- A user mentions **"reSourceAfterReturn"** or `esportsfoundation.com` URL → EWCF.
- A user mentions **`rcmcOrgConversion`**, **"signIt"**, or **"change request"** → RCMC.

---

## Cross-references

- Each variant's full detail: `variants/enterprise.md`, `variants/rcmc.md`, `variants/ewcf.md`, `variants/nhc.md`
- Glossary entries for each variant: `glossary.md`
- Variant impact on P2P phases: `cross-cutting/procure-to-pay.md#variant-impact-on-p2p`
