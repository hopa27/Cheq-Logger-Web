# BACS Payments — Application Digest

## 1. Application

| Field         | Value                                                                                                                                                                                                                |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Name          | BACS Payments                                                                                                                                                                                                        |
| Version       | 1.0.0                                                                                                                                                                                                                |
| Type          | Static web app (no backend) — recreation of legacy Windows desktop tool                                                                                                                                              |
| Description   | Liverpool Victoria Friendly Society Limited internal tool for previewing, validating, exporting and committing BACS payment files across 9 tabs (8 payment workflows plus a Parameters tab). Built with Angular, deployable as a static site. |
| Framework     | Angular 17 (standalone components, signals) + TypeScript                                                                                                                                                                                         |
| Styling       | Tailwind CSS (configured via `tailwind.config.ts`, applied through component-scoped SCSS in each `*.component.scss`; global resets in `src/styles.scss`)                                                                                          |
| Icons         | `@ng-icons/material-icons` (Material Design) — registered per-component via `provideIcons({ matInsertDriveFile, matHelpOutline, ... })` and rendered with `<ng-icon name="matInsertDriveFile">`                                                   |
| PDF / QRP     | `jspdf` + `html2canvas` (wrapped in Angular services); custom QRP serializer in `src/app/lib/save-qrp.ts`                                                                                                                                          |
| Routing       | Single-page, tabbed (`MatTabsModule` from Angular Material — `<mat-tab-group>` / `<mat-tab>`); no `RouterModule` needed                                                                                                                            |
| Forms         | Angular `FormsModule` two-way binding (`[(ngModel)]`) for date / text inputs; no `ReactiveFormsModule` required                                                                                                                                    |
| Build         | Angular CLI (`ng build`) → static `dist/bacs-payments/browser/` output (esbuild via `@angular-devkit/build-angular:application`)                                                                                                                   |
| Change det.   | `ChangeDetectionStrategy.OnPush` on every standalone component; reactive updates driven by `signal()` / `computed()` / `effect()`                                                                                                                  |
| DI            | Standalone APIs only — `bootstrapApplication(AppComponent, { providers: [provideAnimations(), provideHttpClient(), ...] })` in `src/main.ts`                                                                                                       |

### Fonts

- **Heading:** Livvic
- **Body:** Mulish

### Brand colors

| Token         | Hex        | Usage                                |
| ------------- | ---------- | ------------------------------------ |
| primary_blue  | `#04589b`  | Secondary button border / text       |
| deep_blue     | `#003578`  | Hover fill for both button variants  |
| navy          | `#00263e`  | Header bar, modal title bars         |
| accent_blue   | `#006cf4`  | Primary buttons                      |
| title_blue    | `#002f5c`  | Report titles, table header text     |
| gray_border   | `#BBBBBB`  | Modal / card borders                 |
| text          | `#3d3d3d`  | Body text                            |
| muted         | `#979797`  | Disabled button border / text        |
| row_zebra     | `#e7ebec34`| Alternate table rows                 |

---

## 2. Global Components

### 2.1 Header (`BacsHeaderComponent`, selector `app-bacs-header`, `src/app/components/bacs-header/bacs-header.component.ts`)

```yaml
selector: app-bacs-header
sticky: false
background: "#00263e"
height: 64px
left:
  - logo: "LV="
  - title: "BACS Payments for Liverpool Victoria Friendly Society Limited"
right:
  - logout_button: { shape: pill, variant: outline-on-dark, output: "(logout)=onLogout()" }
inputs: []
outputs: [logout (EventEmitter<void>)]
```

### 2.2 Global Filters Bar (visible on all tabs, rendered by `BacsPaymentsComponent`)

```yaml
background: white
elements:
  - completion_start_date: { control: "<app-date-input [(value)]=\"completionStart\" format=\"dd/mm/yyyy\">" }
  - completion_end_date:   { control: "<app-date-input [(value)]=\"completionEnd\" format=\"dd/mm/yyyy\">" }
  - show_payments_button:  { variant: secondary, action: "(click)=openCommitWarning() -> WarningDialog -> populate active grid" }
  - print_report_button:   { variant: secondary, action: "(click)=openPrintWarning()  -> WarningDialog -> ReportPrintModal" }
```

