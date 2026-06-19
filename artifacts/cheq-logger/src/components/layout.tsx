import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { DatePicker } from './ui/date-picker';
import { useDateRange } from '@/lib/date-context';

const navItems = [
  { value: '/', label: 'Dashboard' },
  { value: '/cheques', label: 'Cheque Register' },
  { value: '/reports/accounts', label: 'Accounts' },
  { value: '/reports/departments', label: 'Departments' },
  { value: '/reports/outstanding', label: 'O/S Cheques' },
  { value: '/admin', label: 'Admin/Setup' }
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { startDate, endDate, setStartDate, setEndDate } = useDateRange();

  const currentPath = navItems.find(item => {
    if (item.value === '/') return location === '/';
    return location.startsWith(item.value);
  })?.value || '/';

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f0f0]">
      <Header />

      <nav className="px-[142px] pt-4 border-b border-[#BBBBBB] bg-[#f0f0f0] flex gap-2">
        {navItems.map(item => (
          <button
            key={item.value}
            onClick={() => setLocation(item.value)}
            className={cn(
              "px-6 py-3 text-[16px] font-semibold font-['Livvic'] transition-colors rounded-none border-b-2",
              currentPath === item.value
                ? "border-[#00263e] text-[#00263e]"
                : "border-transparent text-[#0d2c41] hover:text-[#00263e] hover:border-[#00263e]/40"
            )}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <main className="flex-1 px-[142px] py-8">
        <div className="mb-8 flex items-center gap-4 bg-white p-4 rounded-[8px] border border-[#BBBBBB] shadow-sm max-w-fit">
          <div className="font-['Livvic'] font-semibold text-[#002f5c] text-[18px]">Report Period:</div>
          <div className="flex items-center gap-4">
            <div className="w-[180px]">
              <DatePicker
                value={startDate}
                onChange={setStartDate}
              />
            </div>
            <span className="text-[#3d3d3d] font-bold font-['Mulish']">to</span>
            <div className="w-[180px]">
              <DatePicker
                value={endDate}
                onChange={setEndDate}
              />
            </div>
          </div>
        </div>
        {children}
      </main>
      <Footer />
    </div>
  );
}
