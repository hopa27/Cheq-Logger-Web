# CHEQ Logger — Screen Flow (ASCII)

This document captures every screen, modal, dialog, and popup reachable in the
current version of the CHEQ Logger web app, together with the navigation paths
and behaviour rules between them.

**Technology:** Angular  
**Entry point:** `/` — the only navigable page; all features open as modals from here.

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

- **LV= logo** — clicking it navigates back to `/` (Menu).
- **[ Close ]** — navigates back to `/` (Menu).
- **[ Logout ]** — clears all `localStorage` data and reloads the page.

---

## 2. Menu — route `/`

The only page in the app. All features open as modals from here.

```
+---------------------------------------------+
|  Start Date                                 |
|  [ dd/MM/yyyy  📅 ]                          |
|                                             |
|  End Date                                   |
|  [ dd/MM/yyyy  📅 ]                          |
|  ------------------------------------------ |
|  [ Accounts    ]   (opens AccountsReport)   |
|  [ New / Amend ]   (opens ChequeLogModal)   |
+---------------------------------------------+
```

- Both dates default to **empty** on first load (placeholder `DD/MM/YYYY`).
- Both dates persist via a shared context and filter all modals immediately.
- Clicking `📅` opens the **Date Picker Popover** (see §5).

**Accounts button — validation guard:**

```
[ Accounts ] clicked
       |
       +-- Start Date OR End Date is empty?
       |          YES  →  Date Error Dialog (see §2A)
       |          NO   →  open AccountsReportModal (see §4)
```

```
[ Accounts    ]  >>>  §4 AccountsReportModal  (only when both dates are filled)
[ New / Amend ]  >>>  §3 ChequeLogModal
```

### 2A. Date Error Dialog

Shown when **Accounts** is clicked with either date field empty.

```
+------------------------------------------+
| Error                          [ × ]      |
+------------------------------------------+
|  [ X ]  Missing or invalid date range!   |
+------------------------------------------+
|                   [ OK ]                 |
+------------------------------------------+
```

| Element | Detail |
|---------|--------|
| Title bar | Navy `#00263e`, label "Error" |
| Icon | Red circle `#d72714` with white ✕ |
| Message | "Missing or invalid date range!" (Mulish 14px) |
| OK button | Primary; closes dialog; returns focus to Menu |
| Clicking outside | Not applicable — modal blocks interaction |

---

## 3. ChequeLogModal — "Accounts Cheque Log"

Opened from **Menu** → **[ New / Amend ]**.
Overlay modal, max-width 540 px, cannot be closed by clicking outside.

```
+------------------------------------------------------------------------+
| Accounts Cheque Log                                           [ × ]    |
+------------------------------------------------------------------------+
|  Ref: [ 31,008,389 ]          [ New ] | [ |< ]  [ < ]  1 of 8  [ > ]  [ >| ]  |
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
|  Signed By  [ ____________ ]           [ Sign ]                       |
+------------------------------------------------------------------------+
|  (browse mode)  [ Edit ]   [ Close ]                                   |
|  (edit mode)    [ Save ]   [ Cancel ]   [ Close ]                      |
+------------------------------------------------------------------------+
```

### 3A. Toolbar

| Position | Control | Behaviour |
|----------|---------|-----------|
| Left | **Ref badge** | Current cheque's `logRef` (read-only); shows pending next ref in New mode |
| Centre | **[ New ]** | Blank form, auto-generated next Log Ref |
| Right | **[ \|< ]** | Jump to first cheque |
| Right | **[ < ]** | Previous cheque |
| Right | **1 of N** | Current position indicator |
| Right | **[ > ]** | Next cheque |
| Right | **[ >\| ]** | Jump to last cheque |

Cheques are sorted numerically ascending by logRef.

### 3B. Find / Search bar

- Matches on `logRef`, `chequeNumber`, `payee`, and `notes`.
- Up to **8 autocomplete suggestions** appear in a dropdown.
- Selecting a suggestion loads that cheque and clears the search.
- Clicking outside the list dismisses it.

### 3C. Form fields

| Field | Notes |
|-------|-------|
| Pay-in Slip No | Free text (`chequeNumber`) |
| Issue Date | Date picker |
| Payee | Free text |
| Department | Combobox — active departments |
| Account | Combobox — active accounts; defaults to **843** |
| Amount | Numeric counter with ± spinner (£ GBP) |
| Status | Outstanding / Cleared / Cancelled |
| Cleared Date | Visible only when Status = Cleared |
| Policy Ref | Free text (optional). Demo trigger: entering `123` and clicking **Save** shows the Policy Ref Error dialog (§3F) and blocks save. |
| Notes | Free text (optional) |
| Signed By | Read-only display of the signer ID; set by the **Sign** button |

### 3D. Sign (one-way)

Signing is **permanent** — once a cheque is signed it cannot be unsigned or re-signed.

