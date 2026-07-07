# Feature Flags & Configuration

How Penny's feature flags work, the complete HIGH RISK register, QA testing protocol, and per-tenant configuration reference.

**Last updated:** 2026-06-14
**Verified by user:** 2026-06-14. Source: Feature Flag & Configuration Bible v26.2.7 (internal document).

---

## 1. The Two-Tier Configuration System

Penny uses two independent configuration layers. Toggling the wrong layer can have unintended platform-wide effects.

| Layer                        | Path                                                         | Scope                                       | Who Can Change                       |
| ---------------------------- | ------------------------------------------------------------ | ------------------------------------------- | ------------------------------------ |
| **Security Configuration**   | Settings → Configurations → General Configuration → Security | Org-wide: all users, all sessions           | Admin, Super Admin                   |
| **Module Configurations**    | Settings → Configurations → Module Configurations → [Module] | Org-wide: applies identically to every user | Admin, Settings Manager, Super Admin |
| **Workspace Configurations** | Workspace → [Workspace Name] → Configurations tab            | Per-workspace only                          | Admin, Workspace Manager             |

---

## 2. How to Change a Flag (Step by Step)

1. Navigate to Settings (⚙ icon in the left sidebar).
2. Click the **Configurations** tab.
3. Select **General Configuration** (for Security flags) or **Module Configurations** (for all other flags).
4. In Module Configurations: select the module name from the left sidebar panel.
5. Locate the flag row. Click the toggle switch to change its state.
6. Click **SAVE** at the bottom of the section. Changes take effect **immediately** — no restart required.

⚠ Flag changes are **immediate and org-wide**. There is no preview mode, no staging toggle, and no undo button. Always coordinate with the QA team and client before changing any flag in a production environment.

---

## 3. Module Master Toggle Behavior

Every module has a **Master Toggle** as its first flag. When a Module Master Toggle is turned **OFF**:

- The module's sidebar item **disappears for all non-admin users**.
- All module-specific workflows and flags become **dormant**.
- Any **in-flight procurement objects** in that module become **inaccessible**.
- **Admin and Super Admin** roles retain access regardless.

Each master toggle also exposes a **display name customisation control** (↻ rename icon). This allows each org to relabel modules to match their internal terminology — e.g. "Requests" → "Purchase Requisitions" — without any functional change.

---

## 4. Total Flag Count by Module (v26.2.7 — 107 flags)

| Module / Area          | Flag Count |
| ---------------------- | ---------- |
| Security Configuration | 8          |
| Requests               | 25         |
| E-Source               | 18         |
| Orders                 | 13         |
| GRN                    | 3          |
| Bills                  | 10         |
| Payments               | 4          |
| Product & Catalogues   | 3          |
| Workspace              | 4          |
| Workflows              | 1          |
| Vendors                | 9          |
| Settings               | 6          |
| Reports                | 1          |
| Budgets                | 1          |
| Expense Accounts       | 1          |
| **TOTAL**              | **107**    |

---

## 5. HIGH RISK Flag Register

These flags must be tested in **every sprint regression cycle**. A failed test on any HIGH RISK flag is a **sprint blocker**.

