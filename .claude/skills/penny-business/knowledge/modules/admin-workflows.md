# Module: Approval Workflow Configuration

How admins configure the approval rules that route requests, orders, bills, and offers.

**Last updated:** 2026-06-14

---

## Purpose

To declaratively configure routing logic so the right approvers see the right entities, in the right order, based on amount and context.

For the **runtime logic** of how routing actually decides approvers, see `cross-cutting/approval-routing.md`. This module is about the _configuration_.

---

## Configurable workflow object types

**Verified by user:** 2026-06-14. Source: Platform Reference Documentation v26.2.7.

Workflows can be configured for the following six procurement object types:

1. **Requests** (Purchase Requisitions)
2. **Sourcings** (RFQ/RFP events)
3. **Received Offers** (vendor offer acceptance)
4. **Awards** (sourcing award)
5. **Orders** (Purchase Orders)
6. **Bills** (vendor invoices)

Note: "Award approval" and "Received Offers" are fully supported object types in the platform, not just placeholders.

---

## Configuration knobs

**Verified by user:** 2026-06-14. Source: Platform Reference Documentation v26.2.7.

| Knob                    | Description                                                                                                                 |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Levels**              | 1 to 5 sequential approval levels                                                                                           |
| **Amount thresholds**   | Different routing branches based on transaction amount                                                                      |
| **Approvers per level** | Specific users, or roles, or role-within-workspace                                                                          |
| **Sequential Approval** | Approvers act in sequence — next approver notified only after previous approval is complete                                 |
| **Parallel Approval**   | Multiple approvers at a level notified simultaneously — **any one approver** can approve to progress                        |
| **Can Add Next Level**  | Level setting allowing the current approver to dynamically designate the next-level approver. Useful for delegation chains. |
| **Auto-approval**       | Entities under a configured amount skip the workflow entirely                                                               |
| **Conditional routing** | Branch by workspace, category, expense account, vendor, or requester                                                        |
| **Default Workflow**    | A catch-all workflow applied when no routing condition matches                                                              |
| **Delegation**          | Approvers can delegate when unavailable (delegate must have Manager role)                                                   |
| **Timeout / SLA**       | Optional auto-escalate or reminder cadence                                                                                  |

**Priority of conditional rules:** First matching condition wins. Always configure a catch-all (default) workflow — see §Risk below.

---

## Configuration rules

1. Maximum **5** sequential levels.
2. Cannot configure auto-approval without an amount cap.
3. Approver role must exist; user must have at least one role compatible with the configured approver type.
4. Workflow must cover the full amount range — no gaps.
5. **No-match risk:** If no routing condition matches AND no default workflow is configured, procurement objects may **bypass approval entirely** and auto-advance. Always configure a default catch-all workflow or condition that covers the full range.

## Workflows Master Toggle — Critical Risk

**Verified by user:** 2026-06-14. Source: Feature Flag Bible v26.2.7.

⚠ If the **Workflows master toggle** is turned **OFF**, ALL approval workflows **stop running immediately** across every module. All procurement objects (PRs, RFQs, POs, Bills) will be **auto-processed on submission without any human approval**. This is effectively a **full governance bypass**. Must never be turned off on production environments.

---

## Approval actions available at runtime

(For completeness; full detail in `cross-cutting/approval-routing.md`.)

- Approve
- Reject (returns to requester)
- Return for revision (requester can edit and resubmit)
- Delegate
- **Super Approve** (Super Admin only) — proxy approval going _through_ each level
- **Skip Approval** — bypasses the workflow entirely (distinct from Super Approve)

---

## Feature flag behavior rule

**Verified by user: 2026-05-31.** When a feature flag is turned **off**, all four layers must be inert:

| Layer                            | Expected behavior when flag is off                                  |
| -------------------------------- | ------------------------------------------------------------------- |
| **UI**                           | Entry points (buttons, menu items, forms) hidden or disabled        |
| **API**                          | Unauthorized actions blocked — flag-off is not UI-only              |
| **Background jobs / algorithms** | Must not run; disabled feature logic should be fully guarded        |
| **Notifications**                | Must not fire for the disabled feature unless separately configured |

A UI-only check when testing flag-off is insufficient. Validate all four layers. Disabled features running background jobs or sending notifications are bugs even if the UI is correctly hidden.

---

## Variant deviations

- **NHC**: simpler workflows, fewer levels typical.
- **RCMC**: with `rcmcOrgConversion`, commercial scoring approval shifts from the request workflow to the e-source phase.
- **EWCF**: standard enterprise behavior.

---

## Cross-references

- Glossary: Approval Workflow, Super Approve, Workspace
- Runtime routing: `cross-cutting/approval-routing.md`
- Per-entity approval flow: `modules/requests.md`, `modules/orders.md`, `modules/bills.md`, `modules/e-sourcing.md`
