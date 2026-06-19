import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  useListCheques, 
  useListAccounts, 
  useListDepartments, 
  useGetMyProfile,
  ChequeStatus
} from "@workspace/api-client-react";
import { useDateRange } from "@/lib/date-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import { DataGrid, DataGridHeader, DataGridRow, DataGridHead, DataGridBody, DataGridCell } from "@/components/ui/data-grid";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";
import { MdSearch, MdAdd } from "react-icons/md";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);
}

export default function ChequeList() {
  const [, setLocation] = useLocation();
  const { startDate, endDate } = useDateRange();
  const { data: profile } = useGetMyProfile();
  
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [accountId, setAccountId] = useState<string>("all");
  const [departmentId, setDepartmentId] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");

  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc" | null>(null);

  const handleSort = (col: string) => {
    if (sortCol === col) {
      if (sortDir === "asc") setSortDir("desc");
      else {
        setSortDir(null);
        setSortCol(null);
      }
    } else {
      setSortCol(col);
      setSortDir("asc");
    }
  };

  const { data: accounts } = useListAccounts();
  const { data: departments } = useListDepartments();

  const { data: cheques, isLoading } = useListCheques({
    startDate,
    endDate,
    accountId: accountId !== "all" ? Number(accountId) : undefined,
    departmentId: departmentId !== "all" ? Number(departmentId) : undefined,
    status: status !== "all" ? status as ChequeStatus : undefined,
    search: debouncedSearch || undefined,
  });

  const sortedCheques = [...(cheques || [])].sort((a: any, b: any) => {
    if (!sortCol || !sortDir) return 0;
    const aVal = a[sortCol];
    const bVal = b[sortCol];
    if (aVal === bVal) return 0;
    const cmp = aVal < bVal ? -1 : 1;
    return sortDir === "asc" ? cmp : -cmp;
  });

  const canEdit = profile?.canEdit;

  const accountOptions = [
    { value: "all", label: "All Accounts" },
    ...(accounts?.map(a => ({ value: a.id.toString(), label: `${a.code} - ${a.name}` })) || [])
  ];

  const deptOptions = [
    { value: "all", label: "All Departments" },
    ...(departments?.map(d => ({ value: d.id.toString(), label: `${d.code} - ${d.name}` })) || [])
  ];

  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "outstanding", label: "Outstanding" },
    { value: "cleared", label: "Cleared" },
    { value: "cancelled", label: "Cancelled" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-[24px] font-semibold font-['Livvic'] text-[#002f5c]">Cheque Register</h2>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Button 
                onClick={() => setLocation("/cheques/new")}
                disabled={!canEdit}
              >
                <MdAdd className="h-5 w-5" />
                New / Amend
              </Button>
            </div>
          </TooltipTrigger>
          {!canEdit && (
            <TooltipContent>You need edit access to create cheques.</TooltipContent>
          )}
        </Tooltip>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-white rounded-[8px] border border-[#BBBBBB] shadow-sm">
        <Input
          placeholder="Search payee or cheque #"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onBlur={() => setDebouncedSearch(search)}
          onKeyDown={(e) => e.key === 'Enter' && setDebouncedSearch(search)}
          suffixIcon={<MdSearch />}
        />
        
        <Combobox
          options={accountOptions}
          value={accountId}
          onChange={setAccountId}
          placeholder="Select Account"
        />

        <Combobox
          options={deptOptions}
          value={departmentId}
          onChange={setDepartmentId}
          placeholder="Select Department"
        />

        <Combobox
          options={statusOptions}
          value={status}
          onChange={setStatus}
          placeholder="Select Status"
        />
      </div>

      <div className="bg-white p-6 rounded-[8px] border border-[#BBBBBB] shadow-sm">
        <DataGrid>
          <DataGridHeader>
            <DataGridRow className="hover:bg-transparent odd:bg-transparent even:bg-transparent">
              <DataGridHead>Action</DataGridHead>
              <DataGridHead sortable sortDirection={sortCol === 'issueDate' ? sortDir : null} onSortToggle={() => handleSort('issueDate')}>Date</DataGridHead>
              <DataGridHead sortable sortDirection={sortCol === 'chequeNumber' ? sortDir : null} onSortToggle={() => handleSort('chequeNumber')}>Cheque #</DataGridHead>
              <DataGridHead sortable sortDirection={sortCol === 'payee' ? sortDir : null} onSortToggle={() => handleSort('payee')}>Payee</DataGridHead>
              <DataGridHead sortable sortDirection={sortCol === 'accountName' ? sortDir : null} onSortToggle={() => handleSort('accountName')}>Account</DataGridHead>
              <DataGridHead sortable sortDirection={sortCol === 'departmentName' ? sortDir : null} onSortToggle={() => handleSort('departmentName')}>Dept</DataGridHead>
              <DataGridHead className="text-right" sortable sortDirection={sortCol === 'amount' ? sortDir : null} onSortToggle={() => handleSort('amount')}>Amount</DataGridHead>
              <DataGridHead sortable sortDirection={sortCol === 'status' ? sortDir : null} onSortToggle={() => handleSort('status')}>Status</DataGridHead>
            </DataGridRow>
          </DataGridHeader>
          <DataGridBody>
            {isLoading ? (
              <DataGridRow>
                <DataGridCell colSpan={8} className="text-center py-8">Loading...</DataGridCell>
              </DataGridRow>
            ) : sortedCheques.length === 0 ? (
              <DataGridRow>
                <DataGridCell colSpan={8} className="text-center py-8">No cheques found.</DataGridCell>
              </DataGridRow>
            ) : (
              sortedCheques.map((cheque) => (
                <DataGridRow key={cheque.id}>
                  <DataGridCell>
                    <Link 
                      href={`/cheques/${cheque.id}`}
                      className="text-[#005a9c] underline hover:text-white"
                    >
                      View
                    </Link>
                  </DataGridCell>
                  <DataGridCell>{format(new Date(cheque.issueDate), 'dd, MMM, yyyy')}</DataGridCell>
                  <DataGridCell>{cheque.chequeNumber}</DataGridCell>
                  <DataGridCell>{cheque.payee}</DataGridCell>
                  <DataGridCell>{cheque.accountName}</DataGridCell>
                  <DataGridCell>{cheque.departmentName}</DataGridCell>
                  <DataGridCell className="text-right">{formatCurrency(cheque.amount)}</DataGridCell>
                  <DataGridCell className="capitalize">{cheque.status}</DataGridCell>
                </DataGridRow>
              ))
            )}
          </DataGridBody>
        </DataGrid>
      </div>
    </div>
  );
}