### 2.3 Tab Bar (`<mat-tab-group [(selectedIndex)]="activeTab">` with one `<mat-tab>` per entry)

1. Tax Free
2. First and One Off Payments
3. Processed
4. Parameters
5. Monthly Differences
6. Maturities
7. Reports
8. FirstPayments MCP
9. Processed MCP

### 2.4 Footer (`BacsFooterComponent`, selector `app-bacs-footer`)

- Left: `LV=` logo
- Right: *Liverpool Victoria Friendly Society Limited, County Gates, Bournemouth BH1 2NF*

---

## 3. Screens (Tabs)

### 3.1 Tax Free

- **Columns:** Bank Sort Code · Bank Account No · `0` · TaxFreeCash · Bank Account Name · Bank Ref · `99` · C_DATE · Policy No · Tax
- **Totals bar:** Payments · Total Tax Free Cash
- **Actions:**
  - **Save To Bacs** — primary, disabled when no data → `SaveAsDialog (BACS)`

### 3.2 First and One Off Payments

- **Columns:** Sort Code · Acc No · `0` · Amount To Pay · Acc Name · Bank Ref · `99` · BACS Date · Policy No · Tax · Hash · Pay Method
- **Totals bar:** Payments · Total First Payments · Total Tax
- **Actions:**
  - **Save To Bacs** — primary, disabled when no data → `SaveAsDialog (BACS)`
  - **Save And Commit To BACS** — primary, disabled when no data → `handleSaveCommitBacs`

### 3.3 Processed

- **Tab filters:** Start Run Month · End Run Month · Payment Type *(B / C / T / R / All — default All)* · `[x] Include non-PAYE cases` · Show Payments · Print Report
- **Columns:** standard 12-column payment grid
- **Totals bar:** Payments · Total Net · Total Gross · Total Tax
- **Actions:**
  - **Save To Bacs** — disabled when `!showProcessed` → `openSaveAs(BACS)`
  - **Save And Commit To BACS** — disabled when `!showProcessed` → `handleSaveCommitBacs`
  - **Save To CSV** — disabled when `!showProcessed`, when enabled opens `SaveAsDialog (CSV)` **directly** (no preceding info dialog, no date check)

### 3.4 Parameters

A "system parameters" editor that mirrors the legacy desktop screen. Four
date fields are edited as a **draft** and committed via the toolbar.

- **Toolbar:**
  - `▲ Insert` — reserved (no-op in this static recreation)
  - `✓ Post` — commits all draft values; status reads *"Changes saved"*; disabled until there are unsaved drafts
  - `✗ Cancel` — reverts drafts to last-saved values; status reads *"Changes cancelled"*; disabled until there are unsaved drafts
  - `↻ Refresh` — reverts drafts to last-saved values and clears the status text
- **Fields (stacked label above input):**
  - `ARSTARTRUNMONTH` — default `01/05/2025`
  - `ARENDRUNMONTH`   — default `31/05/2025`
  - `ADSTARTRUNMONTH` — default `01/06/2025`
  - `ADENDRUNMONTH`   — default `24/06/2025`
- **Status field (read-only, centered below card):**
  - shows *"Unsaved changes — click ✓ to save"* whenever drafts ≠ committed
  - otherwise shows the most recent action ("Changes saved" / "Changes cancelled" / empty)
- **Per-edit behavior:**
  - Year ≥ 2026 → `ConfirmDialog` ("non-standard processing period") first; OK stages the change, Cancel reverts
  - Year < 2026 → change is staged immediately and `InfoDialog` *"If you wish to save the change, please click on the tick button"* is shown

### 3.5 Monthly Differences

- **Tab filters:** Start Run Month · End Run Month
- **Buttons:**
  - **Produce List** → populate grid
  - **Produce Nil-Income List** → `InfoDialog` (no records)
  - **Print Preview** → `PrintPreviewModal`
- **Columns:** Policy No · Current Date · Current Ref · Current Gross · Previous Date · Previous Ref · Previous Gross

### 3.6 Maturities

- **Columns:** 9-column maturity grid
- **Totals bar:** Payments · Total Maturity Payments
- **Actions:** **Save and Commit To Bacs**

### 3.7 Reports

- **Tab filters:** Start Run Month · End Run Month · `[x] Include non-PAYE cases`
- **Buttons:**
  - **Print First** → `FirstPaymentReportModal`
  - **Print Processed** → `ProcessedReportModal`

### 3.8 FirstPayments MCP

- **Columns:** standard 12-column payment grid
- **Totals bar:** Payments · Total First Payments · Total Tax
- **Actions:** **Save To Bacs** · **Save And Commit To BACS**

### 3.9 Processed MCP

- **Tab filters:** Start Run Month · End Run Month · Payment Type *(B / C / T / R / All — default All)* · `[x] Include non-PAYE cases`
- **Buttons:** **Show Payments** · **Print Report** (Print Report → InfoDialog "No Data found" until payments are shown)
- **Columns:** standard 12-column payment grid
- **Totals bar:** Payments · Total Tax Free Cash
- **Actions:** **Save And Commit To Bacs**

---

## 4. Modals & Dialogs

### 4.1 DateInput (`DateInputComponent`, selector `app-date-input`, `src/app/components/date-input/date-input.component.ts`)

```yaml
selector: app-date-input
inputs:
  - "value: string                    // dd/mm/yyyy, two-way bindable via [(value)]"
  - "format: 'dd/mm/yyyy'             // display format"
  - "variant: 'inline' | 'stacked'    // 'stacked' renders the label above the input"
  - "label?: string"
outputs:
  - "valueChange: EventEmitter<string>   // enables [(value)] banana-in-a-box"
host_bindings: "[class.is-stacked]=\"variant() === 'stacked'\""
```

| View   | Layout                                                                |
| ------ | --------------------------------------------------------------------- |
| Days   | Mon–Sun grid; out-of-month days shown with hatching                   |
| Months | 3 × 4 grid `1..12`; entered by clicking the month name in Days view   |
| Years  | 5 × 5 grid range; entered by clicking the year in Months view         |

### 4.2 SaveAsDialog — Windows 11 File Explorer (`src/app/components/save-as-dialog/save-as-dialog.component.ts`)

```yaml
style: Windows 11 File Explorer (Segoe UI Variable, Fluent)
width: 860px
triggers:
  - any "Save To Bacs" / "Save To CSV" button
  - 💾 toolbar button in any print modal
title_bar:
  text: "Save As"
  controls: [minimize, maximize, close (red hover)]
toolbar:
  nav: [Back, Forward (disabled), Up, Refresh]
  breadcrumb: "📁 This PC > Ual3 (H:) > Annuities"
  search: "Search Annuities"
left_nav:
  - Home
  - Gallery
  - OneDrive (expanded)
  - This PC:
      - Desktop
      - Documents
      - Downloads
      - Music
      - Pictures
      - Videos
      - "OS (C:)"
      - "Ual3 (H:)  [active]"
  - Network
file_list:
  columns: [Name, Date modified, Type, Size]
  selection_color: "#cfe4f7"
footer:
  - file_name: "input + dropdown chevron"
  - save_as_type:
      QRP:  "QuickReport file (*.QRP)"
      BACS: "BACS file (*.BACS)"
      CSV:  "Comma Separated Values (*.CSV)"
  - hide_folders_toggle
  - actions: [Save (primary blue), Cancel]
save: "@Output() save = new EventEmitter<string>()  // emits filename; parent writes blob download"
inputs:  [open: boolean, type: 'BACS' | 'CSV' | 'QRP']
outputs: [save (EventEmitter<string>), cancel (EventEmitter<void>)]
```

### 4.2b LoadReportDialog — Windows 11 Open Dialog (`src/app/components/load-report-dialog/load-report-dialog.component.ts`)

