# Role × Permission Matrix (per module)

The full permission detail for every Penny role, organized by module.

**Last updated:** 2026-05-31
**Verified by user:** 2026-05-13 — captured directly from `Penny User Roles - Master .xlsx` provided by the user.

For role definitions and an overview, see `personas/buyer-roles.md`.

---

## Legend

| Symbol | Meaning                                    |
| ------ | ------------------------------------------ |
| ✅     | Allowed                                    |
| ❌     | Not allowed                                |
| —      | Not applicable / not on the role's surface |

**Scope:** unless noted, _Manager_ roles operate on their assigned workspace(s); _Super Admin_ variants operate on all workspaces.

---

## Requests

| Role            | View own | View workspace | View all | Create | Edit own | Edit workspace | Edit all | View draft on action board | Approve |
| --------------- | -------- | -------------- | -------- | ------ | -------- | -------------- | -------- | -------------------------- | ------- |
| Basic User      | ✅       | ❌             | ❌       | ✅     | ✅       | ❌             | ❌       | ✅                         | ✅      |
| Request Manager | ✅       | ✅             | ❌       | ✅     | ✅       | ✅             | ❌       | ❌                         | ✅      |
| Super Admin     | ✅       | ✅             | ✅       | ✅     | ✅       | ✅             | ✅       | ❌                         | ✅      |

---

## E-Source

| Role                  | View assigned | View workspace | View all | Create/edit/submit/accept (assigned) | Same (workspace) | Same (any) | See committees | Modify committees | Action menu | Unlock sealed bid + tech + commercial | View reports     | View requests     | Request timeline | E-source timeline        | Perform evaluation | See bid-opening / unlock info |
| --------------------- | ------------- | -------------- | -------- | ------------------------------------ | ---------------- | ---------- | -------------- | ----------------- | ----------- | ------------------------------------- | ---------------- | ----------------- | ---------------- | ------------------------ | ------------------ | ----------------------------- |
| E-Source Viewer       | ✅            | ✅             | ❌       | ❌                                   | ❌               | ❌         | ✅             | ❌                | ❌          | ❌                                    | ✅               | Workspace         | ✅               | ✅                       | ❌                 | ✅                            |
| E-Source User         | ✅            | ❌             | ❌       | ✅                                   | ❌               | ❌         | ✅             | ✅                | ✅          | ✅                                    | ✅               | Workspace         | ✅               | ✅                       | ❌                 | ✅                            |
| E-Source Manager      | ✅            | ✅             | ❌       | ❌                                   | ✅               | ❌         | ✅             | ✅                | ✅          | ✅                                    | ✅               | Workspace         | ✅               | ✅                       | ❌                 | ✅                            |
| Super Admin           | ✅            | ✅             | ✅       | ✅                                   | ✅               | ✅         | ✅             | ✅                | ✅          | ✅                                    | ✅               | All               | ✅               | ✅                       | ❌                 | ✅                            |
| Bid Opening Committee | ✅            | ❌             | ❌       | ❌                                   | ❌               | ❌         | ❌             | ❌                | ❌          | ✅                                    | Only assigned WS | Assigned requests | ✅               | ✅                       | ❌                 | ✅                            |
| Technical Evaluator   | ❌            | ❌             | ❌       | ❌                                   | ❌               | ❌         | ❌             | ❌                | ❌          | ❌                                    | Only assigned WS | Assigned requests | ✅               | ❌ (only common actions) | ✅                 | ✅                            |
| Technical Approver    | ❌            | ❌             | ❌       | ❌                                   | ❌               | ❌         | ✅             | ✅                | ❌          | ❌                                    | Only assigned WS | Assigned requests | ✅               | ✅                       | ❌                 | ✅                            |

---

## Orders

| Role          | View (workspace) | View (any) | Create/edit/submit (workspace) | Create/edit/submit (any) |
| ------------- | ---------------- | ---------- | ------------------------------ | ------------------------ |
| Order Viewer  | ✅               | ❌         | ❌                             | ❌                       |
| Order Manager | ✅               | ❌         | ✅                             | ❌                       |
| Super Admin   | ✅               | ✅         | ✅                             | ✅                       |

---

## Catalog & Products

