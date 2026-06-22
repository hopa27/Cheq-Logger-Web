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

- Both dates persist via a shared context and filter all modals immediately.
- Clicking `📅` opens the **Date Picker Popover** (see §5).

```
[ Accounts    ]  >>>  §4 AccountsReportModal
[ New / Amend ]  >>>  §3 ChequeLogModal
```

---

## 3. ChequeLogModal — "Accounts Cheque Log"

Opened from **Menu** → **[ New / Amend ]**.
Overlay modal, max-width 540 px, cannot be closed by clicking outside.

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

### 3A. Toolbar

| Control | Behaviour |
|---------|-----------|
| **[ \|< ]** | Jump to first cheque |
| **[ < ]** | Previous cheque |
| **[ > ]** | Next cheque |
| **[ >\| ]** | Jump to last cheque |
| **[ New ]** | Blank form, auto-generated next Log Ref |
| **Ref badge** | Current cheque's `logRef` (read-only) |

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
| Policy Ref | Free text (optional) |
| Notes | Free text (optional) |
| Signed By | Free text; saved to `signedBy` on the record |

### 3D. Sign / Unsign

- **Sign** — writes the current user ID into Signed By and saves immediately.
- **Unsign** — clears Signed By and saves immediately.
- Label toggles depending on whether `signedBy` is populated.

### 3E. Footer buttons

```
Browse mode:   [ Edit ]             [ Close ]
Edit mode:     [ Save ]  [ Cancel ] [ Close ]
New mode:      [ Save ]  [ Cancel ] [ Close ]
```

- **[ Edit ]** — enables Edit mode.
- **[ Save ]** — persists changes; on New, auto-generates the next `logRef`.
- **[ Cancel ]** — in New mode discards and returns to last saved cheque; in Edit mode restores original values.
- **[ Close ]** / **[ × ]** / **Escape** — all trigger the Exit Confirmation dialog (§3F).

### 3F. Exit Confirmation Dialog

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
|  [ |< ]  [ < ]  Page 1 / 2  [ > ]  [ >| ]   Zoom: [ 100% [v] ]       |
|  [ Print ]   [ Export ]                                                 |
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

| Control | Behaviour |
|---------|-----------|
| **[ \|< ]** | Page 1 |
| **[ < ]** | Previous page |
| **[ > ]** | Next page |
| **[ >\| ]** | Last page |
| Zoom `[v]` | Scales the A4 preview; default 100% |
| **[ Print ]** | Opens PrintDialog (§4A) |
| **[ Export ]** | Opens ExportDialog (§4B) |
| **[ × ]** / **[ Close ]** | Closes the modal |

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
|                        [ OK ]       [ Cancel ]    |
+---------------------------------------------------+
```

- **[ OK ]** — triggers download, closes both dialogs.
- **[ Cancel ]** / **[ × ]** — returns to ExportDialog.

---

## 5. Date Picker Popover

Triggered by the `📅` icon in any date field (Menu dates, ChequeLogModal issue/cleared dates).

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
