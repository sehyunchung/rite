import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  type EventFormData, 
  type Timeslot, 
  validateEvent, 
  validateTimeslot,
  validateTimeRange,
  validateInstagramHandle,
  validateDate,
  validateDeadlineOrder,
  validateTimeslotDuration
} from '@/lib/validation';

interface EventCreationFormProps {
  onEventCreated?: () => void;
}

const MAX_TIMESLOTS_PER_EVENT = 12; // Maximum number of DJ timeslots allowed

export function EventCreationForm({ onEventCreated }: EventCreationFormProps) {
  const createEvent = useMutation(api.events.createEvent);
  
  const [formData, setFormData] = useState<EventFormData>({
    name: '',
    date: '',
    venue: {
      name: '',
      address: '',
    },
    description: '',
    hashtags: '',
    deadlines: {
      guestList: '',
      promoMaterials: '',
    },
    payment: {
      amount: 0,
      perDJ: 0,
      currency: 'KRW',
      dueDate: '',
    },
    guestLimitPerDJ: 2,
  });

  const [timeslots, setTimeslots] = useState<Timeslot[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addTimeslot = () => {
    if (timeslots.length >= MAX_TIMESLOTS_PER_EVENT) {
      setErrors({ ...errors, maxTimeslots: `Maximum ${MAX_TIMESLOTS_PER_EVENT} timeslots allowed per event` });
      return;
    }
    
    const newTimeslot: Timeslot = {
      id: `timeslot-${Date.now()}`,
      startTime: '',
      endTime: '',
      djName: '',
      djInstagram: '',
    };
    setTimeslots([...timeslots, newTimeslot]);
    
    // Clear max timeslots error if it exists
    if (errors.maxTimeslots) {
      clearFieldError('maxTimeslots');
    }
  };

  const updateTimeslot = (id: string, field: keyof Timeslot, value: string) => {
    setTimeslots(timeslots.map(slot => 
      slot.id === id ? { ...slot, [field]: value } : slot
    ));
    
    // Clear field-specific errors when user starts typing
    const errorKey = `timeslot-${id}-${field}`;
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const removeTimeslot = (id: string) => {
    setTimeslots(timeslots.filter(slot => slot.id !== id));
    
    // Clear errors for removed timeslot
    setErrors(prev => {
      const newErrors = { ...prev };
      Object.keys(newErrors).forEach(key => {
        if (key.includes(`timeslot-${id}`)) {
          delete newErrors[key];
        }
      });
      return newErrors;
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate main event data
    const eventValidation = validateEvent(formData);
    if (eventValidation instanceof Error) {
      newErrors.event = eventValidation.message;
    }

    // Validate dates
    const dateError = validateDate(formData.date);
    if (dateError) newErrors.date = dateError;

    const guestListError = validateDate(formData.deadlines.guestList, formData.date);
    if (guestListError) newErrors.guestListDeadline = guestListError;

    const promoError = validateDate(formData.deadlines.promoMaterials, formData.date);
    if (promoError) newErrors.promoDeadline = promoError;

    const paymentError = validateDate(formData.payment.dueDate);
    if (paymentError) newErrors.paymentDue = paymentError;

    // Validate deadline order
    const deadlineOrderError = validateDeadlineOrder(formData.deadlines.guestList, formData.deadlines.promoMaterials);
    if (deadlineOrderError) newErrors.deadlineOrder = deadlineOrderError;

    // Validate timeslots
    if (timeslots.length === 0) {
      newErrors.timeslots = 'At least one timeslot is required';
    }

    timeslots.forEach((slot, index) => {
      const slotValidation = validateTimeslot(slot);
      if (slotValidation instanceof Error) {
        newErrors[`timeslot-${slot.id}`] = `Timeslot ${index + 1}: ${slotValidation.message}`;
      }

      // Validate time range
      const timeError = validateTimeRange(slot.startTime, slot.endTime);
      if (timeError) {
        newErrors[`timeslot-${slot.id}-time`] = timeError;
      }

      // Validate timeslot duration (minimum 30 minutes)
      const durationError = validateTimeslotDuration(slot.startTime, slot.endTime);
      if (durationError) {
        newErrors[`timeslot-${slot.id}-duration`] = durationError;
      }

      // Validate Instagram handle
      const instagramError = validateInstagramHandle(slot.djInstagram);
      if (instagramError) {
        newErrors[`timeslot-${slot.id}-instagram`] = instagramError;
      }
    });

    // Check for overlapping timeslots
    for (let i = 0; i < timeslots.length; i++) {
      for (let j = i + 1; j < timeslots.length; j++) {
        const slot1 = timeslots[i];
        const slot2 = timeslots[j];
        
        if (slot1.startTime && slot1.endTime && slot2.startTime && slot2.endTime) {
          const start1 = new Date(`2000-01-01T${slot1.startTime}:00`);
          const end1 = new Date(`2000-01-01T${slot1.endTime}:00`);
          const start2 = new Date(`2000-01-01T${slot2.startTime}:00`);
          const end2 = new Date(`2000-01-01T${slot2.endTime}:00`);

          if ((start1 < end2 && end1 > start2)) {
            newErrors[`timeslot-${slot1.id}-overlap`] = `Overlaps with another timeslot`;
            newErrors[`timeslot-${slot2.id}-overlap`] = `Overlaps with another timeslot`;
          }
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Prepare data for Convex
      const eventData = {
        organizerId: 'demo-organizer', // TODO: Get from auth
        name: formData.name,
        date: formData.date,
        venue: formData.venue,
        description: formData.description || '',
        hashtags: formData.hashtags || '',
        deadlines: formData.deadlines,
        payment: formData.payment,
        guestLimitPerDJ: formData.guestLimitPerDJ,
        timeslots: timeslots.map(({ id: _id, ...slot }) => slot), // Remove the temporary id
      };

      const result = await createEvent(eventData);
      
      console.log('Event created successfully:', result);
      alert('Event created successfully!');
      
      // Reset form
      setFormData({
        name: '',
        date: '',
        venue: { name: '', address: '' },
        description: '',
        hashtags: '',
        deadlines: { guestList: '', promoMaterials: '' },
        payment: { amount: 0, perDJ: 0, currency: 'KRW', dueDate: '' },
        guestLimitPerDJ: 2,
      });
      setTimeslots([]);
      setErrors({});
      
      // Notify parent component
      onEventCreated?.();
      
    } catch (error) {
      console.error('Failed to create event:', error);
      alert('Failed to create event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearFieldError = (fieldName: string) => {
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Create New Event</h1>
        <p className="text-muted-foreground">Set up your DJ event with timeslots and submission requirements</p>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-8">
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
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    clearFieldError('event');
                  }}
                  className={errors.event ? 'border-red-500' : ''}
                  required
                />
                {errors.event && (
                  <p className="text-sm text-red-500 mt-1">{errors.event}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventDate">Event Date</Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={formData.date}
                  onChange={(e) => {
                    setFormData({ ...formData, date: e.target.value });
                    clearFieldError('date');
                  }}
                  className={errors.date ? 'border-red-500' : ''}
                  required
                />
                {errors.date && (
                  <p className="text-sm text-red-500 mt-1">{errors.date}</p>
                )}
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

            <div className="space-y-2">
              <Label htmlFor="hashtags">Instagram Hashtags</Label>
              <Input
                id="hashtags"
                placeholder="#seouldj #underground #techno"
                value={formData.hashtags}
                onChange={(e) => setFormData({ ...formData, hashtags: e.target.value })}
              />
              <p className="text-sm text-muted-foreground">Hashtags for Instagram promotion</p>
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
            <CardDescription>DJ payment information and guest limits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paymentAmount">Total Budget</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  placeholder="900000"
                  value={formData.payment.amount}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    payment: { ...formData.payment, amount: Number(e.target.value) }
                  })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentPerDJ">Amount per DJ</Label>
                <Input
                  id="paymentPerDJ"
                  type="number"
                  placeholder="150000"
                  value={formData.payment.perDJ}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    payment: { ...formData.payment, perDJ: Number(e.target.value) }
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="guestLimit">Guest Limit per DJ</Label>
                <Input
                  id="guestLimit"
                  type="number"
                  placeholder="2"
                  value={formData.guestLimitPerDJ}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    guestLimitPerDJ: Number(e.target.value)
                  })}
                  min="0"
                  required
                />
                <p className="text-sm text-muted-foreground">Maximum number of guests each DJ can add</p>
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
                  onChange={(e) => {
                    setFormData({ 
                      ...formData, 
                      deadlines: { ...formData.deadlines, guestList: e.target.value }
                    });
                    clearFieldError('guestListDeadline');
                    clearFieldError('deadlineOrder');
                  }}
                  className={errors.guestListDeadline ? 'border-red-500' : ''}
                  required
                />
                {errors.guestListDeadline && (
                  <p className="text-sm text-red-500 mt-1">{errors.guestListDeadline}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="promoDeadline">Promo Materials Deadline</Label>
                <Input
                  id="promoDeadline"
                  type="date"
                  value={formData.deadlines.promoMaterials}
                  onChange={(e) => {
                    setFormData({ 
                      ...formData, 
                      deadlines: { ...formData.deadlines, promoMaterials: e.target.value }
                    });
                    clearFieldError('promoDeadline');
                    clearFieldError('deadlineOrder');
                  }}
                  className={errors.promoDeadline ? 'border-red-500' : ''}
                  required
                />
                {errors.promoDeadline && (
                  <p className="text-sm text-red-500 mt-1">{errors.promoDeadline}</p>
                )}
              </div>
            </div>
            {errors.deadlineOrder && (
              <p className="text-sm text-red-500 text-center">{errors.deadlineOrder}</p>
            )}
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
                      className={errors[`timeslot-${slot.id}-time`] || errors[`timeslot-${slot.id}-overlap`] || errors[`timeslot-${slot.id}-duration`] ? 'border-red-500' : ''}
                      required
                    />
                    {(errors[`timeslot-${slot.id}-time`] || errors[`timeslot-${slot.id}-overlap`] || errors[`timeslot-${slot.id}-duration`]) && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors[`timeslot-${slot.id}-time`] || errors[`timeslot-${slot.id}-overlap`] || errors[`timeslot-${slot.id}-duration`]}
                      </p>
                    )}
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
                      className={errors[`timeslot-${slot.id}-instagram`] ? 'border-red-500' : ''}
                      required
                    />
                    {errors[`timeslot-${slot.id}-instagram`] && (
                      <p className="text-xs text-red-500 mt-1">{errors[`timeslot-${slot.id}-instagram`]}</p>
                    )}
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
            
            {(errors.timeslots || errors.maxTimeslots) && (
              <p className="text-sm text-red-500 text-center">{errors.timeslots || errors.maxTimeslots}</p>
            )}
          </CardContent>
        </Card>

        {/* Global Errors */}
        {Object.keys(errors).length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <h4 className="font-medium text-red-800">Please fix the following errors:</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {Object.entries(errors).map(([key, message]) => (
                    <li key={key}>• {message}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button 
            type="submit" 
            size="lg" 
            className="px-8"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Event...' : 'Create Event'}
          </Button>
        </div>
      </form>
    </div>
  );
}