| Flag                                                                 | Module    | Risk & Why                                                                                                                                  |
| -------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Show budget / Show budget to approver / Show budget to requestor** | Requests  | Budget visibility and blocking controls financial governance. Errors allow overspend or incorrectly block valid PRs.                        |
| **Can source from request**                                          | Requests  | Bypasses approval workflow entirely. If toggled ON unexpectedly, unapproved PRs go directly to sourcing — procurement governance breach.    |
| **Process as direct award**                                          | Requests  | Emergency procurement bypass. Should only be ON where contractually agreed with client. Unexpected activation is a governance risk.         |
| **Approval before sending RFQs**                                     | E-Source  | If disabled, RFQs go to vendors without internal review. Compliance and audit risk.                                                         |
| **Multi Acceptance**                                                 | E-Source  | Changes award logic fundamentally — allows split award across multiple vendors.                                                             |
| **Enforce Payment Plan**                                             | E-Source  | Enabling mid-active-RFQ silently blocks in-progress vendor submissions.                                                                     |
| **NDA mandatory for EOI**                                            | E-Source  | If enabled without an NDA document configured, **ALL EOI expressions are silently blocked** with no visible error to vendors. See §6 below. |
| **Allow Public Tenders**                                             | E-Source  | Exposes sourcing to unvetted vendors. Must never be ON for RCMC or NHC.                                                                     |
| **Direct order**                                                     | Orders    | Allows PO creation without E-Source/RFQ. Bypasses competitive sourcing and audit trails.                                                    |
| **Disable Printing of Purchase Orders**                              | Orders    | Accidentally enabling removes all PO print/PDF capability for all users.                                                                    |
| **Multi-Factor Authentication (MFA)**                                | Security  | Enabling without user preparation causes immediate platform-wide lockout on next login.                                                     |
| **Do not allow combining bills to single payment**                   | Payments  | Switching mid-cycle changes payment behaviour for all in-flight bills.                                                                      |
| **Require Approval for Bank Information updates**                    | Vendors   | Must **always be ON in production** — disabling lets bank account changes go live immediately, creating direct fraud risk.                  |
| **Module: Workflows (Master Toggle)**                                | Workflows | If turned OFF, ALL approval workflows stop org-wide immediately — complete governance bypass across every module.                           |
| **Module: Budgets (Master Toggle)**                                  | Budgets   | If turned OFF, ALL budget enforcement checks stop — requestors can raise PRs of unlimited value with no financial guardrails.               |

---

## 6. Key Flag Interactions & Dependencies

### NDA mandatory for EOI — Silent Blocking Risk

⚠ If "NDA mandatory for EOI" is turned ON and **no NDA document is configured** in the system, every vendor who attempts to express interest will be **silently blocked**. The system does not display an informative error message — vendors simply cannot proceed. Always verify that an NDA document is uploaded in E-Source settings **before** enabling this flag.

### Show budget → depends on Budgets module

The `Show budget`, `Show budget to approver`, and `Show budget to requestor` flags in Requests become **dormant** when the Budgets Master Toggle is OFF. All three flags require the Budgets module to be enabled to have any effect.

### Workflows Master Toggle — Full Governance Bypass

If the Workflows master toggle is turned OFF, **ALL approval workflows stop running immediately** across every module. All procurement objects (PRs, RFQs, POs, Bills) will be **auto-processed on submission without any human approval**. This is effectively a full governance bypass and must never be turned off on production.

### Login Attempts Numeric Field

The "Number of Login Attempts" field only enforces when the "Login Attempts" toggle is ON. Configuring the number without enabling the toggle has no effect.

### Auto Password Expiry Numeric Field

"Password Expiry Time (Days)" only enforces when the "Auto Password Expiry" toggle is ON.

---

## 7. Security Configuration Flags (8 flags)

Path: Settings → Configurations → General Configuration → Security

| Flag                                          | Behaviour                                                                                                                                  |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Login Attempts (toggle)                       | When ON: account locked after configured consecutive failed logins. Default: 3 attempts.                                                   |
| Number of Login Attempts                      | Paired numeric field — only enforced when toggle above is ON.                                                                              |
| Auto Password Expiry (toggle)                 | When ON: users forced to reset password after configured days.                                                                             |
| Password Expiry Time (Days)                   | Paired numeric — default 300 days. Only enforced when toggle above is ON.                                                                  |
| Concurrent Sessions                           | When ON: user can be logged in from multiple browsers/devices simultaneously. When OFF: new login invalidates all existing sessions.       |
| Multi-Factor Authentication (MFA) ⚠ HIGH RISK | When ON: ALL users must complete OTP via authenticator app on every login. Enabling without user preparation causes platform-wide lockout. |
| Web Session Expiry                            | Dropdown: 1 hr / 4 hrs / 1 day / 7 days / 30 days. Default: 7 days.                                                                        |
| Mobile Session Expiry                         | Same options as Web Session Expiry. Default: 7 days.                                                                                       |

---

## 8. Key Module Flag Summaries

### Requests (25 flags) — highest-impact flags

