import { createContext, useContext, useState, ReactNode } from "react";

interface DateRangeContextType {
  startDate: string;
  endDate: string;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
}

const DateRangeContext = createContext<DateRangeContextType | undefined>(undefined);

export function DateRangeProvider({ children }: { children: ReactNode }) {
  const [startDate, setStartDate] = useState("2025-12-03");
  const [endDate, setEndDate] = useState("2026-06-12");

  return (
    <DateRangeContext.Provider value={{ startDate, endDate, setStartDate, setEndDate }}>
      {children}
    </DateRangeContext.Provider>
  );
}

export function useDateRange() {
  const context = useContext(DateRangeContext);
  if (!context) {
    throw new Error("useDateRange must be used within a DateRangeProvider");
  }
  return context;
}
