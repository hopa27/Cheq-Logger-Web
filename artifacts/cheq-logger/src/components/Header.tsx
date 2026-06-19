import React from 'react';
import { useLocation } from "wouter";
import logoUrl from "@/assets/logo.svg";

export default function Header({ title }: { title?: string }) {
  const [location] = useLocation();

  let displayTitle = title;
  if (!displayTitle) {
    if (location === '/') displayTitle = "Dashboard";
    else if (location.startsWith('/cheques')) displayTitle = "Cheque Register";
    else if (location.startsWith('/reports/accounts')) displayTitle = "Accounts Report";
    else if (location.startsWith('/reports/departments')) displayTitle = "Departments Report";
    else if (location.startsWith('/reports/outstanding')) displayTitle = "Outstanding Cheques";
    else if (location.startsWith('/admin')) displayTitle = "Admin / Setup";
    else displayTitle = "CHEQ Logger";
  }

  return (
    <header className="w-full bg-[#00263e] px-[142px] pt-4 pb-6">
      <div className="flex items-center justify-between">
        <img src={logoUrl} alt="CHEQ Logger" className="h-6" />
      </div>
      <div className="h-px bg-slate-600/50 mb-6 mt-4" />
      <h1 className="font-['Livvic'] text-3xl font-normal tracking-tight text-white">
        {displayTitle}
      </h1>
    </header>
  );
}
