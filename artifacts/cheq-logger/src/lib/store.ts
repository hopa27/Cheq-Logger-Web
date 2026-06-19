import { format } from "date-fns";

export type ChequeStatus = "outstanding" | "cleared" | "cancelled";

export interface Account {
  id: number;
  code: string;
  name: string;
  active: boolean;
}

export interface Department {
  id: number;
  code: string;
  name: string;
  active: boolean;
}

export interface ChequeRecord {
  id: number;
  chequeNumber: string;
  issueDate: string;
  payee: string;
  accountId: number;
  departmentId: number;
  amount: number;
  status: ChequeStatus;
  clearedDate: string | null;
  notes: string | null;
}

export type ChequeInput = Omit<ChequeRecord, "id">;

export interface Cheque extends ChequeRecord {
  accountName: string;
  departmentName: string;
}

export interface Profile {
  firstName: string;
  lastName: string;
  role: "admin" | "editor" | "viewer";
  profileImageUrl: string;
  canEdit: boolean;
  canManage: boolean;
}

export interface ChequeFilters {
  startDate: string;
  endDate: string;
  accountId?: number;
  departmentId?: number;
  status?: ChequeStatus;
  search?: string;
}

export interface DateRangeParams {
  startDate: string;
  endDate: string;
}

interface DB {
  accounts: Account[];
  departments: Department[];
  cheques: ChequeRecord[];
  seq: number;
}

const STORAGE_KEY = "cheq_logger_db_v1";

function seed(): DB {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = (day: number) => format(new Date(y, m, day), "yyyy-MM-dd");

  const accounts: Account[] = [
    { id: 1, code: "1000", name: "Main Operating Account", active: true },
    { id: 2, code: "2000", name: "Payroll Account", active: true },
    { id: 3, code: "3000", name: "Reserve Account", active: true },
  ];

  const departments: Department[] = [
    { id: 1, code: "FIN", name: "Finance", active: true },
    { id: 2, code: "HR", name: "Human Resources", active: true },
    { id: 3, code: "OPS", name: "Operations", active: true },
    { id: 4, code: "IT", name: "Information Technology", active: true },
  ];

  const cheques: ChequeRecord[] = [
    { id: 1, chequeNumber: "100245", issueDate: d(2), payee: "Acme Office Supplies", accountId: 1, departmentId: 3, amount: 1245.5, status: "cleared", clearedDate: d(6), notes: "Quarterly stationery order" },
    { id: 2, chequeNumber: "100246", issueDate: d(4), payee: "Northgate Property Ltd", accountId: 1, departmentId: 3, amount: 8500, status: "outstanding", clearedDate: null, notes: "Monthly rent" },
    { id: 3, chequeNumber: "100247", issueDate: d(5), payee: "Bright Spark Electrics", accountId: 1, departmentId: 4, amount: 640.0, status: "outstanding", clearedDate: null, notes: null },
    { id: 4, chequeNumber: "100248", issueDate: d(8), payee: "J. Patterson (Salary)", accountId: 2, departmentId: 2, amount: 3200, status: "cleared", clearedDate: d(10), notes: "June salary" },
    { id: 5, chequeNumber: "100249", issueDate: d(10), payee: "Cloudworks Hosting", accountId: 1, departmentId: 4, amount: 299.99, status: "outstanding", clearedDate: null, notes: "Annual hosting renewal" },
    { id: 6, chequeNumber: "100250", issueDate: d(12), payee: "Meridian Legal Services", accountId: 3, departmentId: 1, amount: 1750, status: "cancelled", clearedDate: null, notes: "Cancelled - duplicate invoice" },
    { id: 7, chequeNumber: "100251", issueDate: d(15), payee: "Greenfield Catering", accountId: 1, departmentId: 2, amount: 420.75, status: "cleared", clearedDate: d(18), notes: "Staff event" },
    { id: 8, chequeNumber: "100252", issueDate: d(18), payee: "Apex Maintenance", accountId: 3, departmentId: 3, amount: 980.0, status: "outstanding", clearedDate: null, notes: null },
  ];

  return { accounts, departments, cheques, seq: 100 };
}

function load(): DB {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as DB;
    }
  } catch {
    // ignore corrupt/unavailable storage and fall back to seed
  }
  const fresh = seed();
  save(fresh);
  return fresh;
}

function save(db: DB): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // storage may be unavailable; keep working in-memory for this session
  }
}

function enrich(db: DB, c: ChequeRecord): Cheque {
  const account = db.accounts.find((a) => a.id === c.accountId);
  const department = db.departments.find((d) => d.id === c.departmentId);
  return {
    ...c,
    accountName: account ? account.name : "Unknown",
    departmentName: department ? department.name : "Unknown",
  };
}

export function getProfile(): Profile {
  return {
    firstName: "Demo",
    lastName: "User",
    role: "admin",
    profileImageUrl: "",
    canEdit: true,
    canManage: true,
  };
}

export function listAccounts(): Account[] {
  return load().accounts.slice().sort((a, b) => a.code.localeCompare(b.code));
}

export function listDepartments(): Department[] {
  return load().departments.slice().sort((a, b) => a.code.localeCompare(b.code));
}

export function createAccount(data: { code: string; name: string; active: boolean }): Account {
  const db = load();
  const id = Math.max(0, ...db.accounts.map((a) => a.id)) + 1;
  const account: Account = { id, code: data.code, name: data.name, active: data.active };
  db.accounts.push(account);
  save(db);
  return account;
}

export function createDepartment(data: { code: string; name: string; active: boolean }): Department {
  const db = load();
  const id = Math.max(0, ...db.departments.map((d) => d.id)) + 1;
  const department: Department = { id, code: data.code, name: data.name, active: data.active };
  db.departments.push(department);
  save(db);
  return department;
}