| State | Button icon | Button title | Clicking |
|-------|------------|--------------|---------|
| Not signed | `MdEdit` | "Sign" | Sets `signedBy = "UAT3"`; field updates immediately |
| Signed | `MdEditOff` | "Signed" | Shows **Re-sign Blocked dialog** (§3E); field unchanged |

- The button is disabled (`opacity-40`) when the form is in read-only (view) mode.
- `signedBy` is stored as `"UAT3"` (the demo user ID) and persisted on **Save**.

### 3E. Re-sign Blocked dialog

Shown when the Sign button is clicked on an already-signed cheque.

```
+------------------------------------------+
| Information                    [ × ]      |
+------------------------------------------+
|  i   You cannot re-sign a cheque!        |
+------------------------------------------+
|                   [ OK ]                 |
+------------------------------------------+
```

| Element | Detail |
|---------|--------|
| Title bar | Navy `#00263e`, label "Information" |
| Icon | Blue `i` (`#006cf4`, 22px) |
| Message | "You cannot re-sign a cheque!" (Mulish 13px) |
| OK button | Primary; closes dialog; no change to the record |
| Clicking outside | Blocked |

### 3F. Policy Ref Error dialog

Shown when **Save** is clicked while Policy Ref contains `123` (demo trigger for invalid reference).

```
+------------------------------------------+
| Cheque Log                     [ × ]      |
+------------------------------------------+
|  Policy Reference should either be       |
|  blank or valid number.                  |
+------------------------------------------+
|                   [ OK ]                 |
+------------------------------------------+
```

| Element | Detail |
|---------|--------|
| Title bar | Navy `#00263e`, label "Cheque Log" |
| Message | "Policy Reference should either be blank or valid number." (Mulish 13px) |
| OK button | Primary; closes dialog **and clears the Policy Ref field** |
| Clicking outside | Blocked |
| Save | Blocked until Policy Ref is changed or emptied |

### 3G. Footer buttons

```
Browse mode:   [ Edit ]             [ Close ]
Edit mode:     [ Save ]  [ Cancel ] [ Close ]
New mode:      [ Save ]  [ Cancel ] [ Close ]
```

- **[ Edit ]** — enables Edit mode.
- **[ Save ]** — validates Policy Ref (§3F) first; persists changes; on New, auto-generates the next `logRef`.
- **[ Cancel ]** — in New mode discards and returns to last saved cheque; in Edit mode restores original values.
- **[ Close ]** / **[ × ]** / **Escape** — all trigger the Exit Confirmation dialog (§3H).

### 3H. Exit Confirmation Dialog

```
+------------------------------+
| Information                  |
+------------------------------+
|  i   Exit now?               |
+------------------------------+
|               [ Yes ]  [ No ]|
+------------------------------+
```

- **[ Yes ]** — closes both dialogs.
- **[ No ]** — returns to ChequeLogModal.
- Clicking outside does nothing.

---

## 4. AccountsReportModal — "Accounts Report"

Opened from **Menu** → **[ Accounts ]**.
Overlay modal with A4-proportioned paged report preview.

```
+------------------------------------------------------------------------+
| Accounts Report                                               [ × ]    |
+------------------------------------------------------------------------+
|  [ |< ]  [ < ]  1 of 2  [ > ]  [ >| ]  |  [ Print ]  [ Export ]  |  [ 100% [v] ]  |  Total: 68  |
+------------------------------------------------------------------------+
|  +------------------------------------------------------------------+  |
|  |                  ACCOUNTS CHEQUE LOG                            |  |
|  |      From: 01 June 2026      To: 22 June 2026                   |  |
|  |------------------------------------------------------------------|  |
|  |  Ref  | Date Rec'd | Drawer | Policy Name/Cheque det. | Pol No  |  |
|  |-------|------------|--------|-------------------------|---------|  |
|  |  ... rows ...                                                    |  |
|  |  Page 1 of 2                                                     |  |
|  +------------------------------------------------------------------+  |
+------------------------------------------------------------------------+
|                                               [ Close ]                |
+------------------------------------------------------------------------+
```

**Report columns:** Ref | Date Rec'd | Drawer | Policy Name/Cheque details |
Policy No | Amount | Account Credited | Payin Slip No | Signed Posted

**Zoom levels:** 50% · 75% · 100% · 125% · 150%

| Order | Control | Behaviour |
|-------|---------|-----------|
| 1 | **[ \|< ]** | Jump to page 1 |
| 2 | **[ < ]** | Previous page |
| 3 | **1 of 2** | Current page indicator |
| 4 | **[ > ]** | Next page |
| 5 | **[ >\| ]** | Last page |
| — | *divider* | |
| 6 | **[ Print ]** | Opens PrintDialog (§4A) |
| 7 | **[ Export ]** | Opens ExportDialog (§4B) |
| — | *divider* | |
| 8 | Zoom `[v]` | Scales the A4 preview; default 100% |
| — | *divider* | |
| 9 | **Total: N** | Total row count (read-only label) |
| — | **[ × ]** / **[ Close ]** | Closes the modal (header / footer) |

### 4A. PrintDialog

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

