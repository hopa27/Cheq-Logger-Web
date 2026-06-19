import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { useLocation } from "wouter";
import * as Tabs from "@radix-ui/react-tabs";
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

  const currentTab = navItems.find(item => {
    if (item.value === '/') return location === '/';
    return location.startsWith(item.value);
  })?.value || '/';

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f0f0]">
      <Header />
      
      {location !== '/login' && (
        <div className="px-[142px] pt-4">
          <Tabs.Root value={currentTab} onValueChange={(val) => setLocation(val)}>
            <Tabs.List className="flex gap-4 bg-transparent border-b border-[#BBBBBB]">
              {navItems.map(item => (
                <Tabs.Trigger
                  key={item.value}
                  value={item.value}
                  className={cn(
                    "min-w-[180px] rounded-t-[8px] px-8 py-4 text-[18px] font-semibold font-['Livvic'] outline-none transition-all",
                    currentTab === item.value 
                      ? "bg-white text-[#4a4a49] shadow-sm border border-b-0 border-[#BBBBBB]" 
                      : "bg-[#eaf5f8] text-[#0d2c41] hover:bg-[#e0eff4]"
                  )}
                >
                  {item.label}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
          </Tabs.Root>
        </div>
      )}

      <main className="flex-1 px-[142px] py-8">
        {location !== '/login' && (
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
        )}
        {children}
      </main>
      <Footer />
    </div>
  );
}