| Flag                                               | Behaviour                                                                                                                                                 |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Module: Requests (Master Toggle)                   | Enables/disables entire Requests module.                                                                                                                  |
| Can source from request ⚠ HIGH RISK                | E-Source users can initiate sourcing during request creation, bypassing standard approval workflow. Only applies when no approver workflow is configured. |
| Show budget ⚠ HIGH RISK                            | Requestor sees available budget and receives blocking error if total exceeds budget. Requires Budgets module ON.                                          |
| Show budget to approver                            | Approvers can see remaining budget balance in the approval view.                                                                                          |
| Show budget to requestor                           | Requestors see budget balance (visibility-only; "Show budget" flag controls the blocking error).                                                          |
| Enable Alternate Product by default                | Alternate Product option pre-checked for every new line item.                                                                                             |
| Mandatory Brand field                              | Vendors must enter Brand name for each product line item.                                                                                                 |
| Mandatory Country of Origin field                  | Vendors must enter Country of Origin for each product line item.                                                                                          |
| Make SKU mandatory during non-catalog item entry   | Requestors must enter SKU for non-catalog items.                                                                                                          |
| Allow Expense Request                              | Requestors can create Expense Request type and generate expense bill.                                                                                     |
| Allow Request Classification                       | Requestors can assign classification tag to requests.                                                                                                     |
| Allow Request for Contract (RFC)                   | Enables RFC/Contract type in E-Source.                                                                                                                    |
| Process as direct award ⚠ HIGH RISK                | Users can raise emergency direct award, bypassing competitive sourcing. Mandatory justification required.                                                 |
| Min. Technical Evaluators for an RFP               | Minimum number of technical evaluators must be assigned when creating an RFP.                                                                             |
| Min. Commercial Evaluators for an RFP              | Minimum number of commercial evaluators must be assigned.                                                                                                 |
| Product Line Item Order History Visibility         | When ON: all users see order history on line items. When OFF: restricted to approvers and request managers.                                               |
| Allow Fulfilling request line items from Inventory | During approval, approvers can fulfil line items from existing inventory stock.                                                                           |

### E-Source (18 flags) — highest-impact flags

| Flag                                     | Behaviour                                                                                                                |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Module: E-Source (Master Toggle)         | Enables/disables entire E-Source module.                                                                                 |
| Allow editing of RFQ                     | Buyers can edit RFQ details after it has been sent to vendors.                                                           |
| Allow update offer offline               | Buyers can update a vendor's offline offer on the comparison screen.                                                     |
| Multi Acceptance ⚠ HIGH RISK             | Buyers can accept offers from multiple vendors for different line items (split award).                                   |
| Enforce Payment Plan ⚠ HIGH RISK         | Vendors cannot submit without completing all Payment Plan fields.                                                        |
| Approval before sending RFQs ⚠ HIGH RISK | RFQs must pass internal approval before vendors receive them.                                                            |
| Expression of Interest (EOI)             | Buyers can invite vendors to express interest before submitting a full offer.                                            |
| NDA mandatory for EOI ⚠ HIGH RISK        | Vendors must accept NDA before expressing interest. If no NDA document configured, ALL EOI expressions silently blocked. |
| Allow Public Tenders ⚠ HIGH RISK         | Buyers can create public tender events open to any registered vendor.                                                    |
| Send email auto-reminder                 | System auto-sends daily reminders to vendors who have not yet submitted an offer.                                        |
| Share vendor enquiry with other vendors  | A vendor's Q&A enquiry and the buyer's response are shared with all other invited vendors.                               |

### Orders (13 flags) — highest-impact flags

| Flag                                              | Behaviour                                                                                                     |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Module: Orders (Master Toggle)                    | Enables/disables entire Orders module.                                                                        |
| Direct order ⚠ HIGH RISK                          | Users can create a PO directly without going through E-Source/RFQ.                                            |
| Allow Purchase Order in vendor currency           | Buyers can issue PO in the vendor's quoted currency rather than workspace default (SAR).                      |
| Disable Printing of Purchase Orders ⚠ HIGH RISK   | When ON: NO user can print or download any PO PDF.                                                            |
| Allow Letter of Award                             | Order manager can issue a formal Letter of Award (LOA) before issuing the full PO or contract.                |
| Allow Adding Chart Of Accounts                    | Buyers can assign Chart of Accounts (GL) codes to individual order line items.                                |
| Use Workspace Abbreviation and Workspace Order ID | PO IDs use workspace abbreviation + serial number (e.g. FIN-0001). Enabled on NHC; disabled on test.penny.co. |

### GRN (3 flags)

| Flag                                     | Behaviour                                                                          |
| ---------------------------------------- | ---------------------------------------------------------------------------------- |
| Module: GRN (Master Toggle)              | Enables/disables GRN module. When OFF: bills cannot be created.                    |
| Edit GRN                                 | Users can edit a GRN after creation as long as no bill has been raised against it. |
| Show supplier information while printing | Vendor name, address, and contact details appear on GRN print/PDF.                 |

