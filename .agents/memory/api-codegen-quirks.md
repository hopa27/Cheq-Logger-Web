---
name: API codegen quirks (Orval + OpenAPI in this repo)
description: Non-obvious gotchas when consuming Orval-generated hooks/Zod schemas server- and client-side.
---

## Date query params are NOT coerced
Orval generates `z.date()` (not `z.coerce.date()`) for query parameters typed as `format: date` in the OpenAPI spec. HTTP query params always arrive as strings, so calling `SomeQueryParams.parse(req.query)` directly throws a 400 on any date filter.

**How to apply:** before parsing, convert date query fields to `Date` yourself, e.g. `Params.parse({ ...req.query, startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined })`. Path/body date schemas DO use coercion — this only bites query params.

## Server route HTTP method must match the generated client
The generated client picks its HTTP method from the spec (e.g. `updateCheque` → `PATCH`). If the Express route uses a different verb (e.g. `PUT`), typecheck passes but the call 404s at runtime.

**Why:** the contract is the spec; the server is just another consumer of it.
**How to apply:** when wiring a route, check the verb in `lib/api-spec/openapi.yaml` (or grep `method:` in the generated client) and match it exactly.

## replit-auth-web is a composite lib needing import.meta.env typing
`lib/replit-auth-web` uses `import.meta.env.BASE_URL`. When an artifact references it via tsconfig `references`, TS requires the lib to be `composite: true` (plus `declarationMap`/`emitDeclarationOnly`), and the lib needs its own ambient `env.d.ts` declaring `ImportMetaEnv`/`ImportMeta` (it has no Vite types of its own).
