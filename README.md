# Credex Audit

Production-grade AI spend audit platform for startups. Enter subscriptions, get deterministic savings recommendations, and share a public founder report at `/audit/[id]`.

## Features

- Multi-tool audit form with autosave (debounced `localStorage`)
- Deterministic audit engine (plan fit, seats, overlap, API credits)
- Optional Anthropic executive summary with 4s timeout + fallback
- Public share pages with Open Graph / Twitter cards
- Lead capture modal (alerts, consultation, email share)
- Supabase persistence + local fallback for offline demos
- Rate limiting + honeypot abuse protection

## Quick start

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical URLs for share links & OG |
| `NEXT_PUBLIC_SUPABASE_URL` | For DB | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | For DB | Public anon key (read audits) |
| `SUPABASE_SERVICE_ROLE_KEY` | For DB writes | Insert audits & leads |
| `ANTHROPIC_API_KEY` | Optional | AI executive summary |
| `RESEND_API_KEY` | Optional | Transactional email |
| `RESEND_FROM_ADDRESS` | Optional | Verified sender domain |

Note: Without `SUPABASE_SERVICE_ROLE_KEY` the app will still generate audits but they are saved only to your browser `localStorage` (IDs prefixed with `local-`). Shareable public pages across devices require a configured Supabase project.

## Supabase schema

Run in the Supabase SQL editor:

```sql
create table if not exists audits (
  id uuid primary key default gen_random_uuid(),
  company_name text,
  role text,
  team_size int,
  total_monthly numeric not null,
  total_annual numeric not null,
  total_savings numeric not null,
  efficiency_score numeric not null,
  recommendations jsonb not null default '[]',
  tool_breakdowns jsonb default '[]',
  benchmarks jsonb,
  summary_text text,
  report_data jsonb not null default '[]',
  created_at timestamptz default now()
);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  report_id text not null,
  email text not null,
  company text,
  role text,
  team_size int,
  intent text default 'alerts',
  created_at timestamptz default now()
);

alter table audits enable row level security;
create policy "Public read audits" on audits for select using (true);
```

## Share URL architecture

1. User submits form → `POST /api/submit-audit`
2. Engine runs synchronously; summary uses fallback immediately, AI races in ≤4s
3. Audit saved to Supabase → UUID `id`
4. User redirected to `/audit/[id]`
5. Public page is a **Server Component** (`app/audit/[id]/page.tsx`) with `revalidate = 3600`
6. `toPublicAudit()` strips `company_name`, `role`, email fields
7. Legacy `/report/[id]` redirects to `/audit/[id]`

**Incognito sharing** requires Supabase. Local-only IDs (`local-*`) work in the same browser via `localStorage`.

## API routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/submit-audit` | POST | Generate audit + persist |
| `/api/record-lead` | POST | Lead capture + email |
| `/api/share-report` | POST | Email shareable report |
| `/api/audit-summary` | POST | Refresh AI summary only |

## Scripts

```bash
npm run dev        # Development
npm run build      # Production build
npm run start      # Production server
npm run lint       # ESLint
npm run typecheck  # TypeScript
npm test           # Vitest (audit engine)
```

## Troubleshooting

- Blank page after generating an audit: ensure you're using the same browser session that created the audit if Supabase is not configured (local-only IDs start with `local-`). If Supabase is configured and you still see a blank page, check server logs for errors and verify `SUPABASE_SERVICE_ROLE_KEY` is set in the environment used by the Next server.
- AI summary missing: Anthropic requests time out after 4s — a deterministic summary is always available as a fallback.
- Rate limit errors: the app enforces 12 audit requests / minute per IP.

If you want me to run the app or the test suite in this workspace, tell me and I'll run the relevant commands and share any errors.

## Performance notes

- Landing page is a Server Component (minimal client JS)
- Public report uses `dynamic()` for `ReportDetail`
- `next/font` Inter with `display: swap`
- Debounced form persistence (450ms)
- Reduced global CSS transitions & blur on mobile
- `optimizePackageImports` for `lucide-react`

Target Lighthouse: Performance ≥85, Accessibility ≥90, Best Practices ≥90.

## Security

See [SECURITY.md](./SECURITY.md) for rate limits and honeypot details.

## Supabase architecture

| Module | Key | Use |
|--------|-----|-----|
| `lib/supabase/client.ts` | `NEXT_PUBLIC_*` anon | Public reads (`fetchAuditById`) |
| `lib/supabase/server.ts` | `SUPABASE_SERVICE_ROLE_KEY` | API writes only (server-only) |

The service role key is **never** imported from client components or `lib/supabase/client.ts`.

## Project structure

```
app/
  audit/           # Form (/audit) + public share (/audit/[id])
  api/             # submit-audit, record-lead, share-report, audit-summary
components/
  audit/           # AuditForm
  report/          # ReportDetail, LeadCaptureModal, hero, breakdown cards
  ui/              # Button, Card, Toast, Modal, Select
lib/
  supabase/        # client.ts (anon) + server.ts (admin, server-only)
  auditEngine, benchmarks, email, reports, rateLimit
```

## Assignment compliance checklist

- [x] Working optimization alerts CTA + lead modal
- [x] Copy share URL with toast
- [x] Public `/audit/[id]` page (Supabase + local fallback)
- [x] Open Graph + Twitter metadata
- [x] Form persistence
- [x] Loading / empty / error states
- [x] Rate limit + honeypot
- [x] No PII on public share view