### Bills (10 flags)

| Flag                             | Behaviour                                                                       |
| -------------------------------- | ------------------------------------------------------------------------------- |
| Module: Bills (Master Toggle)    | Enables/disables entire Bills module. When OFF: payments cannot follow.         |
| Allow creation of advance bill   | Users can create a bill before a GRN exists — for prepayment/advance scenarios. |
| Allow creation of proforma bills | Users can create a proforma bill once order is submitted/accepted by vendor.    |
| Allow creation of expense bill   | Users can create an expense bill with items for vendor review.                  |
| Allow uploading of invoice       | Users can upload an invoice file against the bill.                              |
| Allow Invoice Print              | Vendor can print invoice from their portal.                                     |
| Payment Admin Can Reject Bill    | Payment Admin role can reject an already-submitted bill.                        |
| Do not show attachments warning  | Suppresses "No Attachments" warning when bill submitted without attachment.     |
| Show Order Summary               | Order Summary panel displayed on Bill detail page.                              |
| Show Payment Plan                | Payment Plan section displayed on Bill detail page.                             |

### Payments (4 flags)

| Flag                                                       | Behaviour                                                                                                        |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Module: Payments (Master Toggle)                           | Enables/disables entire Payments module.                                                                         |
| Mandatory attachments                                      | Payment proof attachment must be uploaded when processing a payment.                                             |
| Optional bank account selection                            | Selecting a bank account is optional — payment can be submitted without one.                                     |
| Do not allow combining bills to single payment ⚠ HIGH RISK | Each bill must be paid as a separate transaction. Switching mid-cycle changes behaviour for all in-flight bills. |

### Vendors (9 flags)

| Flag                                                      | Behaviour                                                                                                                                                  |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Module: Vendors (Master Toggle)                           | Enables/disables Vendors sidebar item.                                                                                                                     |
| Allow organisation to create Vendors                      | Org can create and manage vendor records internally.                                                                                                       |
| Allow organisation to create contracts                    | Org can create contracts with vendors.                                                                                                                     |
| Validate Vendor address                                   | Address validation rules applied during vendor registration and editing.                                                                                   |
| Allow Additional Taxes                                    | Additional tax types can be configured per vendor beyond workspace default.                                                                                |
| Make Tax Certification Number Mandatory                   | All vendors must have a Tax Certification Number — registration blocked without it.                                                                        |
| Enable vendor feedback                                    | Feedback questions available per module (GRN, Award, etc.) to rate vendors. Ratings on vendor profiles and reports.                                        |
| CR Owner Type in Vendor Registration form                 | Commercial Registration Owner Type field included in vendor registration form.                                                                             |
| Require Approval for Bank Information updates ⚠ HIGH RISK | Any change to vendor bank account details must pass approval workflow before taking effect. **Must always be ON in production — direct fraud prevention.** |

### Workflows (1 flag)

| Flag                                          | Behaviour                                                                                                                                                                                    |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Module: Workflows (Master Toggle) ⚠ HIGH RISK | If turned OFF: ALL approval workflows stop running immediately across every module. All procurement objects auto-processed on submission without human approval. Complete governance bypass. |

### Budgets (1 flag)

| Flag                                        | Behaviour                                                                                                                                                                             |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Module: Budgets (Master Toggle) ⚠ HIGH RISK | If turned OFF: ALL budget checks stop everywhere. Show budget / Show budget to approver / Show budget to requestor flags become dormant. Requestors can raise PRs of unlimited value. |

### Settings (6 flags)

| Flag                                             | Behaviour                                                                                                                                  |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Module: Settings (Master Toggle)                 | Hides the Settings sidebar item for non-admin users.                                                                                       |
| Enable Feedback                                  | Feedback functionality enabled across all modules. When OFF: all feedback forms and flows hidden platform-wide.                            |
| Disable selecting weekend days on calendar input | Weekend days greyed out and unselectable in all date pickers. Configure based on client's working week (Sun–Thu orgs should have this ON). |
| Send email auto-reminder                         | System sends daily email auto-reminders to approvers with pending items.                                                                   |
| Disable Address Lookup                           | Automatic address autocomplete disabled — users must enter addresses manually.                                                             |

---

## 9. QA Testing Protocol for Feature Flags

