import { useLocation } from "wouter";
import { useDateRange } from "@/lib/date-context";
import { DatePicker } from "@/components/ui/date-picker";
import { MdPrint, MdNoteAdd } from "react-icons/md";

interface MenuButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

function MenuButton({ icon, label, onClick }: MenuButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 px-6 py-4 bg-white border border-[#BBBBBB] rounded-[6px] text-[#00263e] font-['Livvic'] font-semibold text-[18px] hover:bg-[#eaf2f8] hover:border-[#00263e] transition-all shadow-sm text-left"
    >
      <span className="text-[#00263e] flex-shrink-0">{icon}</span>
      {label}
    </button>
  );
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { startDate, endDate, setStartDate, setEndDate } = useDateRange();

  return (
    <div className="flex justify-center items-start pt-8">
      <div className="w-[360px] rounded-[8px] overflow-hidden shadow-lg border border-[#BBBBBB]">

        <div className="bg-[#00263e] px-6 py-4">
          <h2 className="font-['Livvic'] text-[20px] font-semibold text-white tracking-wide">Menu</h2>
        </div>

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
            <MenuButton
              icon={<MdPrint size={22} />}
              label="Accounts"
              onClick={() => setLocation("/reports/accounts")}
            />
            <MenuButton
              icon={<MdPrint size={22} />}
              label="Dept"
              onClick={() => setLocation("/reports/departments")}
            />
            <MenuButton
              icon={<MdPrint size={22} />}
              label="O/S Cheques"
              onClick={() => setLocation("/reports/outstanding")}
            />
            <MenuButton
              icon={<MdNoteAdd size={22} />}
              label="New / Amend"
              onClick={() => setLocation("/cheques")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
