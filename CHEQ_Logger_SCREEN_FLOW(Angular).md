# CHEQ Logger — Screen Flow (ASCII)

This document captures every screen, route, modal, dialog, and popup in the
CHEQ Logger web app, together with the navigation paths and behaviour rules
between them.

**Technology:** Angular  
**Data store:** Browser `localStorage` (key `cheq_logger_db_v5`) — no backend  
**Auth:** Client-side demo gate; user is always `admin` (canEdit + canManage = true)  
**Routing:** SPA with client-side path routing (`/`, `/cheques`, `/cheques/new`, `/cheques/:id`, `/admin`)

---

## Legend

```
[ Button ]        clickable button
[ field ]         text input field
[v]               dropdown / combobox / select
[x]               checkbox (ticked)
( )  (*)          radio button (unselected / selected)
[ 📅 ]            date-picker trigger
|col|             table / grid column separator
>>>               navigation / transition arrow
---               section divider
```

---

## 1. Application Shell (always visible on every route)

```
+-----------------------------------------------------------------------------------------------+
| [LV=]  CHEQ Logger  |  <Page Title>                          [ Close ]    [ Logout ]         |
+-----------------------------------------------------------------------------------------------+
|                                                                                               |
|                              <<< ACTIVE PAGE CONTENT >>>                                      |
|                                                                                               |
+-----------------------------------------------------------------------------------------------+
| [LV=]                                     Company Address Line 1                             |
|                                           Company Address Line 2                             |
+-----------------------------------------------------------------------------------------------+
```

**Header behaviour:**
- LV= logo is a link — clicking it always navigates back to `/` (Menu).
- `<Page Title>` resolves automatically from the current route:
  - `/` → **Menu**
  - `/cheques` or `/cheques/*` → **Cheque Register**
  - `/admin` → **Admin / Setup**
- **[ Close ]** — navigates back to `/` (Menu).
- **[ Logout ]** — clears all `localStorage` data and reloads the page (seed data wiped).

---

## 2. Menu (Dashboard) — route `/`

The primary landing screen. Provides a date range selector and the two main
entry points: Accounts report and New/Amend cheque log.

```
+---------------------------------------------+
|  Start Date                                 |
|  [ dd/MM/yyyy  📅 ]                          |
|                                             |
|  End Date                                   |
|  [ dd/MM/yyyy  📅 ]                          |
|  ------------------------------------------ |
|  [ Accounts     ]   (opens AccountsReport)  |
|  [ New / Amend  ]   (opens ChequeLogModal)  |
+---------------------------------------------+
```

**Date range:**
- Both dates persist across the whole app via a shared `DateRangeContext`.
- Changing either date immediately re-filters all report modals and the
  Cheque Register (they read from context).
- Clicking the calendar icon opens the **Date Picker Popover** (see §8).

**Navigation from Menu:**
```
[ Accounts    ]  >>>  §4 AccountsReportModal (overlaid)
[ New / Amend ]  >>>  §3 ChequeLogModal (overlaid)
Header nav bar  >>>  /cheques  (Cheque Register)
Header nav bar  >>>  /admin    (Admin / Setup)
```

---

## 3. ChequeLogModal — "Accounts Cheque Log"

Opened from the **Menu** → **[ New / Amend ]** button.
Full-screen-overlay modal, max-width 540 px, cannot be closed by clicking outside.

```
+------------------------------------------------------------------------+
| Accounts Cheque Log                                           [ × ]    |
+------------------------------------------------------------------------+
|  [ |< ]  [ < ]  [ > ]  [ >| ]   [ New ]      Ref: [ 31,008,389 ]      |
|  Find: [ search payee / cheque # / log ref _______  ]  (suggests ↓)   |
|  +------------------------------------------------------------------+  |
|  | ↓ suggestion 1 — payee / logRef                                  |  |
|  | ↓ suggestion 2                                                   |  |
|  |  … (up to 8)                                                     |  |
|  +------------------------------------------------------------------+  |
+------------------------------------------------------------------------+
|  Pay-in Slip No   [ ___________  ]   Issue Date   [ dd/MM/yyyy  📅 ]  |
|  Payee            [ ___________________________________ ]              |
|  Department       [ Select Department           [v] ]                  |
|  Account          [ Select Account              [v] ]                  |
|  Amount           [ £ 0.00 ↑↓ ]                                        |
|  Status           [ Outstanding / Cleared / Cancelled [v] ]           |
|  Cleared Date     [ dd/MM/yyyy  📅 ]   (shown only when Cleared)      |
|  Policy Ref       [ ___________________________________ ]              |
|  Notes            [ ___________________________________ ]              |
+------------------------------------------------------------------------+
|  Signed By  [ ____________ ]           [ Sign / Unsign ]              |
+------------------------------------------------------------------------+
|  (browse mode)  [ Edit ]   [ Close ]                                   |
|  (edit mode)    [ Save ]   [ Cancel ]   [ Close ]                      |
+------------------------------------------------------------------------+
```

