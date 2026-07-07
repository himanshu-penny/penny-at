# Module: Users, Roles & Workspaces

Identity, access control, and organizational structure.

**Last updated:** 2026-06-14

---

## Purpose

To define who can do what, scoped to which parts of the organization.

---

## Organisation creation (onboarding a new customer)

**Verified by user: 2026-05-14 — KT Session March 2026.**

Performed by the **Customer Support (CS) Admin** when a new customer subscribes. Buyers log in at `app.penny.co`; organisations are always created as **Buyer type**.

Steps in order:

1. CS Admin logs in → creates the Organisation (Buyer type). The system **auto-generates an org code**.
2. CS Admin creates the **Super Admin user** — this is the mandatory first user.
3. CS Admin configures **feature flags** (e.g., Investment Request, AI features, DocuSign).
4. A welcome email is sent → Super Admin sets their own password.

Configuration can be edited any time by searching for the org by name or code.

---

## Vendor onboarding methods

**Verified by user: 2026-05-14 — KT Session March 2026. Expanded: 2026-06-14 — Source: Platform Reference Documentation v26.2.7.**

| Method                              | Description                                                                                    | Notes                                                     |
| ----------------------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| **Manual Entry**                    | Fill in vendor details directly in the UI                                                      | One-off or small vendor additions                         |
| **Bulk Upload**                     | Download CSV template → fill → upload                                                          | Large initial vendor populations                          |
| **Email Invite**                    | Vendor receives a registration link; self-registers; buyer approves                            | Vendor does not appear in the system until buyer approval |
| **Public Link / Auto-registration** | Vendor discovers the organisation through Penny's vendor directory and registers independently | Buyer approval required before vendor appears             |

## Vendor Bank Information — Critical Rule

**Verified by user:** 2026-06-14. Source: Feature Flag Bible v26.2.7.

The **"Require Approval for Bank Information updates"** flag **must always be ON in production**. If this flag is disabled, vendor bank account changes (IBAN, account number, SWIFT/BIC) go live **immediately without any approval** — creating a direct fraud risk vector where payments could be redirected to a fraudulent account.

Bank information fields that require approval when the flag is ON:

- IBAN / account number
- SWIFT/BIC code
- Bank name and address

Any change to vendor bank details must pass through an approval workflow before taking effect.

## Vendor Performance Tracking

**Verified by user:** 2026-06-14. Source: Platform Reference Documentation v26.2.7.

Penny automatically calculates and tracks vendor performance metrics from historical transaction data:

- **Overall Time**: average time from PO to delivery
- **Delivery Time**: average lead time from PO acceptance to GRN
- **Response Time**: average time from RFQ invitation to offer submission

These metrics are visible on vendor profiles and in the Reports module.

---

## Users

A user has:

- Identity: name, email, phone.
- Role assignments (one or more — permissions are additive).
- Workspace assignments (users see data only from their assigned workspaces).
- Optional MFA, optional delegate assignment.

**Lifecycle:** `Create → Assign roles → Assign workspaces → Activate → Active`. Deactivation is non-destructive (audit preserved).

---

## Roles

**Verified by user:** 2026-05-13. Penny uses **fine-grained per-module roles**, not a small handful of generic roles. The full catalogue lives in `personas/buyer-roles.md`; the per-module permission detail lives in `personas/role-permissions-matrix.md`. Summary here:

| Module / area | Role tiers (low → high)                                                                                                        |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Cross-cutting | Basic User → Super Admin                                                                                                       |
| Requests      | Basic User → Request Manager → Super Admin                                                                                     |
| E-Source      | E-Source Viewer → User → Manager → Super Admin (+ specialized: Bid Opening Committee, Technical Evaluator, Technical Approver) |
| Orders        | Order Viewer → Order Manager → Super Admin                                                                                     |
| Catalog       | Products Manager / Catalog Manager → Super Admin                                                                               |
| GRN           | GRN User → GRN Manager → GRN Super Admin                                                                                       |
| Bills         | Bills Manager → Bills Super Admin                                                                                              |
| Payments      | Payments Manager → Payments Super Admin                                                                                        |
| Vendors       | Vendors Manager                                                                                                                |
| Workspaces    | WS Viewer → WS Manager → WS Admin → Super Admin                                                                                |
| Budgets       | Budget Reader → Budget Manager → Super Admin (+ Workspace Manager can request budget; Expense Accounts Admin)                  |
| Settings      | Settings Manager → Settings Super Admin                                                                                        |
| Reports       | Reports Super Admin → Super Admin                                                                                              |
| Workflows     | Workflow Viewer → Workflow Manager                                                                                             |

Roles are **additive** — a user can hold multiple roles and gets the union of permissions.

**Separation of duties** is enforced where it matters: a requester cannot approve their own request.

**Scope:** most roles default to _assigned workspace(s)_; Super Admin variants expand to _all workspaces_.

---

## Workspaces

A workspace is a logical division of the organization — department, location, cost center, or project.

**Characteristics:**

- Hierarchical (parent → child) allowed.
- Each workspace has its own budget (enterprise), users, and optionally its own approval workflow.
- Data is isolated across workspaces: a user only sees data from workspaces they are assigned to.

**Workspace limits per variant:**

- Enterprise: up to **10** workspaces.
- NHC: **1** workspace (hard limit).
- RCMC / EWCF: enterprise-like.

**Creation flow:** 7-step wizard — basic info, parent, users, approval workflow, categories, budget, review.

---

## Categories

Four classification axes for reporting and filtering:

1. **Item Categories** — products (IT, Office, Furniture, etc.). Hierarchical.
2. **Request Categories** — CAPEX, OPEX, services, goods.
3. **Vendor Categories** — vendor types. NHC uses these to match vendors to sourcing requests.
4. **Workspace Categories** — revenue center, cost center, support function.

---

## Business rules

1. A user must have at least one role.
2. A user must be assigned to at least one workspace (exceptions: Admin and Viewer can be all-workspace).
3. Permissions are additive across roles.
4. Workspace data isolation is enforced at the data layer, not just UI.
5. A user cannot approve their own submitted entities.

---

## Variant deviations

- **NHC**: 1 workspace max. See `variants/nhc.md`.
- **RCMC**: vendor invitation flows are altered when `rcmcOrgConversion` is enabled. See `variants/rcmc.md`.

---

## Cross-references

- Glossary: Workspace, Buyer, Vendor
- Personas: `personas/buyer-roles.md`, `personas/vendor-roles.md`
- Approval workflows: `modules/admin-workflows.md` and `cross-cutting/approval-routing.md`
