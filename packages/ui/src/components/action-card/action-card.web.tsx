import * as React from "react"
import { cn } from "../../utils"

export interface ActionCardProps extends React.ComponentProps<"button"> {
  icon: React.ReactNode
  title: string
  subtitle: string
  variant?: 'default' | 'primary' | 'secondary'
}

const ActionCard = React.forwardRef<HTMLButtonElement, ActionCardProps>(
  ({ className, icon, title, subtitle, variant = 'default', ...props }, ref) => {
    const iconColors = {
      default: 'bg-blue-100 text-blue-600',
      primary: 'bg-purple-100 text-purple-600',
      secondary: 'bg-green-100 text-green-600'
    }

    return (
      <button
        ref={ref}
        className={cn(
          "relative w-full rounded-2xl border-2 border-dashed border-neutral-600 bg-neutral-700/50 p-8 text-center transition-all",
          "hover:border-brand-primary hover:bg-neutral-700 hover:shadow-glow-sm",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "active:scale-[0.98]",
          className
        )}
        {...props}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className={cn(
            "flex h-16 w-16 items-center justify-center rounded-full",
            iconColors[variant]
          )}>
            <div className="h-8 w-8">
              {icon}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="mt-1 text-sm text-neutral-400">{subtitle}</p>
          </div>
        </div>
      </button>
    )
  }
)

ActionCard.displayName = "ActionCard"

export { ActionCard }