### 3A. Toolbar — navigation and record indicator

| Control | Behaviour |
|---------|-----------|
| **[ \|< ]** | Jump to first cheque (index 0) |
| **[ < ]** | Previous cheque |
| **[ > ]** | Next cheque |
| **[ >\| ]** | Jump to last cheque |
| **[ New ]** | Enter New mode (blank form, auto-generated next Log Ref) |
| **Ref badge** | Displays the current cheque's `logRef` (read-only); shows pending next ref in New mode |

Cheques are sorted **numerically ascending by logRef**.

### 3B. Find / Search bar

- Accepts free text; filters on `logRef`, `chequeNumber`, `payee`, and `notes`.
- Up to **8 autocomplete suggestions** appear in a dropdown.
- Selecting a suggestion loads that cheque into the form and clears the search.
- Clicking outside the suggestion list dismisses it.

### 3C. Form fields

| Field | Notes |
|-------|-------|
| Pay-in Slip No | Maps to `chequeNumber`; free text |
| Issue Date | Date picker (dd/MM/yyyy) |
| Payee | Free text |
| Department | Combobox — active departments from store |
| Account | Combobox — active accounts from store; auto-defaults to account **843** |
| Amount | Numeric counter input with ± spinner |
| Status | `Outstanding` / `Cleared` / `Cancelled` |
| Cleared Date | Shown only when Status = **Cleared** |
| Policy Ref | Free text (optional) |
| Notes | Free text (optional) |
| Signed By | Free text below the divider; persisted to `signedBy` on the record |

### 3D. Sign / Unsign button

- **Sign** — enters the current user's ID into the Signed By field and saves immediately.
- **Unsign** — clears the Signed By field and saves immediately.
- Label toggles between **Sign** and **Unsign** depending on whether `signedBy` is populated.

### 3E. Edit / Save / Cancel / Close footer

```
Browse mode:   [ Edit ]             [ Close ]
Edit mode:     [ Save ]  [ Cancel ] [ Close ]
New mode:      [ Save ]  [ Cancel ] [ Close ]
```

- **[ Edit ]** — switches the form from read-only to editable (Edit mode).
- **[ Save ]** — persists changes; on New, auto-generates the next `logRef` and navigates to the new record.
- **[ Cancel ]** — in New mode, discards and navigates back to last saved cheque; in Edit mode, reloads the original values.
- **[ Close ]** — triggers the Exit Confirmation dialog (§3F).
- **[ × ]** header button — also triggers the Exit Confirmation dialog.
- Pressing **Escape** — also triggers the Exit Confirmation dialog.

### 3F. Exit Confirmation Dialog (sub-modal)

Appears when **[ Close ]**, **[ × ]**, or Escape is pressed.

```
+------------------------------+
| Information                  |
+------------------------------+
|  i   Exit now?               |
+------------------------------+
|               [ Yes ]  [ No ]|
+------------------------------+
```

- **[ Yes ]** — closes the Exit Confirmation and then closes the ChequeLogModal.
- **[ No ]** — dismisses the Exit Confirmation; the ChequeLogModal remains open.
- Clicking outside the dialog does nothing (outside-click dismiss is blocked).

---

## 4. AccountsReportModal — "Accounts Report"

Opened from the **Menu** → **[ Accounts ]** button.
Full-screen-overlay modal, A4-proportioned paged report preview.

