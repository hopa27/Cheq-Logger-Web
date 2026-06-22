import React, { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  useListCheques,
  useListAccounts,
  useListDepartments,
  useCreateCheque,
  useUpdateCheque,
  getListChequesQueryKey,
  getGetDashboardSummaryQueryKey,
} from "@/lib/local-data";
import {
  MdSkipPrevious,
  MdSkipNext,
  MdNavigateBefore,
  MdNavigateNext,
  MdNoteAdd,
  MdClose,
} from "react-icons/md";

interface FormState {
  findQuery: string;
  chequeNumber: string;
  issueDate: string;
  departmentId: string;
  accountId: string;
  payee: string;
  notes: string;
  policyRef: string;
  amount: string;
  status: string;
}

const emptyForm = (): FormState => ({
  findQuery: "",
  chequeNumber: "",
  issueDate: format(new Date(), "yyyy-MM-dd"),
  departmentId: "",
  accountId: "",
  payee: "",
  notes: "",
  policyRef: "",
  amount: "",
  status: "outstanding",
});

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ChequeLogModal({ open, onClose }: Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cheques = [] } = useListCheques({ startDate: "2000-01-01", endDate: "2099-12-31" });
  const { data: accounts = [] } = useListAccounts();
  const { data: departments = [] } = useListDepartments();
  const createCheque = useCreateCheque();
  const updateCheque = useUpdateCheque();

  const [isNew, setIsNew] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [signedBy, setSignedBy] = useState<string>("");

  const currentCheque = !isNew && cheques.length > 0 ? cheques[currentIndex] : null;

  const loadCheque = useCallback((index: number) => {
    const c = cheques[index];
    if (!c) return;
    setForm({
      findQuery: "",
      chequeNumber: c.chequeNumber,
      issueDate: c.issueDate,
      departmentId: String(c.departmentId),
      accountId: String(c.accountId),
      payee: c.payee,
      notes: c.notes ?? "",
      policyRef: c.policyRef ?? "",
      amount: c.amount ? String(c.amount) : "",
      status: c.status,
    });
    setIsNew(false);
    setCurrentIndex(index);
  }, [cheques]);

  useEffect(() => {
    if (open && cheques.length > 0 && !isNew) loadCheque(0);
  }, [open, cheques.length]);

  const handleNew = () => { setForm(emptyForm()); setIsNew(true); };
  const handleFirst = () => loadCheque(0);
  const handlePrev = () => loadCheque(Math.max(0, currentIndex - 1));
  const handleNext = () => loadCheque(Math.min(cheques.length - 1, currentIndex + 1));
  const handleLast = () => loadCheque(cheques.length - 1);

  const handleFind = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    const q = form.findQuery.trim().toLowerCase();
    if (!q) return;
    const idx = cheques.findIndex(c => c.chequeNumber.toLowerCase().includes(q));
    if (idx >= 0) loadCheque(idx);
    else toast({ title: "Not found", description: `No cheque matching "${q}".`, variant: "destructive" });
  };

  const set = (field: keyof FormState) => (val: string) =>
    setForm(f => ({ ...f, [field]: val }));

  const handleSave = async () => {
    if (!form.accountId || !form.departmentId || !form.chequeNumber || !form.amount) {
      toast({ title: "Required fields missing", description: "Fill in all required fields.", variant: "destructive" });
      return;
    }
    const data = {
      chequeNumber: form.chequeNumber,
      issueDate: form.issueDate,
      accountId: Number(form.accountId),
      departmentId: Number(form.departmentId),
      payee: form.payee,
      notes: form.notes || null,
      policyRef: form.policyRef || null,
      amount: parseFloat(form.amount) || 0,
      status: form.status as "outstanding" | "cleared" | "cancelled",
      clearedDate: null,
    };
    try {
      if (isNew) {
        await createCheque.mutateAsync({ data });
        toast({ title: "Cheque created" });
      } else if (currentCheque) {
        await updateCheque.mutateAsync({ id: currentCheque.id, data });
        toast({ title: "Cheque updated" });
      }
      queryClient.invalidateQueries({ queryKey: getListChequesQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
      setIsNew(false);
    } catch {
      toast({ title: "Error saving cheque", variant: "destructive" });
    }
  };

  const position = cheques.length > 0
    ? `${isNew ? "New" : currentIndex + 1} of ${cheques.length}`
    : "0 of 0";

  const LBL = "block font-['Livvic'] font-semibold text-[#002f5c] text-[13px] mb-1";
  const INPUT = "h-9 font-['Mulish'] text-[13px] border-[#BBBBBB] rounded-[6px] focus-visible:ring-[#006cf4]/40";

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="p-0 gap-0 max-w-[540px] rounded-[8px] overflow-hidden border border-[#BBBBBB] shadow-2xl [&>button]:hidden" onInteractOutside={e => e.preventDefault()}>

        {/* Visually hidden title for screen reader accessibility */}
        <DialogTitle className="sr-only">Accounts Cheque Log</DialogTitle>

        {/* Header — title + close */}
        <div className="bg-[#00263e] px-5 py-3 flex items-center justify-between">
          <span className="font-['Livvic'] text-white text-[16px] font-semibold">
            Accounts Cheque Log
          </span>
          <button type="button" onClick={onClose} title="Close"
            className="lve-btn lve-btn-secondary !rounded-full !p-0 !w-7 !h-7 shrink-0">
            <MdClose size={16} />
          </button>
        </div>

        {/* Toolbar strip */}
        <div className="bg-[#f5f7fa] border-b border-[#BBBBBB] px-4 py-2 flex items-center gap-2">
          {/* Cheque number badge — no label, left-anchored */}
          <span className="font-['Mulish'] text-[13px] font-bold text-[#00263e] bg-white border border-[#BBBBBB] rounded-[6px] px-3 h-8 flex items-center min-w-[80px] select-none">
            {form.chequeNumber || <span className="text-[#999]">—</span>}
          </span>
          <div className="flex-1" />
          <button type="button" onClick={handleNew} title="New"
            className="lve-btn lve-btn-secondary !rounded-full !p-0 !w-8 !h-8 shrink-0">
            <MdNoteAdd size={18} />
          </button>
          <div className="w-px h-5 bg-[#BBBBBB] mx-1" />
          <button type="button" onClick={handleFirst} disabled={!cheques.length} title="First"
            className="lve-btn lve-btn-secondary !rounded-full !p-0 !w-8 !h-8 shrink-0">
            <MdSkipPrevious size={18} />
          </button>
          <button type="button" onClick={handlePrev} disabled={!cheques.length || currentIndex === 0} title="Previous"
            className="lve-btn lve-btn-secondary !rounded-full !p-0 !w-8 !h-8 shrink-0">
            <MdNavigateBefore size={18} />
          </button>
          <span className="text-[13px] font-['Mulish'] font-bold text-[#4a4a49] px-2 min-w-[64px] text-center select-none">
            {position}
          </span>
          <button type="button" onClick={handleNext} disabled={!cheques.length || currentIndex >= cheques.length - 1} title="Next"
            className="lve-btn lve-btn-secondary !rounded-full !p-0 !w-8 !h-8 shrink-0">
            <MdNavigateNext size={18} />
          </button>
          <button type="button" onClick={handleLast} disabled={!cheques.length} title="Last"
            className="lve-btn lve-btn-secondary !rounded-full !p-0 !w-8 !h-8 shrink-0">
            <MdSkipNext size={18} />
          </button>
        </div>

        {/* Form body */}
        <div className="bg-white px-5 py-5 space-y-4">

          <div>
            <label className={LBL}>Find Cheque</label>
            <Input className={INPUT} placeholder="Enter cheque number and press Enter"
              value={form.findQuery}
              onChange={e => set("findQuery")(e.target.value)}
              onKeyDown={handleFind} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LBL}>Date Rec'd</label>
              <DatePicker value={form.issueDate} onChange={val => set("issueDate")(val)} />
            </div>
            <div>
              <label className={LBL}>Signed / Posted</label>
              <div className="flex items-center gap-2 h-9">
                <Input
                  className={INPUT + " bg-[#f5f7fa] text-[#00263e] font-semibold h-9 flex-1"}
                  value={signedBy}
                  readOnly
                  placeholder="Not signed"
                />
                <button
                  type="button"
                  onClick={() => setSignedBy(signedBy ? "" : "Admin")}
                  className="lve-btn lve-btn-secondary shrink-0 !h-9 !rounded-[6px] !px-3 text-[12px] font-bold"
                >
                  {signedBy ? "Unsign" : "Sign"}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={LBL}>Pay-in Slip No</label>
              <Input className={INPUT} value={form.chequeNumber}
                onChange={e => set("chequeNumber")(e.target.value)} placeholder="CHQ-001" />
            </div>
            <div>
              <label className={LBL}>Department</label>
              <Select value={form.departmentId} onValueChange={set("departmentId")}>
                <SelectTrigger className={INPUT}>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(d => (
                    <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className={LBL}>Account Credited</label>
              <Select value={form.accountId} onValueChange={set("accountId")}>
                <SelectTrigger className={INPUT}>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map(a => (
                    <SelectItem key={a.id} value={String(a.id)}>{a.code}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className={LBL}>Drawer</label>
            <Input className={INPUT} value={form.payee}
              onChange={e => set("payee")(e.target.value)} placeholder="Payee / drawer name" />
          </div>

          <div>
            <label className={LBL}>Policy Name / Cheque Details</label>
            <Input className={INPUT} value={form.notes}
              onChange={e => set("notes")(e.target.value)} placeholder="Notes or cheque description" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LBL}>Policy Ref</label>
              <Input className={INPUT} value={form.policyRef}
                onChange={e => set("policyRef")(e.target.value)} placeholder="e.g. 100030" />
            </div>
            <div>
              <label className={LBL}>Cheque Amount</label>
              <Input className={INPUT + " text-right font-bold text-[#d72714]"}
                type="number" step="0.01"
                value={form.amount}
                onChange={e => set("amount")(e.target.value)}
                placeholder="0.00" />
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-[#f5f7fa] border-t border-[#BBBBBB] px-5 py-3 flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}