| Role             | View catalog | View products | Create products | Edit products | Create/edit categories | Create catalogs | Edit catalogs | Notes                                                                                             |
| ---------------- | ------------ | ------------- | --------------- | ------------- | ---------------------- | --------------- | ------------- | ------------------------------------------------------------------------------------------------- |
| Catalog Manager  | ✅           | ✅            | ✅              | ✅            | ✅                     | ❌              | ✅            |                                                                                                   |
| Products Manager | ✅           | ✅            | ✅              | ✅            | ✅                     | ❌              | ❌            | Can't edit catalogs, so can't access their own products unless added to a catalog by someone else |
| Super Admin      | ✅           | ✅            | ✅              | ✅            | ✅                     | ✅              | ✅            |                                                                                                   |

---

## GRN

| Role            | Create GRN | Edit GRN | Delete GRN | Create Request | Scope                 |
| --------------- | ---------- | -------- | ---------- | -------------- | --------------------- |
| GRN User        | ✅         | —        | —          | —              | **Own requests only** |
| GRN Manager     | ✅         | ✅       | ✅         | ✅             | Assigned workspaces   |
| GRN Super Admin | ✅         | ✅       | ✅         | —              | All workspaces        |

---

## Bills

| Role              | Read GRNs | Create Bills | Create Proforma Bills | Scope               |
| ----------------- | --------- | ------------ | --------------------- | ------------------- |
| Bills Manager     | ✅        | ✅           | ✅                    | Assigned workspaces |
| Bills Super Admin | ✅        | ✅           | ✅                    | All workspaces      |

---

## Payments

| Role                 | Read Bills | Create Payments | Create Proforma Payments | Scope               |
| -------------------- | ---------- | --------------- | ------------------------ | ------------------- |
| Payments Manager     | ✅         | ✅              | ✅                       | Assigned workspaces |
| Payments Super Admin | ✅         | ✅              | ✅                       | All workspaces      |

---

## Vendors

| Role            | Create | View Active | Edit Active | View Inactive | Edit Inactive | View Expired | Edit Expired | View Invited | Edit Invited | Settings | Approve/Reject/Return (as approver) | Assign VPQF assignee |
| --------------- | ------ | ----------- | ----------- | ------------- | ------------- | ------------ | ------------ | ------------ | ------------ | -------- | ----------------------------------- | -------------------- |
| Vendors Manager | ✅     | ✅          | ✅          | ✅            | ✅            | ✅           | ✅           | ✅           | ✅           | ❌       | ✅                                  | ✅                   |

_Aspirational roles defined in the spec but not yet implemented: **Vendors Admin** (full vendor module + settings), **Vendor Supervisor** (can assign user with supervisor/evaluator role), **Vendors Evaluator** (cannot reassign evaluation), **Vendors Viewer** (read-only)._

---

## Workspaces

| Role        | View all | View assigned | Create | Edit assigned WS (not owned) | Edit any | Approve as approver | Action board: approval pending | Action board: draft (creator only) | List page draft | Action board returned | Activate/Deactivate assigned | Activate/Deactivate all | View Budget | Edit Budget |
| ----------- | -------- | ------------- | ------ | ---------------------------- | -------- | ------------------- | ------------------------------ | ---------------------------------- | --------------- | --------------------- | ---------------------------- | ----------------------- | ----------- | ----------- |
| WS Viewer   | ❌       | ✅            | ❌     | ❌                           | ❌       | ❌                  | ❌                             | ❌                                 | ❌              | ❌                    | ❌                           | ❌                      | ✅          | ❌          |
| WS Manager  | ❌       | ✅            | ✅     | ❌                           | ❌       | ❌                  | ❌                             | ❌                                 | ❌              | ❌                    | ✅                           | ❌                      | ✅          | ✅          |
| WS Admin    | ✅       | ❌            | ✅     | ✅                           | ✅       | ✅                  | ✅                             | ✅                                 | ✅              | ✅                    | ❌                           | ✅                      | ✅          | ✅          |
| Super Admin | ✅       | ❌            | ✅     | ❌                           | ✅       | ✅                  | ✅                             | ✅                                 | ✅              | ✅                    | ❌                           | ✅                      | ✅          | ✅          |

---

## Budget & Expense Accounts