```yaml
style: Windows 11 File Explorer "Open" (mirrors SaveAsDialog visuals)
width: 860px
triggers:
  - 📂 "Load Report" toolbar button in:
      - PrintPreviewModal
      - ReportPrintModal
      - FirstPaymentReportModal
      - ProcessedReportModal
title_bar:
  text: "Load Report"
  controls: [minimize, maximize, close (red hover)]
toolbar:
  nav: [Back, Forward (disabled), Up, Refresh]
  breadcrumb: "📁 This PC > Ual3 (H:) > Annuities > Reports"
  search: "Search Reports"
left_nav: same as SaveAsDialog
file_list:
  columns: [Name, Date modified, Type, Size]
  rows: mock list of 9 saved *.qrp report files
  icon: "📄 <ng-icon name=\"matInsertDriveFile\"> (blue)"
  interactions:
    single_click: select row + fill File name field
    double_click: load + close
  selection_color: "#cfe4f7"
footer:
  - file_name: input + dropdown chevron (placeholder: "Select a saved report or browse...")
  - files_of_type: "QuickReport file (*.QRP)" (display only)
actions:
  - "Browse this computer..."  -> hidden <input type=file accept=".qrp"> -> reads File.text() and emits load.emit({ fileName, content })
  - Open   (primary blue)      -> emits load.emit({ fileName }) for selected/typed filename
  - Cancel                     -> emits cancel
load: "@Output() load = new EventEmitter<{ fileName: string; content?: string }>()"
inputs:  [open: boolean]
outputs: [load (EventEmitter<{fileName, content?}>), cancel (EventEmitter<void>)]
notes:
  - Static app: mock entries are visual only; real content arrives only via "Browse this computer..."
  - Parent modals currently consume the emitted event but do not yet swap their rendered report from loaded QRP content.
```

### 4.3 PrintPreviewModal (`src/app/components/print-preview-modal/print-preview-modal.component.ts`)

Used by **Monthly Differences → Print Preview**.

```yaml
width: 1024px
header: "Print Preview" (navy bar, close)
toolbar:
  nav:    [⏮, ⏪, "1 of 1+", ⏩, ⏭]
  print:  "🖨 -> (click)=onPrint()  // calls injected DOCUMENT.defaultView.print()"
  save:   "💾 -> (click)=onSave()   // opens SaveAsDialog (QRP) -> SaveQrpService.download(...)"
  load:   "📂 -> LoadReportDialog (.qrp open)"
  zoom:   [50%, 75%, 100%, 125%, 150%]
  status: Total / Zoom / Showing
body:
  class: print-area  # only this prints via @media print
  content: 11-column compare table
           (Policy / Ref / Paykey / Current.../Previous.../Type / % Change)
footer: none  # closed via header X; print/save/load are toolbar-only
```

### 4.4 ReportPrintModal (`src/app/components/report-print-modal/report-print-modal.component.ts`)

Used by header **Print Report** and the Tax Free / First Payments / Maturities / MCP report flows.

```yaml
toolbar:
  zoom_modes: [Fit, Actual, Width]
  nav: [⏮, ⏪, "Page x/N", ⏩, ⏭]
  ⚙ Printer Setup: "(click)=openPrintDialog()  -> PrintDialogComponent"
  🖨 Print:         "(click)=onPrint()          // calls injected DOCUMENT.defaultView.print()"
  💾 Save:          "(click)=onSave()           // opens SaveAsDialog (QRP) -> SaveQrpService.download(...)"
  📂 Load Report:   "(click)=openLoad()         -> LoadReportDialogComponent (.qrp)"
body:
  class: print-area
  content: report header + table + totals + signature lines
           ("Checked by: ............    Authorised by: ............")
footer: none  # closed via header X; print/save are toolbar-only
notes:
  - Zoom-to-Width / Zoom-to-Fit reserve a 2px buffer in the zoom
    calculation so subpixel rounding does not produce a horizontal
    scrollbar in the preview area.
```

### 4.5 FirstPaymentReportModal (`src/app/components/first-payment-report-modal/first-payment-report-modal.component.ts`)

Triggered from **Reports → Print First**.

- Multi-page paginated, page nav in toolbar
- **Save** → `SaveAsDialogComponent (QRP)` → `SaveQrpService.download('First_Payments_Report.qrp')`
- **Print** → `(click)=onPrint()` (uses injected `DOCUMENT.defaultView.print()`)
- **Printer Setup** → `PrintDialogComponent`
- **Columns:** Bank Sort Code · Bank Account No · `0` · Bank Account Name · Bank Ref · `99` · Gross Ann · Amount To Pay · Tax · Policy Ref
- **Totals:** Count · Total Gross · Total Amount · Total Tax

### 4.6 ProcessedReportModal (`src/app/components/processed-report-modal/processed-report-modal.component.ts`)

Triggered from **Reports → Print Processed**.

- **Save** → `SaveAsDialogComponent (QRP)` → `SaveQrpService.download('Payments_Report.qrp')`
- **Print** → `(click)=onPrint()` (uses injected `DOCUMENT.defaultView.print()`)
- **Printer Setup** → `PrintDialogComponent`
- **Totals:** Count · Total Net · Total Gross · Total Tax

### 4.7 PrintDialog (`src/app/components/print-dialog/print-dialog.component.ts`)

Windows 11 Fluent styled.

```yaml
sections:
  printer:
    - name: dropdown
    - properties_button
    - status / type / where / comment
  print_range:
    - radio: All
    - radio: "Pages from [_] to [_]"
    - radio: Selection
  copies:
    - number: 1
    - collate: "checkbox + page-icon illustrations"
actions: [OK, Cancel]
```

### 4.8 InfoDialog (title **DoBacs**, `src/app/components/info-dialog/info-dialog.component.ts`)

```yaml
inputs:  [open: boolean, title?: string (default "DoBacs"), message: string]
outputs: [ok (EventEmitter<void>)]
```

`ℹ message [OK]` — used for:

- "No data found"
- "Completion Start Date and End Date cannot be in the past."
- "No BACS payments present."
- "From and To date should not be in past date to save the BACS file."
- Nil-Income empty result
- Parameters tab — "If you wish to save the change, please click on the tick button" (after editing a date with year < 2026)

### 4.9 ConfirmDialog (`src/app/components/confirm-dialog/confirm-dialog.component.ts`, title **Confirm**)

LVE-styled confirmation dialog (navy `#00263e` title bar, white card,
pill OK / Cancel buttons, soft-blue help icon). Used by the
**Parameters** tab whenever a date field is changed to a year ≥ 2026
(non-standard processing period).

```yaml
title: "Confirm"
message: "The date entered is for a non-standard processing period. Is this correct?"
icon: matHelpOutline (blue circle, via @ng-icons/material-icons)
inputs:  [open: boolean, title?: string (default "Confirm"), message: string]
outputs: [ok (EventEmitter<void>), cancel (EventEmitter<void>)]
buttons:
  OK:     primary (filled #006cf4 -> hover #003578) — stages the new value into the draft
  Cancel: secondary (outline #04589b)               — keeps the previous draft value
header_X: behaves as Cancel (emits cancel)
z_index: 60   # above other modals/popovers
```

### 4.10 WarningDialog (title **BACS Payments**, `src/app/components/warning-dialog/warning-dialog.component.ts`)

```yaml
inputs:  [open: boolean, message: string]
outputs: [yes (EventEmitter<void>), no (EventEmitter<void>)]
```

`⚠ message [Yes] [No]` — used for:

- Show Payments confirmation
- Print Report confirmation
- "Some of the payments have already been committed. Would you like to exclude these payments?"

---

## 5. Flows

### 5.1 Show Payments

```text
[ Show Payments ]
   │
   ▼
WarningDialog ──No──▶ dismiss
   │ Yes
   ▼
populate active tab grid
```

### 5.2 Print Report

```text
[ Print Report ]
   │
   ▼
WarningDialog ──No──▶ dismiss
   │ Yes
   ▼
ReportPrintModalComponent
   ├─ ⚙ -> PrintDialogComponent
   ├─ 🖨 -> (click)=onPrint()  // inject(DOCUMENT).defaultView?.print()
   └─ 💾 -> SaveAsDialogComponent (QRP) -> SaveQrpService.download(...) -> browser download
```

### 5.3 Save To Bacs

