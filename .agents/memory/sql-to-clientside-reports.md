---
name: SQL LEFT JOIN reports → client-side derivation
description: Preserving "show all master rows" behavior when porting SQL-backed reports to client-side aggregation
---

# Porting LEFT JOIN reports to client-side derivation

When a report was originally a SQL query that LEFT JOINs a master table (accounts,
departments, etc.) to a fact/transaction table, every master row appears in the
output — including ones with zero matching transactions (counts/totals = 0).

**Rule:** A naive client-side port that iterates only the transactions and lazily
creates a row per encountered key will silently DROP zero-activity master rows.
Instead, pre-seed one zero-initialized row per master entity first, then accumulate
matching transactions into those rows.

**Why:** Reproduces the LEFT JOIN contract; reports stay stable (e.g. a date range
with no activity for an account still shows that account at 0) and report pages that
only show an empty state when the whole result is empty keep behaving as before.

**How to apply:** For any "by-account"/"by-department" style summary derived in the
browser, loop the master list to build the row map before looping the filtered
transactions. Sort by code/name to match the original `ORDER BY`.
