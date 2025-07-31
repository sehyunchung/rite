import * as React from "react"
import { cn } from "../../utils"
import { Link2 } from "lucide-react"

export interface EventCardProps extends React.ComponentProps<"div"> {
  eventName: string
  venueName: string
  date: string
  djCount: number
  dueDate: string
  status: 'draft' | 'published' | 'completed'
  onViewDetails?: () => void
  onShare?: () => void
}

const EventCard = React.forwardRef<HTMLDivElement, EventCardProps>(
  ({ 
    className, 
    eventName, 
    venueName, 
    date, 
    djCount, 
    dueDate, 
    status,
    onViewDetails,
    onShare,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-700 to-neutral-800 p-6 shadow-lg",
          className
        )}
        {...props}
      >
        {/* Gradient overlay effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-brand-primary/5 to-transparent opacity-30" />
        
        {/* Status badge */}
        <div className="absolute right-4 top-4">
          <span className={cn(
            "rounded-full px-3 py-1 text-xs font-medium",
            status === 'draft' && "bg-neutral-600 text-neutral-200",
            status === 'published' && "bg-brand-primary/20 text-brand-primary",
            status === 'completed' && "bg-green-500/20 text-green-400"
          )}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <h3 className="text-2xl font-bold text-white">{eventName}</h3>
          <p className="mt-1 text-sm text-neutral-300">{venueName}</p>
          
          <div className="mt-6 space-y-2">
            <p className="text-lg text-white">{date}</p>
            <p className="text-sm text-brand-primary font-medium">{djCount} DJs</p>
          </div>
          
          <div className="mt-4 border-t border-neutral-600 pt-4">
            <p className="text-sm text-neutral-400">Guest list due: {dueDate}</p>
          </div>
          
          {/* Actions */}
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={onViewDetails}
              className="flex-1 rounded-lg border border-neutral-600 bg-transparent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-700 hover:border-neutral-500"
            >
              View Details
            </button>
            {onShare && (
              <button
                onClick={onShare}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-600 bg-transparent text-white transition-colors hover:bg-neutral-700 hover:border-neutral-500"
                aria-label="Share event"
              >
                <Link2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }
)

EventCard.displayName = "EventCard"

export { EventCard }