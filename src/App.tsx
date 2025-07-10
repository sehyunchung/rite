import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export default function App() {
  return (
    <>
      <header className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-900 p-4 border-b-2 border-slate-200 dark:border-slate-800">
        <h1 className="text-xl font-bold">DJ Event Booking System</h1>
      </header>
      <main className="p-8 flex flex-col gap-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">DJ Event Booking</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Streamline your DJ event management with Instagram integration
          </p>
        </div>
        <Content />
      </main>
    </>
  );
}

function Content() {
  // Test connection to our events API
  const events = useQuery(api.events.listEvents, {
    organizerId: "test-organizer-id",
  });

  if (events === undefined) {
    return (
      <div className="mx-auto">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-slate-200 h-10 w-10"></div>
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
          </div>
        </div>
        <p className="text-center mt-4">Loading DJ events...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">System Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 dark:text-green-200">Database</h3>
            <p className="text-green-600 dark:text-green-400">✅ Connected</p>
          </div>
          <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200">Events</h3>
            <p className="text-blue-600 dark:text-blue-400">{events.length} events found</p>
          </div>
          <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800 dark:text-purple-200">API</h3>
            <p className="text-purple-600 dark:text-purple-400">✅ Ready</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FeatureCard
          title="Event Management"
          description="Create and manage DJ events with custom timeslots and venue information."
          status="Ready"
        />
        <FeatureCard
          title="Submission System"
          description="Generate unique links for DJs to submit promo materials and guest lists."
          status="Ready"
        />
        <FeatureCard
          title="Instagram Integration"
          description="Auto-generate copy-paste messages for Instagram event announcements."
          status="Planned"
        />
        <FeatureCard
          title="Data Export"
          description="Export guest lists and payment information with encryption support."
          status="Planned"
        />
      </div>

      <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Next Steps</h3>
        <ul className="space-y-2 text-slate-600 dark:text-slate-400">
          <li>• Set up authentication for organizers</li>
          <li>• Create event management interface</li>
          <li>• Build DJ submission forms</li>
          <li>• Implement file upload functionality</li>
          <li>• Add Instagram message generation</li>
        </ul>
      </div>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  status,
}: {
  title: string;
  description: string;
  status: string;
}) {
  const statusColor = status === "Ready" 
    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold">{title}</h3>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor}`}>
          {status}
        </span>
      </div>
      <p className="text-slate-600 dark:text-slate-400">{description}</p>
    </div>
  );
}
