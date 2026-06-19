---
name: react-day-picker v9 API
description: v9 removed v8 component/classNames keys; custom calendars must use the new API or typecheck fails.
---

react-day-picker installed here is v9.x. It is NOT API-compatible with the v8 patterns most shadcn/AI-generated calendars assume.

**Why:** A generated LVE calendar used v8 (`components.IconLeft/IconRight`, `components.Caption`, classNames `head_row`/`head_cell`/`nav_button`/`day_selected`/`day_today`/`day_outside`/`cell`). These fail typecheck in v9 (`'IconLeft' does not exist in CustomComponents`, untyped `displayMonth`).

**How to apply:** When building/fixing a DayPicker-based calendar in this repo:
- v9 nav components: single `Chevron` (with `orientation`), not `IconLeft`/`IconRight`. To skip nav entirely, pass `hideNavigation` and render your own header.
- v9 caption: `MonthCaption` (not `Caption`); hide the default with classNames key `month_caption: "hidden"`.
- v9 classNames keys: `months`, `month`, `month_caption`, `weekdays`, `weekday`, `week`, `day` (the cell), `day_button` (the inner button), and modifier keys `selected`/`today`/`outside`/`disabled`/`hidden` (applied to the day cell). The v8 keys (`head_row`, `head_cell`, `nav_button`, `day_selected`, `day_today`, `day_outside`, `cell`, `row`) no longer exist.
- To style the selected/today *button*, target the child from the modifier class on the cell, e.g. `selected: "[&>button]:bg-... [&>button]:!text-white"`.
- For a multi-view (days/months/years) calendar, the simplest robust path is to hand-build the months and years grids and the days-view header yourself, and let DayPicker render only the day grid with `hideNavigation`.
