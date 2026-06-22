import { useRef } from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDateRange } from "@/lib/date-context";
import { useListCheques } from "@/lib/local-data";
import { MdClose, MdPrint } from "react-icons/md";

interface Props {
  open: boolean;
  onClose: () => void;
}

function formatDate(d: string) {
  return format(new Date(d), "dd MMM yyyy");
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function formatRangeLabel(d: string) {
  return format(new Date(d), "dd MMMM yyyy");
}

export default function AccountsReportModal({ open, onClose }: Props) {
  const { startDate, endDate } = useDateRange();
  const printRef = useRef<HTMLDivElement>(null);

  const { data: cheques = [] } = useListCheques({ startDate, endDate });

  const totalAmount = cheques.reduce((s, c) => s + c.amount, 0);

  const handlePrint = () => {
    const el = printRef.current;
    if (!el) return;
    const w = window.open("", "_blank", "width=900,height=650");
    if (!w) return;
    w.document.write(`
      <html>
        <head>
          <title>Accounts Report</title>
          <style>
            body { font-family: Arial, sans-serif; font-size: 11px; margin: 24px; color: #000; }
            .range { text-align: center; margin-bottom: 18px; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; }
            th { font-weight: bold; border-bottom: 1px solid #000; padding: 3px 6px; text-align: left; font-size: 10px; }
            td { padding: 3px 6px; font-size: 10px; }
            .amt { text-align: right; }
            .total-row td { border-top: 1px solid #000; font-weight: bold; padding-top: 6px; }
          </style>
        </head>
        <body>${el.innerHTML}</body>
      </html>
    `);
    w.document.close();
    w.focus();
    w.print();
  };

  const thClass = "text-left font-['Mulish'] font-bold text-[10px] text-[#3d3d3d] border-b border-[#3d3d3d] pb-1 whitespace-nowrap px-1";
  const tdClass = "font-['Mulish'] text-[11px] text-[#3d3d3d] py-[3px] px-1 whitespace-nowrap";

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent
        className="p-0 gap-0 max-w-[900px] w-[95vw] rounded-[8px] overflow-hidden border border-[#BBBBBB] shadow-2xl [&>button]:hidden"
        onInteractOutside={e => e.preventDefault()}
      >
        <DialogTitle className="sr-only">Accounts Report</DialogTitle>

        {/* Header */}
        <div className="bg-[#00263e] px-5 py-3 flex items-center justify-between">
          <span className="font-['Livvic'] text-white text-[16px] font-semibold">
            Accounts Report
          </span>
          <button type="button" onClick={onClose} title="Close"
            className="lve-btn lve-btn-secondary !rounded-full !p-0 !w-7 !h-7 shrink-0">
            <MdClose size={16} />
          </button>
        </div>

        {/* Print preview */}
        <div className="bg-[#d0d0d0] px-6 py-6 overflow-auto max-h-[70vh]">
          <div className="bg-white shadow-md mx-auto"
            style={{ minWidth: 720, padding: "32px 40px" }}
            ref={printRef}>

            {/* Date range header */}
            <div className="text-center text-[12px] font-['Mulish'] text-[#3d3d3d] mb-5 tracking-wide">
              {formatRangeLabel(startDate)}&nbsp;&nbsp;&nbsp;to&nbsp;&nbsp;&nbsp;{formatRangeLabel(endDate)}
            </div>

            {/* Table */}
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className={thClass}>Ref</th>
                  <th className={thClass}>Date Rec'd</th>
                  <th className={thClass}>Drawer</th>
                  <th className={thClass + " min-w-[160px]"}>Policy Name/Cheque details</th>
                  <th className={thClass}>Policy No</th>
                  <th className={thClass + " text-right"}>Amount</th>
                  <th className={thClass}>Department</th>
                  <th className={thClass}>Payin Slip No</th>
                  <th className={thClass}>Signed Posted</th>
                </tr>
              </thead>
              <tbody>
                {cheques.length === 0 ? (
                  <tr>
                    <td colSpan={9} className={tdClass + " py-6 text-[#999] text-center"}>
                      No cheques in this date range.
                    </td>
                  </tr>
                ) : (
                  cheques.map(c => (
                    <tr key={c.id} className="odd:bg-[#f9f9f9]">
                      <td className={tdClass}>{c.id}</td>
                      <td className={tdClass}>{formatDate(c.issueDate)}</td>
                      <td className={tdClass}>{c.payee}</td>
                      <td className={tdClass}>{c.notes ?? ""}</td>
                      <td className={tdClass}>{c.policyRef ?? ""}</td>
                      <td className={tdClass + " text-right"}>{formatCurrency(c.amount)}</td>
                      <td className={tdClass}>{c.departmentName}</td>
                      <td className={tdClass}>{c.chequeNumber}</td>
                      <td className={tdClass}></td>
                    </tr>
                  ))
                )}
                {/* Total row */}
                <tr>
                  <td colSpan={5} className={tdClass + " border-t border-[#3d3d3d] pt-2 font-bold"}>Total</td>
                  <td className={tdClass + " border-t border-[#3d3d3d] pt-2 text-right font-bold"}>
                    {formatCurrency(totalAmount)}
                  </td>
                  <td colSpan={3} className={tdClass + " border-t border-[#3d3d3d] pt-2"} />
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#f5f7fa] border-t border-[#BBBBBB] px-5 py-3 flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={handlePrint}>
            <MdPrint size={16} className="mr-1" /> Print
          </Button>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
