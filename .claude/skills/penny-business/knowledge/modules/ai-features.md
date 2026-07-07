# Module: AI Features (AI Chatbot + AI Negotiator)

Intelligent automation and conversational AI tools embedded within the procurement workflow.

**Last updated:** 2026-05-14
**Source:** penny_features_roles.docx — April 2026 (bug tracker analysis). Status: unverified in automated test codebase — confirm before writing tests.

---

## 6.1 AI Chatbot

A conversational AI assistant enabling users to query procurement data, create requests, and navigate the platform using natural language.

### Key capabilities

- **Natural language queries** — ask about requests by date, type, ID, status.
- **Request creation via chat** — users can raise a purchase request through conversation.
- **Bulk procurement request creation** — create multiple requests in one chat session.
- **Public Tender workspace-based queries** — query tender data scoped to assigned workspaces.
- **Chat history with pagination** — prior conversations are preserved and browsable.
- **Mobile-optimized chat interface** — available on iOS/Android app.
- **Role-based access control** — users receive a "restricted module" message if they ask about something outside their role scope.
- **Security: deleted-record protection** — chatbot must not return data for deleted records (data leakage prevention).

### Roles

| Role                    | Access                                                              |
| ----------------------- | ------------------------------------------------------------------- |
| **Buyer / Requester**   | Query own requests; create requests; get workflow guidance          |
| **Procurement Manager** | Query all requests within workspace; get analytics                  |
| **Admin**               | Manage AI chatbot access per user/role; configure workspace mapping |

---

## 6.2 AI Negotiator

An AI-powered negotiation assistant that suggests optimal negotiated prices across multiple vendor line items during RFQ/RFP evaluation.

### Key capabilities

- **Per-line-item price negotiation suggestions** — AI recommends target prices for each line item.
- **Copied line item handling** — correctly handles scenarios where line items are duplicated with varied pricing.
- **Modify Order integration** — suggestions can feed into the order modification flow.
- **Error handling** — gracefully handles edge cases (empty line items, conflicting prices).

### Roles

| Role                         | Access                                                               |
| ---------------------------- | -------------------------------------------------------------------- |
| **Buyer / E-Source Manager** | Use AI Negotiator during RFQ/RFP offer evaluation and negotiation    |
| **Admin**                    | Enable/disable AI Negotiator feature per organization (feature flag) |

---

## Notes

- Both AI features are **feature-flag controlled** — not available in all organizations by default.
- AI Negotiator is relevant to the **E-Source / Negotiation** module; see `modules/e-sourcing.md#negotiation-and-revision`.
- Neither AI feature is currently represented in the automated test suite — status unverified.

---

## Cross-references

- Negotiation flow: `modules/e-sourcing.md`
- Mobile app: `modules/mobile-app.md`
- Feature flags: `modules/admin-users-roles.md#organisation-creation`