Every feature flag represents a testable binary condition. Every flag must be verified in **both ON and OFF states**.

1. **Document the current state** of all flags before testing begins — use this document as the baseline for the reference org.
2. **Toggle the flag to ON** → verify: the feature appears in the UI, is accessible to the correct roles, functions end-to-end, and does not break adjacent features.
3. **Toggle the flag to OFF** → verify: the feature is hidden, blocked, or restricted exactly as described. Verify no error messages or broken states appear.
4. **Test cross-flag dependencies**: flags that depend on other modules or flags being in a specific state must be tested in both dependency-met and dependency-missing states.
5. **Restore all flags** to their documented baseline state after testing is complete.
6. **Log any deviations** from expected behaviour as a Bug with the feature flag state documented in the bug report.

**4-layer flag-off completeness rule (Verified by user: 2026-05-31):** When a feature flag is turned OFF, all four layers must be inert:

- **UI**: entry points (buttons, menu items, forms) hidden or disabled
- **API**: unauthorized actions blocked — flag-off is not UI-only
- **Background jobs / algorithms**: must not run; disabled feature logic must be fully guarded
- **Notifications**: must not fire for the disabled feature

A UI-only check when testing flag-off is insufficient.

---

## 10. Client Tenant Flag Configurations

### RCMC

| Flag / Feature                                | State / Behaviour                                                                                                       |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Direct award                                  | ON — emergency sole-source procurement permitted. Must be tested in RCMC regression each sprint.                        |
| Allow Request for Contract (RFC)              | ON — framework agreements active. Test both RFQ and RFC sourcing paths.                                                 |
| Show budget / Show budget to approver         | ON — budget allocated from SAP at PR level. Over-budget offers blocked until Post Budget Reallocation flow is approved. |
| Approval before sending RFQs                  | ON — all RFQs require internal approval before vendors receive them.                                                    |
| Require Approval for Bank Information updates | ON — financial governance requirement.                                                                                  |
| Process Order Externally (Workspace flag)     | POs processed through SAP rather than standard Penny flow.                                                              |

### EWCF

| Flag / Feature                                | State / Behaviour                                                          |
| --------------------------------------------- | -------------------------------------------------------------------------- |
| Show budget                                   | ON — budget enforcement active. Mandatory test every EWCF sprint.          |
| Show budget to approver                       | ON — approvers see budget balance in approval view.                        |
| SAP PR Sync                                   | ON — purchase requests sync to SAP on approval. Test sync in every sprint. |
| Approval before sending RFQs                  | ON — governance requirement.                                               |
| Require Approval for Bank Information updates | ON — financial governance.                                                 |

### Snoonu & Sabil

| Flag / Feature                                | State / Testing Note                                                                                             |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| MFA                                           | Confirm state before automation — unexpected MFA toggle breaks all auth test flows. Check before every test run. |
| Require Approval for Bank Information updates | ON — must always be ON.                                                                                          |
| IBAN validation (Sabil)                       | ON — Sabil requires strict IBAN format validation on vendor bank info. Test IBAN field specifically.             |

### NHC

| Flag / Feature                                    | State / Behaviour                                                                                                 |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Use Workspace Abbreviation and Workspace Order ID | ON — PO IDs use workspace abbreviation + serial (e.g. NHC-FIN-0001). Verify PO ID format in every NHC regression. |
| Allow Public Tenders                              | Must **never** be enabled — NHC has strict vendor vetting requirements.                                           |
| Approval before sending RFQs                      | ON — governance requirement.                                                                                      |

---

## 11. Post-Hotfix Flag Verification Checklist

After any production hotfix, verify that these flags are **unchanged**:

- Require Approval for Bank Information updates — must be ON
- Module: Workflows (Master Toggle) — must be ON
- Module: Budgets (Master Toggle) — must be ON (where applicable)
- Multi-Factor Authentication — confirm expected state with client before checking
- Show budget / Show budget to approver — per-client configuration
- Approval before sending RFQs — per-client configuration

---

## Cross-references

- Glossary: Feature Flag, Module Master Toggle
- Admin/configuration: `modules/admin-users-roles.md`
- Approval workflow flags: `modules/admin-workflows.md`
- Budget flags: `modules/finance-budgets.md`
- Variant-specific configurations: `variants/rcmc.md`, `variants/ewcf.md`, `variants/nhc.md`