```
+------------------------------------------------------------------------+
| Accounts Report                                               [ × ]    |
+------------------------------------------------------------------------+
|  [ |< ]  [ < ]  Page 1 / 2  [ > ]  [ >| ]   Zoom: [ 100% [v] ]       |
|  [ Print ]   [ Export ]                                                 |
+------------------------------------------------------------------------+
|  +------------------------------------------------------------------+  |
|  |                  ACCOUNTS CHEQUE LOG                            |  |
|  |      From: 01 June 2026      To: 22 June 2026                   |  |
|  |------------------------------------------------------------------|  |
|  |  Ref    | Date Rec'd | Drawer | Policy Name | Policy No |        |  |
|  |         |            |        | Cheque det. |           |        |  |
|  |---------|------------|--------|-------------|-----------|--------|  |
|  |  ...rows (from seed / localStorage data) ...                    |  |
|  |                                                                  |  |
|  |  Page 1 of 2                                                     |  |
|  +------------------------------------------------------------------+  |
+------------------------------------------------------------------------+
|                                               [ Close ]                |
+------------------------------------------------------------------------+
```

**Report columns:** Ref | Date Rec'd | Drawer | Policy Name/Cheque details |
Policy No | Amount | Account Credited | Payin Slip No | Signed Posted

**Zoom levels:** 50% · 75% · 100% · 125% · 150%

**Toolbar behaviour:**

| Control | Behaviour |
|---------|-----------|
| **[ \|< ]** | Jump to page 1 |
| **[ < ]** | Previous page |
| **[ > ]** | Next page |
| **[ >\| ]** | Jump to last page |
| Zoom `[v]` | Scales the A4 preview; default 100% |
| **[ Print ]** | Opens PrintDialog (§4A) |
| **[ Export ]** | Opens ExportDialog (§4B) |
| **[ × ]** / **[ Close ]** | Closes the modal |

### 4A. PrintDialog (sub-modal)

```
+------------------------------------------+
| Print                                    |
+------------------------------------------+
|  Printer:                                |
|  [ System Printer               [v] ]    |
|                                          |
|  Print Range                            |
|  (*) All                                 |
|  ( ) Pages  From: [ 1 ]  To: [ 1 ]      |
|                                          |
|  Copies:  [ 1 ↑↓ ]                       |
|  [x] Collate                             |
+------------------------------------------+
|                   [ Print ]  [ Cancel ]  |
+------------------------------------------+
```

- **Printer** — always "System Printer" (fixed; triggers `window.print()`).
- **Print Range** — All (default) or a page range.
- **Copies** — spinner; minimum 1.
- **Collate** — checkbox; checked by default.
- **[ Print ]** — executes `window.print()` and closes the dialog.
- **[ Cancel ]** — dismisses the dialog; returns to the AccountsReportModal.

### 4B. ExportDialog (sub-modal)

```
+------------------------------------------+
| Export                                   |
+------------------------------------------+
|  Format:                                 |
|  [ Acrobat Format (PDF)         [v] ]    |
|  (options: PDF, HTML 3.2, HTML 4.0,      |
|   MS Excel 97-2000, MS Excel (Data only),|
|   MS Word, Record style ×2, RTF, CSV,   |
|   Tab-separated text)                    |
|                                          |
|  Destination:                            |
|  [ Application                  [v] ]    |
|  (options: Application, Disk file,       |
|   Exchange Folder, Lotus Domino)         |
+------------------------------------------+
|                   [ OK ]     [ Cancel ]  |
+------------------------------------------+
```

- Choosing **MS Excel 97-2000** or **MS Excel 97-2000 (Data only)** as the format
  and clicking **[ OK ]** opens the **ExcelFormatDialog** (§4C) before finalising.
- All other formats: **[ OK ]** triggers a client-side download and closes the dialog.
- **[ Cancel ]** — returns to AccountsReportModal.
- Disabled/greyed formats: Crystal Reports (RPT), ODBC, Report Definition.

### 4C. ExcelFormatDialog (sub-modal, Excel path only)

```
+---------------------------------------------------+
| Excel Format Options                    [ × ]     |
+---------------------------------------------------+
|  +-- Excel Format --------------------------------+|
|  |  (*) Typical  — Data exported with default    ||
|  |                 options applied.              ||
|  |  ( ) Minimal  — Data exported with no         ||
|  |                 formatting applied.           ||
|  |  ( ) Custom   — Data exported according to    ||
|  |                 selected options.             ||
|  +------------------------------------------------+|
+---------------------------------------------------+
|                        [ OK ]       [ Cancel ]    |
+---------------------------------------------------+
```

- **[ OK ]** — applies the chosen Excel style, triggers download, closes both dialogs.
- **[ Cancel ]** — returns to ExportDialog.
- **[ × ]** — also returns to ExportDialog.

---

## 5. OutstandingReportModal — "Outstanding Cheques Report"

Accessible via navigation (linked from the Cheque Register or Menu if wired).
A4-proportioned paged report modal, same chrome as AccountsReportModal.

