import React from 'react';
import { useLocation } from "wouter";
import logoUrl from "@/assets/lve-logo.png";
import { Button } from "@/components/ui/button";

export default function Header({ title }: { title?: string }) {
  const [location, setLocation] = useLocation();

  let displayTitle = title;
  if (!displayTitle) {
    if (location === '/') displayTitle = "Menu";
    else if (location.startsWith('/cheques')) displayTitle = "Cheque Register";
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
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-sm font-medium border-none text-white hover:bg-white/10 hover:text-white"
            onClick={() => setLocation("/")}
          >
            Close
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-sm font-medium border-none text-white hover:bg-white/10 hover:text-white"
            onClick={() => { localStorage.clear(); window.location.reload(); }}
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