| Role              | Edit Budget | Lock/Unlock | View Budget | Create Budget | Add Expense Accounts (org) | Add Expense Accounts (workspace) | Request Additional Budget | Reallocate / Adjust Budget | Notes                                                                                               |
| ----------------- | ----------- | ----------- | ----------- | ------------- | -------------------------- | -------------------------------- | ------------------------- | -------------------------- | --------------------------------------------------------------------------------------------------- |
| Budget Manager    | ✅          | ✅          | ✅          | ✅            | ✅                         | ❌                               | ❌                        | ✅                         | Known gap: should be able to configure expense accounts on assigned workspaces but currently cannot |
| Budget Reader     | ❌          | ❌          | ✅          | ❌            | ❌                         | ❌                               | ❌                        | ❌                         |                                                                                                     |
| Workspace Manager | —           | —           | —           | —             | —                          | —                                | ✅                        | —                          | Can request additional budget                                                                       |
| Super Admin       | ✅          | ✅          | ✅          | ✅            | ✅                         | ✅                               | ❌                        | ✅                         |                                                                                                     |

---

## Settings

| Role                 | Manage all settings for all users | Manage all settings for all users in all workspaces |
| -------------------- | --------------------------------- | --------------------------------------------------- |
| Settings Manager     | ✅                                | ❌                                                  |
| Settings Super Admin | ✅                                | ✅                                                  |

---

## Reports

| Role                | Create reports in all workspaces |
| ------------------- | -------------------------------- |
| Reports Super Admin | ✅                               |
| Super Admin         | ✅                               |

---

## Workflows

| Role             | View workflows (self only) | View workflows (all) | Configure workflows (assigned workspace) | Configure workflows (all workspaces) |
| ---------------- | -------------------------- | -------------------- | ---------------------------------------- | ------------------------------------ |
| Workflow Viewer  | ✅                         | ❌                   | ❌                                       | ❌                                   |
| Workflow Manager | ✅                         | ✅                   | ✅                                       | ❌                                   |

(Super Admin can configure across all workspaces.)

---

## Known gaps / improvement requests captured in source spreadsheet

- **GRN User** should see "own requests + GRNs related to own requests"; currently GRN Manager sees all GRNs of assigned workspace and can create from own requests.
- **Budget Manager** should be able to configure expense accounts on their assigned workspaces; currently they cannot.
- **Vendors Admin / Supervisor / Evaluator / Viewer** are designed but not implemented.

---

## Cross-references

- Role overview and approval-eligibility summary: `personas/buyer-roles.md`
- Vendor-side roles: `personas/vendor-roles.md`
- Approval routing rules: `cross-cutting/approval-routing.md`
- User management module: `modules/admin-users-roles.md`

---

## Role Scope Model

**Verified by user:** 2026-05-31. Source: PennyGuard base-knowledge.

| Scope                  | Meaning                                                                | QA check                                        |
| ---------------------- | ---------------------------------------------------------------------- | ----------------------------------------------- |
| **Own**                | User can see/act only on records they created or own                   | User cannot access teammate's record            |
| **Assigned workspace** | User can act only inside their assigned workspaces                     | User cannot access another workspace            |
| **Assigned event**     | User can act only when assigned to a specific RFx/committee/evaluation | Unassigned event is hidden or read-only         |
| **All workspaces**     | Global access — usually Super Admin class roles                        | Audit trail and policy controls still apply     |
| **Workflow assigned**  | Approval action appears only at the active workflow step               | Module permission alone does not grant approval |

---

## Role Profiles — Capabilities, Limits, and Common Blockers

**Verified by user:** 2026-05-31. Source: PennyGuard base-knowledge. Use with the permission tables above.

### Basic User

- Can create/track own requests; approver only when explicitly assigned by workflow.
- Cannot view/edit unrelated workspace records by default.
- Common blocker: user expects manager-level visibility without workspace scope.

### Request Manager

- Can create, edit, and supervise request flow in assigned workspaces.
- Can approve only when included in the active approval workflow step.
- Common blocker: manager role exists but workflow assignment is missing.

### Approver

- Can approve/return/reject records only when the record is at their active workflow step.
- Cannot approve just because they have broad module access.
- Common blocker: stale approver mapping after workflow or user changes.

### E-Source Viewer

- Can view workspace sourcing events and status for monitoring.
- Cannot create/edit events or perform committee actions.
- Common blocker: users expect edit actions from a view-only role.

