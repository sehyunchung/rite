import * as React from "react"
import { cn } from "../../utils"

export interface TextareaProps extends React.ComponentProps<"textarea"> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        data-slot="textarea"
        className={cn(
          "flex field-sizing-content min-h-16 w-full rounded-lg border border-neutral-600 bg-neutral-700 px-4 py-3 text-base text-white placeholder:text-neutral-400 shadow-sm transition-all outline-none opacity-80",
          "focus:border-brand-primary focus:bg-neutral-600 focus:ring-[3px] focus:ring-brand-primary focus:opacity-90",
          "hover:border-neutral-500 hover:opacity-85",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          "resize-none",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }