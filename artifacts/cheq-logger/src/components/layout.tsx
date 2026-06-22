import React from 'react';
import Header from './Header';
import Footer from './Footer';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[125vh] flex flex-col bg-[#f0f0f0]">
      <Header />
      <main className="flex-1 px-[142px] py-5">
        {children}
      </main>
      <Footer />
    </div>
  );
}
