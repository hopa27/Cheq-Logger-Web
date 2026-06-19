import * as React from "react"
import { format } from "date-fns"
import { MdOutlineCalendarToday } from "react-icons/md"
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover"
import { Calendar } from "./calendar"
import { Input } from "./input"
import { cn } from "@/lib/utils"

export interface DatePickerProps {
  value?: string;
  onChange?: (date: string) => void;
  disabled?: boolean;
  isError?: boolean;
  placeholder?: string;
  className?: string;
}

export function DatePicker({ value, onChange, disabled, isError, placeholder, className }: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const dateValue = value ? new Date(value) : undefined;
  
  const displayValue = dateValue ? format(dateValue, "dd, MMM, yyyy") : "";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className={cn("relative w-full cursor-pointer", className)}>
          <Input 
            value={displayValue} 
            readOnly 
            placeholder={placeholder}
            disabled={disabled}
            isError={isError}
            className={cn("cursor-pointer", open && !isError && "border-[#178830] border-[2px]")}
            suffixIcon={<MdOutlineCalendarToday />}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent 
        className={cn(
          "w-auto p-0 rounded-[12px] bg-white overflow-hidden z-50",
          isError ? "border-[2px] border-[#d72714]" : "border-[2px] border-[#178830]"
        )} 
        align="start"
      >
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={(d) => {
            if (d && onChange) {
              onChange(format(d, "yyyy-MM-dd"));
            }
            setOpen(false);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}