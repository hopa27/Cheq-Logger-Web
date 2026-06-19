import { useState } from "react";
import { useGetDepartmentsReport } from "@workspace/api-client-react";
import { useDateRange } from "@/lib/date-context";
import { DataGrid, DataGridHeader, DataGridRow, DataGridHead, DataGridBody, DataGridCell } from "@/components/ui/data-grid";
import { format } from "date-fns";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);
}

export default function DepartmentsReport() {
  const { startDate, endDate } = useDateRange();
  const { data: report, isLoading } = useGetDepartmentsReport({ startDate, endDate });

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

  const sortedReport = [...(report || [])].sort((a: any, b: any) => {
    if (!sortCol || !sortDir) return 0;
    const aVal = a[sortCol];
    const bVal = b[sortCol];
    if (aVal === bVal) return 0;
    const cmp = aVal < bVal ? -1 : 1;
    return sortDir === "asc" ? cmp : -cmp;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[24px] font-semibold font-['Livvic'] text-[#002f5c]">Departments Report</h2>
        <p className="text-[#3d3d3d] font-['Mulish'] mt-1">
          Activity by department from {format(new Date(startDate), "dd, MMM yyyy")} to {format(new Date(endDate), "dd, MMM yyyy")}.
        </p>
      </div>

      <div className="bg-white p-6 rounded-[8px] border border-[#BBBBBB] shadow-sm">
        <DataGrid>
          <DataGridHeader>
            <DataGridRow className="hover:bg-transparent odd:bg-transparent even:bg-transparent">
              <DataGridHead sortable sortDirection={sortCol === 'departmentCode' ? sortDir : null} onSortToggle={() => handleSort('departmentCode')}>Dept Code</DataGridHead>
              <DataGridHead sortable sortDirection={sortCol === 'departmentName' ? sortDir : null} onSortToggle={() => handleSort('departmentName')}>Dept Name</DataGridHead>
              <DataGridHead className="text-right" sortable sortDirection={sortCol === 'chequeCount' ? sortDir : null} onSortToggle={() => handleSort('chequeCount')}>Total Cheques</DataGridHead>
              <DataGridHead className="text-right" sortable sortDirection={sortCol === 'totalAmount' ? sortDir : null} onSortToggle={() => handleSort('totalAmount')}>Total Amount</DataGridHead>
              <DataGridHead className="text-right" sortable sortDirection={sortCol === 'outstandingCount' ? sortDir : null} onSortToggle={() => handleSort('outstandingCount')}>O/S Cheques</DataGridHead>
              <DataGridHead className="text-right" sortable sortDirection={sortCol === 'outstandingAmount' ? sortDir : null} onSortToggle={() => handleSort('outstandingAmount')}>O/S Amount</DataGridHead>
            </DataGridRow>
          </DataGridHeader>
          <DataGridBody>
            {isLoading ? (
              <DataGridRow>
                <DataGridCell colSpan={6} className="text-center py-8">Loading report...</DataGridCell>
              </DataGridRow>
            ) : sortedReport.length === 0 ? (
              <DataGridRow>
                <DataGridCell colSpan={6} className="text-center py-8">No data for selected date range.</DataGridCell>
              </DataGridRow>
            ) : (
              sortedReport.map(row => (
                <DataGridRow key={row.departmentId}>
                  <DataGridCell>{row.departmentCode}</DataGridCell>
                  <DataGridCell>{row.departmentName}</DataGridCell>
                  <DataGridCell className="text-right">{row.chequeCount}</DataGridCell>
                  <DataGridCell className="text-right font-bold">{formatCurrency(row.totalAmount)}</DataGridCell>
                  <DataGridCell className="text-right">{row.outstandingCount}</DataGridCell>
                  <DataGridCell className="text-right font-bold text-[#d72714] group-hover:text-white">{formatCurrency(row.outstandingAmount)}</DataGridCell>
                </DataGridRow>
              ))
            )}
          </DataGridBody>
        </DataGrid>
      </div>
    </div>
  );
}