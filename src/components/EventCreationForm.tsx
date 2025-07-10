import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Timeslot {
  id: string;
  startTime: string;
  endTime: string;
  djName: string;
  djInstagram: string;
}

interface EventFormData {
  name: string;
  date: string;
  venue: {
    name: string;
    address: string;
  };
  description: string;
  deadlines: {
    guestList: string;
    promoMaterials: string;
  };
  payment: {
    amount: number;
    currency: string;
    dueDate: string;
  };
}

export function EventCreationForm() {
  const [formData, setFormData] = useState<EventFormData>({
    name: '',
    date: '',
    venue: {
      name: '',
      address: '',
    },
    description: '',
    deadlines: {
      guestList: '',
      promoMaterials: '',
    },
    payment: {
      amount: 0,
      currency: 'KRW',
      dueDate: '',
    },
  });

  const [timeslots, setTimeslots] = useState<Timeslot[]>([]);

  const addTimeslot = () => {
    const newTimeslot: Timeslot = {
      id: `timeslot-${Date.now()}`,
      startTime: '',
      endTime: '',
      djName: '',
      djInstagram: '',
    };
    setTimeslots([...timeslots, newTimeslot]);
  };

  const updateTimeslot = (id: string, field: keyof Timeslot, value: string) => {
    setTimeslots(timeslots.map(slot => 
      slot.id === id ? { ...slot, [field]: value } : slot
    ));
  };

  const removeTimeslot = (id: string) => {
    setTimeslots(timeslots.filter(slot => slot.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Event data:', { formData, timeslots });
    // TODO: Connect to Convex backend
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Create New Event</h1>
        <p className="text-muted-foreground">Set up your DJ event with timeslots and submission requirements</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Event Information */}
        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
            <CardDescription>Basic information about your event</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="eventName">Event Name</Label>
                <Input
                  id="eventName"
                  placeholder="Seoul Underground Night"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventDate">Event Date</Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of your event..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Venue Information */}
        <Card>
          <CardHeader>
            <CardTitle>Venue Information</CardTitle>
            <CardDescription>Where will the event take place?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="venueName">Venue Name</Label>
              <Input
                id="venueName"
                placeholder="Club VERA"
                value={formData.venue.name}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  venue: { ...formData.venue, name: e.target.value }
                })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="venueAddress">Address</Label>
              <Input
                id="venueAddress"
                placeholder="123 Hongdae Street, Mapo-gu, Seoul"
                value={formData.venue.address}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  venue: { ...formData.venue, address: e.target.value }
                })}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
            <CardDescription>DJ payment information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paymentAmount">Amount</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  placeholder="150000"
                  value={formData.payment.amount}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    payment: { ...formData.payment, amount: Number(e.target.value) }
                  })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={formData.payment.currency}
                  onValueChange={(value) => setFormData({ 
                    ...formData, 
                    payment: { ...formData.payment, currency: value }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KRW">KRW (₩)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentDue">Payment Due Date</Label>
                <Input
                  id="paymentDue"
                  type="date"
                  value={formData.payment.dueDate}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    payment: { ...formData.payment, dueDate: e.target.value }
                  })}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle>Submission Deadlines</CardTitle>
            <CardDescription>When do DJs need to submit their materials?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="guestListDeadline">Guest List Deadline</Label>
                <Input
                  id="guestListDeadline"
                  type="date"
                  value={formData.deadlines.guestList}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    deadlines: { ...formData.deadlines, guestList: e.target.value }
                  })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="promoDeadline">Promo Materials Deadline</Label>
                <Input
                  id="promoDeadline"
                  type="date"
                  value={formData.deadlines.promoMaterials}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    deadlines: { ...formData.deadlines, promoMaterials: e.target.value }
                  })}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeslots */}
        <Card>
          <CardHeader>
            <CardTitle>DJ Timeslots</CardTitle>
            <CardDescription>Add time slots for each DJ performing at your event</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {timeslots.map((slot, index) => (
              <div key={slot.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Timeslot {index + 1}</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeTimeslot(slot.id)}
                  >
                    Remove
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input
                      type="time"
                      value={slot.startTime}
                      onChange={(e) => updateTimeslot(slot.id, 'startTime', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) => updateTimeslot(slot.id, 'endTime', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>DJ Name</Label>
                    <Input
                      placeholder="DJ Hansol"
                      value={slot.djName}
                      onChange={(e) => updateTimeslot(slot.id, 'djName', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Instagram Handle</Label>
                    <Input
                      placeholder="@dj_hansol"
                      value={slot.djInstagram}
                      onChange={(e) => updateTimeslot(slot.id, 'djInstagram', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addTimeslot}
              className="w-full"
            >
              + Add Timeslot
            </Button>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button type="submit" size="lg" className="px-8">
            Create Event
          </Button>
        </div>
      </form>
    </div>
  );
}