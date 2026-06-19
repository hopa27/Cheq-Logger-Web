import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[30px] font-['Livvic'] text-base font-normal transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:bg-[#979797] disabled:text-white disabled:opacity-100 disabled:shadow-none shadow-md [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[#006cf4] text-white hover:bg-[#003578]",
        destructive: "bg-[#d72714] text-white hover:bg-[#a51c0d]",
        outline: "border border-[#04589b] bg-white hover:bg-[#003578] hover:text-white hover:border-[#003578]",
        secondary: "bg-white text-[#04589b] border border-[#04589b] hover:bg-[#003578] hover:text-white hover:border-[#003578] font-bold",
        ghost: "bg-transparent shadow-none hover:bg-white/10",
        link: "text-[#005a9c] underline-offset-4 hover:underline shadow-none",
      },
      size: {
        default: "h-[44px] px-8 py-2",
        sm: "h-9 rounded-[30px] px-4",
        lg: "h-12 rounded-[30px] px-10",
        icon: "h-[44px] w-[44px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }