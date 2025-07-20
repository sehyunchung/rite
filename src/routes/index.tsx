import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({
  component: Dashboard,
})

function Dashboard() {
  return (
    <div className="flex flex-col gap-16">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">DJ Event Booking</h1>
        <p className="text-lg text-slate-600">
          Streamline your DJ event management with Instagram integration
        </p>
      </div>
      <Content />
    </div>
  )
}

function Content() {
  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      {/* Action Buttons */}
      <div className="flex gap-4 justify-center flex-wrap">
        <Link to="/events/create">
          <Button size="lg">
            🎪 Create New Event
          </Button>
        </Link>
        <Link to="/events">
          <Button 
            variant="outline" 
            size="lg"
          >
            📋 View All Events
          </Button>
        </Link>
        <Link to="/">
          <Button 
            variant="outline" 
            size="lg"
          >
            📊 Dashboard
          </Button>
        </Link>
      </div>
    </div>
  )
}