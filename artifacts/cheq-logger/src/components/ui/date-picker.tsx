import * as React from "react"
import {
  format, parse, isValid,
  subDays, startOfWeek, endOfWeek, subWeeks,
  startOfMonth, startOfYear
} from "date-fns"
import { MdOutlineCalendarToday } from "react-icons/md"
import { Popover, PopoverAnchor, PopoverContent } from "@radix-ui/react-popover"
import { Calendar } from "./calendar"
import { Input } from "./input"
import { cn } from "@/lib/utils"

export interface DatePickerProps {
  value?: string;
  onChange?: (date: string) => void;
  onPresetSelect?: (start: string, end: string) => void;
  disabled?: boolean;
  isError?: boolean;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
}

type Preset = { label: string; range: () => { start: Date; end: Date } };

const PRESETS: Preset[] = [
  { label: "Yesterday",     range: () => { const d = subDays(new Date(), 1); return { start: d, end: d }; } },
  { label: "Week to date",  range: () => ({ start: startOfWeek(new Date(), { weekStartsOn: 1 }), end: new Date() }) },
  { label: "Last Week",     range: () => { const w = subWeeks(new Date(), 1); return { start: startOfWeek(w, { weekStartsOn: 1 }), end: endOfWeek(w, { weekStartsOn: 1 }) }; } },
  { label: "Month to date", range: () => ({ start: startOfMonth(new Date()), end: new Date() }) },
  { label: "Year To Date",  range: () => ({ start: startOfYear(new Date()), end: new Date() }) },
];

export function DatePicker({
  value, onChange, onPresetSelect,
  disabled, isError, placeholder, className, inputClassName
}: DatePickerProps) {
  const [calOpen, setCalOpen] = React.useState(false);
  const [presetOpen, setPresetOpen] = React.useState(false);

  const dateValue = value ? new Date(value) : undefined;

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
    const parsed = parse(raw, "dd/MM/yyyy", new Date());
    if (isValid(parsed) && raw.length === 10 && onChange) {
      onChange(format(parsed, "yyyy-MM-dd"));
    }
  };

  const handleInputClick = () => {
    if (disabled) return;
    if (onPresetSelect) {
      setPresetOpen(v => !v);
      setCalOpen(false);
    }
  };

  const handlePresetClick = (preset: Preset) => {
    const { start, end } = preset.range();
    if (onPresetSelect) onPresetSelect(format(start, "yyyy-MM-dd"), format(end, "yyyy-MM-dd"));
    setPresetOpen(false);
  };

  const handleCalIconClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPresetOpen(false);
    setCalOpen(v => !v);
  };

  const isOpen = calOpen || presetOpen;

  return (
    <Popover
      open={isOpen}
      onOpenChange={(v) => {
        if (!v) { setCalOpen(false); setPresetOpen(false); }
      }}
    >
      <PopoverAnchor asChild>
        <div className={cn("relative w-full", className)}>
          <Input
            value={typedValue}
            onChange={handleTyping}
            onClick={handleInputClick}
            placeholder={placeholder ?? "DD/MM/YYYY"}
            disabled={disabled}
            isError={isError}
            className={cn(isOpen && !isError && "border-[#178830] border-[2px]", inputClassName)}
            suffixIcon={
              <button
                type="button"
                tabIndex={-1}
                disabled={disabled}
                onClick={handleCalIconClick}
                className="flex items-center focus:outline-none"
                aria-label="Open calendar"
              >
                <MdOutlineCalendarToday />
              </button>
            }
          />
        </div>
      </PopoverAnchor>

      {/* Preset dropdown */}
      {presetOpen && (
        <PopoverContent
          className="w-[160px] p-0 rounded-[6px] bg-white border border-[#d0d0d0] shadow-lg z-50 overflow-hidden"
          align="start"
          onOpenAutoFocus={e => e.preventDefault()}
        >
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              className="w-full text-left px-3 py-[7px] font-['Mulish'] text-[13px] text-[#3d3d3d] hover:bg-[#f0f4ff] hover:text-[#04589b] focus:outline-none"
              onClick={() => handlePresetClick(p)}
            >
              {p.label}
            </button>
          ))}
        </PopoverContent>
      )}

      {/* Calendar picker */}
      {calOpen && (
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
              if (d && onChange) onChange(format(d, "yyyy-MM-dd"));
              setCalOpen(false);
            }}
            initialFocus
          />
        </PopoverContent>
      )}
    </Popover>
  );
}