```
+------------------------------------------------------------------------+
| Outstanding Cheques Report                                    [ × ]    |
+------------------------------------------------------------------------+
|  [ |< ]  [ < ]  Page 1 / 2  [ > ]  [ >| ]   Zoom: [ 100% [v] ]       |
|  [ Print ]   [ Export ]                                                 |
+------------------------------------------------------------------------+
|  +------------------------------------------------------------------+  |
|  |           OUTSTANDING CHEQUES REPORT                            |  |
|  |      From: 01 June 2026      To: 22 June 2026                   |  |
|  |------------------------------------------------------------------|  |
|  | Ref      | Date Rec'd | Drawer | Policy Name | Policy No |      |  |
|  |          |            |        | Cheque det. |           |      |  |
|  |----------|------------|--------|-------------|-----------|------|  |
|  |  ...rows of outstanding cheques only ...                        |  |
|  |  Page 1 of 2                                                    |  |
|  +------------------------------------------------------------------+  |
+------------------------------------------------------------------------+
|                                               [ Close ]                |
+------------------------------------------------------------------------+
```

**Report columns:** Ref | Date Rec'd | Drawer | Policy Name/Cheque details |
Policy No | Amount | Account Credited | Payin Slip No | Signed Posted

Behaviour is identical to the AccountsReportModal (§4) with the same
Print (§4A), Export (§4B), and ExcelFormat (§4C) sub-dialogs.

---

## 6. Cheque Register — route `/cheques`

Full-page tabular view of all cheque records with live filters.

```
+-----------------------------------------------------------------------------------------------+
|  Cheque Register                                              [ New / Amend ]                 |
+-----------------------------------------------------------------------------------------------+
|  [ Search payee or cheque # 🔍 ]  [ Account [v] ]  [ Department [v] ]  [ Status [v] ]        |
+-----------------------------------------------------------------------------------------------+
|  Action | Date ↕ | Cheque # ↕ | Payee ↕ | Account ↕ | Dept ↕ | Amount ↕ | Status ↕ |        |
|---------+--------+-----------+---------+-----------+--------+----------+---------- |        |
|  View   | ...    | ...        | ...     | ...        | ...    |  £ ...   | ...      |        |
|  View   | ...    | ...        | ...     | ...        | ...    |  £ ...   | ...      |        |
|  ...                                                                                          |
+-----------------------------------------------------------------------------------------------+
```

**Filter bar:**

| Filter | Options |
|--------|---------|
| Search | Free text — matches payee name or cheque number (on Enter or blur) |
| Account | All Accounts · \<code\> – \<name\> per active account |
| Department | All Departments · \<code\> – \<name\> per active department |
| Status | All Statuses · Outstanding · Cleared · Cancelled |

Filters stack — all active simultaneously. Date range is inherited from the
shared `DateRangeContext` (set on the Menu screen).

**Grid behaviour:**
- All column headers are sortable (click = asc; click again = desc; third click = off).
- **View** link in the Action column navigates to `/cheques/:id` (Cheque Form, Edit).
- **[ New / Amend ]** button navigates to `/cheques/new` (Cheque Form, New).
  Button is disabled (with tooltip) when `canEdit = false`.
- Empty state shows "No cheques found."

**Navigation from Cheque Register:**
```
[ View ] link  >>>  §7 Cheque Form (/cheques/:id)
[ New / Amend ]  >>>  §7 Cheque Form (/cheques/new)
```

---

## 7. Cheque Form — routes `/cheques/new` and `/cheques/:id`

Full-page form for creating a new cheque or amending an existing one.

```
+-----------------------------------------------------------------------------------------------+
|  New Cheque  /  Amend Cheque                                [ Cancel ]                        |
+-----------------------------------------------------------------------------------------------+
|  +-----------------------------------------------------------------------------------------+  |
|  |  Cheque Number   [ _________________ ]   Issue Date   [ dd/MM/yyyy  📅 ]              |  |
|  |  Payee           [ _________________ ]   Amount       [ £ 0.00 ↑↓ ]                   |  |
|  |  Account         [ Select Account [v] ]  Department   [ Select Dept  [v] ]             |  |
|  |  Status          [ Outstanding     [v] ]                                               |  |
|  |  Cleared Date    [ dd/MM/yyyy  📅 ]    (visible only when Status = Cleared)            |  |
|  |  Notes           [ __________________________________________________ ]              |  |
|  |                                                                                         |  |
|  |                                                      [ Save Cheque / Update Cheque ]    |  |
|  +-----------------------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------------------+
```