function inRange(date: string, start: string, end: string): boolean {
  return date >= start && date <= end;
}

export function listCheques(filters: ChequeFilters): Cheque[] {
  const db = load();
  const search = filters.search ? filters.search.toLowerCase() : "";
  return db.cheques
    .filter((c) => inRange(c.issueDate, filters.startDate, filters.endDate))
    .filter((c) => (filters.accountId ? c.accountId === filters.accountId : true))
    .filter((c) => (filters.departmentId ? c.departmentId === filters.departmentId : true))
    .filter((c) => (filters.status ? c.status === filters.status : true))
    .filter((c) =>
      search
        ? c.payee.toLowerCase().includes(search) || c.chequeNumber.toLowerCase().includes(search)
        : true
    )
    .map((c) => enrich(db, c))
    .sort((a, b) => (a.issueDate < b.issueDate ? 1 : a.issueDate > b.issueDate ? -1 : 0));
}

export function getCheque(id: number): Cheque | undefined {
  const db = load();
  const cheque = db.cheques.find((c) => c.id === id);
  return cheque ? enrich(db, cheque) : undefined;
}

export function createCheque(data: ChequeInput): Cheque {
  const db = load();
  const id = Math.max(0, ...db.cheques.map((c) => c.id)) + 1;
  const record: ChequeRecord = { id, ...data };
  db.cheques.push(record);
  save(db);
  return enrich(db, record);
}

export function updateCheque(id: number, data: ChequeInput): Cheque {
  const db = load();
  const idx = db.cheques.findIndex((c) => c.id === id);
  if (idx === -1) {
    throw new Error("Cheque not found");
  }
  const record: ChequeRecord = { id, ...data };
  db.cheques[idx] = record;
  save(db);
  return enrich(db, record);
}

export interface DashboardSummary {
  totalCheques: number;
  totalAmount: number;
  outstandingCount: number;
  outstandingAmount: number;
  clearedCount: number;
  clearedAmount: number;
  cancelledCount: number;
}

export function dashboardSummary(): DashboardSummary {
  const db = load();
  const summary: DashboardSummary = {
    totalCheques: 0,
    totalAmount: 0,
    outstandingCount: 0,
    outstandingAmount: 0,
    clearedCount: 0,
    clearedAmount: 0,
    cancelledCount: 0,
  };
  for (const c of db.cheques) {
    summary.totalCheques += 1;
    summary.totalAmount += c.amount;
    if (c.status === "outstanding") {
      summary.outstandingCount += 1;
      summary.outstandingAmount += c.amount;
    } else if (c.status === "cleared") {
      summary.clearedCount += 1;
      summary.clearedAmount += c.amount;
    } else if (c.status === "cancelled") {
      summary.cancelledCount += 1;
    }
  }
  return summary;
}

export interface AccountsReportRow {
  accountId: number;
  accountCode: string;
  accountName: string;
  chequeCount: number;
  totalAmount: number;
  outstandingCount: number;
  outstandingAmount: number;
}

export function accountsReport(params: DateRangeParams): AccountsReportRow[] {
  const db = load();
  const rows = new Map<number, AccountsReportRow>();
  for (const account of db.accounts) {
    rows.set(account.id, {
      accountId: account.id,
      accountCode: account.code,
      accountName: account.name,
      chequeCount: 0,
      totalAmount: 0,
      outstandingCount: 0,
      outstandingAmount: 0,
    });
  }
  for (const c of db.cheques) {
    if (!inRange(c.issueDate, params.startDate, params.endDate)) continue;
    const row = rows.get(c.accountId);
    if (!row) continue;
    row.chequeCount += 1;
    row.totalAmount += c.amount;
    if (c.status === "outstanding") {
      row.outstandingCount += 1;
      row.outstandingAmount += c.amount;
    }
  }
  return Array.from(rows.values()).sort((a, b) => a.accountCode.localeCompare(b.accountCode));
}

export interface DepartmentsReportRow {
  departmentId: number;
  departmentCode: string;
  departmentName: string;
  chequeCount: number;
  totalAmount: number;
  outstandingCount: number;
  outstandingAmount: number;
}

export function departmentsReport(params: DateRangeParams): DepartmentsReportRow[] {
  const db = load();
  const rows = new Map<number, DepartmentsReportRow>();
  for (const department of db.departments) {
    rows.set(department.id, {
      departmentId: department.id,
      departmentCode: department.code,
      departmentName: department.name,
      chequeCount: 0,
      totalAmount: 0,
      outstandingCount: 0,
      outstandingAmount: 0,
    });
  }
  for (const c of db.cheques) {
    if (!inRange(c.issueDate, params.startDate, params.endDate)) continue;
    const row = rows.get(c.departmentId);
    if (!row) continue;
    row.chequeCount += 1;
    row.totalAmount += c.amount;
    if (c.status === "outstanding") {
      row.outstandingCount += 1;
      row.outstandingAmount += c.amount;
    }
  }
  return Array.from(rows.values()).sort((a, b) => a.departmentCode.localeCompare(b.departmentCode));
}

export interface OutstandingReport {
  cheques: Cheque[];
  totalAmount: number;
  totalCount: number;
}

export function outstandingReport(params: DateRangeParams): OutstandingReport {
  const db = load();
  const cheques = db.cheques
    .filter((c) => c.status === "outstanding" && inRange(c.issueDate, params.startDate, params.endDate))
    .map((c) => enrich(db, c))
    .sort((a, b) => (a.issueDate < b.issueDate ? 1 : a.issueDate > b.issueDate ? -1 : 0));
  return {
    cheques,
    totalAmount: cheques.reduce((sum, c) => sum + c.amount, 0),
    totalCount: cheques.length,
  };
}
