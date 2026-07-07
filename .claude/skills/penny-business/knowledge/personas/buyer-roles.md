# Personas: Buyer-Side Roles

The real Penny role taxonomy. Penny uses **fine-grained per-module roles**, not a small handful of generic roles. Most modules have at least a Viewer / User / Manager / Super Admin tier; some have specialized committee roles.

**Last updated:** 2026-06-14
**Verified by user:** 2026-05-13 — captured from `Penny User Roles - Master .xlsx` provided by the user.
**Expanded:** 2026-06-14 — added missing roles from Platform Reference Documentation v26.2.7 (27-role catalog).

For vendor-side roles, see `personas/vendor-roles.md`.
For the per-module permission matrix, see `personas/role-permissions-matrix.md`.

---

## Core principles

1. **Roles are per-module and per-scope.** Most permissions are gated by _what you can do_ (view/create/edit/approve/delete) × _whose data_ (own / assigned workspace / any workspace).
2. **Permissions are additive.** A user can hold multiple roles; they get the union. There is no conflict resolution — the most permissive permission always applies.
3. **Workspace isolation is enforced.** Most roles default to "assigned workspaces only"; Super Admin variants expand to all workspaces.
4. **Roles are NOT scoped to individual workspaces; they apply org-wide.** A user cannot have different roles in different departments — their role follows them to every workspace they are assigned to.
5. **Super Admin** is the top-tier god-role across modules. Assigned by Penny Support only; cannot be modified by org-level Admins.

---

## Role catalogue

**Verified by user:** 2026-06-14. Source: Platform Reference Documentation v26.2.7 (27-role master catalog).

### Cross-module / platform-level roles

| Role            | What they do                                                                                                           | Notes                                                                       |
| --------------- | ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| **Super Admin** | Full CRUD on all data, settings, users, configs. Access to admin org.                                                  | Assigned by Penny Support only; cannot be modified by other admins.         |
| **Super User**  | Full CRUD on all procurement data. View all settings. Cannot change system configs or manage users.                    | Org-level administrator; below Super Admin.                                 |
| **Orgs Admin**  | Manage organisations, tenants, workspaces. View all.                                                                   | Admin org access only.                                                      |
| **Admin**       | Full CRUD on org data, Settings, Users & Roles, Configurations. Cannot access super-admin panel.                       | Default highest buyer role within an org.                                   |
| **Basic User**  | Default starter role. Can create and approve their own requests; can access products and catalogs they're assigned to. | Most restricted buyer role. Also called "Requester" in simplified contexts. |

### Cross-module procurement roles (added v26.2.7)

**Verified by user:** 2026-06-14. Source: Platform Reference Documentation v26.2.7.

| Role                    | What they do                                                                                     | Notes                                                                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| **Procurement Manager** | Create/Edit/Approve PRs; create/manage RFQs; issue POs; create GRNs. View all procurement data.  | Primary sourcing actor across the P2P cycle.                                                                                 |
| **Procurement Officer** | Create/edit own PRs and RFQs. View all. Cannot approve or award. Must escalate approvals.        | —                                                                                                                            |
| **Finance Manager**     | Create/approve bills; submit/approve payments; view financial reports. Cannot create PRs or POs. | —                                                                                                                            |
| **Approver**            | Approve/reject items routed to them via workflow queue. Read-only on all other data.             | **Effectively inactive without being assigned to a workflow level.** The Approver role has no module-level access by itself. |
| **Warehouse/Receiver**  | Create GRNs on accepted orders. View orders.                                                     | Also called "Receiver" in some tenants. Equivalent to GRN User in the fine-grained model.                                    |

### Requests

| Role                | What they do                                                                                                                                 |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Basic User**      | Create + approve own requests; view own only. Cannot see other users' requests. Cannot create RFQs or approve anything outside own requests. |
| **Request Manager** | Manage all requests in assigned workspace(s); view + edit within workspace; can approve.                                                     |
| **Super Admin**     | All-workspace view/edit/approve.                                                                                                             |

### E-Source

| Role                      | What they do                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **E-Source Viewer**       | View sourcing events in assigned workspaces — read-only. Can see committee assignments but not modify.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| **E-Source User**         | Create/edit RFQs, submit offers, accept offers — for assigned events. Can modify technical and commercial committees on assigned events. Can unlock sealed bid + technical/commercial evaluation.                                                                                                                                                                                                                                                                                                                                                                                                             |
| **E-Source Manager**      | Same as User but scoped to the whole assigned workspace, not just assigned events. Also acts as the **decision-maker** role: can see all evaluator scores (including sealed-bid scores), can accept offers, and can approve or reject commercial submissions. **Verified by user: 2026-05-14** — E-Source Manager encompasses what the KT docs called "E-Source Resource Manager", "Commercial Evaluator", and "Commercial Approver" — these are capabilities of the E-Source Manager, not separate platform roles. Also called **Sourcing Manager** in some tenants — this is an alias, not a separate role. |
| **Super Admin**           | All workspaces, all events, all actions.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| **Bid Opening Committee** | Specialized role: can view and **unlock** RFxs they are assigned to as bid opening committee member. **This is the role that authorizes sealed-bid unlock** (the concept previously mislabelled as "gating committee"). Only activates during sealed bid workflows — members cannot see sealed offers until after the reveal date.                                                                                                                                                                                                                                                                            |
| **Technical Evaluator**   | Can perform technical evaluation on assigned RFxs. Exclusive to RFP flows. Cannot see commercial offers during technical evaluation phase. Cannot reassign evaluation to another user regardless of privilege.                                                                                                                                                                                                                                                                                                                                                                                                |
| **Technical Approver**    | Can approve or reject technical evaluations for assigned RFxs. Can see and modify technical/commercial committees.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |

