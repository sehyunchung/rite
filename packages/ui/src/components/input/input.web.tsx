import * as React from "react"
import { cn } from "../../utils"

export interface InputProps extends React.ComponentProps<"input"> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        data-slot="input"
        className={cn(
          "flex h-12 w-full rounded-lg border border-neutral-600 bg-neutral-700/50 px-4 py-3 text-base text-white placeholder:text-neutral-400 shadow-sm transition-all outline-none",
          "focus:border-brand-primary focus:bg-neutral-600/50 focus:ring-[3px] focus:ring-brand-primary/20",
          "hover:border-neutral-500",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }