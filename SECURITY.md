# Security & Abuse Protection

## Rate limiting

In-memory sliding-window rate limits protect API routes (per client IP):

| Endpoint | Limit |
|----------|-------|
| `POST /api/submit-audit` | 12 requests / minute |
| `POST /api/record-lead` | 8 requests / minute |
| `POST /api/share-report` | 6 requests / minute |

Implementation: `lib/rateLimit.ts`

For multi-instance production deployments, replace with Redis or edge rate limiting.

## Honeypot fields

Hidden `website` / `honeypot` fields are included on:

- Audit submission form (`AuditForm`)
- Lead capture modal (`LeadCaptureModal`)

Bots that fill these fields receive `422 Invalid submission` and are not processed.

## Data privacy on public reports

Public report URLs (`/report/[id]`) intentionally omit company name, role, and email. Only tool spend data, recommendations, and savings metrics are shown.
