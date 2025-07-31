// Web version - uses existing shadcn/ui Button
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-base font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  {
    variants: {
      variant: {
        default:
          "bg-brand-primary text-white shadow-sm hover:bg-brand-primary-dark hover:shadow-glow-sm active:scale-[0.98]",
        destructive:
          "bg-error text-white shadow-sm hover:bg-error/90 focus-visible:ring-error",
        outline:
          "border-2 border-neutral-600 bg-transparent text-white hover:bg-neutral-700 hover:border-neutral-500",
        secondary:
          "bg-neutral-700 text-white shadow-sm hover:bg-neutral-600",
        ghost:
          "text-white hover:bg-neutral-700/50",
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

export { Button, buttonVariants }