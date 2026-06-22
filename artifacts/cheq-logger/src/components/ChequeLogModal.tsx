import React, { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
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
import { MdSkipPrevious, MdSkipNext, MdNavigateBefore, MdNavigateNext, MdNoteAdd } from "react-icons/md";

interface FormState {
  findQuery: string;
  chequeNumber: string;
  issueDate: string;
  departmentId: string;
  accountId: string;
  payee: string;
  notes: string;
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

  const today = format(new Date(), "yyyy-MM-dd");
  const startOfMonth = format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), "yyyy-MM-dd");

  const { data: cheques = [] } = useListCheques({ startDate: "2000-01-01", endDate: "2099-12-31" });
  const { data: accounts = [] } = useListAccounts();
  const { data: departments = [] } = useListDepartments();
  const createCheque = useCreateCheque();
  const updateCheque = useUpdateCheque();

  const [isNew, setIsNew] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [form, setForm] = useState<FormState>(emptyForm());

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
      amount: String(c.amount),
      status: c.status,
    });
    setIsNew(false);
    setCurrentIndex(index);
  }, [cheques]);

  useEffect(() => {
    if (open && cheques.length > 0 && !isNew) {
      loadCheque(0);
    }
  }, [open, cheques.length]);

  const handleNew = () => {
    setForm(emptyForm());
    setIsNew(true);
  };

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

  const label = "block text-[13px] font-semibold font-['Livvic'] text-[#002f5c] mb-1";
  const inputCls = "h-9 text-[13px] font-['Mulish'] border-[#BBBBBB] focus-visible:ring-[#00263e]";
  const navBtn = "h-8 w-8 p-0 text-white bg-[#00263e] hover:bg-[#003d5c] rounded-[4px] flex items-center justify-center";

  const position = cheques.length > 0 ? `${isNew ? "New" : currentIndex + 1} of ${cheques.length}` : "0";

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="p-0 gap-0 max-w-[520px] rounded-[8px] overflow-hidden border border-[#BBBBBB] shadow-xl">

        <DialogHeader className="bg-[#00263e] px-4 py-3 rounded-t-[8px]">
          <DialogTitle className="font-['Livvic'] text-white text-[16px] font-semibold">
            Accounts Cheque Log
          </DialogTitle>
        </DialogHeader>

        <div className="bg-[#f0f0f0] px-4 py-2 flex items-center gap-2 border-b border-[#BBBBBB]">
          <div className="bg-[#00263e] text-white text-[13px] font-['Mulish'] font-bold px-3 h-8 flex items-center rounded-[4px] min-w-[60px] justify-center">
            {position}
          </div>
          <button className={navBtn} onClick={handleNew} title="New">
            <MdNoteAdd size={18} />
          </button>
          <div className="w-px h-6 bg-[#BBBBBB] mx-1" />
          <button className={navBtn} onClick={handleFirst} title="First" disabled={cheques.length === 0}>
            <MdSkipPrevious size={18} />
          </button>
          <button className={navBtn} onClick={handlePrev} title="Previous" disabled={cheques.length === 0 || currentIndex === 0}>
            <MdNavigateBefore size={18} />
          </button>
          <button className={navBtn} onClick={handleNext} title="Next" disabled={cheques.length === 0 || currentIndex >= cheques.length - 1}>
            <MdNavigateNext size={18} />
          </button>
          <button className={navBtn} onClick={handleLast} title="Last" disabled={cheques.length === 0}>
            <MdSkipNext size={18} />
          </button>
        </div>

        <div className="bg-white px-5 py-4 space-y-4">

          <div>
            <label className={label}>Find Cheque</label>
            <Input
              className={inputCls}
              placeholder="Enter cheque number and press Enter"
              value={form.findQuery}
              onChange={e => set("findQuery")(e.target.value)}
              onKeyDown={handleFind}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>Date Rec'd</label>
              <DatePicker value={form.issueDate} onChange={val => set("issueDate")(val)} />
            </div>
            <div>
              <label className={label}>Signed / Posted</label>
              <Input className={inputCls + " bg-[#e8f0e8] font-bold text-[#00263e]"} value="Admin" readOnly />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={label}>Pay-in Slip No</label>
              <Input className={inputCls} value={form.chequeNumber} onChange={e => set("chequeNumber")(e.target.value)} placeholder="e.g. CHQ-001" />
            </div>
            <div>
              <label className={label}>Department</label>
              <Select value={form.departmentId} onValueChange={set("departmentId")}>
                <SelectTrigger className={inputCls}>
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
              <label className={label}>Account Credited</label>
              <Select value={form.accountId} onValueChange={set("accountId")}>
                <SelectTrigger className={inputCls}>
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
            <label className={label}>Drawer</label>
            <Input className={inputCls} value={form.payee} onChange={e => set("payee")(e.target.value)} placeholder="Payee / drawer name" />
          </div>

          <div>
            <label className={label}>Policy Name / Cheque Details</label>
            <Input className={inputCls} value={form.notes} onChange={e => set("notes")(e.target.value)} placeholder="Notes or cheque description" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>Status</label>
              <Select value={form.status} onValueChange={set("status")}>
                <SelectTrigger className={inputCls}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="outstanding">Outstanding</SelectItem>
                  <SelectItem value="cleared">Cleared</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className={label}>Cheque Amount</label>
              <Input
                className={inputCls + " text-right font-bold text-[#d72714]"}
                type="number"
                step="0.01"
                value={form.amount}
                onChange={e => set("amount")(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#f0f0f0] px-5 py-3 border-t border-[#BBBBBB] flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={handleSave} disabled={createCheque.isPending || updateCheque.isPending}>
            Save
          </Button>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}