**Fields:**

| Field | Required | Notes |
|-------|----------|-------|
| Cheque Number | Yes | Free text — Pay-in Slip No |
| Issue Date | No | Date picker |
| Payee | Yes | Free text |
| Amount | Yes | Numeric counter (£ GBP) |
| Account | No | Active accounts from store |
| Department | No | Active departments from store |
| Status | Yes | Outstanding / Cleared / Cancelled |
| Cleared Date | Conditional | Required when Status = Cleared |
| Notes | No | Free text, full width |

**Behaviour:**
- All fields disabled (read-only cursor) when `canEdit = false`; save button also disabled with tooltip.
- On `/cheques/new` — **[ Save Cheque ]** creates the record, shows a success toast, and redirects to `/cheques/:newId`.
- On `/cheques/:id` — **[ Update Cheque ]** patches the record and shows a success toast; stays on the same route.
- **[ Cancel ]** navigates back to `/cheques` without saving.
- Successful save invalidates all report and dashboard query caches so views refresh immediately.

**Navigation from Cheque Form:**
```
[ Save Cheque ]  >>>  /cheques/:newId  (same form, now in Amend mode)
[ Cancel ]       >>>  /cheques  (Cheque Register)
```

---

## 8. Admin / Setup — route `/admin`

Master-data management page for accounts and departments.

```
+-----------------------------------------------------------------------------------------------+
|  Admin / Setup                                                                                |
|  Manage system master data.                                                                   |
+-----------------------------------------------------------------------------------------------+
|  +-- Chart of Accounts -------------------+  +-- Departments -------------------------+      |
|  |  Accounts available for cheque         |  |  Departments available for cheque      |      |
|  |  allocation.                           |  |  allocation.                           |      |
|  |                                        |  |                                        |      |
|  |  Code  [ ______ ]  Name  [ _________ ]|  |  Code  [ ______ ]  Name  [ _________ ]|      |
|  |                       [ Add Account ] |  |                    [ Add Department ] |      |
|  |                                        |  |                                        |      |
|  |  Code | Name          | Active         |  |  Code | Name          | Active         |      |
|  |  -----+---------------+--------        |  |  -----+---------------+--------        |      |
|  |  843  | Main Account  | Yes            |  |  DEPT | Dept Name     | Yes            |      |
|  |  ...                                   |  |  ...                                   |      |
|  +----------------------------------------+  +----------------------------------------+      |
+-----------------------------------------------------------------------------------------------+
```

**Accounts panel:**
- **Code** and **Name** are free-text inputs.
- **[ Add Account ]** — saves the new account to the store; shows a success toast; refreshes the account list.
- All fields are disabled when `canManage = false`.
- Grid shows: Code | Name | Active (Yes/No).

**Departments panel:**
- Identical pattern to Accounts panel.
- **[ Add Department ]** saves and refreshes.

**Error handling:** if save fails, a destructive toast is shown with the error message.

---

## 9. Date Picker Popover

Triggered by clicking the calendar `📅` icon in any date field across the app
(Menu start/end dates, Cheque Form, ChequeLogModal, report modals).

```
Days view                        Months view                   Years view
+----------------------+         +----------------------+       +----------------------+
|  <   June 2026    >  |         |  <      2026      >  |       |  <  2025–2049     >  |
+----------------------+         +----------------------+       +----------------------+
| Mo Tu We Th Fr Sa Su |         |  Jan  Feb  Mar  Apr  |       |  2025  2026  2027    |
| 26 27 28 29 30 31  1 |         |  May  Jun  Jul  Aug  |       |  2028  2029  2030    |
|  2  3  4  5  6  7  8 |         |  Sep  Oct  Nov  Dec  |       |  ...                 |
|  9 10 11 12 13 14 15 |         +----------------------+       +----------------------+
| 16 17 18 19 20 21 22 |
| 23 24 25 26 27 28 29 |
| 30  1  2  3  4  5  6 |
+----------------------+
| [ Today ] [ Clear ]  |
+----------------------+
```

**Interaction:**
- Clicking the month/year header in Days view toggles to Months view.
- Clicking the year header in Months view toggles to Years view.
- **< / >** chevrons navigate backwards/forwards within the current view granularity.
- Selecting a day commits the date and closes the popover.
- **[ Today ]** sets today's date and closes.
- **[ Clear ]** empties the field and closes.
- Clicking outside the popover closes it without changing the value.

