import { useQuery, useMutation } from "@tanstack/react-query";
import * as store from "./store";

export const ChequeStatus = {
  outstanding: "outstanding",
  cleared: "cleared",
  cancelled: "cancelled",
} as const;
export type ChequeStatus = (typeof ChequeStatus)[keyof typeof ChequeStatus];

export type {
  Account,
  Department,
  Cheque,
  ChequeInput,
  ChequeFilters,
  Profile,
} from "./store";

export const getListChequesQueryKey = (params?: store.ChequeFilters) =>
  params ? (["cheques", params] as const) : (["cheques"] as const);
export const getGetChequeQueryKey = (id: number) => ["cheque", id] as const;
export const getGetDashboardSummaryQueryKey = () => ["dashboard"] as const;
export const getGetAccountsReportQueryKey = () => ["accounts-report"] as const;
export const getGetDepartmentsReportQueryKey = () => ["departments-report"] as const;
export const getGetOutstandingReportQueryKey = () => ["outstanding-report"] as const;
export const getListAccountsQueryKey = () => ["accounts"] as const;
export const getListDepartmentsQueryKey = () => ["departments"] as const;

export function useGetMyProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => store.getProfile(),
  });
}

export function useListAccounts() {
  return useQuery({
    queryKey: getListAccountsQueryKey(),
    queryFn: () => store.listAccounts(),
  });
}

export function useListDepartments() {
  return useQuery({
    queryKey: getListDepartmentsQueryKey(),
    queryFn: () => store.listDepartments(),
  });
}

export function useCreateAccount() {
  return useMutation({
    mutationFn: (vars: { data: { code: string; name: string; active: boolean } }) =>
      Promise.resolve(store.createAccount(vars.data)),
  });
}

export function useCreateDepartment() {
  return useMutation({
    mutationFn: (vars: { data: { code: string; name: string; active: boolean } }) =>
      Promise.resolve(store.createDepartment(vars.data)),
  });
}

export function useListCheques(params: store.ChequeFilters) {
  return useQuery({
    queryKey: ["cheques", params],
    queryFn: () => store.listCheques(params),
  });
}

interface GetChequeOptions {
  query?: { enabled?: boolean; queryKey?: unknown };
}

export function useGetCheque(id: number, options?: GetChequeOptions) {
  return useQuery({
    queryKey: getGetChequeQueryKey(id),
    queryFn: () => store.getCheque(id) ?? null,
    enabled: options?.query?.enabled ?? true,
  });
}

export function useCreateCheque() {
  return useMutation({
    mutationFn: (vars: { data: store.ChequeInput }) => Promise.resolve(store.createCheque(vars.data)),
  });
}

export function useUpdateCheque() {
  return useMutation({
    mutationFn: (vars: { id: number; data: store.ChequeInput }) =>
      Promise.resolve(store.updateCheque(vars.id, vars.data)),
  });
}

export function useGetDashboardSummary() {
  return useQuery({
    queryKey: getGetDashboardSummaryQueryKey(),
    queryFn: () => store.dashboardSummary(),
  });
}

export function useGetAccountsReport(params: store.DateRangeParams) {
  return useQuery({
    queryKey: ["accounts-report", params],
    queryFn: () => store.accountsReport(params),
  });
}

export function useGetDepartmentsReport(params: store.DateRangeParams) {
  return useQuery({
    queryKey: ["departments-report", params],
    queryFn: () => store.departmentsReport(params),
  });
}

export function useGetOutstandingReport(params: store.DateRangeParams) {
  return useQuery({
    queryKey: ["outstanding-report", params],
    queryFn: () => store.outstandingReport(params),
  });
}
