# BACS Payments — Screen Flow (ASCII)

This document captures every screen, tab, modal, and dialog in the BACS
Payments web app, plus the navigation paths between them.

---

## 1. Application Shell (always visible)

```
+------------------------------------------------------------------------------------------------+
| [LV=]  BACS Payments for Liverpool Victoria Friendly Society Limited                [ Logout ] |
+------------------------------------------------------------------------------------------------+
| Completion Start: [ 23/04/2026 [v] ]   Completion End: [ 23/04/2026 [v] ]                      |
|                                              [ Show Payments ]   [ Print Report ]              |
+------------------------------------------------------------------------------------------------+
| [ Tax Free | First and One Off Payments | Processed | Parameters |                            |
|   Monthly Differences | Maturities | Reports | FirstPayments MCP | Processed MCP ]              |
+------------------------------------------------------------------------------------------------+
|                                                                                                |
|                              <<< ACTIVE TAB CONTENT >>>                                        |
|                                                                                                |
+------------------------------------------------------------------------------------------------+
| [LV=]                                Liverpool Victoria Friendly Society Limited,              |
|                                      County Gates, Bournemouth BH1 2NF                         |
+------------------------------------------------------------------------------------------------+
```

Legend: `[ Button ]`, `[ field ]`, `[v]` = dropdown / picker, `( )` radio, `[x]` checkbox.

---

## 2. Tab Layouts

### 2A. Tax Free
```
+------------------------------------------------------------------------------------------------+
| Bank Sort Code | Bank Acc No | 0 | TaxFreeCash | Bank Acc Name | Bank Ref | 99 | C_DATE | ... |
|----------------+-------------+---+-------------+---------------+----------+----+--------+-----|
|  ...rows...                                                                                    |
+------------------------------------------------------------------------------------------------+
| Payments: [____]                          Total Tax Free Cash: [_________]                     |
+------------------------------------------------------------------------------------------------+
|                                  [ Save To Bacs ]                                              |
+------------------------------------------------------------------------------------------------+
```

### 2B. First and One Off Payments
```
+------------------------------------------------------------------------------------------------+
| Sort Code | Acc No | 0 | Amount To Pay | Acc Name | Ref | 99 | BACS Date | Policy | Tax | ... |
|-----------+--------+---+---------------+----------+-----+----+-----------+--------+-----+-----|
|  ...rows...                                                                                    |
+------------------------------------------------------------------------------------------------+
| Payments: [____]   Total First Payments: [_________]   Total Tax: [_________]                  |
+------------------------------------------------------------------------------------------------+
|                  [ Save To Bacs ]   [ Save And Commit To BACS ]                                |
+------------------------------------------------------------------------------------------------+
```

### 2C. Processed
```
+------------------------------------------------------------------------------------------------+
| Start Run Month: [ 04/2026 [v] ]   End Run Month: [ 04/2026 [v] ]                              |
| Payment Type: [ All [v] ]   [x] Include non-PAYE cases                                         |
|                                              [ Show Payments ]   [ Print Report ]              |
+------------------------------------------------------------------------------------------------+
| Sort Code | Acc No | 0 | Amount To Pay | Acc Name | Ref | 99 | BACS Date | Policy | Tax | ... |
|-----------+--------+---+---------------+----------+-----+----+-----------+--------+-----+-----|
|  ...rows...                                                                                    |
+------------------------------------------------------------------------------------------------+
| Payments: [____] Total Net: [____] Total Gross: [____] Total Tax: [____]                       |
+------------------------------------------------------------------------------------------------+
|       [ Save To Bacs ]   [ Save And Commit To BACS ]   [ Save To CSV ]                         |
+------------------------------------------------------------------------------------------------+
```

`Payment Type` options: **B · C · T · R · All** (default **All**).

### 2D. Parameters
```
+------------------------------------------------------------------------------------------------+
| [ ▲ Insert ] [ ✓ Post ] [ ✗ Cancel ] [ ↻ Refresh ]                                              |
|                                                                                                 |
|   ARSTARTRUNMONTH                                                                               |
|   [ 01/05/2025 📅 ]                                                                             |
|                                                                                                 |
|   ARENDRUNMONTH                                                                                 |
|   [ 31/05/2025 📅 ]                                                                             |
|                                                                                                 |
|   ADSTARTRUNMONTH                                                                               |
|   [ 01/06/2025 📅 ]                                                                             |
|                                                                                                 |
|   ADENDRUNMONTH                                                                                 |
|   [ 24/06/2025 📅 ]                                                                             |
+------------------------------------------------------------------------------------------------+
|                  [ status: "Unsaved changes — click ✓ to save" / "Changes saved" ]              |
+------------------------------------------------------------------------------------------------+
```

