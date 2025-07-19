import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dropzone } from "@/components/ui/kibo-ui/dropzone";
import { QRCode } from "@/components/ui/kibo-ui/qr-code";
import { CodeBlock } from "@/components/ui/kibo-ui/code-block";
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
  // Test connection to our events API
  const events = useQuery(api.events.listEvents, {
    organizerId: "demo-organizer",
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

      {/* Component Testing Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">🧪 Component Testing</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* File Upload Test */}
          <Card>
            <CardHeader>
              <CardTitle>📁 File Upload (Dropzone)</CardTitle>
              <CardDescription>Test drag-and-drop file upload for DJ promo materials</CardDescription>
            </CardHeader>
            <CardContent>
              <Dropzone
                onDrop={(files) => {
                  console.log("Files dropped:", files);
                  alert(`${files.length} file(s) uploaded successfully!`);
                }}
                maxFiles={5}
                accept={{
                  'image/*': ['.png', '.jpg', '.jpeg'],
                  'video/*': ['.mp4', '.mov'],
                  'application/pdf': ['.pdf']
                }}
              >
                Drop DJ promo materials here
              </Dropzone>
            </CardContent>
          </Card>

          {/* QR Code Test */}
          <Card>
            <CardHeader>
              <CardTitle>📱 QR Code Generator</CardTitle>
              <CardDescription>Generate QR codes for event check-in</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <QRCode 
                value="https://dj-event-booking.com/submit/abc123" 
                size={150}
              />
              <p className="text-sm text-muted-foreground text-center">
                Scan to access DJ submission form
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Instagram Message Preview */}
        <Card>
          <CardHeader>
            <CardTitle>📱 Instagram Message Preview</CardTitle>
            <CardDescription>Auto-generated Instagram post content</CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock
              language="text"
              code={`🎵 Seoul Underground Night - 2025년 1월 15일
📍 Hongdae Club VERA

LINEUP:
22:00-23:00 - @dj_hansol
23:00-00:00 - @dj_minjae  
00:00-01:00 - @dj_seoyoung

📝 각 디제이별 제출 링크는 DM으로 전송됩니다
⏰ 마감일:
- 게스트 명단: 1월 10일
- 프로모 자료: 1월 8일

#seoulunderground #djnight #hongdae #electronicmusic`}
              showLineNumbers={false}
              allowCopy={true}
            />
          </CardContent>
        </Card>

        {/* Action Button Test */}
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
