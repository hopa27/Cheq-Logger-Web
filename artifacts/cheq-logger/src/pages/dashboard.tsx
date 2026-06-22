import { useState } from "react";
import { useLocation } from "wouter";
import { useDateRange } from "@/lib/date-context";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import ChequeLogModal from "@/components/ChequeLogModal";
import AccountsReportModal from "@/components/AccountsReportModal";
import OutstandingReportModal from "@/components/OutstandingReportModal";
import { MdPrint, MdNoteAdd } from "react-icons/md";
import { listCheques, listDepartments } from "@/lib/store";
import { format } from "date-fns";

function buildDeptCsv(startDate: string, endDate: string): string {
  const departments = listDepartments();
  const cheques = listCheques({ startDate, endDate });

  const rows: string[] = [
    `Departments Report`,
    `${format(new Date(startDate), "dd MMMM yyyy")} to ${format(new Date(endDate), "dd MMMM yyyy")}`,
    ``,
    `Ref,Date Rec'd,Drawer,Policy Name/Cheque Details,Policy No,Amount,Department,Payin Slip No`,
  ];

  for (const dept of departments) {
    const deptCheques = cheques.filter(c => c.departmentId === dept.id);
    if (deptCheques.length === 0) continue;
    rows.push(`--- ${dept.name} ---`);
    for (const c of deptCheques) {
      rows.push([
        c.id,
        format(new Date(c.issueDate), "dd MMM yyyy"),
        `"${c.payee}"`,
        `"${c.notes ?? ""}"`,
        c.policyRef ?? "",
        c.amount.toFixed(2),
        `"${dept.name}"`,
        c.chequeNumber,
      ].join(","));
    }
    const total = deptCheques.reduce((s, c) => s + c.amount, 0);
    rows.push(`,,,,,${total.toFixed(2)},,`);
    rows.push(``);
  }

  return rows.join("\r\n");
}

async function saveDeptReport(startDate: string, endDate: string) {
  const csv = buildDeptCsv(startDate, endDate);
  const blob = new Blob([csv], { type: "text/csv" });
  const filename = `dept-report-${startDate}-${endDate}.csv`;

  if ("showSaveFilePicker" in window) {
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: filename,
        types: [{ description: "CSV file", accept: { "text/csv": [".csv"] } }],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    } catch {
      // user cancelled or API unavailable — fall through
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { startDate, endDate, setStartDate, setEndDate } = useDateRange();
  const [modalOpen, setModalOpen] = useState(false);
  const [accountsOpen, setAccountsOpen] = useState(false);
  const [outstandingOpen, setOutstandingOpen] = useState(false);

  return (
    <div className="flex justify-center items-start pt-8">
      <div className="w-[360px] rounded-[8px] overflow-hidden shadow-lg border border-[#BBBBBB]">
        <div className="bg-white px-6 py-6 space-y-6">

          <div className="space-y-4">
            <div>
              <label className="block font-['Livvic'] font-semibold text-[#002f5c] text-[15px] mb-1.5">
                Start Date
              </label>
              <DatePicker value={startDate} onChange={setStartDate} />
            </div>
            <div>
              <label className="block font-['Livvic'] font-semibold text-[#002f5c] text-[15px] mb-1.5">
                End Date
              </label>
              <DatePicker value={endDate} onChange={setEndDate} />
            </div>
          </div>

          <div className="h-px bg-[#e0e0e0]" />

          <div className="space-y-3">
            <Button variant="secondary" size="lg" className="w-full justify-start gap-3" onClick={() => setAccountsOpen(true)}>
              <MdPrint size={20} />Accounts
            </Button>
            <Button variant="secondary" size="lg" className="w-full justify-start gap-3" onClick={() => saveDeptReport(startDate, endDate)}>
              <MdPrint size={20} />Dept
            </Button>
            <Button variant="secondary" size="lg" className="w-full justify-start gap-3" onClick={() => setOutstandingOpen(true)}>
              <MdPrint size={20} />O/S Cheques
            </Button>
            <Button variant="secondary" size="lg" className="w-full justify-start gap-3" onClick={() => setModalOpen(true)}>
              <MdNoteAdd size={20} />New / Amend
            </Button>
          </div>
        </div>
      </div>

      <ChequeLogModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <AccountsReportModal open={accountsOpen} onClose={() => setAccountsOpen(false)} />
      <OutstandingReportModal open={outstandingOpen} onClose={() => setOutstandingOpen(false)} />
    </div>
  );
}
