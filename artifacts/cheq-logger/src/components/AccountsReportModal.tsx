import { useRef, useState } from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDateRange } from "@/lib/date-context";
import { useListCheques } from "@/lib/local-data";
import {
  MdClose, MdPrint, MdSave,
  MdSkipPrevious, MdSkipNext,
  MdNavigateBefore, MdNavigateNext,
} from "react-icons/md";

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

const ZOOM_OPTIONS = [50, 75, 100, 125, 150];

export default function AccountsReportModal({ open, onClose }: Props) {
  const { startDate, endDate } = useDateRange();
  const printRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(100);

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
            table { width: 100%; border-collapse: collapse; }
            th { font-weight: bold; border-bottom: 1px solid #000; padding: 3px 6px; text-align: left; font-size: 10px; }
            td { padding: 3px 6px; font-size: 10px; }
            .amt { text-align: right; }
          </style>
        </head>
        <body>${el.innerHTML}</body>
      </html>
    `);
    w.document.close();
    w.focus();
    w.print();
  };

  const handleExport = async () => {
    const el = printRef.current;
    if (!el) return;
    const html = `<html><head><title>Accounts Report</title></head><body>${el.innerHTML}</body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const filename = `accounts-report-${startDate}-${endDate}.html`;
    if ("showSaveFilePicker" in window) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: filename,
          types: [{ description: "HTML file", accept: { "text/html": [".html"] } }],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        return;
      } catch { /* cancelled */ }
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const TB_BTN = "lve-btn lve-btn-secondary !rounded-full !p-0 !w-8 !h-8 shrink-0 disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none";

  const thClass = "text-left font-['Mulish'] font-bold text-[10px] text-[#3d3d3d] border-b border-[#3d3d3d] pb-1 whitespace-nowrap px-1";
  const tdClass = "font-['Mulish'] text-[11px] text-[#3d3d3d] py-[3px] px-1 whitespace-nowrap";

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent
        className="p-0 gap-0 max-w-[900px] w-[95vw] rounded-[8px] overflow-hidden border border-[#BBBBBB] shadow-2xl [&>button]:hidden"
        onInteractOutside={e => e.preventDefault()}
      >
        <DialogTitle className="sr-only">Accounts Report</DialogTitle>

        {/* LV Header */}
        <div className="bg-[#00263e] px-5 py-3 flex items-center justify-between">
          <span className="font-['Livvic'] text-white text-[16px] font-semibold">
            Accounts Report
          </span>
          <button type="button" onClick={onClose} title="Close"
            className="lve-btn lve-btn-secondary !rounded-full !p-0 !w-7 !h-7 shrink-0">
            <MdClose size={16} />
          </button>
        </div>

        {/* Viewer toolbar */}
        <div className="bg-[#f5f7fa] border-b border-[#BBBBBB] px-4 py-2 flex items-center gap-2 flex-wrap">
          {/* Navigation */}
          <button className={TB_BTN} title="First page" disabled><MdSkipPrevious size={14} /></button>
          <button className={TB_BTN} title="Previous page" disabled><MdNavigateBefore size={14} /></button>
          <span className="font-['Mulish'] text-[11px] text-[#3d3d3d] px-2 select-none">
            1 of {cheques.length > 0 ? "1+" : "1"}
          </span>
          <button className={TB_BTN} title="Next page" disabled><MdNavigateNext size={14} /></button>
          <button className={TB_BTN} title="Last page" disabled><MdSkipNext size={14} /></button>

          <div className="w-px h-5 bg-[#BBBBBB] mx-1" />

          {/* Print & Export */}
          <button className={TB_BTN} title="Print" onClick={handlePrint}><MdPrint size={14} /></button>
          <button className={TB_BTN} title="Export / Save As" onClick={handleExport}><MdSave size={14} /></button>

          <div className="w-px h-5 bg-[#BBBBBB] mx-1" />

          {/* Zoom */}
          <select
            value={zoom}
            onChange={e => setZoom(Number(e.target.value))}
            className="font-['Mulish'] text-[12px] font-bold text-[#00263e] border border-[#04589b] rounded-[6px] bg-white h-8 px-2 focus:outline-none focus:border-[#006cf4] cursor-pointer"
          >
            {ZOOM_OPTIONS.map(z => (
              <option key={z} value={z}>{z}%</option>
            ))}
          </select>

          <div className="w-px h-5 bg-[#BBBBBB] mx-1" />

          {/* Stats */}
          <span className="font-['Mulish'] text-[12px] font-semibold text-[#4a4a49] select-none">
            Total: {cheques.length}
          </span>
          <span className="font-['Mulish'] text-[12px] font-semibold text-[#4a4a49] select-none mx-1">
            {formatCurrency(totalAmount)}
          </span>
          <span className="font-['Mulish'] text-[12px] text-[#4a4a49] select-none">
            {cheques.length} of {cheques.length}
          </span>
        </div>

        {/* Print preview */}
        <div className="bg-[#808080] px-6 py-6 overflow-auto max-h-[65vh]">
          <div style={{ transformOrigin: "top center", transform: `scale(${zoom / 100})`, transition: "transform 0.15s" }}>
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
        </div>


      </DialogContent>
    </Dialog>
  );
}