```text
[ Save To Bacs ]   (disabled when no data)
   │
   ▼
openSaveAs(BACS):
   │
   ├─ dates in past? ──Yes──▶ InfoDialog
   │                          "Completion Start Date and End Date cannot be in the past."
   │ No
   ▼
SaveAsDialog (BACS)
   │ Save
   ▼
browser download .BACS file
```

### 5.4 Save To CSV (Processed tab)

```text
[ Save To CSV ]   (disabled when !showProcessed)
   │ enabled
   ▼
SaveAsDialog (CSV)        ← opens directly, no info dialog, no date check
   │ Save
   ▼
browser download .CSV file
```

### 5.5 Save And Commit To BACS

```text
[ Save And Commit To BACS ]
   │
   ▼
tab has data? ──No──▶ InfoDialog "No BACS payments present."
   │ Yes
   ▼
commit conflict? (1 in 3) ──Yes──▶ WarningDialog (exclude already-committed?)
   │ No
   ▼
InfoDialog "From and To date should not be in past date to save the BACS file."
```

### 5.6 Monthly Differences

```text
[ Produce List ]              ─▶ grid populated
[ Produce Nil-Income List ]   ─▶ InfoDialog (no records)
[ Print Preview ]             ─▶ PrintPreviewModalComponent
                                   ├─ 🖨 -> (click)=onPrint()  // inject(DOCUMENT).defaultView?.print()
                                   └─ 💾 -> SaveAsDialogComponent (QRP) -> SaveQrpService.download(...)
```

### 5.7 Reports tab

```text
[ Print First ]      ─▶ FirstPaymentReportModal ─▶ { ⚙ PrintDialog | 🖨 print | 💾 SaveAsDialog QRP | 📂 LoadReportDialog }
[ Print Processed ]  ─▶ ProcessedReportModal    ─▶ { ⚙ PrintDialog | 🖨 print | 💾 SaveAsDialog QRP | 📂 LoadReportDialog }
```

### 5.8 Parameters tab

```text
edit AR/AD date field
   │
   ▼
isNonStandardDate(value)?  (year >= 2026)
   │ Yes                                        │ No
   ▼                                            ▼
ConfirmDialog                              stage value into draftParams
   ├─ Cancel ─▶ keep previous draft         InfoDialog "click ✓ to save"
   └─ OK     ─▶ stage value into draftParams
                InfoDialog "click ✓ to save"

[ ✓ Post ]    ─▶ commit draftParams to ar/ad state; status = "Changes saved"
[ ✗ Cancel ]  ─▶ draftParams := committedParams; status = "Changes cancelled"
[ ↻ Refresh ] ─▶ draftParams := committedParams; status cleared
[ ▲ Insert ]  ─▶ reserved (no-op)
```

---

## 6. Print Behaviour

- Strategy: CSS `@media print` declared in **global** styles (`src/styles.scss`) so the rules survive Angular's `ViewEncapsulation.Emulated` attribute scoping.
- Rules:
  - `body * { visibility: hidden; }`
  - `.print-area, .print-area * { visibility: visible; }`
  - `.print-area` positioned absolute at top-left, `zoom: 1`
  - Elements with `.no-print` are hidden
- Trigger: `(click)=onPrint()` invokes `this.document.defaultView?.print()` where `document` is provided by `inject(DOCUMENT)` from `@angular/common`.
- Result: only the report page renders; modal chrome, toolbars and the app shell are excluded automatically.

---

## 7. File Export

### QRP (`SaveQrpService`, `src/app/lib/save-qrp.service.ts`)

- Provided in root: `@Injectable({ providedIn: 'root' })`
- Method: `download(report: ReportModel, filename: string): void`
- Format:

  ```text
  QRP/1.0
  TITLE   <title>
  RANGE   <dateRange>
  COLUMNS <label1>  <label2>  ...
  ROW     <cell1>   <cell2>   ...
  ROW     ...
  TOTAL   <label>   <value>
  ...
  END
  ```

### PDF (`SavePdfService`, `src/app/lib/save-pdf.service.ts`)

- Provided in root; wraps `jspdf` + `html2canvas` so components depend only on the Angular service surface.

### CSV (`SaveCsvService`)

- Triggered from **Save To CSV** (Processed tab) via `SaveAsDialogComponent`.

### BACS (`SaveBacsService`)

