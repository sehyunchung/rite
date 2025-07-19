import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { EventCreationForm } from "@/components/EventCreationForm";
import { DJSubmissionForm } from "@/components/DJSubmissionForm";
import { Footer } from "@/components/Footer";

export default function App() {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'create-event' | 'dj-submission'>('dashboard');
  const [submissionToken, setSubmissionToken] = useState<string>('');

  // Check URL for submission token
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      setSubmissionToken(token);
      setCurrentPage('dj-submission');
    }
  }, []);
  return (
    <>
      {currentPage !== 'dj-submission' && (
        <header className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-900 p-4 border-b-2 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">DJ Event Booking System</h1>
            {currentPage === 'create-event' && (
              <Button 
                variant="outline" 
                onClick={() => setCurrentPage('dashboard')}
              >
                ← Back to Dashboard
              </Button>
            )}
          </div>
        </header>
      )}
      
      <main className={currentPage === 'dj-submission' ? '' : 'p-8'}>
        {currentPage === 'dashboard' ? (
          <div className="flex flex-col gap-16">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">DJ Event Booking</h1>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Streamline your DJ event management with Instagram integration
              </p>
            </div>
            <Content setCurrentPage={setCurrentPage} />
          </div>
        ) : currentPage === 'create-event' ? (
          <EventCreationForm 
            onEventCreated={() => setCurrentPage('dashboard')} 
          />
        ) : (
          <DJSubmissionForm submissionToken={submissionToken} />
        )}
      </main>
      
      <Footer />
    </>
  );
}

function Content({ setCurrentPage }: { setCurrentPage: (page: 'dashboard' | 'create-event') => void }) {

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
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

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <Button 
          onClick={() => setCurrentPage('create-event')}
          size="lg"
        >
          🎪 Create New Event
        </Button>
        <Button 
          variant="outline" 
          onClick={() => setCurrentPage('dashboard')}
          size="lg"
        >
          📊 View Dashboard
        </Button>
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
