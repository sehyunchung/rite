import React, { useState, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@rite/backend/convex/_generated/api';
import { Id, Doc } from '@rite/backend/convex/_generated/dataModel';
import { useSession } from 'next-auth/react';
import { Button } from '@rite/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@rite/ui';
import { Input, Label, Textarea } from '@rite/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@rite/ui';
import { 
  type EventFormData, 
  type Timeslot, 
  validateEvent, 
  validateTimeslot,
  validateTimeRange,
  validateDate,
  validateDeadlineOrder,
  validateTimeslotDuration,
  getDefaultGuestListDeadline,
  getDefaultPromoDeadline,
  getDefaultStartTime,
  getDefaultEndTime,
  validateGuestListDeadline,
  validatePromoDeadline
} from '@/lib/validation';
import { useTranslations } from 'next-intl';
import { AlertCircle, Trash2, Calendar, MapPin, Users, DollarSign, Clock, PlusCircle } from 'lucide-react';

// Type for event with timeslots
type EventWithTimeslots = Doc<"events"> & {
  timeslots: Doc<"timeslots">[];
};

interface EventEditFormProps {
  event: EventWithTimeslots;
  onEventUpdated?: () => void;
}

const MAX_TIMESLOTS_PER_EVENT = 12;

export function EventEditForm({ event, onEventUpdated }: EventEditFormProps) {
  const updateEvent = useMutation(api.events.updateEvent);
  const { data: session } = useSession();
  
  const [formData, setFormData] = useState<EventFormData>({
    name: event.name,
    date: event.date,
    venue: {
      name: event.venue.name,
      address: event.venue.address,
    },
    description: event.description || '',
    hashtags: event.hashtags || '',
    deadlines: {
      guestList: event.deadlines.guestList,
      promoMaterials: event.deadlines.promoMaterials,
    },
    payment: {
      amount: event.payment.amount || 0,
      perDJ: event.payment.perDJ || 0,
      currency: event.payment.currency as 'KRW' | 'USD' | 'EUR',
      dueDate: event.payment.dueDate,
    },
    guestLimitPerDJ: event.guestLimitPerDJ || 2,
  });

  // Convert existing timeslots to form format
  const [timeslots, setTimeslots] = useState<Timeslot[]>(
    event.timeslots.map(slot => ({
      id: slot._id,
      startTime: slot.startTime,
      endTime: slot.endTime,
      djName: slot.djName,
      djInstagram: slot.djInstagram,
    }))
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const addTimeslot = () => {
    if (timeslots.length >= MAX_TIMESLOTS_PER_EVENT) {
      setErrors({ ...errors, maxTimeslots: `Maximum ${MAX_TIMESLOTS_PER_EVENT} timeslots allowed per event` });
      return;
    }
    
    let defaultStartTime = '';
    let defaultEndTime = '';
    
    if (timeslots.length === 0) {
      defaultStartTime = getDefaultStartTime();
      defaultEndTime = getDefaultEndTime(defaultStartTime);
    } else {
      const lastSlot = timeslots[timeslots.length - 1];
      if (lastSlot.endTime) {
        defaultStartTime = lastSlot.endTime;
        defaultEndTime = getDefaultEndTime(defaultStartTime);
      }
    }

    const newTimeslot: Timeslot = {
      id: `new-timeslot-${Date.now()}`,
      startTime: defaultStartTime,
      endTime: defaultEndTime,
      djName: '',
      djInstagram: '',
    };
    setTimeslots([...timeslots, newTimeslot]);
    
    if (errors.maxTimeslots) {
      clearFieldError('maxTimeslots');
    }
  };

  const updateTimeslot = (id: string, field: keyof Timeslot, value: string) => {
    setTimeslots(timeslots.map(slot => 
      slot.id === id ? { ...slot, [field]: value } : slot
    ));
    
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
    if (deleteConfirm === id) {
      setTimeslots(timeslots.filter(slot => slot.id !== id));
      setDeleteConfirm(null);
      
      // Clear related errors
      const errorKeys = Object.keys(errors).filter(key => key.includes(`timeslot-${id}`));
      if (errorKeys.length > 0) {
        setErrors(prev => {
          const newErrors = { ...prev };
          errorKeys.forEach(key => delete newErrors[key]);
          return newErrors;
        });
      }
    } else {
      setDeleteConfirm(id);
    }
  };

  const clearFieldError = (field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return {
          ...prev,
          [parent]: {
            ...(prev[parent as keyof EventFormData] as any),
            [child]: value
          }
        };
      }
      return { ...prev, [field]: value };
    });
    
    clearFieldError(field);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Validate basic event data
    const eventValidation = validateEvent(formData);
    Object.assign(newErrors, eventValidation);
    
    // Validate timeslots
    if (timeslots.length === 0) {
      newErrors.timeslots = 'At least one DJ timeslot is required';
    } else {
      timeslots.forEach((slot, index) => {
        const slotErrors = validateTimeslot(slot);
        Object.keys(slotErrors).forEach(key => {
          newErrors[`timeslot-${slot.id}-${key}`] = slotErrors[key as keyof typeof slotErrors];
        });
      });
      
      // Validate time ranges between timeslots
      for (let i = 0; i < timeslots.length - 1; i++) {
        const current = timeslots[i];
        const next = timeslots[i + 1];
        // Check if current end time comes before next start time
        if (current.endTime && next.startTime && current.endTime > next.startTime) {
          newErrors[`timeslot-${next.id}-startTime`] = 'Start time must be after previous slot ends';
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !session?.user) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Convert timeslots to the format expected by the backend
      const formattedTimeslots = timeslots.map(slot => ({
        id: slot.id?.startsWith('new-') ? undefined : slot.id as Id<"timeslots">,
        startTime: slot.startTime,
        endTime: slot.endTime,
        djName: slot.djName,
        djInstagram: slot.djInstagram,
      }));

      await updateEvent({
        eventId: event._id,
        userId: session.user.id as Id<"users">,
        ...formData,
        timeslots: formattedTimeslots,
      });
      
      onEventUpdated?.();
    } catch (error) {
      console.error('Failed to update event:', error);
      setErrors({ submit: 'Failed to update event. Please try again.' });
    }
    
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Event Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Event Details</span>
          </CardTitle>
          <CardDescription>Update the basic information about your event</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="eventName">Event Name *</Label>
              <Input
                id="eventName"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                placeholder="Enter event name"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.name}</span>
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="eventDate">Event Date *</Label>
              <Input
                id="eventDate"
                type="date"
                value={formData.date}
                onChange={(e) => updateFormData('date', e.target.value)}
                className={errors.date ? 'border-red-500' : ''}
              />
              {errors.date && (
                <p className="text-sm text-red-500 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.date}</span>
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateFormData('description', e.target.value)}
              placeholder="Describe your event..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hashtags">Instagram Hashtags</Label>
            <Input
              id="hashtags"
              value={formData.hashtags}
              onChange={(e) => updateFormData('hashtags', e.target.value)}
              placeholder="#techno #underground #seoul"
            />
          </div>
        </CardContent>
      </Card>

      {/* Venue Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span>Venue Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="venueName">Venue Name *</Label>
            <Input
              id="venueName"
              value={formData.venue.name}
              onChange={(e) => updateFormData('venue.name', e.target.value)}
              placeholder="Enter venue name"
              className={errors['venue.name'] ? 'border-red-500' : ''}
            />
            {errors['venue.name'] && (
              <p className="text-sm text-red-500 flex items-center space-x-1">
                <AlertCircle className="w-4 h-4" />
                <span>{errors['venue.name']}</span>
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="venueAddress">Venue Address *</Label>
            <Input
              id="venueAddress"
              value={formData.venue.address}
              onChange={(e) => updateFormData('venue.address', e.target.value)}
              placeholder="Enter full venue address"
              className={errors['venue.address'] ? 'border-red-500' : ''}
            />
            {errors['venue.address'] && (
              <p className="text-sm text-red-500 flex items-center space-x-1">
                <AlertCircle className="w-4 h-4" />
                <span>{errors['venue.address']}</span>
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* DJ Timeslots */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>DJ Lineup ({timeslots.length})</span>
            </div>
            <Button
              type="button"
              onClick={addTimeslot}
              variant="outline"
              size="sm"
              disabled={timeslots.length >= MAX_TIMESLOTS_PER_EVENT}
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Add DJ Slot
            </Button>
          </CardTitle>
          <CardDescription>
            Schedule your DJs and their performance times
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {errors.timeslots && (
            <p className="text-sm text-red-500 flex items-center space-x-1">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.timeslots}</span>
            </p>
          )}
          
          {errors.maxTimeslots && (
            <p className="text-sm text-red-500 flex items-center space-x-1">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.maxTimeslots}</span>
            </p>
          )}

          {timeslots.map((slot, index) => (
            <div key={slot.id} className="p-4 border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">DJ Slot {index + 1}</h4>
                <Button
                  type="button"
                  variant={deleteConfirm === slot.id ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => removeTimeslot(slot.id)}
                >
                  <Trash2 className="w-4 h-4" />
                  {deleteConfirm === slot.id ? 'Confirm Delete' : 'Remove'}
                </Button>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor={`djName-${slot.id}`}>DJ Name *</Label>
                  <Input
                    id={`djName-${slot.id}`}
                    value={slot.djName}
                    onChange={(e) => updateTimeslot(slot.id, 'djName', e.target.value)}
                    placeholder="DJ name"
                    className={errors[`timeslot-${slot.id}-djName`] ? 'border-red-500' : ''}
                  />
                  {errors[`timeslot-${slot.id}-djName`] && (
                    <p className="text-sm text-red-500">{errors[`timeslot-${slot.id}-djName`]}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`djInstagram-${slot.id}`}>Instagram Handle *</Label>
                  <Input
                    id={`djInstagram-${slot.id}`}
                    value={slot.djInstagram}
                    onChange={(e) => updateTimeslot(slot.id, 'djInstagram', e.target.value)}
                    placeholder="@djhandle"
                    className={errors[`timeslot-${slot.id}-djInstagram`] ? 'border-red-500' : ''}
                  />
                  {errors[`timeslot-${slot.id}-djInstagram`] && (
                    <p className="text-sm text-red-500">{errors[`timeslot-${slot.id}-djInstagram`]}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`startTime-${slot.id}`}>Start Time *</Label>
                  <Input
                    id={`startTime-${slot.id}`}
                    type="time"
                    value={slot.startTime}
                    onChange={(e) => updateTimeslot(slot.id, 'startTime', e.target.value)}
                    className={errors[`timeslot-${slot.id}-startTime`] ? 'border-red-500' : ''}
                  />
                  {errors[`timeslot-${slot.id}-startTime`] && (
                    <p className="text-sm text-red-500">{errors[`timeslot-${slot.id}-startTime`]}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`endTime-${slot.id}`}>End Time *</Label>
                  <Input
                    id={`endTime-${slot.id}`}
                    type="time"
                    value={slot.endTime}
                    onChange={(e) => updateTimeslot(slot.id, 'endTime', e.target.value)}
                    className={errors[`timeslot-${slot.id}-endTime`] ? 'border-red-500' : ''}
                  />
                  {errors[`timeslot-${slot.id}-endTime`] && (
                    <p className="text-sm text-red-500">{errors[`timeslot-${slot.id}-endTime`]}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Deadlines */}
      <Card>
        <CardHeader>
          <CardTitle>Important Deadlines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="guestListDeadline">Guest List Deadline *</Label>
              <Input
                id="guestListDeadline"
                type="date"
                value={formData.deadlines.guestList}
                onChange={(e) => updateFormData('deadlines.guestList', e.target.value)}
                className={errors['deadlines.guestList'] ? 'border-red-500' : ''}
              />
              {errors['deadlines.guestList'] && (
                <p className="text-sm text-red-500">{errors['deadlines.guestList']}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="promoDeadline">Promo Materials Deadline *</Label>
              <Input
                id="promoDeadline"
                type="date"
                value={formData.deadlines.promoMaterials}
                onChange={(e) => updateFormData('deadlines.promoMaterials', e.target.value)}
                className={errors['deadlines.promoMaterials'] ? 'border-red-500' : ''}
              />
              {errors['deadlines.promoMaterials'] && (
                <p className="text-sm text-red-500">{errors['deadlines.promoMaterials']}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5" />
            <span>Payment Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="totalAmount">Total Payment *</Label>
              <Input
                id="totalAmount"
                type="number"
                value={formData.payment.amount}
                onChange={(e) => updateFormData('payment.amount', Number(e.target.value))}
                placeholder="0"
                className={errors['payment.amount'] ? 'border-red-500' : ''}
              />
              {errors['payment.amount'] && (
                <p className="text-sm text-red-500">{errors['payment.amount']}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="perDJAmount">Payment per DJ *</Label>
              <Input
                id="perDJAmount"
                type="number"
                value={formData.payment.perDJ}
                onChange={(e) => updateFormData('payment.perDJ', Number(e.target.value))}
                placeholder="0"
                className={errors['payment.perDJ'] ? 'border-red-500' : ''}
              />
              {errors['payment.perDJ'] && (
                <p className="text-sm text-red-500">{errors['payment.perDJ']}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="currency">Currency *</Label>
              <Select value={formData.payment.currency} onValueChange={(value) => updateFormData('payment.currency', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KRW">KRW (₩)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="paymentDue">Payment Due Date *</Label>
              <Input
                id="paymentDue"
                type="date"
                value={formData.payment.dueDate}
                onChange={(e) => updateFormData('payment.dueDate', e.target.value)}
                className={errors['payment.dueDate'] ? 'border-red-500' : ''}
              />
              {errors['payment.dueDate'] && (
                <p className="text-sm text-red-500">{errors['payment.dueDate']}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="guestLimit">Guest Limit per DJ *</Label>
              <Select 
                value={formData.guestLimitPerDJ.toString()} 
                onValueChange={(value) => updateFormData('guestLimitPerDJ', Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select guest limit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 guest</SelectItem>
                  <SelectItem value="2">2 guests</SelectItem>
                  <SelectItem value="3">3 guests</SelectItem>
                  <SelectItem value="4">4 guests</SelectItem>
                  <SelectItem value="5">5 guests</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      {errors.submit && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700 flex items-center space-x-1">
            <AlertCircle className="w-4 h-4" />
            <span>{errors.submit}</span>
          </p>
        </div>
      )}

      <div className="flex justify-end space-x-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="min-w-[120px]"
        >
          {isSubmitting ? 'Updating...' : 'Update Event'}
        </Button>
      </div>
    </form>
  );
}