import React from 'react';
import { useLocation } from "wouter";
import logoUrl from "@/assets/lve-logo.png";

export default function Header({ title }: { title?: string }) {
  const [location, setLocation] = useLocation();

  let displayTitle = title;
  if (!displayTitle) {
    if (location === '/') displayTitle = "Menu";
    else if (location.startsWith('/cheques')) displayTitle = "Cheque Register";
    else if (location.startsWith('/reports/accounts')) displayTitle = "Accounts Report";
    else if (location.startsWith('/reports/departments')) displayTitle = "Departments Report";
    else if (location.startsWith('/reports/outstanding')) displayTitle = "Outstanding Cheques";
    else if (location.startsWith('/admin')) displayTitle = "Admin / Setup";
    else displayTitle = "CHEQ Logger";
  }

  return (
    <header className="w-full bg-[#00263e] px-[142px] py-5">
      <div className="flex items-center gap-6 justify-between">
        <div className="flex items-center gap-6">
          <button onClick={() => setLocation("/")} className="focus:outline-none flex-shrink-0" aria-label="Back to menu">
            <img src={logoUrl} alt="CHEQ Logger" className="h-6" />
          </button>
          {displayTitle && (
            <>
              <div className="w-px h-6 bg-white/30 flex-shrink-0" />
              <h1 className="font-['Livvic'] text-2xl font-normal tracking-tight text-white">
                {displayTitle}
              </h1>
            </>
          )}
        </div>
        <button
          onClick={() => { localStorage.clear(); window.location.reload(); }}
          className="text-white/70 hover:text-white text-sm font-['Mulish'] transition-colors flex-shrink-0 border border-white/30 hover:border-white/60 rounded-[30px] px-4 py-1.5"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
