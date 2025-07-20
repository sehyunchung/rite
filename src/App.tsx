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
        <header className="sticky top-0 z-10 bg-slate-50 p-4 border-b-2 border-slate-200">
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
              <p className="text-lg text-slate-600">
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

