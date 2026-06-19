---
name: First-user-admin RBAC bootstrap
description: How to safely promote the first signed-in user to admin without a race.
---

When there is no admin-seeding mechanism, a common pattern is to promote the very first user to sign in to `admin`. The naive `SELECT count(*)` then insert-with-role approach is race-prone: two concurrent first sign-ins can both observe an empty table and both become admin.

**Rule:** serialize the check+insert with a transaction-scoped Postgres advisory lock: inside `db.transaction(...)`, run `select pg_advisory_xact_lock(<constant>)`, then count, then upsert. The lock auto-releases at commit, so only one first sign-in can win.

**Why:** advisory locks are cheap and don't require an extra bootstrap table; the xact-scoped variant guarantees release even on rollback.
**How to apply:** never overwrite an existing user's role on subsequent logins (keep manual role changes sticky) — only set role at insert time.
