# CHEQ Logger — Screen Flow (ASCII)

This document captures every screen, modal, dialog, and popup in the current
version of the CHEQ Logger web app, together with the navigation paths and
behaviour rules between them.

**Technology:** Angular  
**Data store:** Browser `localStorage` (key `cheq_logger_db_v5`) — no backend  
**Auth:** Client-side demo gate; user is always `admin` (canEdit + canManage = true)  
**Entry point:** `/` (Menu — the only navigable page; all features open as modals from here)

---

## Legend

```
[ Button ]        clickable button
[ field ]         text input field
[v]               dropdown / combobox / select
[x]               checkbox (ticked)
( )  (*)          radio button (unselected / selected)
[ 📅 ]            date-picker trigger
>>>               navigation / transition arrow
---               section divider
```

---

## 1. Application Shell (always visible)

```
+-----------------------------------------------------------------------------------------------+
| [LV=]  CHEQ Logger  |  Menu                                  [ Close ]    [ Logout ]         |
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
- **LV= logo** — clicking it navigates back to `/` (Menu).
- **[ Close ]** — navigates back to `/` (Menu).
- **[ Logout ]** — clears all `localStorage` data and reloads the page (seed data wiped, auth flag cleared).

---

## 2. Menu (Dashboard) — route `/`

The only page in the app. All features are accessed as overlaid modals from here.

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
- Changing either date immediately re-filters all report modals (they read from context).
- Clicking the calendar icon opens the **Date Picker Popover** (see §5).

**Navigation from Menu:**
```
[ Accounts    ]  >>>  §4 AccountsReportModal (overlaid)
[ New / Amend ]  >>>  §3 ChequeLogModal (overlaid)
```

---

## 3. ChequeLogModal — "Accounts Cheque Log"

Opened from **Menu** → **[ New / Amend ]**.
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
| **[ New ]** | Enter New mode — blank form, auto-generated next Log Ref |
| **Ref badge** | Displays the current cheque's `logRef` (read-only); shows pending next ref in New mode |

Cheques are sorted **numerically ascending by logRef**.

### 3B. Find / Search bar

- Accepts free text; matches on `logRef`, `chequeNumber`, `payee`, and `notes`.
- Up to **8 autocomplete suggestions** appear in a dropdown below the field.
- Selecting a suggestion loads that cheque into the form and clears the search.
- Clicking outside the suggestion list dismisses it.

### 3C. Form fields

| Field | Notes |
|-------|-------|
| Pay-in Slip No | Maps to `chequeNumber`; free text |
| Issue Date | Date picker (dd/MM/yyyy) |
| Payee | Free text |
| Department | Combobox — active departments from store |
| Account | Combobox — active accounts; auto-defaults to account **843** |
| Amount | Numeric counter input with ± spinner (£ GBP) |
| Status | `Outstanding` / `Cleared` / `Cancelled` |
| Cleared Date | Shown only when Status = **Cleared** |
| Policy Ref | Free text (optional) |
| Notes | Free text (optional) |
| Signed By | Free text; persisted to `signedBy` on the record |

### 3D. Sign / Unsign button

- **Sign** — writes the current user ID into Signed By and saves immediately.
- **Unsign** — clears Signed By and saves immediately.
- Label toggles based on whether `signedBy` is populated.

### 3E. Edit / Save / Cancel / Close footer

```
Browse mode:   [ Edit ]             [ Close ]
Edit mode:     [ Save ]  [ Cancel ] [ Close ]
New mode:      [ Save ]  [ Cancel ] [ Close ]
```

- **[ Edit ]** — switches the form to editable (Edit mode).
- **[ Save ]** — persists changes; on New, auto-generates the next `logRef`.
- **[ Cancel ]** — in New mode discards and returns to last saved cheque; in Edit mode reloads original values.
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

- **[ Yes ]** — closes the confirmation and then closes the ChequeLogModal.
- **[ No ]** — dismisses the confirmation; ChequeLogModal remains open.
- Clicking outside does nothing (outside-click dismiss is blocked).

---

## 4. AccountsReportModal — "Accounts Report"

Opened from **Menu** → **[ Accounts ]**.
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
|  Print Range                             |
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
|   MS Word, Record style ×2, RTF, CSV,    |
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

- Choosing **MS Excel 97-2000** or **MS Excel 97-2000 (Data only)** and clicking **[ OK ]**
  opens the **ExcelFormatDialog** (§4C) before finalising.
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

## 5. Date Picker Popover

Triggered by clicking the `📅` icon in any date field (Menu start/end dates,
ChequeLogModal issue/cleared dates).

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

- Clicking the month/year header in Days view → Months view.
- Clicking the year header in Months view → Years view.
- **< / >** chevrons navigate within the current view granularity.
- Selecting a day commits the date and closes the popover.
- **[ Today ]** sets today's date and closes.
- **[ Clear ]** empties the field and closes.
- Clicking outside closes without changing the value.

---

## 6. Screen Flow Map

```
[Menu / Dashboard]  (route: /)
     |
     |-- [Header logo] / [Close] ---------> back to /
     |-- [Logout] -----------------------> clears localStorage, reloads
     |
     |--[ Accounts ]----> [AccountsReportModal]
     |                          |
     |                          |-- [Print] -------> [PrintDialog]
     |                          |                        |-- [Print]   --> window.print(), close
     |                          |                        |-- [Cancel]  --> back to modal
     |                          |
     |                          |-- [Export] ------> [ExportDialog]
     |                          |                        |-- (Excel format selected)
     |                          |                        |     --> [ExcelFormatDialog]
     |                          |                        |             |-- [OK]     --> download, close
     |                          |                        |             |-- [Cancel] --> ExportDialog
     |                          |                        |-- [OK]     --> download, close
     |                          |                        |-- [Cancel] --> back to modal
     |                          |
     |                          |-- [×] / [Close] --> close modal
     |
     |--[ New/Amend ]---> [ChequeLogModal]
                               |
                               |-- [|<][<][>][>|] ---------> navigate records
                               |-- [New] ------------------> blank form, New mode
                               |-- Find bar + suggestions --> load selected record
                               |-- [Sign / Unsign] --------> update signedBy in place
                               |-- [Edit] -----------------> Edit mode
                               |-- [Save] -----------------> persist, toast
                               |-- [Cancel] ---------------> discard changes
                               |
                               |-- [Close] -+
                               |-- [×]      +--> [Exit Confirmation Dialog]
                               |-- Escape  -+         |-- [Yes] --> close modal
                                                       |-- [No]  --> stay in modal
