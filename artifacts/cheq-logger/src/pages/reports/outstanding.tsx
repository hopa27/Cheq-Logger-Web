import { useState } from "react";
import { useGetOutstandingReport } from "@workspace/api-client-react";
import { useDateRange } from "@/lib/date-context";
import { DataGrid, DataGridHeader, DataGridRow, DataGridHead, DataGridBody, DataGridCell } from "@/components/ui/data-grid";
import { format } from "date-fns";
import { Link } from "wouter";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);
}

export default function OutstandingReport() {
  const { startDate, endDate } = useDateRange();
  const { data: report, isLoading } = useGetOutstandingReport({ startDate, endDate });

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

  const sortedCheques = [...(report?.cheques || [])].sort((a: any, b: any) => {
    if (!sortCol || !sortDir) return 0;
    const aVal = a[sortCol];
    const bVal = b[sortCol];
    if (aVal === bVal) return 0;
    const cmp = aVal < bVal ? -1 : 1;
    return sortDir === "asc" ? cmp : -cmp;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-[24px] font-semibold font-['Livvic'] text-[#002f5c]">Outstanding Cheques</h2>
          <p className="text-[#3d3d3d] font-['Mulish'] mt-1">
            Uncleared cheques from {format(new Date(startDate), "dd, MMM yyyy")} to {format(new Date(endDate), "dd, MMM yyyy")}.
          </p>
        </div>
        {report && (
          <div className="text-right bg-white px-6 py-4 rounded-[8px] border border-[#BBBBBB] shadow-sm">
            <p className="text-[14px] text-[#3d3d3d] font-bold font-['Mulish'] uppercase">Total Outstanding</p>
            <p className="text-[24px] font-bold text-[#d72714] font-['Livvic']">{formatCurrency(report.totalAmount)}</p>
            <p className="text-[14px] text-[#3d3d3d] font-['Mulish']">{report.totalCount} cheques</p>
          </div>
        )}
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
            </DataGridRow>
          </DataGridHeader>
          <DataGridBody>
            {isLoading ? (
              <DataGridRow>
                <DataGridCell colSpan={7} className="text-center py-8">Loading report...</DataGridCell>
              </DataGridRow>
            ) : sortedCheques.length === 0 ? (
              <DataGridRow>
                <DataGridCell colSpan={7} className="text-center py-8">No outstanding cheques for selected date range.</DataGridCell>
              </DataGridRow>
            ) : (
              sortedCheques.map(cheque => (
                <DataGridRow key={cheque.id}>
                  <DataGridCell>
                    <Link 
                      href={`/cheques/${cheque.id}`}
                      className="text-[#005a9c] underline hover:text-white"
                    >
                      View
                    </Link>
                  </DataGridCell>
                  <DataGridCell>{format(new Date(cheque.issueDate), 'dd, MMM yyyy')}</DataGridCell>
                  <DataGridCell>{cheque.chequeNumber}</DataGridCell>
                  <DataGridCell>{cheque.payee}</DataGridCell>
                  <DataGridCell>{cheque.accountName}</DataGridCell>
                  <DataGridCell>{cheque.departmentName}</DataGridCell>
                  <DataGridCell className="text-right font-bold">{formatCurrency(cheque.amount)}</DataGridCell>
                </DataGridRow>
              ))
            )}
          </DataGridBody>
        </DataGrid>
      </div>
    </div>
  );
}