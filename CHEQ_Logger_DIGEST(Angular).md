# CHEQ Logger — Application Digest

## 1. Application

| Field        | Value                                                                                                                                                                  |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Name         | CHEQ Logger                                                                                                                                                           |
| Version      | 1.0.0                                                                                                                                                                 |
| Type         | Static web app (no backend) — recreation of the legacy Windows "Accounts Cheque Log" desktop tool, previously delivered via Citrix                                    |
| Description  | Liverpool Victoria Friendly Society Limited internal tool for logging, amending, and reporting on cheques received into accounts. Staff pick a date range, then navigate cheque records via the Cheque Log modal or generate Accounts reports. All data is held client-side (seed data + `localStorage`). |
| Framework    | Angular 17 (standalone components, signals) + TypeScript                                                                                                              |
| Styling      | Tailwind CSS v4 (`@tailwindcss/vite` plugin); global design tokens in `src/index.css`; LV design-library button variants in `.lve-btn` / `.lve-btn-secondary` utility classes; global base reset applied via `@layer base`; `html { zoom: 0.8 }` global scale for legacy-tool fidelity |
| Icons        | `react-icons/md` (Material Design) — `MdSkipPrevious`, `MdSkipNext`, `MdNavigateBefore`, `MdNavigateNext`, `MdNoteAdd`, `MdClose`, `MdEdit`, `MdEditOff`, `MdPrint`, `MdSave` |
| UI Kit       | shadcn/ui (Radix UI primitives): `Dialog`, `Button`, `Input`, `Select`, `Popover`, `Calendar`, `Toaster`                                                             |
| Date handling | `date-fns` v3 — formatting and calendar arithmetic; `react-day-picker` v9 for the calendar popover                                                                  |
| Routing      | `wouter` v3 — single-page; only `/` is reachable from the UI; routes `/cheques`, `/cheques/new`, `/cheques/:id`, `/admin` exist in code but have no navigation links |
| State        | TanStack Query v5 (`@tanstack/react-query`) wrapping synchronous `localStorage` CRUD; `invalidateQueries` refreshes all query subscribers after mutations            |
| Data store   | `localStorage` key `cheq_logger_db_v5`; seeded on first load with 2 accounts, 12 departments, 8 cheques                                                              |
| Auth         | No server auth — demo gate; user is always `Demo User / admin`; `canEdit` and `canManage` are always `true`                                                          |
| Build        | Vite (`@vitejs/plugin-react`, `@tailwindcss/vite`) → static `dist/public/` output; reads `PORT` and `BASE_PATH` environment variables at startup                    |
| Date context | Global `DateRangeContext` (default start `2025-12-03`, end `2026-06-12`) — drives both the Dashboard pickers and the Accounts report range                           |

### Fonts

| Role    | Family         |
| ------- | -------------- |
| Heading | Livvic         |
| Body    | Mulish         |
| Mono    | JetBrains Mono |

### Brand colours

| Token        | Hex       | Usage                                                  |
| ------------ | --------- | ------------------------------------------------------ |
| navy         | `#00263e` | Header bar, modal / dialog title bars                  |
| accent_blue  | `#006cf4` | Primary button fill, focus rings, info icon, scrollbar |
| title_blue   | `#002f5c` | Report titles, form-field labels, fieldset legends     |
| gray_border  | `#BBBBBB` | Modal borders, card borders, separators                |
| text         | `#3d3d3d` | Body text inside modals and dialogs                    |
| surface_alt  | `#f5f7fa` | Modal footers, read-only inputs                        |
| bg_light     | `#e7ebec` | Outside-month day hatching in calendar                 |
| teal_scroll  | `#62bda8` | Custom scrollbar thumb                                 |
| amount_red   | `#d72714` | Cheque Amount field text (bold)                        |

---

## 2. Global Components

### 2.1 Header (`Header`, `src/components/Header.tsx`)