Behavior:
* Editing a date stages a **draft** value (not yet committed).
* `✓ Post` commits all drafts → status reads *"Changes saved"*.
* `✗ Cancel` reverts drafts to last saved values → status reads *"Changes cancelled"*.
* `↻ Refresh` also reverts drafts and clears the status text.
* `▲ Insert` is reserved (no-op in this static recreation).
* `✓` and `✗` are disabled when there are no unsaved drafts.
* Whenever a date is edited:
  * If year ≥ 2026 → **ConfirmDialog** ("non-standard processing period") first; OK stages the change, Cancel keeps the previous draft.
  * Otherwise → the change is staged immediately and **InfoDialog** *"If you wish to save the change, please click on the tick button"* is shown.

### 2E. Monthly Differences
```
+------------------------------------------------------------------------------------------------+
| Start Run Month: [ 04/2026 [v] ]   End Run Month: [ 04/2026 [v] ]                              |
| [ Produce List ]   [ Produce Nil-Income List ]   [ Print Preview ]                             |
+------------------------------------------------------------------------------------------------+
| Policy No | Cur Date | Cur Ref | Cur Gross | Prev Date | Prev Ref | Prev Gross                 |
|-----------+----------+---------+-----------+-----------+----------+-----------                 |
|  ...rows...                                                                                    |
+------------------------------------------------------------------------------------------------+
```

### 2F. Maturities
```
+------------------------------------------------------------------------------------------------+
| Sort Code | Acc No | 0 | Amount | Acc Name | Ref | 99 | BACS Date | Policy                    |
|-----------+--------+---+--------+----------+-----+----+-----------+--------                    |
|  ...rows...                                                                                    |
+------------------------------------------------------------------------------------------------+
| Payments: [____]                          Total Maturity Payments: [_________]                 |
+------------------------------------------------------------------------------------------------+
|                            [ Save and Commit To Bacs ]                                         |
+------------------------------------------------------------------------------------------------+
```

### 2G. Reports
```
+------------------------------------------------------------------------------------------------+
| Start Run Month: [ 04/2026 [v] ]   End Run Month: [ 04/2026 [v] ]                              |
| [x] Include non-PAYE cases                                                                     |
|                                  [ Print First ]   [ Print Processed ]                         |
+------------------------------------------------------------------------------------------------+
```

### 2H. FirstPayments MCP
```
+------------------------------------------------------------------------------------------------+
| Sort Code | Acc No | 0 | Amount To Pay | Acc Name | Ref | 99 | BACS Date | Policy | Tax | ... |
|-----------+--------+---+---------------+----------+-----+----+-----------+--------+-----+-----|
|  ...rows...                                                                                    |
+------------------------------------------------------------------------------------------------+
| Payments: [____]   Total First Payments: [_________]   Total Tax: [_________]                  |
+------------------------------------------------------------------------------------------------+
|                  [ Save To Bacs ]   [ Save And Commit To BACS ]                                |
+------------------------------------------------------------------------------------------------+
```

### 2I. Processed MCP
```
+------------------------------------------------------------------------------------------------+
| Start Run Month: [ 04/2026 [v] ]   End Run Month: [ 04/2026 [v] ]                              |
| Payment Type: [ All [v] ]   [x] Include non-PAYE cases                                         |
+------------------------------------------------------------------------------------------------+
| Sort Code | Acc No | 0 | Amount To Pay | Acc Name | Ref | 99 | BACS Date | Policy | Tax | ... |
|-----------+--------+---+---------------+----------+-----+----+-----------+--------+-----+-----|
|  ...rows...                                                                                    |
+------------------------------------------------------------------------------------------------+
| Payments: [____]                          Total Tax Free Cash: [_________]                     |
+------------------------------------------------------------------------------------------------+
|                            [ Save And Commit To Bacs ]                                         |
+------------------------------------------------------------------------------------------------+
```

`Payment Type` options: **B · C · T · R · All** (default **All**).

---

## 3. Date Picker Popover (DateInput)

Triggered by clicking the calendar icon in any date field.

```
Days view                       Months view                    Years view
+--------------------+          +--------------------+         +--------------------+
| <  April 2026   >  |          | <     2026      >  |         | <  2025-2049    >  |
+--------------------+          +--------------------+         +--------------------+
| Mo Tu We Th Fr Sa Su          |  1   2   3   4    |         | 2025 2026 2027 ... |
| 30 31  1  2  3  4  5          |  5   6   7   8    |         | 2030 2031 2032 ... |
|  6  7  8  9 10 11 12          |  9  10  11  12    |         |    ...             |
| ...                           +--------------------+         +--------------------+
+--------------------+
```