- Triggered from **Save To Bacs** in multiple tabs.

---

## 8. State Model

All page state is held inside `BacsPaymentsComponent`
(`src/app/pages/bacs-payments/bacs-payments.component.ts`) using Angular
**signals** (writable + computed). No NgRx / global store.

```yaml
# class fields on BacsPaymentsComponent
global:
  - completionStart  = signal('')           # dd/mm/yyyy strings
  - completionEnd    = signal('')
  - activeTab        = signal<TabId>(...)   # one of 9 tab ids
  - showData         = signal(false)
  - showProcessed    = signal(false)
  - showProcessedMcp = signal(false)
  - showMonthlyDiff  = signal(false)
  - showNilIncome    = signal(false)
  - saveAsOpen       = signal(false)
  - saveAsType       = signal<'BACS'|'CSV'|'QRP'>('BACS')
  - loadOpen         = signal(false)        # one per print modal
  - noDataOpen       = signal(false)        # InfoDialog (also reused for "click ✓ to save" reminder)
  - noDataMessage    = signal('')
  - commitWarningOpen= signal(false)
  - paymentType      = signal<'B'|'C'|'T'|'R'|'All'>('All')

parameters_tab:
  - arStartRunMonth  = signal('01/05/2025')   # committed values
  - arEndRunMonth    = signal('31/05/2025')
  - adStartRunMonth  = signal('01/06/2025')
  - adEndRunMonth    = signal('24/06/2025')
  - draftParams      = signal<{arStart: string; arEnd: string; adStart: string; adEnd: string}>({...})
  - paramsDirty      = computed(() =>
                         draftParams().arStart !== arStartRunMonth() ||
                         draftParams().arEnd   !== arEndRunMonth()   ||
                         draftParams().adStart !== adStartRunMonth() ||
                         draftParams().adEnd   !== adEndRunMonth())
  - paramsStatus     = signal<'' | 'Changes saved' | 'Changes cancelled'>('')
  - nonStandardConfirm = signal<{ open: boolean; pending: { key: ParamKey; previous: string; next: string } | null }>(...)
```

Helpers (component methods):

- `onParamDateChange(key: ParamKey, next: string)` — entry point from each `<app-date-input>` `(valueChange)`; routes through ConfirmDialog (year ≥ 2026) or directly stages + opens InfoDialog.
- `onParamsPost()` — commits drafts → `paramsStatus.set('Changes saved')`.
- `onParamsCancel()` / `onParamsRefresh()` — revert drafts to committed.

---

## 9. Design Notes

- Header uses navy `#00263e` with white `LV=` logo and Logout pill.
- **Primary buttons:** background `#006cf4`, hover `#003578`, pill shape (`rounded-30px`).
- **Secondary buttons:** white background, `#04589b` border + text; on hover fill navy `#003578` with white text.
- **Disabled buttons:** white background, gray `#979797` border + text.
- **Tables:** zebra rows `#e7ebec34`; full-row hover `#05579B` with white text.
- **Print modals:** open over a 40% black backdrop, `shadow-2xl`, 12px radius.
- **SaveAsDialog, LoadReportDialog and PrintDialog** match Windows 11 Fluent visuals: Segoe UI Variable, 4px corner radius, accent `#0067c0`, light Mica grey `#f3f3f3`.
- **InfoDialog and ConfirmDialog** follow the LVE design language: navy `#00263e` title bar, white card with 12px radius and `border-[#BBBBBB]` border, pill OK / Cancel buttons in brand blues. Both are standalone Angular components animated via `@angular/animations` (`fadeIn` / `scaleIn`) registered in their `animations: []` metadata.
- **Parameters tab toolbar buttons (▲ ✓ ✗ ↻):** 32×36, white background, `#BBBBBB` border, 4px radius, `#3d3d3d` glyph, hover `#f0f0f0`. ✓ and ✗ fade to 40% opacity and become non-clickable when there are no unsaved drafts.
- **DateInput `stacked` variant** (used in Parameters): renders the label above the input as small uppercase grey text (`text-[11px] tracking-wide uppercase text-[#5f5f5f]`) instead of the default inline label.