---

## 10. Screen Flow Map

```
[Menu / Dashboard]  (/route: /)
     |           |           |           |
     |           |     [Header logo / Close] --> back to /
     |           |     [Header Logout] --> clears localStorage --> reload
     |           |
     |--[ Accounts ]----> [AccountsReportModal]
     |                          |-- [Print] --> [PrintDialog]
     |                          |                  |-- [Print] --> window.print()
     |                          |                  |-- [Cancel] --> back to modal
     |                          |-- [Export] --> [ExportDialog]
     |                          |                  |-- (Excel format) --> [ExcelFormatDialog]
     |                          |                  |                        |-- [OK] --> download
     |                          |                  |                        |-- [Cancel] --> ExportDialog
     |                          |                  |-- [OK] --> download / close
     |                          |                  |-- [Cancel] --> back to modal
     |                          |-- [×] / [Close] --> close modal
     |
     |--[ New/Amend ]---> [ChequeLogModal]
     |                          |-- [|<][<][>][>|] --> navigate between records
     |                          |-- [New] --> blank form (New mode)
     |                          |-- Find bar --> autocomplete suggestions --> load record
     |                          |-- [Sign / Unsign] --> update signedBy in place
     |                          |-- [Edit] --> Edit mode
     |                          |-- [Save] --> persist, toast, stay in modal
     |                          |-- [Cancel] --> discard changes
     |                          |-- [Close] --> [Exit Confirmation Dialog]
     |                          |-- [×]     --> [Exit Confirmation Dialog]
     |                          |-- Escape  --> [Exit Confirmation Dialog]
     |                          |                  |-- [Yes] --> close modal
     |                          |                  |-- [No]  --> stay in modal
     |
     |--[Header nav]--> /cheques  [Cheque Register]
     |                          |-- Filters (search, account, dept, status) --> live re-filter grid
     |                          |-- [View] --> /cheques/:id  [Cheque Form — Amend]
     |                          |-- [New/Amend] --> /cheques/new  [Cheque Form — New]
     |                                                  |-- [Save Cheque] --> /cheques/:newId
     |                                                  |-- [Update Cheque] --> stay on /cheques/:id
     |                                                  |-- [Cancel] --> /cheques
     |
     |--[Header nav]--> /admin  [Admin / Setup]
                                |-- [Add Account]    --> create account, toast, refresh list
                                |-- [Add Department] --> create department, toast, refresh list
```

---

## 11. Data Model Summary

```
Account {
  id        : number  (auto-increment)
  code      : string  (e.g. "843")
  name      : string
  active    : boolean
}

Department {
  id        : number  (auto-increment)
  code      : string  (e.g. "DEPT01")
  name      : string
  active    : boolean
}

ChequeRecord {
  id          : number         (auto-increment)
  logRef      : string         (sequential numeric ref, e.g. "31008389")
  chequeNumber: string         (Pay-in Slip No)
  issueDate   : string         (yyyy-MM-dd)
  signedBy    : string | null
  payee       : string
  accountId   : number
  departmentId: number
  amount      : number         (GBP)
  status      : "outstanding" | "cleared" | "cancelled"
  clearedDate : string | null  (yyyy-MM-dd)
  policyRef   : string | null
  notes       : string | null
}
```

Seed data (populated once on first load):
- **1 account** — code `843`
- **12 departments**
- **8 cheques** — logRefs `31008389` → `31166764`, all dated in the current month

---

## 12. Role / Permission Matrix

| Action | canEdit required | canManage required |
|--------|:----------------:|:------------------:|
| Browse cheques (Register, Reports, Modal) | No | No |
| Create / amend a cheque | Yes | No |
| Sign / Unsign a cheque | Yes | No |
| Add an account | No | Yes |
| Add a department | No | Yes |

Demo user is always `admin`; both flags are always `true`.
Actions are gated (button disabled + tooltip) — never hidden.

---

## 13. Toast Notifications

Shown in the bottom-right corner. Auto-dismiss after a few seconds.

| Trigger | Toast |
|---------|-------|
| Cheque created successfully | "Cheque created successfully" |
| Cheque updated successfully | "Cheque updated successfully" |
| Error saving cheque | "Error saving cheque" + error message (destructive) |
| Account created | "Account created" |
| Department created | "Department created" |
| Error creating account/department | "Error" + error message (destructive) |