Tap month name -> Months view. Tap year number -> Years view.

---

## 4. Modals & Dialogs

### 4A. Save As Dialog (Windows 11 File Explorer style)

Triggered from any *Save To Bacs / CSV / QRP* button or the **Save** icon
inside any print modal.

```
+--------------------------------------------------------------------------------------+
| Save As                                                              _   ▢   X       |
+--------------------------------------------------------------------------------------+
| < > ↑ ⟳   [📁 This PC > Ual3 (H:) > Annuities                ]   [🔍 Search ...   ]  |
+--------------------------------------------------------------------------------------+
| ⭐ Home                       | Name                  Date modified      Type        |
| 🖼️ Gallery                    |-------------------------------------------------------|
| ☁️ OneDrive       v           | 📁 2024 Tax Codes     15/03/2026 09:14   File folder|
| This PC                       | 📁 ANB Controls       02/04/2026 11:32   File folder|
|   🖥 Desktop                   | 📁 Annuity Archive... 21/01/2026 15:08   File folder|
|   📄 Documents                 | 📁 BACS               12/04/2026 09:02   File folder|
|   ⬇ Downloads                  |  ...                                                |
|   💽 Ual3 (H:)   [active]      |                                                     |
| 💻 Network                    |                                                     |
+--------------------------------------------------------------------------------------+
| File name:      [ Payments_Report.qrp                              ] [v]             |
| Save as type:   [ QuickReport file (*.QRP)                         ] [v]             |
+--------------------------------------------------------------------------------------+
| ▲ Hide Folders                                          [ Save ]   [ Cancel ]        |
+--------------------------------------------------------------------------------------+
```

`Save as type` is BACS / CSV / QRP depending on which button opened the
dialog. Clicking **Save** triggers a browser download with the chosen filename.

### 4B. Print Preview Modal (Monthly Differences)

```
+----------------------------------------------------------------------------------+
| Print Preview                                                              X     |
+----------------------------------------------------------------------------------+
| ⏮  ⏪   1 of 1+   ⏩  ⏭   |   🖨   💾   |  Zoom [100% v]                          |
|                                            Total: 3   Zoom: 100%   Showing: 3/3 |
+----------------------------------------------------------------------------------+
|     +------------------------------------------------------------------+         |
|     |                  Monthly Differences Report                       |         |
|     |                                                23/04/2026         |         |
|     |  Policy | Ref | Paykey |   Current   |  Previous  | Pay |  %      |         |
|     |---------+-----+--------+-------------+------------+-----+---------|         |
|     |  ...rows                                                          |         |
|     +------------------------------------------------------------------+         |
+----------------------------------------------------------------------------------+
```

* 🖨 (toolbar) → browser print of the report area.
* 💾 → Save As Dialog (file type **QRP**).
* Window header `X` closes the modal.

### 4C. Report Print Modal (Tax Free / First Payments / Maturities / MCP)

```
+----------------------------------------------------------------------------------+
| Report                                                                     X     |
+----------------------------------------------------------------------------------+
| ⤢ ⤡ ⛶  | ⏮ ⏪  Page 1 / N  ⏩ ⏭ |  ⚙ Printer Setup   🖨   💾   📂              |
+----------------------------------------------------------------------------------+
|     +------------------------------------------------------------------+         |
|     |  {Title}: {Date Range}                                            |         |
|     |  ...table...                                                      |         |
|     |  Totals: Count, Net, Gross, Tax                                   |         |
|     |                                                                   |         |
|     |  Checked by: ............         Authorised by: ............    |         |
|     +------------------------------------------------------------------+         |
+----------------------------------------------------------------------------------+
```

* ⚙ → Print Dialog
* 🖨 → browser print
* 💾 → Save As Dialog (QRP)
* 📂 → **Load Report Dialog** (Win11 Open dialog, lists previously saved `.qrp` files)
* Window header `X` closes the modal.
* Zoom-to-Width / Zoom-to-Fit calculations leave a 2px buffer so no horizontal scrollbar appears in those modes.

### 4D. Print Dialog (classic look, opened by ⚙ Printer Setup)

