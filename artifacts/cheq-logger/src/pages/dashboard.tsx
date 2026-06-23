import { useState } from "react";
import { useDateRange } from "@/lib/date-context";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import ChequeLogModal from "@/components/ChequeLogModal";
import AccountsReportModal from "@/components/AccountsReportModal";
import { MdPrint, MdNoteAdd } from "react-icons/md";

export default function Dashboard() {
  const { startDate, endDate, setStartDate, setEndDate } = useDateRange();
  const [modalOpen, setModalOpen] = useState(false);
  const [accountsOpen, setAccountsOpen] = useState(false);
  const [dateErrorOpen, setDateErrorOpen] = useState(false);

  const handlePreset = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  };

  const handleAccountsClick = () => {
    if (!startDate || !endDate) {
      setDateErrorOpen(true);
      return;
    }
    setAccountsOpen(true);
  };

  return (
    <div className="flex justify-center items-start pt-8">
      <div className="w-[360px] rounded-[8px] overflow-hidden shadow-lg border border-[#BBBBBB]">
        <div className="bg-white px-6 py-6 space-y-6">

          <div className="space-y-4">
            <div>
              <label className="block font-['Livvic'] font-semibold text-[#002f5c] text-[15px] mb-1.5">
                Start Date
              </label>
              <DatePicker value={startDate} onChange={setStartDate} onPresetSelect={handlePreset} />
            </div>
            <div>
              <label className="block font-['Livvic'] font-semibold text-[#002f5c] text-[15px] mb-1.5">
                End Date
              </label>
              <DatePicker value={endDate} onChange={setEndDate} onPresetSelect={handlePreset} />
            </div>
          </div>

          <div className="h-px bg-[#e0e0e0]" />

          <div className="space-y-3">
            <Button variant="secondary" size="lg" className="w-full justify-start gap-3" onClick={handleAccountsClick}>
              <MdPrint size={20} />Accounts
            </Button>
            <Button variant="secondary" size="lg" className="w-full justify-start gap-3" onClick={() => setModalOpen(true)}>
              <MdNoteAdd size={20} />New / Amend
            </Button>
          </div>
        </div>
      </div>

      <ChequeLogModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <AccountsReportModal open={accountsOpen} onClose={() => setAccountsOpen(false)} />

      {/* Date validation error dialog */}
      <Dialog open={dateErrorOpen} onOpenChange={setDateErrorOpen}>
        <DialogContent
          className="p-0 overflow-hidden border border-[#BBBBBB] shadow-lg"
          style={{ width: 320, maxWidth: "90vw" }}
        >
          {/* Title bar */}
          <div className="flex items-center justify-between bg-[#00263e] px-3 py-2">
            <span className="font-['Livvic'] font-semibold text-white text-[14px]">Error</span>
          </div>

          {/* Body */}
          <div className="flex items-center gap-4 px-5 py-5 bg-white">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#d72714] flex items-center justify-center">
              <span className="text-white font-bold text-xl leading-none">✕</span>
            </div>
            <p className="font-['Mulish'] text-[14px] text-[#1a1a1a]">
              Missing or invalid date range!
            </p>
          </div>

          {/* Footer */}
          <div className="bg-[#f5f7fa] border-t border-[#BBBBBB] px-5 py-3 flex justify-center">
            <Button size="sm" className="min-w-[72px]" onClick={() => setDateErrorOpen(false)}>
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
