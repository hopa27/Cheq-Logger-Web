import * as React from "react"
import { format, parse, isValid } from "date-fns"
import { MdOutlineCalendarToday } from "react-icons/md"
import { Popover, PopoverAnchor, PopoverContent } from "@radix-ui/react-popover"
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
  inputClassName?: string;
}

export function DatePicker({ value, onChange, disabled, isError, placeholder, className, inputClassName }: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const dateValue = value ? new Date(value) : undefined;

  // Local typed text — kept in sync when external value changes (e.g. calendar pick)
  const [typedValue, setTypedValue] = React.useState(
    dateValue && isValid(dateValue) ? format(dateValue, "dd/MM/yyyy") : ""
  );

  React.useEffect(() => {
    setTypedValue(dateValue && isValid(dateValue) ? format(dateValue, "dd/MM/yyyy") : "");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setTypedValue(raw);
    // Accept DD/MM/YYYY once fully entered
    const parsed = parse(raw, "dd/MM/yyyy", new Date());
    if (isValid(parsed) && raw.length === 10 && onChange) {
      onChange(format(parsed, "yyyy-MM-dd"));
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div className={cn("relative w-full", className)}>
          <Input
            value={typedValue}
            onChange={handleTyping}
            placeholder={placeholder ?? "DD/MM/YYYY"}
            disabled={disabled}
            isError={isError}
            className={cn(open && !isError && "border-[#178830] border-[2px]", inputClassName)}
            suffixIcon={
              <button
                type="button"
                tabIndex={-1}
                disabled={disabled}
                onClick={(e) => { e.stopPropagation(); setOpen(v => !v); }}
                className="flex items-center focus:outline-none"
                aria-label="Open calendar"
              >
                <MdOutlineCalendarToday />
              </button>
            }
          />
        </div>
      </PopoverAnchor>
      <PopoverContent
        className={cn(
          "w-auto p-0 rounded-[12px] bg-white overflow-hidden z-50",
          isError ? "border-[2px] border-[#d72714]" : "border-[2px] border-[#178830]"
        )}
        align="start"
        onOpenAutoFocus={e => e.preventDefault()}
      >
        <Calendar
          mode="single"
          selected={dateValue && isValid(dateValue) ? dateValue : undefined}
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
  );
}
