import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDateRange } from "@/lib/date-context";
import {
  MdClose, MdPrint, MdSave,
  MdSkipPrevious, MdSkipNext,
  MdNavigateBefore, MdNavigateNext,
} from "react-icons/md";

const EXPORT_FORMATS = [
  { value: "pdf",          label: "Acrobat Format (PDF)" },
  { value: "rpt",          label: "Crystal Reports (RPT)",               disabled: true },
  { value: "html32",       label: "HTML 3.2" },
  { value: "html40",       label: "HTML 4.0" },
  { value: "xls",          label: "MS Excel 97-2000" },
  { value: "xls-data",     label: "MS Excel 97-2000 (Data only)" },
  { value: "doc",          label: "MS Word" },
  { value: "odbc",         label: "ODBC",                                disabled: true },
  { value: "rec-nospace",  label: "Record style (columns no spaces)" },
  { value: "rec-space",    label: "Record style (columns with spaces)" },
  { value: "rdef",         label: "Report Definition",                   disabled: true },
  { value: "rtf",          label: "Rich Text Format" },
  { value: "csv",          label: "Separated Values (CSV)" },
  { value: "tsv",          label: "Tab-separated text" },
];

function ExportDialog({
  open, onCancel, onOk,
}: { open: boolean; onCancel: () => void; onOk: (fmt: string) => void }) {
  const [fmt, setFmt] = useState("pdf");

  return (
    <Dialog open={open} onOpenChange={v => !v && onCancel()}>
      <DialogContent
        className="p-0 gap-0 max-w-[400px] rounded-[8px] overflow-hidden border border-[#BBBBBB] shadow-2xl [&>button]:hidden"
        onInteractOutside={e => e.preventDefault()}
      >
        <DialogTitle className="sr-only">Export</DialogTitle>

        {/* LV header */}
        <div className="bg-[#00263e] px-5 py-3 flex items-center justify-between">
          <span className="font-['Livvic'] text-white text-[16px] font-semibold">Export</span>
          <button type="button" onClick={onCancel}
            className="lve-btn lve-btn-secondary !rounded-full !p-0 !w-7 !h-7 shrink-0" aria-label="Close">
            <MdClose size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="bg-white px-5 py-5 space-y-4">
          <div>
            <label className="block font-['Livvic'] font-semibold text-[#002f5c] text-[13px] mb-1">
              Format:
            </label>
            <select
              value={fmt}
              onChange={e => setFmt(e.target.value)}
              className="h-[44px] w-full font-['Mulish'] text-[13px] text-[#3d3d3d] border border-[#BBBBBB] rounded-[6px] px-3 bg-white focus:outline-none focus:border-[#006cf4] cursor-pointer"
            >
              {EXPORT_FORMATS.map(f => (
                <option key={f.value} value={f.value} disabled={f.disabled}>{f.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-['Livvic'] font-semibold text-[#002f5c] text-[13px] mb-1">
              Destination:
            </label>
            <div className="h-[44px] w-full font-['Mulish'] text-[13px] text-[#3d3d3d] border border-[#BBBBBB] rounded-[6px] px-3 bg-[#f5f7fa] flex items-center select-none">
              Disk file
            </div>
          </div>
        </div>

        {/* LV footer */}
        <div className="bg-[#f5f7fa] border-t border-[#BBBBBB] px-5 py-3 flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onCancel}>Cancel</Button>
          <Button size="sm" onClick={() => onOk(fmt)}>OK</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface Props {
  open: boolean;
  onClose: () => void;
}

function fmtRangeLabel(d: string) {
  return format(new Date(d), "dd MMMM yyyy");
}

const A4_W = 794;
const A4_H = 1123;
const ZOOM_OPTIONS = [50, 75, 100, 125, 150];

// Columns sum to 698px (A4 794px − 48px×2 side padding)
const COL_WIDTHS = "grid-cols-[72px_72px_104px_128px_60px_64px_72px_52px_74px]";

interface DummyRow {
  ref: string;
  date: string;
  drawer: string;
  policyName: string;
  policyNo: string;
  amount: string;
  department: string;
  payinSlip: string;
  signedPosted: string;
}

const DUMMY_ROWS: DummyRow[] = [
  { ref: "31,008,419", date: "16 Jan 2026", drawer: "ZURICH", policyName: "", policyNo: "100030", amount: "", department: "CPA", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,008,453", date: "21 Jan 2026", drawer: "PRUDENTIAL", policyName: "", policyNo: "100054", amount: "", department: "CPA", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,009,334", date: "29 Apr 2026", drawer: "AVIVA", policyName: "", policyNo: "", amount: "", department: "ACC", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,009,857", date: "30 Apr 2026", drawer: "LEGAL & GENERAL", policyName: "", policyNo: "", amount: "", department: "ACCOUNTS", payinSlip: "", signedPosted: "ACCJO" },
  { ref: "31,009,918", date: "07 May 2026", drawer: "SCOTTISH WIDOWS", policyName: "", policyNo: "100930", amount: "", department: "BQU", payinSlip: "39", signedPosted: "SIPMT" },
  { ref: "31,009,962", date: "08 May 2026", drawer: "CLERICAL MEDICAL", policyName: "", policyNo: "", amount: "", department: "CPA", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,009,971", date: "07 May 2026", drawer: "ZURICH", policyName: "", policyNo: "100930", amount: "", department: "CPA-760", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,010,598", date: "20 Jun 2026", drawer: "Legal and General", policyName: "L&G Cpay 019310272", policyNo: "", amount: "£49,254.12", department: "CPA-830", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,010,660", date: "06 Jun 2026", drawer: "AEGON", policyName: "", policyNo: "101504", amount: "", department: "ADMIN", payinSlip: "", signedPosted: "" },
  { ref: "31,010,893", date: "10 Jul 2026", drawer: "ROYAL LONDON", policyName: "", policyNo: "", amount: "", department: "CPA", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,010,895", date: "10 Jul 2026", drawer: "PHOENIX GROUP", policyName: "", policyNo: "", amount: "", department: "ACC", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,011,200", date: "25 Jul 2026", drawer: "AVIVA LIFE", policyName: "", policyNo: "", amount: "", department: "ACCOUNTS_F", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,011,266", date: "11 Jul 2026", drawer: "ARRIVA", policyName: "", policyNo: "102117", amount: "£2,876.97", department: "CPA", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,012,035", date: "03 Sep 2026", drawer: "NFU MUTUAL", policyName: "", policyNo: "", amount: "", department: "ACCOUNTS_G", payinSlip: "316", signedPosted: "ACCJO" },
  { ref: "31,012,135", date: "08 Sep 2026", drawer: "STANDARD LIFE", policyName: "", policyNo: "", amount: "", department: "CPA", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,013,308", date: "27 Oct 2026", drawer: "Legal and General", policyName: "L&G Cpay 020227837", policyNo: "", amount: "£9,658.26", department: "CPA-926", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,015,674", date: "06 Feb 2026", drawer: "SUNLIFE", policyName: "", policyNo: "", amount: "", department: "ADMIN", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,016,254", date: "09 Mar 2026", drawer: "PRUDENTIAL", policyName: "Pru Cpay 10022841", policyNo: "103001", amount: "£14,320.00", department: "CPA", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,016,901", date: "15 Mar 2026", drawer: "AVIVA", policyName: "", policyNo: "103120", amount: "", department: "BQU", payinSlip: "42", signedPosted: "SIPMT" },
  { ref: "31,017,432", date: "22 Mar 2026", drawer: "ROYAL LONDON", policyName: "RL Cpay 00291847", policyNo: "", amount: "£6,100.50", department: "CPA", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,017,889", date: "28 Mar 2026", drawer: "ZURICH", policyName: "", policyNo: "103298", amount: "", department: "ACC", payinSlip: "", signedPosted: "ACCJO" },
  { ref: "31,018,003", date: "01 Apr 2026", drawer: "CLERICAL MEDICAL", policyName: "CM Cpay 55018293", policyNo: "103400", amount: "£3,450.00", department: "CPA-PRP", payinSlip: "55", signedPosted: "SIPMT" },
  { ref: "31,018,341", date: "05 Apr 2026", drawer: "SCOTTISH WIDOWS", policyName: "", policyNo: "", amount: "", department: "CPA", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,018,720", date: "10 Apr 2026", drawer: "AEGON", policyName: "", policyNo: "103601", amount: "", department: "ACCOUNTS", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,019,112", date: "14 Apr 2026", drawer: "NFU MUTUAL", policyName: "NFU Cpay 00381920", policyNo: "", amount: "£11,274.80", department: "BQU", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,019,587", date: "20 Apr 2026", drawer: "STANDARD LIFE", policyName: "", policyNo: "103799", amount: "", department: "CPA", payinSlip: "61", signedPosted: "ACCJO" },
  { ref: "31,019,990", date: "25 Apr 2026", drawer: "AVIVA LIFE", policyName: "Aviva Cpay 10048291", policyNo: "103900", amount: "£7,830.00", department: "ACCOUNTS_F", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,020,114", date: "28 Apr 2026", drawer: "PHOENIX GROUP", policyName: "", policyNo: "", amount: "", department: "CPA-760", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,020,443", date: "02 May 2026", drawer: "LEGAL & GENERAL", policyName: "L&G Cpay 021004561", policyNo: "104010", amount: "£22,500.00", department: "CPA-830", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,020,881", date: "07 May 2026", drawer: "PRUDENTIAL", policyName: "", policyNo: "104111", amount: "", department: "CPA", payinSlip: "78", signedPosted: "SIPMT" },
  { ref: "31,021,230", date: "12 May 2026", drawer: "ZURICH", policyName: "", policyNo: "", amount: "", department: "ACC", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,021,605", date: "15 May 2026", drawer: "ROYAL LONDON", policyName: "", policyNo: "104298", amount: "", department: "CPA", payinSlip: "", signedPosted: "ACCJO" },
  { ref: "31,022,014", date: "20 May 2026", drawer: "CLERICAL MEDICAL", policyName: "CM Cpay 55029812", policyNo: "104401", amount: "£5,200.00", department: "ADMIN", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,022,389", date: "22 May 2026", drawer: "SUNLIFE", policyName: "", policyNo: "", amount: "", department: "CPA-926", payinSlip: "83", signedPosted: "SIPMT" },
  // Page 2
  { ref: "31,022,740", date: "27 May 2026", drawer: "SCOTTISH WIDOWS", policyName: "", policyNo: "104589", amount: "", department: "CPA", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,023,001", date: "29 May 2026", drawer: "AEGON", policyName: "Aegon Cpay 00412938", policyNo: "", amount: "£8,640.00", department: "BQU", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,023,298", date: "02 Jun 2026", drawer: "NFU MUTUAL", policyName: "", policyNo: "104721", amount: "", department: "ACCOUNTS_G", payinSlip: "89", signedPosted: "ACCJO" },
  { ref: "31,023,561", date: "04 Jun 2026", drawer: "AVIVA", policyName: "Aviva Cpay 10059382", policyNo: "104800", amount: "£31,000.00", department: "CPA", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,023,877", date: "06 Jun 2026", drawer: "LEGAL & GENERAL", policyName: "", policyNo: "", amount: "", department: "ACCOUNTS", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,024,002", date: "09 Jun 2026", drawer: "ZURICH", policyName: "", policyNo: "104920", amount: "", department: "CPA-PRP", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,024,331", date: "10 Jun 2026", drawer: "PHOENIX GROUP", policyName: "PG Cpay 00501928", policyNo: "105010", amount: "£4,750.00", department: "CPA", payinSlip: "97", signedPosted: "SIPMT" },
  { ref: "31,024,590", date: "11 Jun 2026", drawer: "PRUDENTIAL", policyName: "", policyNo: "", amount: "", department: "ACC", payinSlip: "", signedPosted: "ACCJO" },
  { ref: "31,024,811", date: "12 Jun 2026", drawer: "SUNLIFE", policyName: "", policyNo: "105198", amount: "", department: "ADMIN", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,025,034", date: "12 Jun 2026", drawer: "ROYAL LONDON", policyName: "RL Cpay 00318291", policyNo: "105220", amount: "£15,900.00", department: "CPA-760", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,025,210", date: "12 Jun 2026", drawer: "SCOTTISH WIDOWS", policyName: "", policyNo: "", amount: "", department: "BQU", payinSlip: "101", signedPosted: "SIPMT" },
  { ref: "31,025,388", date: "12 Jun 2026", drawer: "CLERICAL MEDICAL", policyName: "", policyNo: "105340", amount: "", department: "CPA", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,025,602", date: "12 Jun 2026", drawer: "AVIVA LIFE", policyName: "Aviva Cpay 10072018", policyNo: "", amount: "£9,120.50", department: "ACCOUNTS_F", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,025,799", date: "12 Jun 2026", drawer: "AEGON", policyName: "", policyNo: "105480", amount: "", department: "CPA-830", payinSlip: "", signedPosted: "ACCJO" },
  { ref: "31,025,901", date: "12 Jun 2026", drawer: "NFU MUTUAL", policyName: "", policyNo: "", amount: "", department: "CPA", payinSlip: "108", signedPosted: "SIPMT" },
  { ref: "31,026,044", date: "12 Jun 2026", drawer: "LEGAL & GENERAL", policyName: "L&G Cpay 022110293", policyNo: "105601", amount: "£18,450.00", department: "CPA-926", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,026,198", date: "12 Jun 2026", drawer: "ZURICH", policyName: "", policyNo: "", amount: "", department: "ACCOUNTS_G", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,026,340", date: "12 Jun 2026", drawer: "STANDARD LIFE", policyName: "", policyNo: "105720", amount: "", department: "CPA", payinSlip: "114", signedPosted: "SIPMT" },
  { ref: "31,026,501", date: "12 Jun 2026", drawer: "PRUDENTIAL", policyName: "Pru Cpay 10038920", policyNo: "105810", amount: "£27,300.00", department: "BQU", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,026,677", date: "12 Jun 2026", drawer: "PHOENIX GROUP", policyName: "", policyNo: "", amount: "", department: "CPA", payinSlip: "", signedPosted: "ACCJO" },
  { ref: "31,026,890", date: "12 Jun 2026", drawer: "ROYAL LONDON", policyName: "", policyNo: "105930", amount: "", department: "ACC", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,027,012", date: "12 Jun 2026", drawer: "AVIVA", policyName: "Aviva Cpay 10083124", policyNo: "106010", amount: "£3,875.00", department: "ADMIN", payinSlip: "120", signedPosted: "SIPMT" },
  { ref: "31,027,201", date: "12 Jun 2026", drawer: "CLERICAL MEDICAL", policyName: "", policyNo: "", amount: "", department: "CPA-PRP", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,027,388", date: "12 Jun 2026", drawer: "AEGON", policyName: "", policyNo: "106180", amount: "", department: "CPA", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,027,590", date: "12 Jun 2026", drawer: "NFU MUTUAL", policyName: "NFU Cpay 00428193", policyNo: "106290", amount: "£44,100.00", department: "CPA-760", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,027,801", date: "12 Jun 2026", drawer: "SUNLIFE", policyName: "", policyNo: "", amount: "", department: "ACCOUNTS", payinSlip: "127", signedPosted: "ACCJO" },
  { ref: "31,028,002", date: "12 Jun 2026", drawer: "SCOTTISH WIDOWS", policyName: "", policyNo: "106401", amount: "", department: "CPA-830", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,028,190", date: "12 Jun 2026", drawer: "LEGAL & GENERAL", policyName: "L&G Cpay 023019482", policyNo: "106500", amount: "£7,650.00", department: "CPA", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,028,340", date: "12 Jun 2026", drawer: "STANDARD LIFE", policyName: "", policyNo: "", amount: "", department: "BQU", payinSlip: "133", signedPosted: "SIPMT" },
  { ref: "31,028,501", date: "12 Jun 2026", drawer: "ZURICH", policyName: "", policyNo: "106620", amount: "", department: "CPA-926", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,028,750", date: "12 Jun 2026", drawer: "PRUDENTIAL", policyName: "Pru Cpay 10044102", policyNo: "106710", amount: "£19,875.00", department: "CPA", payinSlip: "", signedPosted: "SIPMT" },
  { ref: "31,028,920", date: "12 Jun 2026", drawer: "PHOENIX GROUP", policyName: "", policyNo: "", amount: "", department: "ACCOUNTS_G", payinSlip: "138", signedPosted: "ACCJO" },
  { ref: "31,029,001", date: "12 Jun 2026", drawer: "AVIVA LIFE", policyName: "", policyNo: "106830", amount: "", department: "ACC", payinSlip: "", signedPosted: "SIPMT" },
];

const PAGE_1_ROWS = DUMMY_ROWS.slice(0, 34);
const PAGE_2_ROWS = DUMMY_ROWS.slice(34);

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
      <span className={thCls}>Department</span>
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
          <span className={tdCls}>{r.department}</span>
          <span className={tdCls}>{r.payinSlip}</span>
          <span className={tdCls}>{r.signedPosted}</span>
        </div>
      ))}
    </>
  );
}

const TOTAL_PAGES = 2;

export default function AccountsReportModal({ open, onClose }: Props) {
  const { startDate, endDate } = useDateRange();
  const printRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [exportOpen, setExportOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCurrentPage(1);
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        const availW = scrollRef.current.clientWidth - 48;
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
      <html><head><title>Accounts Report</title>
      <style>
        @page { size: A4 portrait; margin: 20mm 15mm; }
        body { font-family: Arial, sans-serif; font-size: 9px; color: #000; }
        h2 { text-align: center; font-size: 12px; margin-bottom: 12px; }
        .subtitle { text-align: center; font-size: 9px; margin-bottom: 16px; }
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

  const download = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportOk = async (fmt: string) => {
    setExportOpen(false);
    const el = printRef.current;
    const base = `accounts-report-${startDate}-${endDate}`;

    const printHtml = (title: string, style: string) => {
      if (!el) return;
      const w = window.open("", "_blank", "width=960,height=650");
      if (!w) return;
      w.document.write(`<html><head><title>${title}</title><style>${style}</style></head><body>${el.innerHTML}</body></html>`);
      w.document.close(); w.focus(); w.print();
    };

    const PAGE_STYLE = `
      @page { size: A4 portrait; margin: 20mm 15mm; }
      body { font-family: Arial, sans-serif; font-size: 9px; color: #000; }
      h2 { text-align: center; font-size: 12px; margin-bottom: 12px; }
      .grid { display: grid; grid-template-columns: 72px 72px 104px 128px 60px 64px 72px 52px 74px; }
      .th { font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 2px; font-size: 8.5px; padding-right: 6px; }
      .td { font-size: 8.5px; padding: 1px 6px 1px 0; }
    `;

    const csvRow = (r: typeof DUMMY_ROWS[0], sep: string, pad?: number) => {
      const cols = [r.ref, r.date, r.drawer, r.policyName, r.policyNo, r.amount, r.department, r.payinSlip, r.signedPosted];
      if (pad) return cols.map(v => (v ?? "").padEnd(pad)).join(sep);
      return cols.map(v => (sep === "," ? `"${(v ?? "").replace(/"/g, '""')}"` : (v ?? ""))).join(sep);
    };

    const HEADERS = ["Ref", "Date Rec'd", "Drawer", "Policy Name/Cheque Details", "Policy No", "Amount", "Department", "Payin Slip No", "Signed Posted"];

    switch (fmt) {
      case "pdf":
        printHtml("Accounts Report", PAGE_STYLE);
        break;

      case "html32":
      case "html40": {
        if (!el) break;
        const doctype = fmt === "html32" ? "<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 3.2//EN\">" : "<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.0//EN\">";
        const html = `${doctype}\n<html><head><title>Accounts Report</title></head><body>${el.innerHTML}</body></html>`;
        download(new Blob([html], { type: "text/html" }), `${base}.html`);
        break;
      }

      case "xls":
      case "xls-data": {
        const rows = fmt === "xls-data" ? DUMMY_ROWS : DUMMY_ROWS;
        const tableRows = rows.map(r =>
          `<tr>${[r.ref, r.date, r.drawer, r.policyName, r.policyNo, r.amount, r.department, r.payinSlip, r.signedPosted]
            .map(v => `<td>${v ?? ""}</td>`).join("")}</tr>`
        ).join("\n");
        const headerRow = fmt === "xls" ? `<tr>${HEADERS.map(h => `<th>${h}</th>`).join("")}</tr>\n` : "";
        const xls = `<html><head><meta charset="UTF-8"><style>table{border-collapse:collapse}td,th{border:1px solid #ccc;padding:3px 6px;font-size:9pt}</style></head><body><table>${headerRow}${tableRows}</table></body></html>`;
        download(new Blob([xls], { type: "application/vnd.ms-excel" }), `${base}.xls`);
        break;
      }

      case "doc": {
        if (!el) break;
        const doc = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="UTF-8"><title>Accounts Report</title></head><body>${el.innerHTML}</body></html>`;
        download(new Blob([doc], { type: "application/msword" }), `${base}.doc`);
        break;
      }

      case "rec-nospace": {
        const lines = [HEADERS.map(h => h.replace(/\s/g, "")).join(" "), ...DUMMY_ROWS.map(r => csvRow(r, " "))];
        download(new Blob([lines.join("\r\n")], { type: "text/plain" }), `${base}.txt`);
        break;
      }

      case "rec-space": {
        const lines = [HEADERS.join(" "), ...DUMMY_ROWS.map(r => csvRow(r, " ", 20))];
        download(new Blob([lines.join("\r\n")], { type: "text/plain" }), `${base}.txt`);
        break;
      }

      case "rtf": {
        const rtfRows = DUMMY_ROWS.map(r =>
          [r.ref, r.date, r.drawer, r.policyName, r.policyNo, r.amount, r.department, r.payinSlip, r.signedPosted]
            .map(v => `\\pard\\intbl ${v ?? ""}\\cell`).join("") + "\\row"
        ).join("\n");
        const rtf = `{\\rtf1\\ansi{\\fonttbl{\\f0 Arial;}}\\f0\\fs18\n{\\b Accounts Report}\\par\\par\n{\\trowd${rtfRows}\\pard}\\par}`;
        download(new Blob([rtf], { type: "application/rtf" }), `${base}.rtf`);
        break;
      }

      case "csv": {
        const lines = [HEADERS.map(h => `"${h}"`).join(","), ...DUMMY_ROWS.map(r => csvRow(r, ","))];
        download(new Blob([lines.join("\r\n")], { type: "text/csv" }), `${base}.csv`);
        break;
      }

      case "tsv": {
        const lines = [HEADERS.join("\t"), ...DUMMY_ROWS.map(r => csvRow(r, "\t"))];
        download(new Blob([lines.join("\r\n")], { type: "text/tab-separated-values" }), `${base}.tsv`);
        break;
      }
    }
  };

  const TB_BTN = "lve-btn lve-btn-secondary !rounded-full !p-0 !w-8 !h-8 shrink-0 disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none";
  const scale = zoom / 100;
  const scaledPageH = A4_H * scale + 48;

  const isFirst = currentPage === 1;
  const isLast  = currentPage === TOTAL_PAGES;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent
        className="p-0 gap-0 max-w-[960px] w-[97vw] rounded-[8px] overflow-hidden border border-[#BBBBBB] shadow-2xl [&>button]:hidden"
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
          <button className={TB_BTN} disabled={isFirst} title="First"    onClick={() => setCurrentPage(1)}><MdSkipPrevious size={14} /></button>
          <button className={TB_BTN} disabled={isFirst} title="Previous" onClick={() => setCurrentPage(p => Math.max(1, p - 1))}><MdNavigateBefore size={14} /></button>
          <span className="font-['Mulish'] text-[12px] text-[#4a4a49] px-1 select-none">{currentPage} of {TOTAL_PAGES}</span>
          <button className={TB_BTN} disabled={isLast}  title="Next"     onClick={() => setCurrentPage(p => Math.min(TOTAL_PAGES, p + 1))}><MdNavigateNext size={14} /></button>
          <button className={TB_BTN} disabled={isLast}  title="Last"     onClick={() => setCurrentPage(TOTAL_PAGES)}><MdSkipNext size={14} /></button>
          <div className="w-px h-5 bg-[#BBBBBB] mx-1" />
          <button className={TB_BTN} title="Print" onClick={handlePrint}><MdPrint size={14} /></button>
          <button className={TB_BTN} title="Export / Save As" onClick={() => setExportOpen(true)}><MdSave size={14} /></button>
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
        </div>

        {/* Scrollable preview area — one page at a time */}
        <div
          ref={scrollRef}
          className="bg-[#808080] overflow-auto"
          style={{ maxHeight: "68vh" }}
        >
          <div style={{ width: A4_W * scale + 48, height: scaledPageH, position: "relative" }}>
            <div
              ref={printRef}
              style={{
                transformOrigin: "top left",
                transform: `scale(${scale})`,
                position: "absolute",
                top: 0,
                left: 0,
                padding: "24px",
              }}
            >
              {currentPage === 1 && (
                <div style={{ width: A4_W, height: A4_H, background: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.35)", padding: "40px 48px", overflow: "hidden", boxSizing: "border-box" }}>
                  <h2 style={{ textAlign: "center", fontFamily: "Mulish, Arial, sans-serif", fontWeight: 700, fontSize: 13, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1, color: "#3d3d3d" }}>
                    Accounts Report
                  </h2>
                  <div style={{ textAlign: "center", fontFamily: "Mulish, Arial, sans-serif", fontSize: 11, color: "#3d3d3d", marginBottom: 18 }}>
                    {fmtRangeLabel(startDate)}&nbsp;&nbsp;to&nbsp;&nbsp;{fmtRangeLabel(endDate)}
                  </div>
                  <div className="font-['Mulish'] font-bold text-[9.5px] text-[#3d3d3d] pb-1">
                    1. Account No. 843
                  </div>
                  <TableHead />
                  <TableRows rows={PAGE_1_ROWS} />
                </div>
              )}

              {currentPage === 2 && (
                <div style={{ width: A4_W, height: A4_H, background: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.35)", padding: "40px 48px", overflow: "hidden", boxSizing: "border-box" }}>
                  <div className="font-['Mulish'] font-bold text-[9.5px] text-[#3d3d3d] pb-1">
                    1. Account No. 843 (continued)
                  </div>
                  <TableHead />
                  <TableRows rows={PAGE_2_ROWS} />
                  <div className={`grid ${COL_WIDTHS} mt-2 border-t border-[#3d3d3d] pt-1`}>
                    <span className="col-span-5 font-['Mulish'] font-bold text-[9.5px] text-[#3d3d3d]">Total</span>
                    <span className="font-['Mulish'] font-bold text-[9.5px] text-[#3d3d3d] text-right">£311,775.15</span>
                    <span className="col-span-3" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>

      <ExportDialog
        open={exportOpen}
        onCancel={() => setExportOpen(false)}
        onOk={handleExportOk}
      />
    </Dialog>
  );
}
