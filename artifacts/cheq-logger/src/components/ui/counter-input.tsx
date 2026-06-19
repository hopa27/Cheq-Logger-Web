import * as React from "react"
import { MdKeyboardArrowUp, MdKeyboardArrowDown } from "react-icons/md"
import { cn } from "@/lib/utils"

export interface CounterInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: number;
  onChange?: (value: number) => void;
  isError?: boolean;
}

const CounterInput = React.forwardRef<HTMLInputElement, CounterInputProps>(
  ({ className, value, onChange, isError, disabled, ...props }, ref) => {
    
    const handleIncrement = () => {
      if (disabled) return;
      onChange?.((value || 0) + 1);
    }
    
    const handleDecrement = () => {
      if (disabled) return;
      const newValue = (value || 0) - 1;
      if (newValue >= 0) onChange?.(newValue);
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseFloat(e.target.value);
      if (!isNaN(val) && val >= 0) {
        onChange?.(val);
      } else if (e.target.value === '') {
        onChange?.(0);
      }
    }

    return (
      <div className="relative w-full flex items-center">
        <div className={cn(
          "absolute left-0 pl-[12px] font-['Mulish'] text-[16px] z-10",
          isError ? "text-[#d72714]" : "text-[#3d3d3d]",
          disabled && "text-[#3d3d3d]"
        )}>£</div>
        <input
          type="number"
          step="0.01"
          min="0"
          value={value !== undefined ? value : ''}
          onChange={handleChange}
          disabled={disabled}
          className={cn(
            "flex h-[44px] w-full rounded-[8px] border bg-white pl-[30px] pr-[40px] py-[8px] font-['Mulish'] text-[16px] leading-[26px] text-[#3d3d3d] placeholder:text-[#BBBBBB] transition-colors focus-visible:outline-none focus-visible:border-[3px] focus-visible:pl-[28px] focus-visible:pr-[38px] focus-visible:py-[6px] hover:border-[#178830] disabled:cursor-not-allowed disabled:bg-[#CCCCCC] disabled:border-[#ACACAC] disabled:border-[2px] disabled:opacity-100",
            isError ? "border-[#d72714] text-[#d72714] focus-visible:border-[#d72714]" : "border-[#BBBBBB] focus-visible:border-[#178830]",
            className
          )}
          ref={ref}
          {...props}
        />
        <div className="absolute right-0 top-0 h-[44px] flex items-center pr-[2px]">
          <div className="h-6 w-[1px] bg-[#BBBBBB] mr-1" />
          <div className="flex flex-col h-full justify-center">
            <button 
              type="button" 
              onClick={handleIncrement}
              disabled={disabled}
              className="text-[#006cf4] hover:text-[#003578] disabled:text-[#006cf4] disabled:cursor-not-allowed h-1/2 flex items-end"
            >
              <MdKeyboardArrowUp className="h-5 w-5" />
            </button>
            <button 
              type="button" 
              onClick={handleDecrement}
              disabled={disabled}
              className="text-[#006cf4] hover:text-[#003578] disabled:text-[#006cf4] disabled:cursor-not-allowed h-1/2 flex items-start"
            >
              <MdKeyboardArrowDown className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    )
  }
)
CounterInput.displayName = "CounterInput"

export { CounterInput }