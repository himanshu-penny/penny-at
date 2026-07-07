# Variant: Enterprise

**One-liner:** Full-featured Penny variant for large B2B organizations. The default reference variant in this knowledge base.

**Last updated:** 2026-05-13

---

## Who it's for

Standard B2B procurement: corporations, universities, hospitals, government agencies, NGOs. Multi-department organizations needing controlled spending, competitive sourcing, and approval governance.

---

## What enterprise has (the full surface area)

### Requests & sourcing

- Requests with multi-line items, expense-account allocation, budget validation. See `modules/requests.md`.
- E-sourcing: **RFQ, RFP, EOI**, plus the **RFC** request type that triggers the MFA contract flow. See `modules/e-sourcing.md` and `modules/contracts.md`.
- **Sealed bid** mode (verified — dedicated tests). Unlock authorization specifics are unverified in code.
- Negotiation and revision rounds.
- Direct award (single-vendor, with justification).

### Contracts (full set)

- **MFA contracts** (Master Frame Agreement) from approved offers via the "Create MFA" action. States: Drafted → Active.
- **Vendor contracts** with contract name, reference number, end date, credit term, products table.
- **Letter of Award** as the formal award document. See `modules/contracts.md`.

### Orders

- Three creation methods: from RFQ/RFP, from catalog, direct.
- Order approval workflow.
- Budget booking on approval.
- Change orders (amendments).
- Vendor acceptance flow.

### GRN

- Standard goods receipt with per-line accept/reject/partial-accept.
- Partial receipts (multiple GRNs per order).

### Bills & payments

- 2-way and 3-way invoice matching.
- Standard and proforma bills.
- Standard payment methods (bank transfer, check, online).

### Finance

- **Budgets** with the `Available = Total − Booked − Spent` formula.
- **Expense accounts** (full chart of accounts).
- Workspace-level and expense-account-level budget allocation.
- Multi-currency.

### Governance

- Approval workflows with up to 5 sequential levels.
- Conditional routing by amount, workspace, category, expense account, requester.
- Auto-approval below thresholds.
- Delegation, Super Approve, Skip Approval.

### Structure

- **Up to 10 workspaces** per organization.
- Hierarchical workspaces (parent / child).
- All 7 standard roles (Admin, Finance, Manager, Buyer, Receiver, Viewer, Vendor).

### URLs

- Buyer and vendor portals on per-environment URLs (no custom domain).

---

## What enterprise does NOT have (so you don't look for it)

- **Change requests** — RCMC-only. See `variants/rcmc.md`.
- **Digital signature on contracts (`draftWorkflowInSignIt`)** — RCMC-only.
- **`reSourceAfterReturn` flag** — EWCF-only.
- **Spend cap on MFA contracts** — EWCF-only.
- **ProPay financing module** — NHC-only. See `variants/nhc.md`.
- **Sourcing Requests** — NHC's analogue to RFQ. Enterprise uses RFQ/RFP directly.
- **Bulk Purchase** — NHC-only flow.
- **Custom domain branding** — EWCF has `procurement.esportsfoundation.com`; enterprise does not.

---

## Cross-references

- Variant matrix: `variants/variant-matrix.md`
- Glossary: Enterprise, Workspace, Budget, MFA Contract, RFC
- For module specifics, see each `modules/*.md` (enterprise is the default reference unless a variant deviation is called out)
