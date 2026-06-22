import React, { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
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
} from "react-icons/md";

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
    ? `${isNew ? "New" : currentIndex + 1} / ${cheques.length}`
    : "0 / 0";

  const LBL = "block font-['Livvic'] font-semibold text-[#002f5c] text-[13px] mb-1";
  const INPUT = "h-9 font-['Mulish'] text-[13px] border-[#BBBBBB] rounded-[6px] focus-visible:ring-[#006cf4]/40";

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="p-0 gap-0 max-w-[540px] rounded-[8px] overflow-hidden border border-[#BBBBBB] shadow-2xl [&>button]:hidden">

        {/* Header — navy band with title + toolbar */}
        <div className="bg-[#00263e] px-5 py-3 flex items-center justify-between gap-4">
          <span className="font-['Livvic'] text-white text-[16px] font-semibold flex-shrink-0">
            Accounts Cheque Log
          </span>

          {/* position badge */}
          <span className="font-['Mulish'] text-white/70 text-[12px] flex-shrink-0">{position}</span>

          {/* toolbar buttons */}
          <div className="flex items-center gap-1 ml-auto">
            <Button variant="ghost" size="icon"
              className="h-8 w-8 text-white hover:bg-white/10 hover:text-white"
              onClick={handleNew} title="New">
              <MdNoteAdd size={18} />
            </Button>
            <div className="w-px h-5 bg-white/20 mx-1" />
            <Button variant="ghost" size="icon"
              className="h-8 w-8 text-white hover:bg-white/10 hover:text-white"
              onClick={handleFirst} disabled={!cheques.length} title="First">
              <MdSkipPrevious size={18} />
            </Button>
            <Button variant="ghost" size="icon"
              className="h-8 w-8 text-white hover:bg-white/10 hover:text-white"
              onClick={handlePrev} disabled={!cheques.length || currentIndex === 0} title="Previous">
              <MdNavigateBefore size={18} />
            </Button>
            <Button variant="ghost" size="icon"
              className="h-8 w-8 text-white hover:bg-white/10 hover:text-white"
              onClick={handleNext} disabled={!cheques.length || currentIndex >= cheques.length - 1} title="Next">
              <MdNavigateNext size={18} />
            </Button>
            <Button variant="ghost" size="icon"
              className="h-8 w-8 text-white hover:bg-white/10 hover:text-white"
              onClick={handleLast} disabled={!cheques.length} title="Last">
              <MdSkipNext size={18} />
            </Button>
          </div>
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
              <Input className={INPUT + " bg-[#f5f7fa] text-[#00263e] font-semibold"} value="Admin" readOnly />
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
              <label className={LBL}>Status</label>
              <Select value={form.status} onValueChange={set("status")}>
                <SelectTrigger className={INPUT}>
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
          <Button variant="secondary" size="sm"
            onClick={handleSave}
            disabled={createCheque.isPending || updateCheque.isPending}>
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
