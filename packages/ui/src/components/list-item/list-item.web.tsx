import * as React from "react"
import { cn } from "../../utils"
import { ChevronRight } from "lucide-react"

export interface ListItemProps extends React.ComponentProps<"button"> {
  icon?: React.ReactNode
  title: string
  subtitle?: string
  trailing?: React.ReactNode
  showChevron?: boolean
}

const ListItem = React.forwardRef<HTMLButtonElement, ListItemProps>(
  ({ className, icon, title, subtitle, trailing, showChevron = true, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "flex w-full items-center gap-4 px-5 py-4 text-left transition-colors",
          "hover:bg-bg-secondary/50 active:bg-bg-secondary",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-inset",
          className
        )}
        {...props}
      >
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bg-secondary">
            <div className="h-5 w-5 text-text-primary">
              {icon}
            </div>
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <p className="text-base font-medium text-text-primary">{title}</p>
          {subtitle && (
            <p className="text-sm text-text-muted mt-0.5">{subtitle}</p>
          )}
        </div>
        
        {trailing || (showChevron && (
          <ChevronRight className="h-5 w-5 text-text-muted flex-shrink-0" />
        ))}
      </button>
    )
  }
)

ListItem.displayName = "ListItem"

export { ListItem }