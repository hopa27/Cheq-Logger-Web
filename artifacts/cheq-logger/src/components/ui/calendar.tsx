"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import { cn } from "@/lib/utils"
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md"
import { format, setMonth, setYear, addYears, subYears, addMonths, subMonths } from "date-fns"

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  isError?: boolean;
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  month: controlledMonth,
  onMonthChange,
  isError,
  ...props
}: CalendarProps) {
  const [view, setView] = React.useState<"days" | "months" | "years">("days")
  const [currentMonth, setCurrentMonth] = React.useState<Date>(controlledMonth || new Date())
  const [yearGridStart, setYearGridStart] = React.useState(Math.floor(currentMonth.getFullYear() / 25) * 25)

  React.useEffect(() => {
    if (controlledMonth) {
      setCurrentMonth(controlledMonth)
    }
  }, [controlledMonth])

  const handleMonthChange = (newMonth: Date) => {
    setCurrentMonth(newMonth)
    onMonthChange?.(newMonth)
  }

  const textColor = isError ? "text-[#d72714]" : "text-[#005a9c]"
  const hoverColor = isError ? "hover:text-[#a51c0d]" : "hover:text-[#003578]"

  if (view === "months") {
    return (
      <div className={cn("p-4 bg-white w-[300px]", className)}>
        <div className="flex justify-center items-center mb-4 relative">
          <button 
            type="button"
            className={cn("font-bold text-[16px] px-2 py-1", textColor, hoverColor)}
            onClick={() => {
              setYearGridStart(Math.floor(currentMonth.getFullYear() / 25) * 25)
              setView("years")
            }}
          >
            {currentMonth.getFullYear()}
          </button>
          <div className="absolute inset-x-0 flex justify-between pointer-events-none">
            <button type="button" onClick={() => handleMonthChange(subYears(currentMonth, 1))} className={cn("h-7 w-7 flex items-center justify-center pointer-events-auto", textColor, hoverColor)}>
              <MdKeyboardArrowLeft className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => handleMonthChange(addYears(currentMonth, 1))} className={cn("h-7 w-7 flex items-center justify-center pointer-events-auto", textColor, hoverColor)}>
              <MdKeyboardArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 12 }).map((_, i) => {
            const isSelected = currentMonth.getMonth() === i
            return (
              <button
                key={i}
                type="button"
                className={cn(
                  "p-2 text-center rounded text-sm font-['Mulish'] flex flex-col items-center justify-center",
                  isSelected ? "bg-[#006cf4] text-white hover:bg-[#003578]" : "hover:bg-[#eef4f8] text-[#3d3d3d]"
                )}
                onClick={() => {
                  handleMonthChange(setMonth(currentMonth, i))
                  setView("days")
                }}
              >
                <span className="text-[10px] opacity-70 leading-none">{String(i + 1).padStart(2, '0')}</span>
                <span className="leading-tight">{format(setMonth(new Date(), i), 'MMM')}</span>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  if (view === "years") {
    const years = Array.from({ length: 25 }).map((_, i) => yearGridStart + i)
    return (
      <div className={cn("p-4 bg-white w-[300px]", className)}>
        <div className="flex justify-center items-center mb-4 relative">
          <div className={cn("font-bold text-[16px] px-2 py-1", textColor)}>
            {yearGridStart} - {yearGridStart + 24}
          </div>
          <div className="absolute inset-x-0 flex justify-between pointer-events-none">
            <button type="button" onClick={() => setYearGridStart(y => y - 25)} className={cn("h-7 w-7 flex items-center justify-center pointer-events-auto", textColor, hoverColor)}>
              <MdKeyboardArrowLeft className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => setYearGridStart(y => y + 25)} className={cn("h-7 w-7 flex items-center justify-center pointer-events-auto", textColor, hoverColor)}>
              <MdKeyboardArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {years.map(y => {
            const isSelected = currentMonth.getFullYear() === y
            return (
              <button
                key={y}
                type="button"
                className={cn(
                  "p-2 text-center rounded text-sm font-['Mulish']",
                  isSelected 
                    ? "bg-[#006cf4] text-white hover:bg-[#003578]" 
                    : "hover:bg-[#eef4f8] text-[#3d3d3d] day-outside-hatch"
                )}
                onClick={() => {
                  handleMonthChange(setYear(currentMonth, y))
                  setView("months")
                }}
              >
                {y}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className={cn("p-3 bg-white w-[300px]", className)}>
      <div className="flex justify-center items-center mb-2 relative">
        <div className="flex gap-1 items-center">
          <button
            type="button"
            className={cn("text-[16px] font-bold bg-transparent border-none cursor-pointer px-1", textColor, hoverColor)}
            onClick={() => setView("months")}
          >
            {format(currentMonth, "MMMM")}
          </button>
          <button
            type="button"
            className={cn("text-[16px] font-bold bg-transparent border-none cursor-pointer px-1", textColor, hoverColor)}
            onClick={() => {
              setYearGridStart(Math.floor(currentMonth.getFullYear() / 25) * 25)
              setView("years")
            }}
          >
            {format(currentMonth, "yyyy")}
          </button>
        </div>
        <div className="absolute inset-x-0 flex justify-between pointer-events-none">
          <button type="button" onClick={() => handleMonthChange(subMonths(currentMonth, 1))} className={cn("h-7 w-7 flex items-center justify-center pointer-events-auto", textColor, hoverColor)}>
            <MdKeyboardArrowLeft className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => handleMonthChange(addMonths(currentMonth, 1))} className={cn("h-7 w-7 flex items-center justify-center pointer-events-auto", textColor, hoverColor)}>
            <MdKeyboardArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
      <DayPicker
        month={currentMonth}
        onMonthChange={handleMonthChange}
        showOutsideDays={showOutsideDays}
        hideNavigation
        className="p-0 bg-white"
        classNames={{
          months: "flex flex-col w-full",
          month: "w-full",
          month_caption: "hidden",
          weekdays: "flex w-full bg-[#eef4f8] py-1 rounded",
          weekday: cn("w-9 font-normal text-[0.8rem] flex-1 text-center font-['Mulish']", isError ? "text-[#d72714]" : "text-[#002f5c]"),
          week: "flex w-full mt-1",
          day: "h-9 w-9 text-center text-sm p-0 relative font-['Mulish'] flex-1",
          day_button: "h-9 w-9 p-0 font-normal hover:bg-[#003578] hover:text-white rounded-full mx-auto text-[#3d3d3d] cursor-pointer",
          today: "[&>button]:text-[#006cf4] [&>button]:font-semibold",
          selected: "[&>button]:bg-[#006cf4] [&>button]:!text-white [&>button:hover]:bg-[#003578]",
          outside: "day-outside-hatch opacity-50",
          disabled: "opacity-50",
          hidden: "invisible",
          ...classNames,
        }}
        {...props}
      />
    </div>
  )
}
Calendar.displayName = "Calendar"

export { Calendar }