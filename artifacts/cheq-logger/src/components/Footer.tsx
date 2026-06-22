import React from 'react';
import logoUrl from "@/assets/logo-dark.svg";

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-slate-200 mt-auto shrink-0 py-4 px-[142px] flex flex-row justify-between items-center">
      <img src={logoUrl} alt="CHEQ Logger" className="h-6" />
      <div className="text-[10px] font-medium text-slate-400 text-right">
        Company Address Line 1<br />
        Company Address Line 2
      </div>
    </footer>
  );
}