### Orders

| Role              | What they do                                                                                          |
| ----------------- | ----------------------------------------------------------------------------------------------------- |
| **Order Viewer**  | View orders in assigned workspaces.                                                                   |
| **Order Manager** | View, create, edit, submit orders + awards + contracts (from approved offers) in assigned workspaces. |
| **Super Admin**   | All workspaces, all actions.                                                                          |

### Catalog / Products

| Role                 | What they do                                                                                                                                                                                       |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Catalog Manager**  | Manage catalogs — view catalog/products, create + edit products, create/edit categories, edit catalogs. Cannot create new catalogs (only edit existing).                                           |
| **Products Manager** | Create + edit products and categories. **Caveat from spec:** cannot edit catalogs, so cannot access products they created themselves unless those products are added to a catalog by someone else. |
| **Super Admin**      | All catalog and product actions.                                                                                                                                                                   |

### GRN

| Role                | What they do                                                                               |
| ------------------- | ------------------------------------------------------------------------------------------ |
| **GRN User**        | Create GRNs **for own requests only**. (Granular ownership scope.)                         |
| **GRN Manager**     | Create, edit, delete GRNs for orders in **assigned workspaces**. Can also create requests. |
| **GRN Super Admin** | Same as Manager but for **all workspaces**.                                                |

### Bills

| Role                  | What they do                                                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Bills Manager**     | Read approved GRNs and create bills (standard + proforma) for orders in **assigned workspaces**. Cannot process payments. |
| **Bills Super Admin** | Same as Manager but for **all workspaces**.                                                                               |

### Payments

| Role                     | What they do                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------ |
| **Payments Manager**     | Submit and process payments. View bills. Cannot create bills. Scoped to **assigned workspaces**. |
| **Payments Super Admin** | Same as Manager but for **all workspaces**.                                                      |

### Vendors

| Role                | What they do                                                                                                                                                            |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Vendors Manager** | Create + view + edit vendors across all statuses (Active, Inactive, Expired, Invited). Can approve/reject/return (when added as approver). Can assign assignee in VPQF. |

(Future/aspirational roles per the spec's "Desired Roles" sheet: Vendors Admin, Vendor Supervisor, Vendors Evaluator, Vendors Viewer — **not yet implemented**.)

### Workspaces

| Role            | What they do                                                                                                                                  |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **WS Viewer**   | View only the assigned workspace. View budget. No create/edit/delete.                                                                         |
| **WS Manager**  | Create new workspaces and edit ones they own. Activate/deactivate their assigned workspace. View + edit budget.                               |
| **WS Admin**    | Can do everything on the workspace module — view all workspaces, create/edit any, approve, manage approval pending / draft / returned states. |
| **Super Admin** | View all workspaces, create, edit any, full activate/deactivate, all budget actions.                                                          |

### Budgets / Expense Accounts

| Role                       | What they do                                                                                                                                                                                                              |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Budget Manager**         | Create, edit, view budgets. Lock/unlock. Add expense accounts at organization level. Reallocate/adjust budgets. (Known gap per spec: should be able to add expense accounts to assigned workspaces but currently cannot.) |
| **Budget Reader**          | Read-only view of budgets.                                                                                                                                                                                                |
| **Workspace Manager**      | Limited budget interaction: can **request additional budget**.                                                                                                                                                            |
| **Expense Accounts Admin** | Manage expense accounts.                                                                                                                                                                                                  |
| **Super Admin**            | All budget actions including adding expense accounts by workspace.                                                                                                                                                        |

### Settings / Reports / Workflows

| Role                        | What they do                                                                               |
| --------------------------- | ------------------------------------------------------------------------------------------ |
| **Settings Manager**        | View and edit Configurations. Cannot manage users or roles.                                |
| **Settings Super Admin**    | Full settings access across all workspaces.                                                |
| **Reports Super Admin**     | Access to all report tabs. Can schedule and export. View-only on procurement data.         |
| **Reports Manager**         | View all standard reports. Cannot access financial reports or schedule exports.            |
| **Workflow Viewer**         | View workflow configurations (self only).                                                  |
| **Workflow Config Manager** | Create and manage approval workflows and routing conditions. Also called Workflow Manager. |

---

## Approval-workflow eligibility (which roles can be approvers for which entity)

Verified from the user-provided spreadsheet:

| Role             | Requests | Sourcing | Received Offers | Orders | GRNs | Bills |
| ---------------- | -------- | -------- | --------------- | ------ | ---- | ----- |
| All Users        | ✅       | ❌       | ❌              | ❌     | ❌   | ❌    |
| Sourcing User    | —        | ✅       | ✅              | —      | —    | —     |
| Sourcing Manager | —        | ✅       | ✅              | —      | —    | —     |
| Orders Manager   | —        | —        | —               | ✅     | —    | —     |
| GRN Manager      | —        | —        | —               | —      | ✅   | —     |
| Bills Manager    | —        | —        | —               | —      | —    | ✅    |

In short: requests are universal — any user can be a request approver. For everything else, only the relevant Manager role (or higher) can sit on the approval workflow.

---

## Cross-references

- Glossary: Super Admin, Basic User, Bid Opening Committee, Technical Evaluator, Technical Approver, Workspace
- Full permission matrix per module: `personas/role-permissions-matrix.md`
- Vendor-side roles: `personas/vendor-roles.md`
- Approval rules: `cross-cutting/approval-routing.md`
- User management module: `modules/admin-users-roles.md`
- NHC-specific roles (Marketplace vendor, SCA buyer): `variants/nhc.md`
