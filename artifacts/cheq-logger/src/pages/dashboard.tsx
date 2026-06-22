import { useState } from "react";
import { useLocation } from "wouter";
import { useDateRange } from "@/lib/date-context";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import ChequeLogModal from "@/components/ChequeLogModal";
import { MdPrint, MdNoteAdd } from "react-icons/md";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { startDate, endDate, setStartDate, setEndDate } = useDateRange();
  const [modalOpen, setModalOpen] = useState(false);

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
            <Button variant="secondary" size="lg" className="w-full justify-start gap-3" onClick={() => setLocation("/reports/accounts")}>
              <MdPrint size={20} />Accounts
            </Button>
            <Button variant="secondary" size="lg" className="w-full justify-start gap-3" onClick={() => setLocation("/reports/departments")}>
              <MdPrint size={20} />Dept
            </Button>
            <Button variant="secondary" size="lg" className="w-full justify-start gap-3" onClick={() => setLocation("/reports/outstanding")}>
              <MdPrint size={20} />O/S Cheques
            </Button>
            <Button variant="secondary" size="lg" className="w-full justify-start gap-3" onClick={() => setModalOpen(true)}>
              <MdNoteAdd size={20} />New / Amend
            </Button>
          </div>
        </div>
      </div>

      <ChequeLogModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
