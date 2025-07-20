import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PhaseStatus {
  name: string;
  status: 'completed' | 'in-progress' | 'planned';
  progress: number;
  items: {
    name: string;
    completed: boolean;
  }[];
}

const phaseData: PhaseStatus[] = [
  {
    name: 'Phase 1: Core Event Creation',
    status: 'completed',
    progress: 100,
    items: [
      { name: 'Event creation form with validation', completed: true },
      { name: 'Timeslot management with overlap detection', completed: true },
      { name: 'ArkType integration for validation', completed: true },
      { name: 'Convex backend integration', completed: true },
      { name: 'Real-time form validation', completed: true },
    ],
  },
  {
    name: 'Phase 2: DJ Submission System',
    status: 'in-progress',
    progress: 85,
    items: [
      { name: 'Unique submission link generation', completed: true },
      { name: 'Public DJ submission pages', completed: true },
      { name: 'Guest list management', completed: true },
      { name: 'Payment information collection', completed: true },
      { name: 'Token-based URL routing', completed: true },
      { name: 'File upload integration', completed: false },
      { name: 'Submission data storage', completed: false },
    ],
  },
  {
    name: 'Phase 2.5: Enhanced Event Creation',
    status: 'completed',
    progress: 100,
    items: [
      { name: 'Instagram hashtags field', completed: true },
      { name: 'Payment per DJ configuration', completed: true },
      { name: 'Guest limit per DJ', completed: true },
      { name: 'Enhanced validation rules', completed: true },
      { name: 'Backward compatibility', completed: true },
    ],
  },
  {
    name: 'Phase 3: Advanced Features',
    status: 'planned',
    progress: 0,
    items: [
      { name: 'Drag-and-drop timeslot reordering', completed: false },
      { name: 'File preview functionality', completed: false },
      { name: 'Instagram message generation', completed: false },
      { name: 'Submission tracker dashboard', completed: false },
      { name: 'Organizer authentication system', completed: false },
      { name: 'Event template system', completed: false },
    ],
  },
];

const getStatusColor = (status: PhaseStatus['status']) => {
  switch (status) {
    case 'completed':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'in-progress':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'planned':
      return 'text-gray-600 bg-gray-50 border-gray-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

const getStatusIcon = (status: PhaseStatus['status']) => {
  switch (status) {
    case 'completed':
      return '✅';
    case 'in-progress':
      return '🚧';
    case 'planned':
      return '📋';
    default:
      return '📋';
  }
};

const nextSteps = [
  'Complete file upload integration with Convex storage',
  'Implement submission data storage with encryption',
  'Add file preview functionality for uploads',
  'Create drag-and-drop timeslot reordering',
  'Build Instagram message generation templates',
  'Develop submission tracker dashboard for organizers',
];

export function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* System Status */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4 text-slate-900">
              Development Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {phaseData.map((phase) => (
                <Card key={phase.name} className={`border ${getStatusColor(phase.status)}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">
                        {getStatusIcon(phase.status)} {phase.name}
                      </CardTitle>
                      <span className="text-xs font-medium">
                        {phase.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          phase.status === 'completed'
                            ? 'bg-green-500'
                            : phase.status === 'in-progress'
                            ? 'bg-blue-500'
                            : 'bg-gray-400'
                        }`}
                        style={{ width: `${phase.progress}%` }}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-1">
                      {phase.items.slice(0, 3).map((item) => (
                        <div key={item.name} className="flex items-center space-x-2">
                          <span className="text-xs">
                            {item.completed ? '✓' : '○'}
                          </span>
                          <span className={`text-xs ${
                            item.completed 
                              ? 'text-slate-600' 
                              : 'text-slate-500'
                          }`}>
                            {item.name}
                          </span>
                        </div>
                      ))}
                      {phase.items.length > 3 && (
                        <div className="text-xs text-slate-500">
                          +{phase.items.length - 3} more items
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Next Steps */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-slate-900">
              Next Steps
            </h3>
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-sm">Upcoming Tasks</CardTitle>
                <CardDescription>
                  Priority items for the next development cycle
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {nextSteps.map((step, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-slate-400 text-sm mt-0.5">
                        {index + 1}.
                      </span>
                      <span className="text-sm text-slate-600">
                        {step}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <div className="text-sm text-slate-500">
              DJ Event Booking System • Built with React, Convex, and TypeScript
            </div>
            <div className="text-sm text-slate-500">
              🤖 Enhanced with Claude Code
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}