- **[ Print ]** — triggers `window.print()` and closes the dialog.
- **[ Cancel ]** — returns to AccountsReportModal.

### 4B. ExportDialog

```
+------------------------------------------+
| Export                                   |
+------------------------------------------+
|  Format:                                 |
|  [ Acrobat Format (PDF)         [v] ]    |
|  (PDF, HTML 3.2, HTML 4.0,               |
|   MS Excel 97-2000, MS Excel Data only,  |
|   MS Word, Record style ×2, RTF, CSV,    |
|   Tab-separated text)                    |
|                                          |
|  Destination:                            |
|  [ Application                  [v] ]    |
|  (Application, Disk file,                |
|   Exchange Folder, Lotus Domino)         |
+------------------------------------------+
|                   [ OK ]     [ Cancel ]  |
+------------------------------------------+
```

- Selecting **MS Excel 97-2000** or **MS Excel 97-2000 (Data only)** and clicking
  **[ OK ]** → opens ExcelFormatDialog (§4C).
- All other formats: **[ OK ]** triggers download and closes.
- **[ Cancel ]** — returns to AccountsReportModal.
- Greyed out: Crystal Reports (RPT), ODBC, Report Definition.

### 4C. ExcelFormatDialog

```
+---------------------------------------------------+
| Excel Format Options                    [ × ]     |
+---------------------------------------------------+
|  +-- Excel Format --------------------------------+|
|  |  (*) Typical  — default options applied.      ||
|  |  ( ) Minimal  — no formatting applied.        ||
|  |  ( ) Custom   — selected options applied.     ||
|  +------------------------------------------------+|
+---------------------------------------------------+
| [ Options >>> ]          [ Cancel ]    [ OK ]     |
+---------------------------------------------------+
```

| Button | Position | Action |
|--------|----------|--------|
| **[ Options >>> ]** | Footer left | Closes ExcelFormatDialog and returns to ExportDialog (same as Cancel) |
| **[ Cancel ]** | Footer right | Closes ExcelFormatDialog and returns to ExportDialog |
| **[ OK ]** | Footer right | Triggers download; closes ExcelFormatDialog and ExportDialog |
| **[ × ]** | Title bar right | Closes ExcelFormatDialog and returns to ExportDialog |

---

## 5. Date Picker Popover

Triggered by the `📅` icon in any date field (Menu dates, ChequeLogModal issue/cleared dates).

### 5A. Typed input behaviour

The text input accepts **digits only** — letters are silently blocked. Slashes are inserted automatically as the user types:

```
User types   →   Field shows
1            →   1
19           →   19
196          →   19/6      (slash auto-inserted at position 3)
1906         →   19/06
19062        →   19/06/2   (slash auto-inserted at position 6)
19062026     →   19/06/2026  (date committed to context)
```

Month clamping rules (enforced in real time):

| Typed month digit | Rule | Example |
|---|---|---|
| First digit > 1 | Clamped to `1` | typing `3` → stored as `1` |
| First digit = `1`, second digit > 2 | Clamped to `2` | `13` → `12` |
| All other combinations | Accepted as-is | `09`, `12` |

The date is committed to the context only when all 8 digits form a valid calendar date. Clearing the field fires `onChange("")`.

### 5B. Calendar popover

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

- Header click in Days view → Months view; header click in Months view → Years view.
- **< / >** navigate within the current granularity.
- Clicking a day commits the date and closes.
- **[ Today ]** sets today and closes. **[ Clear ]** empties the field and closes.
- Clicking outside closes without changing the value.

---

## 6. Screen Flow Map

```
[Menu]  (route: /)
  |
  |-- [LV= logo] / [Close] -----> back to /
  |-- [Logout] -----------------> clear localStorage, reload
  |
  |--[ Accounts ]----> [AccountsReportModal]
  |                        |-- [Print]  --> [PrintDialog]
  |                        |                   |-- [Print]   --> window.print(), close
  |                        |                   |-- [Cancel]  --> back to modal
  |                        |-- [Export] --> [ExportDialog]
  |                        |                   |-- (Excel) --> [ExcelFormatDialog]
  |                        |                   |                   |-- [OK]     --> download, close
  |                        |                   |                   |-- [Cancel] --> ExportDialog
  |                        |                   |-- [OK]     --> download, close
  |                        |                   |-- [Cancel] --> back to modal
  |                        |-- [×] / [Close] --> close modal
  |
  |--[ New/Amend ]---> [ChequeLogModal]
                           |-- [|<][<][>][>|] --> navigate records
                           |-- [New]           --> blank form, New mode
                           |-- Find bar        --> suggestions --> load record
                           |-- [Sign/Unsign]   --> update signedBy in place
                           |-- [Edit]          --> Edit mode
                           |-- [Save]          --> persist, toast
                           |-- [Cancel]        --> discard changes
                           |
                           |-- [Close] -+
                           |-- [×]      +--> [Exit Confirmation]
                           |-- Escape  -+        |-- [Yes] --> close modal
                                                  |-- [No]  --> stay in modal
```