```yaml
selector: app-header
sticky: false
background: "#00263e"
padding: "py-5 px-[142px]"
left:
  - logo:
      src: "src/assets/lve-logo.png"
      alt: "CHEQ Logger"
      height: h-6
      action: "navigate to /"
  - divider: "w-px h-6 bg-white/30"
  - title:
      text: route-derived label
      rules:
        - path "/":          "Menu"
        - path "/cheques*":  "Cheque Register"
        - path "/admin*":    "Admin / Setup"
        - default:           "CHEQ Logger"
      font: "Livvic 24px font-normal text-white"
right:
  - close_button:
      label: "Close"
      variant: ghost (text-white, hover bg-white/10)
      action: "navigate to /"
  - logout_button:
      label: "Logout"
      variant: ghost (text-white, hover bg-white/10)
      action: "localStorage.clear(); window.location.reload()"
inputs: [title?: string]
outputs: []
```

### 2.2 Footer (`Footer`, `src/components/Footer.tsx`)

```yaml
selector: app-footer
background: white
border: "border-t border-slate-200"
padding: "py-4 px-[142px]"
left:
  - logo: "src/assets/lve-logo.png"  // h-6
right:
  - address: "Company Address Line 1 / Company Address Line 2"
    font: "10px font-medium text-slate-400"
inputs: []
outputs: []
```

### 2.3 Layout (`Layout`, `src/components/layout.tsx`)

Wraps every route. Renders `<Header>` → `<main>` (flex-1 bg-background) → `<Footer>`. The `<Toaster>` (shadcn toast) is mounted at `App` level, outside `Layout`.

### 2.4 Global Date Range Context (`DateRangeContext`, `src/lib/date-context.tsx`)

```yaml
provider: DateRangeProvider
defaults:
  startDate: "2025-12-03"
  endDate:   "2026-06-12"
hook: useDateRange()
fields:
  - startDate: string   // yyyy-MM-dd
  - endDate:   string   // yyyy-MM-dd
  - setStartDate: (date: string) => void
  - setEndDate:   (date: string) => void
```

Used by both the Dashboard pickers and the `AccountsReportModal` to scope its report query.

---

## 3. Screens

### 3.1 Dashboard / Menu (`Dashboard`, `src/pages/dashboard.tsx`, route `/`)

The only screen reachable via the UI. Displayed as a centred card (`w-[360px]`) on a light background, with the global navy Header above and white Footer below.

The card contains three sections in order:

1. **Date range pickers** — Start Date and End Date, each a `DatePicker` component, stacked vertically with Livvic bold labels in title_blue.
2. **Horizontal rule** — `h-px bg-[#e0e0e0]` divider.
3. **Action buttons** — two full-width secondary buttons, stacked vertically, left-aligned icon + label.

#### 3.1.1 Date Range pickers

Two `DatePicker` components (see §4.1), stacked vertically. Both are two-way bound to the global `DateRangeContext`. Changing either value is reflected immediately in the Accounts report.

#### 3.1.2 Action buttons

| Button       | Icon          | Variant   | Opens                  |
| ------------ | ------------- | --------- | ---------------------- |
| Accounts     | `MdPrint`     | secondary | `AccountsReportModal`  |
| New / Amend  | `MdNoteAdd`   | secondary | `ChequeLogModal`       |

Both buttons span full width with left-aligned icon+label (`justify-start`).

---

## 4. Modals & Dialogs

### 4.1 DatePicker (`DatePicker`, `src/components/ui/date-picker.tsx`)

