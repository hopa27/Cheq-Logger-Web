import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useDateRange } from "@/lib/date-context";
import {
  MdClose, MdPrint, MdSave,
  MdSkipPrevious, MdSkipNext,
  MdNavigateBefore, MdNavigateNext,
} from "react-icons/md";

interface Props {
  open: boolean;
  onClose: () => void;
}

function fmtRangeLabel(d: string) {
  return format(new Date(d), "dd MMMM yyyy");
}

// A4 portrait at 96 dpi
const A4_W = 794;
const A4_H = 1123;

const ZOOM_OPTIONS = [50, 75, 100, 125, 150];

interface DummyRow {
  ref: string;
  date: string;
  drawer: string;
  policyName: string;
  policyNo: string;
  amount: string;
  account: string;
  payinSlip: string;
  signedPosted: string;
}

const DUMMY_ROWS: DummyRow[] = [
  { ref: "31,008,419", date: "16 Jan 2026", drawer: "ZURICH", policyName: "", policyNo: "100030", amount: "", account: "", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,008,453", date: "21 Jan 2026", drawer: "PRUDENTIAL", policyName: "", policyNo: "100054", amount: "", account: "", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,009,334", date: "29 Apr 2026", drawer: "AVIVA", policyName: "", policyNo: "", amount: "", account: "", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,009,857", date: "30 Apr 2026", drawer: "LEGAL & GENERAL", policyName: "", policyNo: "", amount: "", account: "", payinSlip: "", signedPosted: "ACCJO" },
  { ref: "31,009,918", date: "07 May 2026", drawer: "SCOTTISH WIDOWS", policyName: "", policyNo: "100930", amount: "", account: "", payinSlip: "39", signedPosted: "SIPMT" },
  { ref: "31,009,962", date: "08 May 2026", drawer: "CLERICAL MEDICAL", policyName: "", policyNo: "", amount: "", account: "", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,009,971", date: "07 May 2026", drawer: "ZURICH", policyName: "", policyNo: "100930", amount: "", account: "", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,010,598", date: "20 Jun 2026", drawer: "Legal and General", policyName: "L&G Cpay 019310272", policyNo: "", amount: "£49,254.12", account: "", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,010,660", date: "06 Jun 2026", drawer: "AEGON", policyName: "", policyNo: "101504", amount: "", account: "", payinSlip: "", signedPosted: "" },
  { ref: "31,010,893", date: "10 Jul 2026", drawer: "ROYAL LONDON", policyName: "", policyNo: "", amount: "", account: "", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,010,895", date: "10 Jul 2026", drawer: "PHOENIX GROUP", policyName: "", policyNo: "", amount: "", account: "", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,011,200", date: "25 Jul 2026", drawer: "AVIVA LIFE", policyName: "", policyNo: "", amount: "", account: "", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,011,266", date: "11 Jul 2026", drawer: "ARRIVA", policyName: "", policyNo: "102117", amount: "£2,876.97", account: "", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,012,035", date: "03 Sep 2026", drawer: "NFU MUTUAL", policyName: "", policyNo: "", amount: "", account: "", payinSlip: "316", signedPosted: "ACCJO" },
  { ref: "31,012,135", date: "08 Sep 2026", drawer: "STANDARD LIFE", policyName: "", policyNo: "", amount: "", account: "", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,013,308", date: "27 Oct 2026", drawer: "Legal and General", policyName: "L&G Cpay 020227837", policyNo: "", amount: "£9,658.26", account: "", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,015,674", date: "06 Feb 2026", drawer: "SUNLIFE", policyName: "", policyNo: "", amount: "", account: "", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,016,254", date: "09 Mar 2026", drawer: "PRUDENTIAL", policyName: "Pru Cpay 10022841", policyNo: "103001", amount: "£14,320.00", account: "", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,016,901", date: "15 Mar 2026", drawer: "AVIVA", policyName: "", policyNo: "103120", amount: "", account: "", payinSlip: "42", signedPosted: "SIPMT" },
  { ref: "31,017,432", date: "22 Mar 2026", drawer: "ROYAL LONDON", policyName: "RL Cpay 00291847", policyNo: "", amount: "£6,100.50", account: "", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,017,889", date: "28 Mar 2026", drawer: "ZURICH", policyName: "", policyNo: "103298", amount: "", account: "", payinSlip: "", signedPosted: "ACCJO" },
  { ref: "31,018,003", date: "01 Apr 2026", drawer: "CLERICAL MEDICAL", policyName: "CM Cpay 55018293", policyNo: "103400", amount: "£3,450.00", account: "", payinSlip: "55", signedPosted: "SIPMT" },
  { ref: "31,018,341", date: "05 Apr 2026", drawer: "SCOTTISH WIDOWS", policyName: "", policyNo: "", amount: "", account: "", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,018,720", date: "10 Apr 2026", drawer: "AEGON", policyName: "", policyNo: "103601", amount: "", account: "", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,019,112", date: "14 Apr 2026", drawer: "NFU MUTUAL", policyName: "NFU Cpay 00381920", policyNo: "", amount: "£11,274.80", account: "", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,019,587", date: "20 Apr 2026", drawer: "STANDARD LIFE", policyName: "", policyNo: "103799", amount: "", account: "", payinSlip: "61", signedPosted: "ACCJO" },
  { ref: "31,019,990", date: "25 Apr 2026", drawer: "AVIVA LIFE", policyName: "Aviva Cpay 10048291", policyNo: "103900", amount: "£7,830.00", account: "", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,020,114", date: "28 Apr 2026", drawer: "PHOENIX GROUP", policyName: "", policyNo: "", amount: "", account: "", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,020,443", date: "02 May 2026", drawer: "LEGAL & GENERAL", policyName: "L&G Cpay 021004561", policyNo: "104010", amount: "£22,500.00", account: "", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,020,881", date: "07 May 2026", drawer: "PRUDENTIAL", policyName: "", policyNo: "104111", amount: "", account: "", payinSlip: "78", signedPosted: "SIPMT" },
  { ref: "31,021,230", date: "12 May 2026", drawer: "ZURICH", policyName: "", policyNo: "", amount: "", account: "", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,021,605", date: "15 May 2026", drawer: "ROYAL LONDON", policyName: "", policyNo: "104298", amount: "", account: "", payinSlip: "", signedPosted: "ACCJO" },
  { ref: "31,022,014", date: "20 May 2026", drawer: "CLERICAL MEDICAL", policyName: "CM Cpay 55029812", policyNo: "104401", amount: "£5,200.00", account: "", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,022,389", date: "22 May 2026", drawer: "SUNLIFE", policyName: "", policyNo: "", amount: "", account: "", payinSlip: "83", signedPosted: "SIPMT" },
  // Page 2 rows
  { ref: "31,022,740", date: "27 May 2026", drawer: "SCOTTISH WIDOWS", policyName: "", policyNo: "104589", amount: "", account: "", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,023,001", date: "29 May 2026", drawer: "AEGON", policyName: "Aegon Cpay 00412938", policyNo: "", amount: "£8,640.00", account: "", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,023,298", date: "02 Jun 2026", drawer: "NFU MUTUAL", policyName: "", policyNo: "104721", amount: "", account: "", payinSlip: "89", signedPosted: "ACCJO" },
  { ref: "31,023,561", date: "04 Jun 2026", drawer: "AVIVA", policyName: "Aviva Cpay 10059382", policyNo: "104800", amount: "£31,000.00", account: "", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,023,877", date: "06 Jun 2026", drawer: "LEGAL & GENERAL", policyName: "", policyNo: "", amount: "", account: "", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,024,002", date: "09 Jun 2026", drawer: "ZURICH", policyName: "", policyNo: "104920", amount: "", account: "", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,024,331", date: "10 Jun 2026", drawer: "PHOENIX GROUP", policyName: "PG Cpay 00501928", policyNo: "105010", amount: "£4,750.00", account: "", payinSlip: "97", signedPosted: "SIPMT" },
  { ref: "31,024,590", date: "11 Jun 2026", drawer: "PRUDENTIAL", policyName: "", policyNo: "", amount: "", account: "", payinSlip: "", signedPosted: "ACCJO" },
  { ref: "31,024,811", date: "12 Jun 2026", drawer: "SUNLIFE", policyName: "", policyNo: "105198", amount: "", account: "", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,025,034", date: "12 Jun 2026", drawer: "ROYAL LONDON", policyName: "RL Cpay 00318291", policyNo: "105220", amount: "£15,900.00", account: "", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,025,210", date: "12 Jun 2026", drawer: "SCOTTISH WIDOWS", policyName: "", policyNo: "", amount: "", account: "", payinSlip: "101", signedPosted: "SIPMT" },
  { ref: "31,025,388", date: "12 Jun 2026", drawer: "CLERICAL MEDICAL", policyName: "", policyNo: "105340", amount: "", account: "", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,025,602", date: "12 Jun 2026", drawer: "AVIVA LIFE", policyName: "Aviva Cpay 10072018", policyNo: "", amount: "£9,120.50", account: "", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,025,799", date: "12 Jun 2026", drawer: "AEGON", policyName: "", policyNo: "105480", amount: "", account: "", payinSlip: "", signedPosted: "ACCJO" },
  { ref: "31,025,901", date: "12 Jun 2026", drawer: "NFU MUTUAL", policyName: "", policyNo: "", amount: "", account: "", payinSlip: "108", signedPosted: "SIPMT" },
  { ref: "31,026,044", date: "12 Jun 2026", drawer: "LEGAL & GENERAL", policyName: "L&G Cpay 022110293", policyNo: "105601", amount: "£18,450.00", account: "", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,026,198", date: "12 Jun 2026", drawer: "ZURICH", policyName: "", policyNo: "", amount: "", account: "", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,026,340", date: "12 Jun 2026", drawer: "STANDARD LIFE", policyName: "", policyNo: "105720", amount: "", account: "", payinSlip: "114", signedPosted: "SIPMT" },
  { ref: "31,026,501", date: "12 Jun 2026", drawer: "PRUDENTIAL", policyName: "Pru Cpay 10038920", policyNo: "105810", amount: "£27,300.00", account: "", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,026,677", date: "12 Jun 2026", drawer: "PHOENIX GROUP", policyName: "", policyNo: "", amount: "", account: "", payinSlip: "", signedPosted: "ACCJO" },
  { ref: "31,026,890", date: "12 Jun 2026", drawer: "ROYAL LONDON", policyName: "", policyNo: "105930", amount: "", account: "", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,027,012", date: "12 Jun 2026", drawer: "AVIVA", policyName: "Aviva Cpay 10083124", policyNo: "106010", amount: "£3,875.00", account: "", payinSlip: "120", signedPosted: "SIPMT" },
  { ref: "31,027,201", date: "12 Jun 2026", drawer: "CLERICAL MEDICAL", policyName: "", policyNo: "", amount: "", account: "", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,027,388", date: "12 Jun 2026", drawer: "AEGON", policyName: "", policyNo: "106180", amount: "", account: "", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,027,590", date: "12 Jun 2026", drawer: "NFU MUTUAL", policyName: "NFU Cpay 00428193", policyNo: "106290", amount: "£44,100.00", account: "", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,027,801", date: "12 Jun 2026", drawer: "SUNLIFE", policyName: "", policyNo: "", amount: "", account: "", payinSlip: "127", signedPosted: "ACCJO" },
  { ref: "31,028,002", date: "12 Jun 2026", drawer: "SCOTTISH WIDOWS", policyName: "", policyNo: "106401", amount: "", account: "", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,028,190", date: "12 Jun 2026", drawer: "LEGAL & GENERAL", policyName: "L&G Cpay 023019482", policyNo: "106500", amount: "£7,650.00", account: "", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,028,340", date: "12 Jun 2026", drawer: "STANDARD LIFE", policyName: "", policyNo: "", amount: "", account: "", payinSlip: "133", signedPosted: "SIPMT" },
  { ref: "31,028,501", date: "12 Jun 2026", drawer: "ZURICH", policyName: "", policyNo: "106620", amount: "", account: "", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,028,750", date: "12 Jun 2026", drawer: "PRUDENTIAL", policyName: "Pru Cpay 10044102", policyNo: "106710", amount: "£19,875.00", account: "", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,028,920", date: "12 Jun 2026", drawer: "PHOENIX GROUP", policyName: "", policyNo: "", amount: "", account: "", payinSlip: "138", signedPosted: "ACCJO" },
  { ref: "31,029,001", date: "12 Jun 2026", drawer: "AVIVA LIFE", policyName: "", policyNo: "106830", amount: "", account: "", payinSlip: "", signedPosted: "SIPMT" },
];

const PAGE_1_ROWS = DUMMY_ROWS.slice(0, 34);
const PAGE_2_ROWS = DUMMY_ROWS.slice(34);

// Columns must sum to ≤ 698px (A4 794px − 48px×2 side padding)
const COL_WIDTHS = "grid-cols-[72px_72px_104px_128px_60px_64px_72px_52px_74px]";

function TableHead() {
  const thCls = "text-left font-['Mulish'] font-bold text-[9.5px] text-[#3d3d3d] border-b border-[#3d3d3d] pb-[3px] leading-tight pr-2";
  return (
    <div className={`grid ${COL_WIDTHS} mb-[1px]`}>
      <span className={thCls}>Ref</span>
      <span className={thCls}>Date Rec'd</span>
      <span className={thCls}>Drawer</span>
      <span className={thCls}>Policy Name/Cheque details</span>
      <span className={thCls}>Policy No</span>
      <span className={thCls + " text-right"}>Amount</span>
      <span className={thCls}>Account Credited</span>
      <span className={thCls}>Payin Slip No</span>
      <span className={thCls}>Signed Posted</span>
    </div>
  );
}

function TableRows({ rows }: { rows: DummyRow[] }) {
  const tdCls = "font-['Mulish'] text-[9.5px] text-[#3d3d3d] py-[1.5px] pr-2 truncate";
  return (
    <>
      {rows.map((r, i) => (
        <div key={i} className={`grid ${COL_WIDTHS}`}>
          <span className={tdCls}>{r.ref}</span>
          <span className={tdCls}>{r.date}</span>
          <span className={tdCls}>{r.drawer}</span>
          <span className={tdCls}>{r.policyName}</span>
          <span className={tdCls}>{r.policyNo}</span>
          <span className={tdCls + " text-right"}>{r.amount}</span>
          <span className={tdCls}>{r.account}</span>
          <span className={tdCls}>{r.payinSlip}</span>
          <span className={tdCls}>{r.signedPosted}</span>
        </div>
      ))}
    </>
  );
}

export default function OutstandingReportModal({ open, onClose }: Props) {
  const { startDate, endDate } = useDateRange();
  const printRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(100);

  // Auto-fit zoom to modal width whenever the modal opens
  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        const availW = scrollRef.current.clientWidth - 48; // subtract px-6 padding
        const fit = Math.round((availW / A4_W) * 100);
        setZoom(Math.min(Math.max(fit, 50), 150));
      }
    });
  }, [open]);

  const handlePrint = () => {
    const el = printRef.current;
    if (!el) return;
    const w = window.open("", "_blank", "width=960,height=650");
    if (!w) return;
    w.document.write(`
      <html><head><title>O/S Cheques Report</title>
      <style>
        @page { size: A4 portrait; margin: 20mm 15mm; }
        body { font-family: Arial, sans-serif; font-size: 9px; color: #000; }
        h2 { text-align: center; font-size: 12px; margin-bottom: 12px; }
        .subtitle { text-align: center; font-size: 9px; margin-bottom: 16px; }
        .section { font-weight: bold; padding: 6px 0 2px; font-size: 9px; }
        .grid { display: grid; grid-template-columns: 72px 72px 104px 128px 60px 64px 72px 52px 74px; }
        .th { font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 2px; font-size: 8.5px; padding-right: 6px; }
        .td { font-size: 8.5px; padding: 1px 6px 1px 0; }
        .amt { text-align: right; }
        .total-line { border-top: 1px solid #000; font-weight: bold; padding-top: 3px; }
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

  const scale = zoom / 100;
  // Outer scroll area needs to accommodate scaled pages
  const scaledTotalH = (A4_H * 2 + 24) * scale + 48; // 2 pages + gap + padding

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
          <span className="font-['Mulish'] text-[12px] text-[#4a4a49] px-1 select-none">
            1 of 2
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
            Total: {DUMMY_ROWS.length}
          </span>
          <span className="font-['Mulish'] text-[12px] text-[#4a4a49] select-none mx-1">
            {DUMMY_ROWS.length} of {DUMMY_ROWS.length}
          </span>
        </div>

        {/* Scrollable preview area */}
        <div
          ref={scrollRef}
          className="bg-[#808080] overflow-auto"
          style={{ maxHeight: "68vh" }}
        >
          {/* Wrapper that expands to hold scaled content so scrollbar is accurate */}
          <div
            style={{
              width: A4_W * scale + 48,
              height: scaledTotalH,
              position: "relative",
            }}
          >
            {/* Scaled pages container */}
            <div
              ref={printRef}
              style={{
                transformOrigin: "top left",
                transform: `scale(${scale})`,
                position: "absolute",
                top: 0,
                left: 0,
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              {/* Page 1 */}
              <div
                style={{
                  width: A4_W,
                  height: A4_H,
                  background: "white",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.35)",
                  padding: "40px 48px",
                  overflow: "hidden",
                  boxSizing: "border-box",
                }}
              >
                <h2 style={{ textAlign: "center", fontFamily: "Mulish, Arial, sans-serif", fontWeight: 700, fontSize: 13, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1, color: "#3d3d3d" }}>
                  Cheques &ldquo;Unallocated&rdquo;:
                </h2>
                <div style={{ textAlign: "center", fontFamily: "Mulish, Arial, sans-serif", fontSize: 11, color: "#3d3d3d", marginBottom: 18 }}>
                  {fmtRangeLabel(startDate)}&nbsp;&nbsp;to&nbsp;&nbsp;{fmtRangeLabel(endDate)}
                </div>
                <div className="font-['Mulish'] font-bold text-[9.5px] text-[#3d3d3d] pb-1">
                  1. Account No. blank
                </div>
                <TableHead />
                <TableRows rows={PAGE_1_ROWS} />
              </div>

              {/* Page 2 */}
              <div
                style={{
                  width: A4_W,
                  height: A4_H,
                  background: "white",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.35)",
                  padding: "40px 48px",
                  overflow: "hidden",
                  boxSizing: "border-box",
                }}
              >
                <div className="font-['Mulish'] font-bold text-[9.5px] text-[#3d3d3d] pb-1">
                  1. Account No. blank (continued)
                </div>
                <TableHead />
                <TableRows rows={PAGE_2_ROWS} />
                {/* Total */}
                <div className={`grid ${COL_WIDTHS} mt-2 border-t border-[#3d3d3d] pt-1`}>
                  <span className="col-span-5 font-['Mulish'] font-bold text-[9.5px] text-[#3d3d3d]">Total</span>
                  <span className="font-['Mulish'] font-bold text-[9.5px] text-[#3d3d3d] text-right">£311,775.15</span>
                  <span className="col-span-3" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