### E-Source User

- Can create/edit assigned sourcing events and contribute to event setup.
- Cannot unlock sealed bids unless also assigned as Bid Opening Committee.
- Common blocker: role assigned but event assignment is missing.

### E-Source Manager

- Can manage sourcing events at workspace level and adjust event configuration.
- **Does not automatically gain sealed-bid unlock authority** — committee assignment on the specific event is still required.
- Common blocker: manager assumed to have committee unlock rights.

### Bid Opening Committee

- Can unlock/open sealed-bid gates only for assigned events at valid stage/time.
- Cannot score technical/commercial evaluation unless separately assigned to those evaluator roles.
- Common blocker: committee assigned at role level but not mapped to the specific event.

### Technical Evaluator

- Can review technical submissions and submit stage-gated scoring for assigned events.
- **Cannot unlock sealed bid gates** unless also assigned to Bid Opening Committee.
- **Cannot approve technical stage** unless also assigned as Technical Approver.
- Cannot access commercial gate data before allowed unlock/approval path.
- Common blocker: evaluator role present but no event assignment, or stage not yet opened.

### Technical Approver

- Can approve/reject technical evaluation and gate movement to next stage where configured.
- Cannot perform commercial approval unless separately assigned.
- Common blocker: expected gate transition blocked because technical approval is still pending.

### Commercial Evaluator

- Can score commercial responses/pricing only after sealed/technical gate conditions are satisfied.
- Cannot access commercial stage before sealed-bid or technical gate conditions are met.
- Common blocker: commercial stage hidden due to incomplete technical approval path.

### Commercial Approver

- Can approve/reject commercial evaluation and support award readiness.
- Cannot unlock technical stage or bypass committee sequence.
- Common blocker: approver assignment missing for final commercial decision step.

### Order Viewer / Order Manager

- Order Viewer monitors order data in scope; Order Manager creates/edits/submits orders in assigned workspace.
- Cannot operate outside assigned workspace scope.
- Common blocker: order action disabled due to workspace mismatch or record state lock.

### GRN User / GRN Manager / GRN Super Admin

- GRN User handles own-flow receiving; GRN Manager manages receiving in assigned workspaces; Super Admin has global scope.
- Even with role access, receiving still follows PO quantity/state rules.
- Common blocker: receiving blocked by PO status, quantity, or scope mismatch.

### Bills Manager / Bills Super Admin

- Can create and manage bills within configured workspace/global scope.
- Bill actions still depend on order/GRN state and validation checks.
- Common blocker: bill submit blocked by mismatch, duplicates, or missing attachment/fields.

### Payments Manager / Payments Super Admin

- Can create/manage payments in workspace or global scope.
- Payment execution still depends on bill approval and finance controls.
- Common blocker: payment action blocked because source bill is not fully eligible.

### Workflow Viewer / Workflow Manager

- Workflow Viewer can inspect workflow setup; Workflow Manager can configure workflows in assigned workspaces.
- Common blocker: approvals route incorrectly due to condition mismatch or stale workflow version.

### Budget Reader / Budget Manager / Workspace Manager

- Budget Reader sees budget state; Budget Manager can configure budget behavior; Workspace Manager can request additional budget.
- Budget operations remain subject to client-specific finance policy and integration rules.
- Common blocker: budget check fails due to wrong account mapping, state, or integration config.

### Super Admin

- Broad cross-workspace control for users, roles, workflows, configuration, and most module operations.
- **Still subject to product state rules, audit expectations, and explicit event/workflow gates where enforced.** Super Admin does not bypass business-state validations.
- Common blocker: Super Admin role assumed to bypass lifecycle gates — it should not.

### Vendors Manager (buyer side)

- Can create/manage vendor records and vendor workflow actions in configured scope.
- Vendor approval actions still depend on assignment and current vendor state.
- Common blocker: vendor not visible or non-actionable due to state/filter/scope mismatch.

---

## QA Risk Notes

- Validate role checks together with scope checks — role alone is not enough.
- Validate workflow assignment together with role for approval actions.
- Validate event-specific assignments (committee/evaluator/approver) separately from generic module roles.
- Validate that high-privilege roles still respect lifecycle gates and audit/timeline records.