Calendar date-picker rendered as a Radix `Popover` containing `react-day-picker`. Used in the Dashboard (both pickers) and in `ChequeLogModal` (Date Rec'd field).

```yaml
inputs:
  - value:          string    // yyyy-MM-dd
  - onChange:       (date: string) => void
  - onPresetSelect: (start: string, end: string) => void   // optional, Dashboard only
  - disabled:       boolean   // propagated from parent read-only state
  - inputClassName: string    // tailwind override for the trigger input
trigger:
  - text input showing formatted date (dd/mm/yyyy)
  - calendar icon button on the right
popover:
  width: 280px
  calendar_view: Days (Mon–Sun grid)
  outside_month_days: hatched (.day-outside-hatch diagonal stripe)
  selected_day: navy (#00263e) filled circle
  today: accent_blue (#006cf4) ring
  navigation: [< Prev month]  [Month Year]  [Next month >]
  month_click: toggles to Months grid (3×4)
  year_click:  toggles to Years grid (5×5 range)
presets (Dashboard only, below calendar):
  - "This month"
  - "Last month"
  - "This year"
```

---

### 4.2 ChequeLogModal (`ChequeLogModal`, `src/components/ChequeLogModal.tsx`)

Full-screen overlay dialog. Triggered from Dashboard → **New / Amend**. Loads all cheques (date range `2000-01-01 → 2099-12-31`). Initial display shows the first cheque (index 0) sorted ascending by `logRef`.

The modal is structured in four vertical bands:

1. **Title bar** — navy background; "Accounts Cheque Log" in Livvic white; `×` close pill button (right).
2. **Toolbar** — white background; Ref badge (left), New button + nav controls (right).
3. **Form body** — white background; Find bar at top followed by all form fields.
4. **Footer** — `#f5f7fa` background; mode-dependent action buttons (right).

#### 4.2.1 Toolbar

| Position | Element | Detail |
| -------- | ------- | ------ |
| Far left | **Ref badge** | Current cheque's `logRef`; shows next pending `logRef` in New mode; styled as a pill badge in navy text |
| Centre   | **[ New ]** | `MdNoteAdd` icon; creates a blank form with auto-generated `logRef = max(existing) + 1`; sets mode to New + editing |
| Centre   | vertical divider | `w-px h-5 bg-[#BBBBBB]` |
| Right    | **[ \|< ]** First | `MdSkipPrevious`; disabled when list is empty |
| Right    | **[ < ]** Prev | `MdNavigateBefore`; disabled at index 0 |
| Right    | **N of M** | position indicator; Mulish 13px bold; min-width 64px centred |
| Right    | **[ > ]** Next | `MdNavigateNext`; disabled at last index |
| Right    | **[ >\| ]** Last | `MdSkipNext`; disabled when list is empty |

#### 4.2.2 Find bar

- Typeahead search field; placeholder "Type log ref, slip no, drawer…"
- Matches on `logRef`, `chequeNumber`, `payee`, `notes` (all case-insensitive).
- Suggestion list appears on focus while query is non-empty; up to **8** results.
- Each row: **logRef** (navy bold, 72px) · **payee** (truncated, muted "No drawer" if blank) · **amount** (accent_blue, right-aligned, `£N,NNN.NN` or `—`).
- Clicking / pressing Enter on a suggestion navigates the modal to that cheque.
- Pressing Escape in the field clears the query.

#### 4.2.3 Form fields

| Field | Control | Notes |
| ----- | ------- | ----- |
| Date Rec'd | `DatePicker` | `yyyy-MM-dd` stored; editable in edit/new mode |
| Signed / Posted | Read-only `Input` + **Sign / Unsign** icon button | Toggle: empty → `"UAT3"` → empty; button shows `MdEdit` (sign) or `MdEditOff` (unsign) |
| Pay-in Slip No | `Input` | Free text; maps to `chequeNumber` |
| Department | `Select` | Populated from `listDepartments()`, sorted by code |
| Account Credited | `Select` | Filtered to accounts with code `"843"` only |
| Drawer | `Input` + **LV=** quick-fill button | Quick-fill sets `payee = "LV="`; button hidden in view mode |
| Policy Name / Cheque Details | `Input` | Maps to `notes` |
| Policy Ref | `Input` | Free text |
| Cheque Amount | `Input type="number" step="0.01"` | Displayed in **red bold** (`#d72714`) |

All fields are **read-only** in view mode (`ro = true`). Edit mode is entered via **[ Edit ]** button.

#### 4.2.4 Modes and state transitions

**Opening an existing cheque** — modal opens in view mode (read-only).

- **[ Edit ]** — switches to edit mode; all fields become editable.
  - **[ Save ]** — calls `updateCheque`; shows toast; returns to view mode.
  - **[ Cancel ]** — reloads current cheque from store; returns to view mode without saving.
- **Navigation** (`[|<]` `[<]` `[>]` `[>|]`) or **Find** — loads a different cheque; stays in view mode.

**[ New ]** — opens a blank form in new + editing mode; `pendingLogRef` is auto-assigned.

- **[ Save ]** — calls `createCheque`; sets `wantLastRef = true`; navigates to the newly created record; switches to view mode.
- **[ Cancel ]** — returns to the previously viewed cheque in view mode.

**[ Close ] / [ × ] / Escape**

- No unsaved changes — closes the modal immediately.
- Unsaved changes present — opens ExitConfirmationDialog (§4.3).

#### 4.2.5 Toast notifications

| Action | Toast |
| ------ | ----- |
| Cheque saved (update) | "Cheque updated" |
| Cheque saved (new) | "Cheque created" |
| Save validation error | Destructive toast with message |

---

### 4.3 ExitConfirmationDialog (sub-dialog of ChequeLogModal)

Triggered when the user clicks **Close**, the **×** button, or presses **Escape** while there are unsaved changes (edit or new mode).

```yaml
width: 280px
title_bar:
  background: "#00263e"
  label: "Information"
  font: "Livvic 14px font-semibold text-white"
body:
  icon: "i"  // accent_blue (#006cf4), 22px
  text: "Exit now?"
  font: "Mulish 13px text-[#3d3d3d]"
footer:
  background: "#f5f7fa"
  border: "border-t border-[#BBBBBB]"
  buttons:
    - label: "Yes"
      variant: primary
      action: "close ExitConfirmation + close ChequeLogModal"
    - label: "No"
      variant: secondary
      action: "dismiss ExitConfirmation, return to edit"
behaviour:
  - clicking outside is blocked (onInteractOutside preventDefault)
  - Radix close button hidden
```

---

### 4.4 AccountsReportModal (`AccountsReportModal`, `src/components/AccountsReportModal.tsx`)

Overlay modal displaying an A4-proportioned paged report of cheques for the global date range. Triggered from Dashboard → **Accounts**.

The modal is structured in four vertical bands:

1. **Title bar** — navy background; "Accounts Report" in Livvic white; `×` close pill button (right).
2. **Toolbar** — white background; page navigation, Print, Export, Zoom, and Total controls in a single row (see §4.4.1).
3. **Report canvas** — white background; A4-proportioned (794 × 1123 px) paged preview, scaled by the Zoom setting. Report title and date range header at top, followed by a 9-column data grid.
4. **Footer** — `#f5f7fa` background; `[ Close ]` button (secondary, right-aligned).

#### 4.4.1 Toolbar

| Order | Control | Detail |
| ----- | ------- | ------ |
| 1 | **[ \|< ]** | `MdSkipPrevious` — jump to first page |
| 2 | **[ < ]** | `MdNavigateBefore` — previous page |
| 3 | **N of M** | current page / total pages (read-only) |
| 4 | **[ > ]** | `MdNavigateNext` — next page |
| 5 | **[ >\| ]** | `MdSkipNext` — last page |
| — | divider | |
| 6 | **[ Print ]** | `MdPrint` — opens `PrintDialog` (§4.5) |
| 7 | **[ Export ]** | `MdSave` — opens `ExportDialog` (§4.6) |
| — | divider | |
| 8 | **[ N% ▾ ]** | Zoom select; options: 50% · 75% · 100% · 125% · 150%; default 100% |
| — | divider | |
| 9 | **Total: N** | total cheque row count for the date range (read-only label) |

#### 4.4.2 Report body

- A4 canvas `794 × 1123 px`, scaled by zoom level.
- Paginated: rows are split across pages; page navigation advances the A4 preview.
- **9 columns** (pixel widths summing to 698 px inside 48 px side padding):

| # | Column heading | Width |
| - | -------------- | ----- |
| 1 | Ref | 72 px |
| 2 | Date Rec'd | 72 px |
| 3 | Drawer | 104 px |
| 4 | Policy Name / Cheque Details | 128 px |
| 5 | Policy No | 60 px |
| 6 | Amount | 64 px |
| 7 | Account Credited / Dept | 72 px |
| 8 | Payin Slip No | 52 px |
| 9 | Signed Posted | 74 px |

- Header rows (report title + date range) rendered in navy / title_blue; column headers in title_blue bold.
- Data rows alternate background (`#e7ebec34` zebra).
- Report title: **"ACCOUNTS CHEQUE LOG"**
- Date range line: *"From: DD Month YYYY · To: DD Month YYYY"*

#### 4.4.3 Footer

`[ Close ]` button (secondary, bottom-right). Equivalent to `[ × ]` in title bar.

---

### 4.5 PrintDialog (sub-dialog of AccountsReportModal)

```yaml
width: 380px
title_bar:
  background: "#00263e"
  label: "Print"
  close_button: "× pill (lve-btn-secondary)"
body:
  fieldsets:
    - legend: "Printer"
      content:
        printer_name: "System Printer"
        printer_detail: "Hitchin_PreConfiguration on HIKNPS001.group.net"
    - legend: "Print Range"
      options:
        - radio: "All"   // default selected
        - radio: "Pages"
          sub_fields:
            - From: number input (min 1); disabled unless Pages selected
            - To:   number input (min 1); disabled unless Pages selected
  inline_row:
    - Copies: number input (min 1, max 99, default 1)
    - Collate Copies: checkbox (default checked)
footer:
  background: "#f5f7fa"
  border: "border-t border-[#BBBBBB]"
  buttons:
    - label: "Cancel"
      variant: secondary
      action: close dialog
    - label: "OK"
      variant: primary
      action: "execute browser print (window.print() simulation); close dialog"
behaviour:
  - clicking outside is blocked
  - Radix close button hidden
```

---

### 4.6 ExportDialog (sub-dialog of AccountsReportModal)

```yaml
width: 400px
title_bar:
  background: "#00263e"
  label: "Export"
  close_button: "× pill (lve-btn-secondary)"
body:
  fields:
    - label: "Format:"
      control: native <select>
      default: "MS Excel 97-2000 (Data only)"
      options:
        enabled:
          - "Acrobat Format (PDF)"
          - "HTML 3.2"
          - "HTML 4.0"
          - "MS Excel 97-2000"
          - "MS Excel 97-2000 (Data only)"  // default
          - "MS Word"
          - "Record style (columns no spaces)"
          - "Record style (columns with spaces)"
          - "Rich Text Format"
          - "Separated Values (CSV)"
          - "Tab-separated text"
        disabled:
          - "Crystal Reports (RPT)"
          - "ODBC"
          - "Report Definition"
    - label: "Destination:"
      control: native <select>
      default: "Disk file"
      options:
        - "Application"
        - "Disk file"       // default
        - "Exchange Folder"
        - "Lotus Domino"
footer:
  background: "#f5f7fa"
  border: "border-t border-[#BBBBBB]"
  buttons:
    - label: "Cancel"
      variant: secondary
      action: close dialog
    - label: "OK"
      variant: primary
      action: |
        if format in [MS Excel 97-2000, MS Excel 97-2000 (Data only)]:
          → open ExcelFormatDialog (§4.7)
        else:
          → trigger browser Blob download, close dialog
behaviour:
  - clicking outside is blocked
  - Radix close button hidden
```

---

### 4.7 ExcelFormatDialog (sub-dialog of ExportDialog)

Opened automatically when the selected export format is `xls` or `xls-data`.

```yaml
width: 460px
title_bar:
  background: "#00263e"
  label: "Excel Format Options"
  close_button: "× pill (lve-btn-secondary)"
body:
  fieldset:
    legend: "Excel Format"
    radio_options:
      - value: "typical"
        label: "Typical"
        description: "Data is exported with default options applied."
        default: true
      - value: "minimal"
        label: "Minimal"
        description: "Data is exported with no formatting applied."
      - value: "custom"
        label: "Custom"
        description: "Data is exported according to selected options."
    radio_style: "accent-[#006cf4]"
footer:
  background: "#f5f7fa"
  border: "border-t border-[#BBBBBB]"
  buttons:
    - label: "Cancel"
      variant: secondary
      action: "close ExcelFormatDialog, return to ExportDialog"
    - label: "OK"
      variant: primary
      action: "close ExcelFormatDialog + ExportDialog; trigger Blob download"
behaviour:
  - clicking outside is blocked
  - Radix close button hidden
```

---

## 5. Data Layer

### 5.1 localStorage Schema (`cheq_logger_db_v5`)

```typescript
interface DB {
  accounts:    Account[];
  departments: Department[];
  cheques:     ChequeRecord[];
  seq:         number;           // next auto-increment id seed
}

interface Account {
  id:     number;
  code:   string;
  name:   string;
  active: boolean;
}

interface Department {
  id:     number;
  code:   string;
  name:   string;
  active: boolean;
}

interface ChequeRecord {
  id:           number;
  logRef:       string;           // system-assigned sequential reference
  chequeNumber: string;           // Pay-in Slip No
  issueDate:    string;           // yyyy-MM-dd (Date Rec'd)
  signedBy:     string | null;    // Signed / Posted
  payee:        string;           // Drawer
  accountId:    number;
  departmentId: number;
  amount:       number;
  status:       "outstanding" | "cleared" | "cancelled";
  clearedDate:  string | null;    // yyyy-MM-dd; only set when status = "cleared"
  notes:        string | null;    // Policy Name / Cheque Details
  policyRef:    string | null;
}
```

Enriched read model (`Cheque`) extends `ChequeRecord` with `accountName: string` and `departmentName: string` (joined at read time from `accounts` / `departments`).

### 5.2 Seed Data (first load only)

#### Accounts (2)

| id | code | name |
| -- | ---- | ---- |
| 1  | 843  | 843  |
| 2  | 844  | 844  |

#### Departments (12)

| id | code        |
| -- | ----------- |
| 1  | ACCOUNTS    |
| 2  | CPA         |
| 3  | ACC         |
| 4  | ACCOUNTS_F  |
| 5  | ACCOUNTS_G  |
| 6  | ACCOUNTS-PRP|
| 7  | ADMIN       |
| 8  | BQU         |
| 9  | CPA-760     |
| 10 | CPA-830     |
| 11 | CPA-926     |
| 12 | CPA-PRP     |

#### Cheques (8, all status `outstanding`)

| logRef   | chequeNumber | issueDate  | payee           | dept | amount      |
| -------- | ------------ | ---------- | --------------- | ---- | ----------- |
| 31008389 | 1            | 2008-01-09 | clerical medical| CPA  | 0.00        |
| 31008390 | 1            | 2008-01-09 | zurich          | CPA  | 61,310.42   |
| 31008391 | (blank)      | 2007-12-31 | (blank)         | ACCOUNTS | 0.00   |
| 31008393 | 2            | 2008-01-10 | PRUDENTIAL      | CPA  | 28,122.00   |
| 31008394 | 3            | 2008-01-11 | CBS LTD         | CPA  | 17,330.00   |
| 31008395 | 2            | 2008-01-11 | ZURICH          | CPA  | 54,695.20   |
| 31008400 | 4            | 2008-01-14 | prudential      | CPA  | 11,090.15   |
| 31166764 | (blank)      | 2008-01-15 | (blank)         | CPA  | 21,212.00   |

`seq` initialises to `31166765` (next available `logRef`).

### 5.3 Store Operations

| Operation | Function | Notes |
| --------- | -------- | ----- |
| List cheques | `listCheques(filters)` | Filters by date range, accountId, departmentId, status, free-text search; sorts by logRef asc |
| Get cheque | `getCheque(id)` | Returns enriched `Cheque` or `undefined` |
| Create cheque | `createCheque(data)` | Auto-assigns `id`; auto-generates `logRef = max(existing) + 1` if not provided |
| Update cheque | `updateCheque(id, data)` | Throws if `id` not found |
| Accounts report | `accountsReport(params)` | Aggregates cheques per account in date range |
| Departments report | `departmentsReport(params)` | Aggregates cheques per department in date range |
| Outstanding report | `outstandingReport(params)` | Returns outstanding cheques in date range, sorted by issueDate desc |
| Dashboard summary | `dashboardSummary()` | Total/outstanding/cleared/cancelled counts and amounts across all cheques |
| List accounts | `listAccounts()` | Sorted by code |
| List departments | `listDepartments()` | Sorted by code |
| Get profile | `getProfile()` | Always returns `{ role: "admin", canEdit: true, canManage: true }` |

### 5.4 TanStack Query Keys

| Query key | Hook | Invalidated by |
| --------- | ---- | -------------- |
| `["cheques", filters]` | `useListCheques` | `createCheque`, `updateCheque` mutations |
| `["cheque", id]` | `useGetCheque` | — |
| `["dashboard"]` | `useGetDashboardSummary` | `createCheque`, `updateCheque` mutations |
| `["accounts-report", params]` | `useGetAccountsReport` | — (reactively re-fetches on DateRange change) |
| `["departments-report", params]` | `useGetDepartmentsReport` | — |
| `["outstanding-report", params]` | `useGetOutstandingReport` | — |
| `["accounts"]` | `useListAccounts` | — |
| `["departments"]` | `useListDepartments` | — |
| `["profile"]` | `useGetMyProfile` | — |

---

## 6. Screen Flow Summary

Every URL is served by the single-page app. The global `Layout` wraps all routes, providing the navy Header and white Footer on every screen.

**Entry point (`/`)** — Dashboard / Menu card is rendered. The user selects a date range using the two DatePicker popovers, which update the global `DateRangeContext`.

From the Dashboard the user can:

- Click **Accounts** — opens `AccountsReportModal`, which renders a paged A4 report for the selected date range.
  - From within the report: **Print** opens `PrintDialog`; **Export** opens `ExportDialog`.
  - If the chosen export format is MS Excel 97-2000 or MS Excel 97-2000 (Data only), `ExportDialog` automatically opens `ExcelFormatDialog` before completing the export.
- Click **New / Amend** — opens `ChequeLogModal`, which displays the cheque register. The user can browse, search, edit, or create cheques.
  - Attempting to close the modal with unsaved changes triggers `ExitConfirmationDialog`; confirming with **Yes** closes the modal, **No** returns to editing.

No other routes are reachable via the UI. The Header **Close** button navigates to `/`; **Logout** clears `localStorage` and reloads.

---

## 7. Accessibility & Behaviour Notes

| Concern | Implementation |
| ------- | -------------- |
| Modal trap | All `Dialog` components use Radix `Dialog` which traps focus and handles Escape key automatically |
| Radix close button | Hidden in all LV modals (`[&>button]:hidden`) — close is via the custom `[ × ]` pill button in the title bar or footer buttons |
| Overlay click | All modals block `onInteractOutside` (`e.preventDefault()`) — only explicit buttons dismiss them |
| Screen-reader titles | Every `Dialog` includes a `<DialogTitle className="sr-only">` for accessible label |
| Global zoom | `html { zoom: 0.8 }` applies a fixed 80% scale for legacy-desktop fidelity; not controlled by the Zoom dropdown (which only scales the report preview canvas) |
| Keyboard navigation | Standard browser tab order; DatePicker calendar supports keyboard arrow keys via `react-day-picker` |
| No emojis | Per design convention — no emoji characters appear anywhere in the UI |