```
+--------------------------------------------------------+
| Print                                              X   |
+--------------------------------------------------------+
| Printer ----------------------------------------------+|
|  Name:    [ Microsoft Print to PDF      v ]  [ Properties ] |
|  Status:  Ready                                       |
|  Type:    Microsoft Print to PDF                      |
|  Where:   PORTPROMPT:                                 |
|  Comment:                                             |
| -----------------------------------------------------+|
| Print range -----------------+ Copies ----------------|
| (•) All                      | Number of copies: [1] |
| ( ) Pages from [_] to [_]    | [x] Collate           |
| ( ) Selection                |   [📄][📄] [📄][📄]   |
| -----------------------------+----------------------+|
|                                    [ OK ]   [ Cancel ]|
+--------------------------------------------------------+
```

### 4E. First Payment Report Modal / Processed Report Modal

Opened from the **Reports** tab via *Print First* / *Print Processed*.
Same toolbar as Report Print Modal (⏮⏪⏩⏭, ⚙, 🖨, 💾, 📂 Load Report). All
actions are in the toolbar; the modal is closed via the header `X` button.
The body renders the appropriate report layout.

### 4E-bis. Load Report Dialog (`LoadReportDialog`)

Opened from the 📂 toolbar button in any Print/Report preview modal
(Print Preview, Report Print, First Payment Report, Processed Report).
Visually mirrors the Save As dialog — a Windows 11 File Explorer
"Open" window.

```
+----------------------------------------------------------------------+
| Load Report                                          ▁  ▢  ✕         |
+----------------------------------------------------------------------+
| ←  →  ↑  ↻ | This PC > Ual3 (H:) > Annuities > Reports |  🔍 Search |
+----------------------------------------------------------------------+
| ⭐ Home          | Name                          | Date modified |...|
| 🖼 Gallery       | 📄 Monthly_Differences_Mar... | 31/03/2026    |...|
| ☁ OneDrive       | 📄 Tax_Free_Payments_Apr...   | 15/04/2026    |...|
|   This PC        | 📄 First_Payments_Apr2026.qrp | 14/04/2026    |...|
|   ▸ Desktop      | 📄 Maturities_Mar2026.qrp     | 28/03/2026    |...|
|   ▸ Documents    | 📄 MCP_Payments_Q1_2026.qrp   | 02/04/2026    |...|
|   ▸ Downloads    | 📄 Processed_Payments_Apr...  | 20/04/2026    |...|
|   ▸ Ual3 (H:) ●  | ...                                                |
| 🖥 Network        |                                                    |
+----------------------------------------------------------------------+
| File name:      [_____________________________________] [v]          |
| Files of type:  [ QuickReport file (*.QRP)              v]           |
+----------------------------------------------------------------------+
| Browse this computer...                       [ Open ]   [ Cancel ]  |
+----------------------------------------------------------------------+
```

* Single-click a row → selects it and fills the *File name* field.
* Double-click a row → loads it immediately and closes the dialog.
* **Browse this computer...** → opens an OS file picker scoped to
  `.qrp` files; the picked file is read with `File.text()` and passed
  to the parent via `load.emit({ fileName: name, content })`.
* **Open** → loads the selected/typed name (no content) via
  `load.emit({ fileName: name })` and closes.
* Header `X` or **Cancel** closes without loading.

> Static-app note: the listed files are mock entries for visual
> fidelity. Real loading is supported only through *Browse this
> computer...*; the parent modal currently consumes the emitted
> `load` event but does not yet replace its rendered report from the
> loaded content.

### 4F. Information Dialog (`InfoDialog` / "DoBacs")

```
+----------------------------------+
| DoBacs                       X   |
+----------------------------------+
|  ℹ  No data found.               |
|                                  |
|                       [  OK  ]   |
+----------------------------------+
```
Used for: "No Data", "Dates in past", "Nil-Income list empty",
"From and To date should not be in past date to save the BACS file."

### 4G. Confirm Dialog (`ConfirmDialog`)

Used by the **Parameters** tab when a date with year ≥ 2026 is entered
(non-standard processing period).

```
+------------------------------------------------+
| Confirm                                    X   |
+------------------------------------------------+
|  ❓  The date entered is for a non-standard     |
|      processing period. Is this correct?       |
|                                                |
|                       [  OK  ]   [ Cancel ]    |
+------------------------------------------------+
```

* Style follows the LVE design language (navy `#00263e` title bar,
  white card, pill OK/Cancel buttons in brand blues).
