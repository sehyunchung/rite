// Web version - uses existing shadcn/ui Button
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-base font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  {
    variants: {
      variant: {
        default:
          "bg-brand-primary shadow-sm hover:bg-brand-primary-dark hover:shadow-glow-sm active:scale-[0.98] [&]:text-[var(--button-primary-text,_white)]",
        destructive:
          "bg-error text-[var(--button-primary-text,_white)] shadow-sm hover:bg-error/90 focus-visible:ring-error",
        outline:
          "border-2 border-border bg-transparent text-text-primary hover:bg-bg-secondary hover:border-border-strong",
        secondary:
          "bg-bg-secondary text-text-primary shadow-sm hover:bg-bg-tertiary",
        ghost:
          "text-text-primary hover:bg-bg-secondary/50",
        link: "text-brand-primary underline-offset-4 hover:underline hover:text-brand-primary-light",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 rounded-md px-4 py-2 text-sm",
        lg: "h-14 rounded-xl px-8 py-4 text-lg",
        icon: "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants }