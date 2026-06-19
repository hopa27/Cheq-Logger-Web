# CHEQ Logger

An internal web app for logging cheques and running cheque reports. It replaces a legacy Windows desktop tool (and its Citrix delivery). Staff pick a date range, then view Accounts / Department / Outstanding reports and create or amend individual cheques.

This is now a **fully static, client-side web app** (no API server, database, or SSO). All data lives in the browser (seed data + `localStorage`) and authentication is a client-side demo gate. It can be published as a static website.

## Run & Operate

- `pnpm --filter @workspace/cheq-logger run dev` — run the web app (Vite)
- `pnpm --filter @workspace/cheq-logger run build` — build the static site
- `pnpm --filter @workspace/cheq-logger run typecheck` — typecheck the web app
- `pnpm run typecheck` — full typecheck across all workspace packages
- No environment variables are required.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Web: React + Vite + wouter + TanStack Query + shadcn/ui
- Data: client-side store (seed data + `localStorage`); no backend
- Auth: client-side demo gate (no real SSO/OIDC)

## Where things live

- Client data store (seed data + localStorage CRUD): `artifacts/cheq-logger/src/lib/store.ts`
- Data hooks (TanStack Query wrappers over the store) + query-key helpers + `ChequeStatus`: `artifacts/cheq-logger/src/lib/local-data.ts`
- Client demo auth (`useAuth`, `AuthProvider`): `artifacts/cheq-logger/src/lib/local-auth.tsx`
- Date range context: `artifacts/cheq-logger/src/lib/date-context.tsx`
- Frontend pages: `artifacts/cheq-logger/src/pages/`, theme in `src/index.css`

## Architecture decisions

- The app has no server. Data hooks return data synchronously from a `localStorage`-backed store via TanStack Query, so existing `invalidateQueries` calls still refresh views. The store is seeded once (3 accounts, 4 departments, 8 cheques dated in the current month) under key `cheq_logger_db_v1`.
- Reports and the dashboard summary are derived client-side from the cheque/account/department data.
- Auth is a one-click client-side demo: signing in sets a flag in `localStorage` (`cheq_logger_auth_v1`); the demo user is always `admin`, so `canEdit` and `canManage` are true and every feature is usable. Logout clears the flag.
- Cheque amounts are numbers; dates are `yyyy-MM-dd` strings.

## Product

- Sign-in gate (client-side demo, one click — no password form).
- Dashboard with summary metrics and the legacy "Menu" workflow (date range + Accounts / Dept / O/S Cheques / New-Amend).
- Cheque register with filters (date range, account, department, status, search), plus create/amend.
- Reports: by account, by department, and outstanding cheques — all driven by a persistent date range.
- Admin page to manage accounts and departments.

## User preferences

- Build in React (chosen over the originally-mentioned Angular).
- Minimal, clean style; keep all menu options visible/active (gate actions by role, don't hide them).
- Do not use emojis in the UI.

## History

- Originally a full-stack app (Express API + PostgreSQL/Drizzle + Replit Auth SSO + OpenAPI codegen). On request, it was converted to a static client-side app: the `api-server` artifact and the `api-spec`, `api-client-react`, `api-zod`, `db`, and `replit-auth-web` libraries were removed, and the frontend was rewired to the local store/auth modules above.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
