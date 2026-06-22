import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  suffixIcon?: React.ReactNode;
  isError?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, suffixIcon, isError, disabled, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <input
          type={type}
          disabled={disabled}
          className={cn(
            "flex h-[44px] w-full rounded-[8px] border bg-white px-[12px] py-[8px] font-['Mulish'] text-[16px] leading-[26px] text-[#3d3d3d] placeholder:text-[#BBBBBB] transition-colors focus-visible:outline-none focus-visible:border-[3px] focus-visible:px-[10px] focus-visible:py-[6px] hover:border-[#178830] disabled:cursor-not-allowed disabled:bg-[#CCCCCC] disabled:border-[#ACACAC] disabled:border-[2px] disabled:opacity-100",
            isError ? "border-[#d72714] text-[#d72714] placeholder:text-[#d72714] focus-visible:border-[#d72714]" : "border-[#BBBBBB] focus-visible:border-[#178830]",
            suffixIcon ? "pr-[40px]" : "",
            className
          )}
          ref={ref}
          {...props}
        />
        {suffixIcon && (
          <div className="absolute right-0 top-0 h-full flex items-center pr-3">
            <div className="h-6 w-[1px] bg-[#BBBBBB] mr-2" />
            <div className={cn("text-[20px]", isError ? "text-[#d72714]" : "text-[#006cf4]")}>
              {suffixIcon}
            </div>
          </div>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }