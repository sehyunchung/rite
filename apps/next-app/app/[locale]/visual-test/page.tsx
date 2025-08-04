import * as React from 'react'

export const dynamic = 'force-dynamic'

import { 
  Button,
  Card, CardHeader, CardTitle, CardDescription, CardContent,
  Badge,
  Input,
  Label,
  Textarea,
  Alert, AlertDescription, AlertTitle,
  Typography,
  EventCard,
  ActionCard,
  LoadingIndicator,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@rite/ui'
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react'

export default function VisualTestPage() {
  return (
    <div className="min-h-screen bg-background p-8 space-y-12">
      {/* Typography Section */}
      <section className="space-y-4">
        <Typography variant="h1">Typography Showcase</Typography>
        <Typography variant="h2">Heading 2</Typography>
        <Typography variant="h3">Heading 3</Typography>
        <Typography variant="h4">Heading 4</Typography>
        <Typography variant="h5">Heading 5</Typography>
        <Typography variant="h6">Heading 6</Typography>
        <Typography variant="body">Body text - Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Typography>
        <Typography variant="caption">Caption text - Small supporting text</Typography>
      </section>

      {/* Buttons Section */}
      <section className="space-y-4">
        <Typography variant="h2">Buttons</Typography>
        <div className="flex flex-wrap gap-4">
          <Button variant="default">Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
        </div>
        <div className="flex flex-wrap gap-4">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
        </div>
        <div className="flex flex-wrap gap-4">
          <Button disabled>Disabled</Button>
          <Button variant="secondary" disabled>Disabled Secondary</Button>
        </div>
      </section>

      {/* Badges Section */}
      <section className="space-y-4">
        <Typography variant="h2">Badges</Typography>
        <div className="flex flex-wrap gap-4">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </div>
      </section>

      {/* Cards Section */}
      <section className="space-y-4">
        <Typography variant="h2">Cards</Typography>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
              <CardDescription>Card description goes here</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Card content with some example text.</p>
            </CardContent>
          </Card>
          <ActionCard
            title="Action Card"
            description="This is an action card with interactive behavior"
            action={<Button size="sm">Action</Button>}
          />
        </div>
      </section>

      {/* Event Card Section */}
      <section className="space-y-4">
        <Typography variant="h2">Event Card</Typography>
        <EventCard
          eventName="Summer Music Festival"
          venueName="Central Park"
          date="July 15, 2025 • 6:00 PM"
          djCount={5}
          dueDate="July 10, 2025"
          status="published"
        />
      </section>

      {/* Form Elements Section */}
      <section className="space-y-4">
        <Typography variant="h2">Form Elements</Typography>
        <div className="space-y-4 max-w-md">
          <div>
            <Label htmlFor="input-test">Input Field</Label>
            <Input id="input-test" placeholder="Enter text here..." />
          </div>
          <div>
            <Label htmlFor="textarea-test">Textarea</Label>
            <Textarea id="textarea-test" placeholder="Enter longer text here..." rows={4} />
          </div>
          <div>
            <Label htmlFor="select-test">Select</Label>
            <Select>
              <SelectTrigger id="select-test">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Option 1</SelectItem>
                <SelectItem value="option2">Option 2</SelectItem>
                <SelectItem value="option3">Option 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Alerts Section */}
      <section className="space-y-4">
        <Typography variant="h2">Alerts</Typography>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Info</AlertTitle>
          <AlertDescription>This is an informational alert.</AlertDescription>
        </Alert>
        <Alert variant="success">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>Operation completed successfully!</AlertDescription>
        </Alert>
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>Please review before proceeding.</AlertDescription>
        </Alert>
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Something went wrong.</AlertDescription>
        </Alert>
      </section>

      {/* Loading States Section */}
      <section className="space-y-4">
        <Typography variant="h2">Loading States</Typography>
        <div className="flex gap-4 items-center">
          <LoadingIndicator size="sm" />
          <LoadingIndicator />
          <LoadingIndicator size="lg" />
        </div>
      </section>
    </div>
  )
}