import * as React from "react"
import { cn } from "../../utils"
import { tokens } from "../../design-tokens"
import { cva, type VariantProps } from "class-variance-authority"

const typographyVariants = cva("", {
  variants: {
    variant: {
      h1: "text-5xl font-bold leading-tight tracking-tight",
      h2: "text-4xl font-bold leading-tight tracking-tight",
      h3: "text-3xl font-semibold leading-snug",
      h4: "text-2xl font-semibold leading-normal",
      h5: "text-xl font-medium leading-normal",
      h6: "text-lg font-medium leading-normal",
      body: "text-base font-normal leading-normal",
      "body-lg": "text-lg font-normal leading-relaxed",
      "body-sm": "text-sm font-normal leading-normal",
      caption: "text-xs font-normal leading-normal",
      label: "text-sm font-medium leading-tight",
      button: "text-base font-medium leading-tight tracking-wide",
    },
    color: {
      default: "text-text-primary",
      secondary: "text-text-secondary", 
      muted: "text-text-muted",
      primary: "text-brand-primary",
      error: "text-error",
      success: "text-success",
    },
  },
  defaultVariants: {
    variant: "body",
    color: "default",
  },
})

export interface TypographyProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'color'>,
    VariantProps<typeof typographyVariants> {
  as?: React.ElementType
  children: React.ReactNode
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant = "body", color = "default", as, children, ...props }, ref) => {
    // Map variants to semantic HTML elements
    const defaultElements = {
      h1: "h1",
      h2: "h2",
      h3: "h3",
      h4: "h4",
      h5: "h5",
      h6: "h6",
      body: "p",
      "body-lg": "p",
      "body-sm": "p",
      caption: "span",
      label: "label",
      button: "span",
    } as const

    const Component = (as || defaultElements[variant || "body"] || "span") as any

    return (
      <Component
        ref={ref}
        className={cn(
          "font-suit",
          typographyVariants({ variant, color }),
          className
        )}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

Typography.displayName = "Typography"

export { Typography, typographyVariants }