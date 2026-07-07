# Module: Contracts (MFA / Vendor Contracts / Letter of Award)

Contract creation and management — distinct from one-off purchase orders.

**Last updated:** 2026-05-13
**Source:** Verified against codebase 2026-05-13 (page objects, request type constants, test tags).

---

## Purpose

To capture longer-term, multi-transaction commitments between buyer and vendor. Where an Order is a one-off purchase, a Contract is a framework that subsequent activity (orders, deliveries, billing) operates under.

---

## Contract types in Penny

### 1. MFA contract (Master Frame Agreement)

**MFA = Master Frame Agreement.** A contract created from an approved e-sourcing offer when the request type is `CONTRACT_REQUEST` (displayed in the UI as **"RFC (MFA)"**).

**Flow:**

1. Buyer creates a request of type `CONTRACT_REQUEST`.
2. E-sourcing event runs (RFQ/RFP).
3. Buyer evaluates offers and submits the **Letter of Award** (see below). Offer state becomes `AWARD_SUBMITTED`.
4. Orders admin clicks **"Create MFA"** on the approved offer.
5. MFA details are filled: contract name, reference contract number, contract file.
6. Contract is saved in state **Drafted**.
7. On submission, contract transitions to state **Active**.

**EWCF-specific addition:** the MFA carries a **spend cap**:

- Cap type: `BY_VALUE`, `BY_QUANTITY`, or `NO_CAP`.
- `spendCapValue` (when applicable).

### 2. Vendor contract

A master supply agreement managed at the vendor level (not tied to a single transaction).

**Fields observed in code:**

- Contract name, reference contract number, description
- End date (date + hour/minute/AM-PM)
- Credit term (payment term in days)
- Products table: product name, brand, contract price, total qty, balance qty
- Payment term displayed on list

**State observed:** `Active`. (No other states observed in code — earlier mentions of Draft / Expired / Cancelled / Signed are **unverified**.)

---

## Letter of Award (LoA)

A formal award document issued when the buyer accepts a winning offer.

**Fields observed:**

- Code
- Description
- Supporting document (Excel)

**Effect:**

- Saving the LoA shows a "Letter of Award saved successfully" confirmation.
- On submission, the underlying offer moves to status `AWARD_SUBMITTED`.
- Acts as the formal precursor to MFA contract creation (or directly to an order, depending on flow).

---

### 3. RCMC contract types

**Verified by user:** 2026-06-06. Source: RCMC BRD R4.

RCMC supports the following named contract types in addition to standard MFA/vendor contracts:

| Type                                | Description                                                                                                                                                                                     |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Standard Service Agreement          | Standard contracted service                                                                                                                                                                     |
| Operations and Maintenance Contract | Ongoing O&M scope                                                                                                                                                                               |
| MFA (multi-supplier, shared cap)    | Multiple suppliers for a given set of items with individual prices but a **shared value cap** across all suppliers. **Phase 2 only** — Phase 1 supports individual contracts per supplier only. |
| Construction Contract               | Construction project scope                                                                                                                                                                      |
| Addendum                            | Amendment/addendum to an existing contract                                                                                                                                                      |

---

## Change Requests (RCMC — contract/order amendments)

**Verified by user:** 2026-06-06. Source: RCMC BRD R4 + Penny KB.

In RCMC, modifications to an active contract or PO follow a formal **Change Request (CR)** process.

### Supported change types

- Contract Duration Change
- Terms & Conditions Change
- Quantity Change
- Freeze Duration Change
- Delivery Location and Delivery Date Change
- _(Future enhancement)_ Contract Termination

### RCMC approval process

1. Business Owner initiates CR from existing contract/PO (approved by Business Chief + Procurement Contract Director + Finance Group).
2. CR enters the eSource module for Procurement review. Procurement can communicate with vendors and negotiate pricing for new line items.
3. Vendor receives the CR and can accept, participate in negotiations, or counter.
4. Even after vendor acceptance, Procurement can send the CR back for revision to negotiate pricing before proceeding.
5. Finance reviews and **can only approve** — Finance **cannot reject or return** a CR.
6. Committee voting begins. The **Committee Head receives the CR only after 75% of committee members have voted** (participation threshold, not outcome threshold). Committee members can view who voted and the voting progress.
7. Committee Head can approve or reject (decision is independent of voting results).
8. After approval, Procurement accepts the vendor offer and the signature workflow is triggered.
9. Once signed, Penny creates a **new version** of the contract/PO document.
10. SAP sync is triggered **only when a PO is submitted** against the amended contract — the amendment signature alone does not trigger SAP sync.

### 25% cap rule

The updated contract value must **not exceed 25% above the original contract value**. If the proposed increase exceeds 25%, Procurement cannot continue — they must re-negotiate with the vendor to reduce the increase below the threshold before the CR can proceed.

**Formula:** `Increase % = ((New Value − Original Value) ÷ Original Value) × 100`

### Contract eligibility for Change Requests

A contract remains eligible for a CR even if past its expiry date, as long as **all deliverables have not been received**. Contract eligibility is determined by deliverable completion status, not the expiration date.

### Cancellation rules

- Once a CR is cancelled, it is nullified and cannot be reactivated.
- A completely new CR must be created to attempt similar changes.
- If cancelled after vendor acceptance or after signature initiation, the vendor must be notified.

### System location

| Action                                    | Location                                |
| ----------------------------------------- | --------------------------------------- |
| Create CR                                 | Create → Change Request                 |
| Procurement review and vendor negotiation | eSource Module                          |
| Vendor acceptance                         | eSource Module                          |
| Committee voting                          | eSource Module                          |
| CR signature processing                   | Orders Module → Change Requests tab     |
| Approval tasks                            | Requests Module + Action Board → CR tab |

See `variants/rcmc.md#change-requests`.

---

## Performance Bonds

**Verified by user:** 2026-06-06. Source: RCMC BRD R4 + Penny KB.

A **Performance Bond** is a financial guarantee from the awarded vendor that contractual obligations will be fulfilled. The buyer can request it at multiple stages.

### When a Performance Bond can be requested

- During **LOA creation** (becomes part of the LOA document)
- After **LOA signature** but before Order/Contract creation
- During **Order or Contract creation**
- At any **later stage** after contract/order creation

### Key blocking rule

When a Performance Bond is marked as required, the **vendor must submit the bond before the buyer can create an Order or Contract**. If no bond is requested, procurement continues normally with no restrictions.

### Bond amount configuration

- Buyer specifies either a **fixed amount** or a **percentage** of the contract/order value.
- When one field is entered, the other is **auto-calculated** (e.g., 10% of 100,000 SAR = 10,000 SAR automatically shown).

### Status lifecycle

`Draft → Requested → Submitted → Approved → Expired → Resubmission Requested`

### Expiry monitoring

Buyer configures a reminder period (e.g., 30 days before expiry). System sends notifications before expiry and at expiry. Buyer can request resubmission after expiry.

### System location

**Orders → Performance Bonds** — centralized tracking of all bonds with reference number, vendor, related order/contract, bond amount, expiry date, and status.

In RCMC (BRD R4), the typical value is **5% of the awarded contract value**, valid for the project duration. Marked as **Phase 2** RCMC capability. See `glossary.md#performance-bond` and `variants/rcmc.md`.

---

## MFA Work Orders — detailed rules

**Verified by user:** 2026-06-06. Source: Penny KB.

### MFA creation from RFC sourcing event

- One RFC sourcing event can result in **multiple accepted vendor offers**.
- All accepted offers consolidate into **one parent MFA** — not one MFA per vendor.
- Individual **vendor agreements** are created under the parent MFA.
- The MFA carries a **Spend Cap** shared across all agreements under it.

### Spend cap tracking

```
Utilized Amount = Sum of all approved Work Orders under all agreements in the MFA
Balance = Spend Cap − Utilized Amount
```

- A new Work Order is blocked if its value would exceed the remaining MFA balance.
- When `Utilized = Spend Cap`, the MFA is fully consumed and no further Work Orders are allowed.

### MFA date rules

- MFA has a Start Date and End Date.
- Vendor agreement **end date cannot exceed the parent MFA end date**.
- MFA start and end dates **lock once the first agreement is submitted** — they cannot be changed after that point.
- Agreement start date can be modified; end date inherits from MFA.

### Workspace validation

A Work Order can only utilize an agreement if the **Work Order workspace matches the MFA workspace**. If the workspaces differ, the WO submission is rejected.

- _(RCMC enhancement request, not yet implemented)_: Multiple workspaces accessing the same MFA.

### Work Order item rules

All items in a single Work Order must come from the **same agreement**. Items from different agreements cannot be combined in one Work Order — separate Work Orders must be created per agreement.

### Result

One Work Order → One Purchase Order, linked to a specific vendor agreement under the parent MFA.

## Variant support

| Variant    | MFA contracts    | Vendor contracts | Letter of Award |
| ---------- | ---------------- | ---------------- | --------------- |
| Enterprise | ✅               | ✅               | ✅              |
| RCMC       | ✅               | ✅               | ✅              |
| EWCF       | ✅ (+ spend cap) | ✅ (+ spend cap) | ✅              |
| NHC        | ❌               | ❌               | ❌              |

(Test tags across `tests/shared/saas-modules/.../rfc.ts` and `letter-of-award.ts` consistently list `@enterprise`, `@rcmc`, `@ewcf`. No NHC contract tests exist.)

---

## State machine (what's verified)

| State       | Means                               |
| ----------- | ----------------------------------- |
| **Drafted** | Contract created, not yet submitted |
| **Active**  | Submitted and effective             |

Earlier mentions of Expired / Cancelled / Signed in source documents are **unverified** — they may exist in product but are not observable in the test codebase.

---

## Integration with the P2P flow

- **Contract requests** (`CONTRACT_REQUEST` type) go through the normal request approval workflow before the e-source step.
- E-sourcing produces an awarded offer; the LoA formalizes the award.
- The MFA contract is created from the approved offer rather than a direct purchase order being issued.
- Subsequent orders against the contract draw down its capacity (especially relevant for EWCF spend-capped contracts).

---

## Cross-references

- Glossary: MFA Contract, Vendor Contract, Letter of Award, RFC
- Request type: `modules/requests.md` (CONTRACT_REQUEST flow)
- Sourcing source: `modules/e-sourcing.md`
- Variant differences: `variants/variant-matrix.md` (contracts row), `variants/ewcf.md` (spend cap)
- State transitions: `cross-cutting/state-transitions.md`

---

## High-risk regression areas

**Verified by user: 2026-05-31.** Always check these when contracts/LOA/signature code is touched:

- Wrong signatory assignment
- Stuck external signature status (DocuSign/SignIt)
- Expired JWT / signature link handling and resend/void/restart logic
- PDF generation vs. system status mismatch
- Performance bond requirements (client/config-specific)
- RCMC `draftWorkflowInSignIt` behavior when flag is on/off
