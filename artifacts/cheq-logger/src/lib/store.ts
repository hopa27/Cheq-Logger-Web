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
  logRef: string;
  chequeNumber: string;
  issueDate: string;
  signedBy: string | null;
  payee: string;
  accountId: number;
  departmentId: number;
  amount: number;
  status: ChequeStatus;
  clearedDate: string | null;
  notes: string | null;
  policyRef: string | null;
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

const STORAGE_KEY = "cheq_logger_db_v6";

function seed(): DB {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = (day: number) => format(new Date(y, m, day), "yyyy-MM-dd");

  const accounts: Account[] = [
    { id: 1, code: "843", name: "843", active: true },
    { id: 2, code: "844", name: "844", active: true },
  ];

  const departments: Department[] = [
    { id: 1, code: "ACCOUNTS",     name: "ACCOUNTS",     active: true },
    { id: 2, code: "ACCOUNTS-PRP", name: "ACCOUNTS-PRP", active: true },
    { id: 3, code: "CPA",          name: "CPA",          active: true },
  ];

  const cheques: ChequeRecord[] = [
    { id: 1, logRef: "31008389", chequeNumber: "1",  issueDate: "2008-01-09", signedBy: "SIPMT", payee: "clerical medical", accountId: 1, departmentId: 2, amount: 0,         status: "outstanding", clearedDate: null, notes: "Testmrbaaaae",  policyRef: "100004" },
    { id: 2, logRef: "31008390", chequeNumber: "1",  issueDate: "2008-01-09", signedBy: "SIPMT", payee: "zurich",           accountId: 1, departmentId: 2, amount: 61310.42,  status: "outstanding", clearedDate: null, notes: "Testmrbaacbi",  policyRef: "100218" },
    { id: 3, logRef: "31008391", chequeNumber: "",   issueDate: "2007-12-31", signedBy: "SIPMT", payee: "",                 accountId: 1, departmentId: 1, amount: 0,         status: "outstanding", clearedDate: null, notes: null,           policyRef: null     },
    { id: 4, logRef: "31008393", chequeNumber: "2",  issueDate: "2008-01-10", signedBy: "SIPMT", payee: "PRUDENTIAL",       accountId: 1, departmentId: 2, amount: 28122.00,  status: "outstanding", clearedDate: null, notes: "Testmsbaaaabc", policyRef: "100012" },
    { id: 5, logRef: "31008394", chequeNumber: "3",  issueDate: "2008-01-11", signedBy: "SIPMT", payee: "CBS LTD",          accountId: 1, departmentId: 2, amount: 17330.00,  status: "outstanding", clearedDate: null, notes: "Testwrbaaajd",  policyRef: "100093" },
    { id: 6, logRef: "31008395", chequeNumber: "2",  issueDate: "2008-01-11", signedBy: "SIPMT", payee: "ZURICH",           accountId: 1, departmentId: 2, amount: 54695.20,  status: "outstanding", clearedDate: null, notes: "Testtdbaaaef",  policyRef: "100045" },
    { id: 7, logRef: "31008400", chequeNumber: "4",  issueDate: "2008-01-14", signedBy: "SIPMT", payee: "prudential",       accountId: 1, departmentId: 2, amount: 11090.15,  status: "outstanding", clearedDate: null, notes: "Testmlbaaada",  policyRef: "100030" },
    { id: 8, logRef: "31166764", chequeNumber: "",   issueDate: "2008-01-15", signedBy: "UAT5",  payee: "",                 accountId: 1, departmentId: 2, amount: 21212.00,  status: "outstanding", clearedDate: null, notes: null,           policyRef: null     },
  ];

  return { accounts, departments, cheques, seq: 31166765 };
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
    .sort((a, b) => (parseInt(a.logRef, 10) || 0) - (parseInt(b.logRef, 10) || 0));
}

export function getCheque(id: number): Cheque | undefined {
  const db = load();
  const cheque = db.cheques.find((c) => c.id === id);
  return cheque ? enrich(db, cheque) : undefined;
}

export function createCheque(data: ChequeInput): Cheque {
  const db = load();
  const id = Math.max(0, ...db.cheques.map((c) => c.id)) + 1;
  const logRef = data.logRef || String(Math.max(31000000, ...db.cheques.map(c => parseInt(c.logRef, 10) || 0)) + 1);
  const record: ChequeRecord = { id, ...data, logRef };
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