```

---

## 7. Data Model Summary

```
Account {
  id        : number   (auto-increment)
  code      : string   (e.g. "843")
  name      : string
  active    : boolean
}

Department {
  id        : number   (auto-increment)
  code      : string
  name      : string
  active    : boolean
}

ChequeRecord {
  id           : number          (auto-increment)
  logRef       : string          (sequential numeric ref, e.g. "31008389")
  chequeNumber : string          (Pay-in Slip No)
  issueDate    : string          (yyyy-MM-dd)
  signedBy     : string | null
  payee        : string
  accountId    : number
  departmentId : number
  amount       : number          (GBP)
  status       : "outstanding" | "cleared" | "cancelled"
  clearedDate  : string | null   (yyyy-MM-dd)
  policyRef    : string | null
  notes        : string | null
}
```

Seed data (populated once on first load):
- **1 account** — code `843`
- **12 departments**
- **8 cheques** — logRefs `31008389` → `31166764`, all dated in the current month

---

## 8. Role / Permission Matrix

| Action | canEdit required | canManage required |
|--------|:----------------:|:------------------:|
| Browse cheques (ChequeLogModal, reports) | No | No |
| Create / amend a cheque | Yes | No |
| Sign / Unsign a cheque | Yes | No |

Demo user is always `admin`; both flags are always `true`.
Actions are gated (button disabled + tooltip) — never hidden.

---

## 9. Toast Notifications

Shown bottom-right, auto-dismiss after a few seconds.

| Trigger | Toast |
|---------|-------|
| Cheque created | "Cheque created successfully" |
| Cheque updated | "Cheque updated successfully" |
| Error saving cheque | "Error saving cheque" + message (destructive) |
