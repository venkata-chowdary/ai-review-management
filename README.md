# Local Business Review Platform

A QR review assistant and Google review management dashboard. The product name is still a working label. It is built with Next.js 16 (App Router, Cache Components), React 19, Tailwind CSS 4 and Supabase.

- Product plan: [masterplan_updated.md](masterplan_updated.md)
- Design system (the visual source of truth): [design-system/](design-system/README.md)
- Progress log: [docs/progress-log.md](docs/progress-log.md)
- Phase notes: [Phase 0 assessment](docs/phase-0-assessment.md), [Phase 1 UI](docs/phase-1-ui.md)

## Run it

```bash
npm install
npm run dev     # http://localhost:3000
```

The UI runs on sample data, so no `.env.local` is needed yet. The Supabase session refresh in `src/proxy.ts` is skipped until the Supabase variables are set.

## Local database

The schema lives in `supabase/migrations/` and is rebuilt from those files plus `supabase/seed.sql`. It needs Docker Desktop running.

```bash
npm run db:start    # starts local Supabase and prints the URL and keys for .env.local
npm run db:reset    # rebuilds the database from the migrations and the seed
npm run db:test     # runs the row level security tests in supabase/tests/database
npm run db:types    # regenerates src/lib/supabase/database.types.ts
```

Seed users: `owner-a@example.com` and `owner-b@example.com`, password `password123`. For a hosted project, run `npx supabase link` and then `npx supabase db push`. More detail is in [Phase 2 database](docs/phase-2-database.md).

## Routes

| Route | Screen |
|---|---|
| `/` | Overview home: action queue, KPIs, recent reviews, rating breakdown |
| `/reviews` | Inbox split: review list and detail with the AI draft. `?tab=`, `?q=`, `?id=` |
| `/insights`, `/qr-codes`, `/ai-replies`, `/locations`, `/billing`, `/settings` | Provisional screens composed from the design system |
| `/r/demo-downtown`, `/r/demo-riverside` | Public QR review page. `/r/demo-airport` shows the "AI paused" fallback, and `?ai=paused` forces it on any page |

The location picker writes `?loc=`. The Overview and Reviews pages filter by it, and navigation links keep it.

## Preview loading, empty and error states

In development, add `?state=loading`, `?state=empty` or `?state=error` to any dashboard page that loads data. For example, `/reviews?state=empty` shows the empty inbox. The override is ignored in production builds.

## Checks

```bash
npx next typegen && npx tsc --noEmit
npm run lint
npm run build
```
