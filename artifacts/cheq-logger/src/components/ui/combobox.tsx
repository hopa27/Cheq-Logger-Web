import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover"
import { MdKeyboardArrowDown, MdCheck } from "react-icons/md"
import { cn } from "@/lib/utils"

export interface ComboboxOption {
  value: string;
  label: string;
}

export interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  isError?: boolean;
  className?: string;
}

export function Combobox({ options, value, onChange, placeholder, disabled, isError, className }: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const selectedLabel = options.find((opt) => opt.value === value)?.label

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          disabled={disabled}
          className={cn(
            "flex h-[44px] w-full items-center justify-between rounded-[8px] border bg-white px-[12px] font-['Mulish'] text-[16px] text-[#3d3d3d] transition-colors focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-[#CCCCCC] disabled:border-[#ACACAC]",
            isError ? "border-[#d72714] text-[#d72714]" : "border-[#BBBBBB] hover:border-[#178830]",
            open && !isError && "border-[3px] border-[#178830] !border-b-0 rounded-b-none",
            open && isError && "border-[#d72714]",
            !selectedLabel && "text-[#BBBBBB]",
            className
          )}
        >
          <span className="truncate">{selectedLabel || placeholder}</span>
          <div className="flex items-center h-full">
            <div className={cn("h-6 w-[1px] mr-2", isError ? "bg-[#d72714]" : "bg-[#BBBBBB]")} />
            <MdKeyboardArrowDown 
              className={cn(
                "h-5 w-5 transition-transform duration-200", 
                open && "rotate-180",
                isError ? "text-[#d72714]" : "text-[#006cf4]"
              )} 
            />
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className={cn(
          "p-0 bg-white shadow-md z-50 overflow-hidden",
          isError ? "border-[3px] border-[#d72714] !border-t-0 rounded-b-[8px]" : "border-[3px] border-[#178830] !border-t-0 rounded-b-[8px]"
        )}
        style={{ width: 'var(--radix-popover-trigger-width)' }}
        align="start"
        sideOffset={0}
        avoidCollisions={false}
      >
        <CommandPrimitive className="flex flex-col overflow-hidden w-full">
          <CommandPrimitive.Input 
            placeholder="Search..." 
            className="flex h-10 w-full bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground border-b border-[#BBBBBB] font-['Mulish']"
          />
          <CommandPrimitive.List className="max-h-[200px] overflow-y-auto overflow-x-hidden custom-scrollbar">
            <CommandPrimitive.Empty className="py-6 text-center text-sm font-['Mulish']">No results found.</CommandPrimitive.Empty>
            {options.map((option) => (
              <CommandPrimitive.Item
                key={option.value}
                value={option.label}
                onSelect={() => {
                  onChange?.(option.value)
                  setOpen(false)
                }}
                className={cn(
                  "relative flex cursor-default select-none items-center px-3 py-3 text-[16px] font-['Mulish'] text-[#3d3d3d] outline-none hover:bg-[#05579B] hover:text-white data-[selected=true]:bg-[#05579B] data-[selected=true]:text-white",
                )}
              >
                <span className="flex-1 truncate">{option.label}</span>
                {value === option.value && <MdCheck className="h-4 w-4 ml-2 shrink-0" />}
              </CommandPrimitive.Item>
            ))}
          </CommandPrimitive.List>
        </CommandPrimitive>
      </PopoverContent>
    </Popover>
  )
}