* `OK` stages the new date in the draft (then InfoDialog "click ✓ to
  save" appears).
* `Cancel` (or header X) discards the change — the previous draft
  value is kept.

### 4H. Warning Dialog (Commit / Exclude already-committed)

```
+--------------------------------------------------+
| BACS Payments                                X   |
+--------------------------------------------------+
|  ⚠  Some of the payments have already been       |
|     committed. Would you like to exclude them?   |
|                                                  |
|                              [ Yes ]   [ No ]    |
+--------------------------------------------------+
```

---

## 5. Navigation / Flow Diagrams

### 5.1 Show Payments / Print Report (header buttons)

```
   [ Show Payments ]                          [ Print Report ]
        │                                            │
        ▼                                            ▼
  Warning Dialog ──No──▶ (no action)         Warning Dialog ──No──▶ (no action)
        │ Yes                                       │ Yes
        ▼                                            ▼
   Active tab grid                            Report Print Modal
   populated                                    │   │   │
                                                │   │   └─▶ 💾 Save As Dialog (QRP)
                                                │   └─────▶ 🖨 Browser Print
                                                └────────▶ ⚙ Print Dialog
```

### 5.2 Save To Bacs / Save To CSV (per-tab buttons)

```
      [ Save To Bacs ]                         [ Save To CSV ]
            │                                         │
            ▼                                         ▼
    (disabled if no data)                    (disabled if no data)
            │                                         │
            ▼                                         ▼
    Date-in-past check                       Save As Dialog (CSV)
            │                                         │
   ┌────────┴─────────┐                               ▼
   ▼                  ▼                       Browser Download
 Info Dialog     Save As Dialog
 (past date)     (BACS) ─▶ Browser Download
```

### 5.3 Save And Commit To BACS

```
   [ Save And Commit To BACS ]
            │
            ▼
   tab has data? ──No──▶ Info Dialog ("No BACS payments present.")
            │ Yes
            ▼
   commit conflict? ──Yes──▶ Warning Dialog ──Yes──▶ proceed
            │ No                            └─No───▶ cancel
            ▼
   Info Dialog ("From and To date should not be in past date...")
```

### 5.4 Monthly Differences

```
  [ Produce List ] ────────▶ grid populated
  [ Produce Nil-Income List ] ▶ Info Dialog (no records)
  [ Print Preview ] ────────▶ Print Preview Modal
                                    │
                                    ├─▶ 🖨 Browser Print
                                    └─▶ 💾 Save As Dialog (QRP)
```

### 5.5 Parameters tab

```
  Edit a date in any of the 4 fields
        │
        ▼
   year >= 2026 ? ──Yes──▶ ConfirmDialog ──Cancel──▶ keep previous draft
        │ No                       │ OK
        ▼                          ▼
   stage value into draft  ◀──── stage value into draft
        │                          │
        ▼                          ▼
   InfoDialog "click ✓ to save"   InfoDialog "click ✓ to save"
        │
        ▼
  [ ✓ Post ]   ──▶ commit drafts → status: "Changes saved"
  [ ✗ Cancel ] ──▶ revert drafts  → status: "Changes cancelled"
  [ ↻ Refresh ]──▶ revert drafts  → clear status
  [ ▲ Insert ] ──▶ (reserved, no-op)
```

### 5.6 Reports tab

```
  [ Print First ] ─────────▶ First Payment Report Modal
  [ Print Processed ] ─────▶ Processed Report Modal
                                    │
                                    ├─▶ ⚙ Print Dialog
                                    ├─▶ 🖨 Browser Print
                                    └─▶ 💾 Save As Dialog (QRP)
```

### 5.6 Date Picker

```
  [ DD/MM/YYYY 📅 ]
        │
        ▼
   Days view ◀──┐
        │       │ (header click)
        ▼       │
   Months view ─┤
        │       │
        ▼       │
   Years view ──┘
```

---

## 6. Cross-cutting Components

| Component (Angular selector)              | Triggered By                                     | Result                                                  |
|-------------------------------------------|--------------------------------------------------|---------------------------------------------------------|
| Save As Dialog (`<app-save-as-dialog>`)   | Save To Bacs / CSV, 💾 in any print modal        | Filename + folder browse, then browser download         |
| Print Dialog (`<app-print-dialog>`)       | ⚙ in any print modal                             | Mock printer settings (informational only)              |
| Browser Print                             | 🖨 in any print modal                            | `inject(DOCUMENT).defaultView?.print()` of report area  |
| Info Dialog (`<app-info-dialog>`)         | No-data, past-date, nil-income, save-failure, "click ✓ to save" reminder in Parameters | OK button to dismiss                  |
| Confirm Dialog (`<app-confirm-dialog>`)   | Parameters tab — date with year ≥ 2026           | OK stages the date as draft; Cancel reverts             |
| Warning Dialog (`<app-warning-dialog>`)   | Show Payments, Print Report, Commit conflicts    | Yes / No, branches to next action or cancels            |
| Load Report Dialog (`<app-load-report-dialog>`) | 📂 in any print modal                      | Loads `.qrp` file via mock list or Browse this computer |
