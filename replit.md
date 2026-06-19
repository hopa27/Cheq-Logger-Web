# CHEQ Logger

An internal web app for logging cheques and running cheque reports. It replaces a legacy Windows desktop tool (and its Citrix delivery) with single sign-on and role-based access. Staff pick a date range, then view Accounts / Department / Outstanding reports and create or amend individual cheques.

## Run & Operate

- `pnpm --filter @workspace/cheq-logger run dev` — run the web app (Vite)
- `pnpm --filter @workspace/api-server run dev` — run the API server
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run typecheck:libs` — build/typecheck composite libs only
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL`, `SESSION_SECRET` (auth)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Web: React + Vite + wouter + TanStack Query + shadcn/ui
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Auth: single sign-on (OpenID Connect) via `@workspace/replit-auth-web` + session cookies
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)

## Where things live

- API contract (source of truth): `lib/api-spec/openapi.yaml` — regenerate hooks/schemas after edits
- Generated React Query hooks + types: `@workspace/api-client-react`
- Generated Zod schemas (server validation): `@workspace/api-zod`
- DB schema: `lib/db/src/schema/` (`auth.ts`, `accounts.ts`, `departments.ts`, `cheques.ts`)
- Auth web hook: `lib/replit-auth-web` (`useAuth()`)
- API routes: `artifacts/api-server/src/routes/` (one file per resource)
- RBAC middleware: `artifacts/api-server/src/lib/permissions.ts`
- Frontend pages: `artifacts/cheq-logger/src/pages/`, theme in `src/index.css`

## Architecture decisions

- Roles (`admin`/`editor`/`viewer`) live on the `users` table as a `role` column; the auth user table is otherwise managed by the auth template. `canEdit` = editor|admin, `canManage` = admin.
- The very first user to sign in is promoted to `admin` (serialized by a transaction-scoped Postgres advisory lock so concurrent first sign-ins can't both win). Roles are never overwritten on subsequent logins.
- RBAC is enforced server-side (`requireEdit` for cheque create/amend, `requireManage` for accounts/departments). The UI shows all controls but disables gated actions per the user's "all options active" requirement.
- Cheque amounts are stored as `numeric` and converted to numbers in API responses; dates are stored as `date` and sent/received as strings.
- Cheque update uses HTTP `PATCH /cheques/:id` to match the generated client.
- Date query params are coerced to `Date` before Zod validation (generated query schemas use non-coercing `z.date()`).

## Product

- Sign-in gate (SSO, no password form).
- Dashboard with summary metrics and the legacy "Menu" workflow (date range + Accounts / Dept / O/S Cheques / New-Amend).
- Cheque register with filters (date range, account, department, status, search), plus create/amend.
- Reports: by account, by department, and outstanding cheques — all driven by a persistent date range.
- Admin page to manage accounts and departments (admin only).

## User preferences

- Build in React (chosen over the originally-mentioned Angular).
- Minimal, clean style; keep all menu options visible/active (gate actions by role, don't hide them).
- Do not use emojis in the UI.

## Gotchas

- Edit `lib/api-spec/openapi.yaml` first, then run codegen — do not hand-edit generated files.
- After lib changes, run `pnpm run typecheck:libs` before leaf artifact typechecks.
- `lib/replit-auth-web` is a composite lib; it needs `import.meta.env` typing (see `src/env.d.ts`).

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
