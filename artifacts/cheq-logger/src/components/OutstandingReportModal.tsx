import { useRef, useState } from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDateRange } from "@/lib/date-context";
import { useListCheques, useListAccounts } from "@/lib/local-data";
import {
  MdClose, MdPrint, MdSave,
  MdSkipPrevious, MdSkipNext,
  MdNavigateBefore, MdNavigateNext,
} from "react-icons/md";

interface Props {
  open: boolean;
  onClose: () => void;
}

function fmtDate(d: string) {
  return format(new Date(d), "dd MMM yyyy");
}

function fmtCurrency(n: number) {
  return n === 0 ? "" : new Intl.NumberFormat("en-GB", {
    style: "currency", currency: "GBP",
  }).format(n);
}

function fmtRangeLabel(d: string) {
  return format(new Date(d), "dd MMMM yyyy");
}

const ZOOM_OPTIONS = [50, 75, 100, 125, 150];

export default function OutstandingReportModal({ open, onClose }: Props) {
  const { startDate, endDate } = useDateRange();
  const printRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(100);

  const { data: allCheques = [] } = useListCheques({ startDate, endDate });
  const { data: accounts = [] } = useListAccounts();

  const outstanding = allCheques.filter(c => c.status === "outstanding");
  const totalAmount = outstanding.reduce((s, c) => s + c.amount, 0);

  const handlePrint = () => {
    const el = printRef.current;
    if (!el) return;
    const w = window.open("", "_blank", "width=960,height=650");
    if (!w) return;
    w.document.write(`
      <html><head><title>O/S Cheques Report</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 10px; margin: 24px; color: #000; }
        h2 { text-align: center; font-size: 13px; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; }
        th { font-weight: bold; border-bottom: 1px solid #000; padding: 2px 5px; text-align: left; }
        td { padding: 2px 5px; }
        .section { font-weight: bold; padding: 6px 5px 2px; }
        .amt { text-align: right; }
        .total td { border-top: 1px solid #000; font-weight: bold; padding-top: 4px; }
      </style></head>
      <body>${el.innerHTML}</body></html>
    `);
    w.document.close(); w.focus(); w.print();
  };

  const handleExport = async () => {
    const el = printRef.current;
    if (!el) return;
    const html = `<html><head><title>O/S Cheques</title></head><body>${el.innerHTML}</body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const filename = `os-cheques-${startDate}-${endDate}.html`;
    if ("showSaveFilePicker" in window) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: filename,
          types: [{ description: "HTML file", accept: { "text/html": [".html"] } }],
        });
        const writable = await handle.createWritable();
        await writable.write(blob); await writable.close(); return;
      } catch { /* cancelled */ }
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const TB_BTN = "lve-btn lve-btn-secondary !rounded-full !p-0 !w-8 !h-8 shrink-0 disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none";
  const thCls = "text-left font-['Mulish'] font-bold text-[10px] text-[#3d3d3d] border-b border-[#3d3d3d] pb-1 whitespace-nowrap px-1";
  const tdCls = "font-['Mulish'] text-[11px] text-[#3d3d3d] py-[2px] px-1 whitespace-nowrap";

  const accountGroups = accounts.map(acct => ({
    acct,
    cheques: outstanding.filter(c => c.accountId === acct.id),
  })).filter(g => g.cheques.length > 0);

  const unaccounted = outstanding.filter(
    c => !accounts.find(a => a.id === c.accountId)
  );

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent
        className="p-0 gap-0 max-w-[960px] w-[97vw] rounded-[8px] overflow-hidden border border-[#BBBBBB] shadow-2xl [&>button]:hidden"
        onInteractOutside={e => e.preventDefault()}
      >
        <DialogTitle className="sr-only">O/S Cheques Report</DialogTitle>

        {/* LV Header */}
        <div className="bg-[#00263e] px-5 py-3 flex items-center justify-between">
          <span className="font-['Livvic'] text-white text-[16px] font-semibold">
            O/S Cheques Report
          </span>
          <button type="button" onClick={onClose} title="Close"
            className="lve-btn lve-btn-secondary !rounded-full !p-0 !w-7 !h-7 shrink-0">
            <MdClose size={16} />
          </button>
        </div>

        {/* Viewer toolbar */}
        <div className="bg-[#f5f7fa] border-b border-[#BBBBBB] px-4 py-2 flex items-center gap-2 flex-wrap">
          <button className={TB_BTN} disabled title="First"><MdSkipPrevious size={14} /></button>
          <button className={TB_BTN} disabled title="Previous"><MdNavigateBefore size={14} /></button>
          <span className="font-['Mulish'] text-[11px] text-[#3d3d3d] px-2 select-none">
            1 of {outstanding.length > 0 ? "1+" : "1"}
          </span>
          <button className={TB_BTN} disabled title="Next"><MdNavigateNext size={14} /></button>
          <button className={TB_BTN} disabled title="Last"><MdSkipNext size={14} /></button>
          <div className="w-px h-5 bg-[#BBBBBB] mx-1" />
          <button className={TB_BTN} title="Print" onClick={handlePrint}><MdPrint size={14} /></button>
          <button className={TB_BTN} title="Export / Save As" onClick={handleExport}><MdSave size={14} /></button>
          <div className="w-px h-5 bg-[#BBBBBB] mx-1" />
          <select
            value={zoom}
            onChange={e => setZoom(Number(e.target.value))}
            className="font-['Mulish'] text-[12px] font-bold text-[#00263e] border border-[#04589b] rounded-[6px] bg-white h-8 px-2 focus:outline-none focus:border-[#006cf4] cursor-pointer"
          >
            {ZOOM_OPTIONS.map(z => <option key={z} value={z}>{z}%</option>)}
          </select>
          <div className="w-px h-5 bg-[#BBBBBB] mx-1" />
          <span className="font-['Mulish'] text-[12px] font-semibold text-[#4a4a49] select-none">
            Total: {outstanding.length}
          </span>
          <span className="font-['Mulish'] text-[12px] text-[#4a4a49] select-none mx-1">
            {outstanding.length} of {outstanding.length}
          </span>
        </div>

        {/* Print preview */}
        <div className="bg-[#808080] px-6 py-6 overflow-auto max-h-[65vh]">
          <div style={{ transformOrigin: "top center", transform: `scale(${zoom / 100})`, transition: "transform 0.15s" }}>
            <div className="bg-white shadow-md mx-auto" style={{ minWidth: 760, padding: "32px 48px" }} ref={printRef}>

              {/* Title */}
              <h2 className="text-center font-['Mulish'] font-bold text-[13px] text-[#3d3d3d] mb-4 uppercase tracking-wide">
                Cheques &ldquo;Unallocated&rdquo;:
              </h2>

              {/* Date range */}
              <div className="text-center font-['Mulish'] text-[11px] text-[#3d3d3d] mb-5">
                {fmtRangeLabel(startDate)}&nbsp;&nbsp;to&nbsp;&nbsp;{fmtRangeLabel(endDate)}
              </div>

              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className={thCls}>Ref</th>
                    <th className={thCls}>Date Rec'd</th>
                    <th className={thCls}>Drawer</th>
                    <th className={thCls + " min-w-[150px]"}>Policy Name/Cheque details</th>
                    <th className={thCls}>Policy No</th>
                    <th className={thCls + " text-right"}>Amount</th>
                    <th className={thCls}>Account Credited</th>
                    <th className={thCls}>Payin Slip No</th>
                    <th className={thCls}>Signed Posted</th>
                  </tr>
                </thead>
                <tbody>
                  {outstanding.length === 0 ? (
                    <tr>
                      <td colSpan={9} className={tdCls + " py-6 text-[#999] text-center"}>
                        No outstanding cheques in this date range.
                      </td>
                    </tr>
                  ) : (
                    <>
                      {accountGroups.map((g, i) => (
                        <>
                          <tr key={`hdr-${g.acct.id}`}>
                            <td colSpan={9} className={tdCls + " font-bold pt-3 pb-1"}>
                              {i + 1}. Account No. {g.acct.code}
                            </td>
                          </tr>
                          {g.cheques.map(c => (
                            <tr key={c.id}>
                              <td className={tdCls}>{c.id}</td>
                              <td className={tdCls}>{fmtDate(c.issueDate)}</td>
                              <td className={tdCls}>{c.payee}</td>
                              <td className={tdCls}>{c.notes ?? ""}</td>
                              <td className={tdCls}>{c.policyRef ?? ""}</td>
                              <td className={tdCls + " text-right"}>{fmtCurrency(c.amount)}</td>
                              <td className={tdCls}>{c.accountName}</td>
                              <td className={tdCls}>{c.chequeNumber}</td>
                              <td className={tdCls}></td>
                            </tr>
                          ))}
                        </>
                      ))}
                      {unaccounted.map(c => (
                        <tr key={c.id}>
                          <td className={tdCls}>{c.id}</td>
                          <td className={tdCls}>{fmtDate(c.issueDate)}</td>
                          <td className={tdCls}>{c.payee}</td>
                          <td className={tdCls}>{c.notes ?? ""}</td>
                          <td className={tdCls}>{c.policyRef ?? ""}</td>
                          <td className={tdCls + " text-right"}>{fmtCurrency(c.amount)}</td>
                          <td className={tdCls}></td>
                          <td className={tdCls}>{c.chequeNumber}</td>
                          <td className={tdCls}></td>
                        </tr>
                      ))}
                      {/* Total */}
                      <tr className="total">
                        <td colSpan={5} className={tdCls + " border-t border-[#3d3d3d] pt-2 font-bold"}>Total</td>
                        <td className={tdCls + " border-t border-[#3d3d3d] pt-2 text-right font-bold"}>
                          {fmtCurrency(totalAmount)}
                        </td>
                        <td colSpan={3} className={tdCls + " border-t border-[#3d3d3d] pt-2"} />
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>


      </DialogContent>
    </Dialog>
  );
}
