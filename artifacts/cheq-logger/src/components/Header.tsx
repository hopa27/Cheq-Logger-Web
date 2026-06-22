import React from 'react';
import { useLocation } from "wouter";
import logoUrl from "@/assets/logo.svg";

export default function Header({ title }: { title?: string }) {
  const [location, setLocation] = useLocation();

  let displayTitle = title;
  if (!displayTitle) {
    if (location === '/') displayTitle = "";
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
        <button
          onClick={() => setLocation("/")}
          className="focus:outline-none"
          aria-label="Back to menu"
        >
          <img src={logoUrl} alt="CHEQ Logger" className="h-6" />
        </button>
        {location !== '/' && (
          <button
            onClick={() => setLocation("/")}
            className="text-white/70 hover:text-white text-sm font-['Mulish'] transition-colors"
          >
            Back to Menu
          </button>
        )}
      </div>
      <div className="h-px bg-slate-600/50 mb-6 mt-4" />
      {displayTitle && (
        <h1 className="font-['Livvic'] text-3xl font-normal tracking-tight text-white">
          {displayTitle}
        </h1>
      )}
    </header>
  );
}
