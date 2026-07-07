# Cross-Cutting: Approval Routing

How entities (requests, orders, bills, RFQs/offers) get routed to approvers at runtime.

**Last updated:** 2026-05-31

---

## Where this applies

Routing logic is shared across:

- **Request approval** — purchase requests.
- **Order approval** — purchase orders.
- **Bill approval** — vendor invoices.
- **RFQ/Offer approval** — sourcing awards.

For _how to configure_ these workflows, see `modules/admin-workflows.md`. This file covers _runtime behavior_.

---

## Routing model

Each workflow defines up to **5 sequential levels**. An entity at level N is visible only to that level's approvers; it does not appear on level N+1 until level N approves.

### Branching

Routing branches on **amount** by default. Other branch dimensions: workspace, category, expense account, requester.

**Priority of conditional rules:** Workspace > Category > Default.

### Auto-approval

Below a configured threshold, the entity skips the workflow entirely (state goes directly to `Approved`).

### Example request workflow

```
Amount < $1,000:            Auto-approve
$1,000 ≤ Amount < $10,000:  Level 1 = Request Manager
$10,000 ≤ Amount < $50,000: Level 1 = Request Manager
                            Level 2 = Budget Manager
Amount ≥ $50,000:           Level 1 = Request Manager
                            Level 2 = Budget Manager
                            Level 3 = Super Admin
```

Approver role names above (Request Manager, Budget Manager, Super Admin) are the actual Penny roles. See `personas/buyer-roles.md` for the full role catalogue.

### Which roles can be approvers for which entity

(Verified from user-provided role spreadsheet, 2026-05-13.)

| Entity being approved | Eligible approver roles         |
| --------------------- | ------------------------------- |
| Requests              | Any user                        |
| Sourcing events       | Sourcing User, Sourcing Manager |
| Received Offers       | Sourcing User, Sourcing Manager |
| Orders                | Orders Manager                  |
| GRNs                  | GRN Manager                     |
| Bills                 | Bills Manager                   |

(Super Admin can act in any approval role across all entities and all workspaces.)

---

## Approval actions

At each level, the assigned approver(s) can take one of these actions:

| Action                  | Effect                                                      |
| ----------------------- | ----------------------------------------------------------- |
| **Approve**             | Move to next level, or to `Approved` if last level          |
| **Reject**              | Return to requester with reason; entity moves to `Rejected` |
| **Return for Revision** | Requester can edit and resubmit                             |
| **Delegate**            | Assign to another user (must have Manager role)             |
| **Super Approve**       | Super Admin proxy — see below                               |
| **Skip Approval**       | Super Admin only — bypass the entire workflow               |

---

## Super Approve vs Skip Approval (commonly confused)

These are **not the same thing**:

| Feature              | Super Approve                                                          | Skip Approval                        |
| -------------------- | ---------------------------------------------------------------------- | ------------------------------------ |
| Who can use          | Super Admin only                                                       | Super Admin only                     |
| Effect               | Approves _on behalf of_ the configured approver at the current level   | Bypasses the workflow entirely       |
| Goes through levels? | Yes — each level still requires a separate super-approve action        | No — entire workflow skipped at once |
| Audit trail          | Recorded as approved by Super Admin on behalf of that level's approver | Recorded as workflow skipped         |
| UI                   | "super-approve-checkbox" → click Approve normally                      | Separate Skip Approval action        |
| Use case             | Approver unavailable, urgent approval                                  | Emergency override, admin testing    |

---

## Workspace scoping rule

**Verified by user:** 2026-06-06. Source: Penny KB.

If a workflow is configured with an approver who is **not a member of the workspace** the entity belongs to, that approver is **automatically skipped** — they will not receive the approval notification and the entity passes to the next configured approver.

Key implication: an approver appearing in the workflow config does not guarantee they receive the task. Always confirm that approver users are workspace members when debugging missing approval notifications.

---

## Separation of duties

**Hard rule:** The requester (creator) of an entity cannot also be an approver of that entity, even if they hold a Manager role assigned to the workflow level. The system automatically skips them.

---

## Delegation

When an approver is unavailable:

- They can assign a delegate ahead of time (e.g., before going on leave).
- Delegate must have the Manager role.
- Delegation can be time-bounded.
- Pending entities reroute to the delegate during the delegation window.

---

## Timeout / escalation (optional)

Workflows can specify an SLA per level (e.g., 3 business days). On expiry, the system can:

- Auto-escalate to the next level.
- Send reminder notifications.
- Both (configurable).

---

## Segregation of duties

**Verified by user: 2026-05-31.** Self-approval should be **blocked** where segregation-of-duties rules are configured. A record creator should not be able to approve their own submission.

- Validate that the requester/creator cannot approve their own record at any level.
- Validate that approval is blocked via both UI and API when self-approval rules apply.
- This is a QA regression checkpoint whenever approval workflow configuration is changed.

---

## Troubleshooting — common approval blockers

| Symptom                            | First checks                                                                 |
| ---------------------------------- | ---------------------------------------------------------------------------- |
| Approval button missing            | Role assignment, workspace scope, record state, workflow step assignment     |
| Wrong approver receives task       | Workflow condition match, amount threshold, delegation, stale approver       |
| Action Board task missing/stale    | Compare record state vs. task owner; check workflow step transition          |
| Self-approval allowed unexpectedly | Check segregation-of-duties configuration for the org/module                 |
| Approval stuck after workflow edit | Existing in-flight records may follow old version; check reprocessing policy |

---

## Variant deviations

- **NHC**: simpler workflows; fewer levels typical.
- **RCMC**: `rcmcOrgConversion` flag moves commercial scoring approval from the request workflow to the e-source workflow.
- **EWCF**: standard enterprise behavior.

---

## Cross-references

- Glossary: Approval Workflow, Super Approve
- Configuration side: `modules/admin-workflows.md`
- Entity-specific approval rules: `modules/requests.md`, `modules/orders.md`, `modules/bills.md`, `modules/e-sourcing.md`
- Variants: `variants/variant-matrix.md`
