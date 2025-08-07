import * as React from 'react';
import { 
  validateInstagramHandle,
  validateDate,
  validateDeadlineDate,
  validateDeadlineOrder,
  getDefaultGuestListDeadline,
  getDefaultPromoDeadline,
  type EventFormData
} from './validation';

// Validation state types
export type ValidationStatus = 'pristine' | 'validating' | 'valid' | 'invalid' | 'warning';

export interface ValidationState<T> {
  value: T;
  status: ValidationStatus;
  error?: string;
  suggestion?: string;
  confidence?: 'high' | 'medium' | 'low';
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  suggestion?: string;
  confidence?: 'high' | 'medium' | 'low';
}

// Enhanced validation with real-time feedback
export class ProgressiveValidator<T> {
  private debounceTimeout?: NodeJS.Timeout;
  private validators: Array<(value: T, context?: any) => ValidationResult> = [];
  private debounceMs: number;

  constructor(debounceMs: number = 500) {
    this.debounceMs = debounceMs;
  }

  addValidator(validator: (value: T, context?: any) => ValidationResult) {
    this.validators.push(validator);
    return this;
  }

  validate(value: T, context?: any): Promise<ValidationResult> {
    return new Promise((resolve) => {
      if (this.debounceTimeout) {
        clearTimeout(this.debounceTimeout);
      }

      this.debounceTimeout = setTimeout(() => {
        // Run all validators in sequence
        for (const validator of this.validators) {
          const result = validator(value, context);
          if (!result.isValid) {
            resolve(result);
            return;
          }
        }
        
        // All validators passed
        const lastResult = this.validators.length > 0 
          ? this.validators[this.validators.length - 1](value, context)
          : { isValid: true, confidence: 'high' as const };
        
        resolve(lastResult);
      }, this.debounceMs);
    });
  }
}

// React hook for progressive validation
export function useProgressiveValidation<T>(
  initialValue: T,
  validators: Array<(value: T, context?: any) => ValidationResult>,
  debounceMs: number = 500,
  context?: any
) {
  const [state, setState] = React.useState<ValidationState<T>>({
    value: initialValue,
    status: 'pristine'
  });

  const validatorRef = React.useRef<ProgressiveValidator<T> | undefined>(undefined);

  React.useEffect(() => {
    validatorRef.current = new ProgressiveValidator<T>(debounceMs);
    validators.forEach(validator => {
      validatorRef.current?.addValidator(validator);
    });
  }, [debounceMs, validators]);

  const setValue = React.useCallback(async (newValue: T) => {
    setState(prev => ({ ...prev, value: newValue, status: 'validating' }));
    
    if (validatorRef.current) {
      const result = await validatorRef.current.validate(newValue, context);
      setState(prev => ({
        ...prev,
        status: result.isValid ? 'valid' : 'invalid',
        error: result.error,
        suggestion: result.suggestion,
        confidence: result.confidence
      }));
    }
  }, [context]);

  const setValueImmediate = React.useCallback((newValue: T) => {
    setState(prev => ({ ...prev, value: newValue }));
  }, []);

  return {
    ...state,
    setValue,
    setValueImmediate,
    isValid: state.status === 'valid',
    isPristine: state.status === 'pristine',
    isValidating: state.status === 'validating',
    hasError: state.status === 'invalid'
  };
}

// Specific validators for RITE forms

export const eventNameValidator = (name: string): ValidationResult => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Event name is required' };
  }
  
  if (name.length < 3) {
    return { isValid: false, error: 'Event name must be at least 3 characters' };
  }
  
  if (name.length > 100) {
    return { isValid: false, error: 'Event name must be less than 100 characters' };
  }
  
  // Smart suggestions based on common patterns
  if (!name.toLowerCase().includes('party') && !name.toLowerCase().includes('event') && !name.toLowerCase().includes('night')) {
    return { 
      isValid: true, 
      suggestion: 'Consider adding words like "Party", "Night", or "Event" for clarity',
      confidence: 'medium'
    };
  }
  
  return { isValid: true, confidence: 'high' };
};

export const eventDateValidator = (date: string, context?: { minDate?: string }): ValidationResult => {
  if (!date) {
    return { isValid: false, error: 'Event date is required' };
  }
  
  const dateError = validateDate(date, context?.minDate);
  if (dateError) {
    return { isValid: false, error: dateError };
  }
  
  const selectedDate = new Date(date);
  const today = new Date();
  const diffDays = Math.ceil((selectedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 7) {
    return {
      isValid: true,
      suggestion: 'Events planned less than a week ahead may have limited DJ availability',
      confidence: 'medium'
    };
  }
  
  if (diffDays > 90) {
    return {
      isValid: true,
      suggestion: 'Events planned more than 3 months ahead may need timeline adjustments',
      confidence: 'low'
    };
  }
  
  return { isValid: true, confidence: 'high' };
};

export const instagramHandleValidator = (handle: string): ValidationResult => {
  const error = validateInstagramHandle(handle);
  if (error) {
    return { isValid: false, error };
  }
  
  if (!handle || handle.trim() === '') {
    return { 
      isValid: true, 
      suggestion: 'Adding Instagram helps with event promotion',
      confidence: 'medium'
    };
  }
  
  return { isValid: true, confidence: 'high' };
};

export const venueNameValidator = (name: string): ValidationResult => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Venue name is required' };
  }
  
  if (name.length < 2) {
    return { isValid: false, error: 'Venue name must be at least 2 characters' };
  }
  
  return { isValid: true, confidence: 'high' };
};

export const venueAddressValidator = (address: string): ValidationResult => {
  if (!address || address.trim().length === 0) {
    return { isValid: false, error: 'Venue address is required' };
  }
  
  if (address.length < 10) {
    return { 
      isValid: false, 
      error: 'Please provide a complete address' 
    };
  }
  
  // Simple heuristic for address completeness
  const hasNumber = /\d/.test(address);
  const hasComma = address.includes(',');
  
  if (!hasNumber || !hasComma) {
    return {
      isValid: true,
      suggestion: 'Include street number and city for better accuracy',
      confidence: 'medium'
    };
  }
  
  return { isValid: true, confidence: 'high' };
};

export const guestListDeadlineValidator = (deadline: string, context?: { eventDate?: string }): ValidationResult => {
  if (!deadline) {
    return { isValid: false, error: 'Guest list deadline is required' };
  }
  
  const dateError = validateDeadlineDate(deadline, context?.eventDate);
  if (dateError) {
    return { isValid: false, error: dateError };
  }
  
  if (context?.eventDate) {
    const suggestedDate = getDefaultGuestListDeadline(context.eventDate);
    const guest = new Date(deadline);
    const event = new Date(context.eventDate);
    const daysDiff = Math.ceil((event.getTime() - guest.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 1) {
      return {
        isValid: false,
        error: 'Guest list deadline should be at least 1 day before the event',
        suggestion: `Consider ${suggestedDate} (day before event)`
      };
    }
    
    if (daysDiff > 7) {
      return {
        isValid: true,
        suggestion: `Suggested: ${suggestedDate} (day before event)`,
        confidence: 'medium'
      };
    }
  }
  
  return { isValid: true, confidence: 'high' };
};

export const promoDeadlineValidator = (deadline: string, context?: { eventDate?: string; guestDeadline?: string }): ValidationResult => {
  if (!deadline) {
    return { isValid: false, error: 'Promo materials deadline is required' };
  }
  
  const dateError = validateDeadlineDate(deadline, context?.eventDate);
  if (dateError) {
    return { isValid: false, error: dateError };
  }
  
  if (context?.guestDeadline) {
    const orderError = validateDeadlineOrder(context.guestDeadline, deadline);
    if (orderError) {
      return { isValid: false, error: orderError };
    }
  }
  
  if (context?.eventDate) {
    const suggestedDate = getDefaultPromoDeadline(context.eventDate);
    const promo = new Date(deadline);
    const event = new Date(context.eventDate);
    const daysDiff = Math.ceil((event.getTime() - promo.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 7) {
      return {
        isValid: true,
        suggestion: `Consider ${suggestedDate} (3 weeks before) for better DJ preparation time`,
        confidence: 'medium'
      };
    }
    
    if (daysDiff < 14) {
      return {
        isValid: true,
        suggestion: `Good timing! Suggested: ${suggestedDate} (3 weeks before)`,
        confidence: 'high'
      };
    }
  }
  
  return { isValid: true, confidence: 'high' };
};

export const timeslotTimeValidator = (startTime: string, endTime: string): ValidationResult => {
  if (!startTime || !endTime) {
    return { isValid: false, error: 'Both start and end times are required' };
  }
  
  const start = new Date(`2000-01-01T${startTime}:00`);
  let end = new Date(`2000-01-01T${endTime}:00`);
  
  // Handle cross-midnight timeslots
  if (end <= start) {
    end = new Date(`2000-01-02T${endTime}:00`);
  }
  
  const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
  
  if (durationMinutes < 15) {
    return { isValid: false, error: 'Timeslot must be at least 15 minutes' };
  }
  
  if (durationMinutes < 30) {
    return {
      isValid: true,
      suggestion: 'Most DJ sets are 30-120 minutes long',
      confidence: 'medium'
    };
  }
  
  if (durationMinutes > 180) {
    return {
      isValid: true,
      suggestion: 'Long sets (3+ hours) may be challenging for some DJs',
      confidence: 'medium'
    };
  }
  
  return { isValid: true, confidence: 'high' };
};

export const djPaymentValidator = (amount: number): ValidationResult => {
  if (amount < 0) {
    return { isValid: false, error: 'Payment amount cannot be negative' };
  }
  
  if (amount === 0) {
    return {
      isValid: true,
      suggestion: 'Free events may have limited DJ applications',
      confidence: 'medium'
    };
  }
  
  if (amount < 50) {
    return {
      isValid: true,
      suggestion: 'Low payment rates may affect DJ quality and availability',
      confidence: 'medium'
    };
  }
  
  if (amount > 1000) {
    return {
      isValid: true,
      suggestion: 'High payment rates are great for attracting top talent!',
      confidence: 'high'
    };
  }
  
  return { isValid: true, confidence: 'high' };
};

// Composite validator for the entire event form
export function useEventFormValidation(initialData: Partial<EventFormData>) {
  const [eventDate, setEventDate] = React.useState(initialData.date || '');
  const [guestDeadline, setGuestDeadline] = React.useState(initialData.deadlines?.guestList || '');

  const name = useProgressiveValidation(
    initialData.name || '',
    [eventNameValidator],
    300
  );

  const date = useProgressiveValidation(
    initialData.date || '',
    [eventDateValidator],
    300
  );

  const venueName = useProgressiveValidation(
    initialData.venue?.name || '',
    [venueNameValidator],
    300
  );

  const venueAddress = useProgressiveValidation(
    initialData.venue?.address || '',
    [venueAddressValidator],
    500
  );

  const guestListDeadline = useProgressiveValidation(
    initialData.deadlines?.guestList || '',
    [(deadline: string) => guestListDeadlineValidator(deadline, { eventDate })],
    300,
    { eventDate }
  );

  const promoDeadline = useProgressiveValidation(
    initialData.deadlines?.promoMaterials || '',
    [(deadline: string) => promoDeadlineValidator(deadline, { eventDate, guestDeadline })],
    300,
    { eventDate, guestDeadline }
  );

  // Update context when dependencies change
  React.useEffect(() => {
    setEventDate(date.value);
  }, [date.value]);

  React.useEffect(() => {
    setGuestDeadline(guestListDeadline.value);
  }, [guestListDeadline.value]);

  const isFormValid = 
    name.isValid &&
    date.isValid &&
    venueName.isValid &&
    venueAddress.isValid &&
    guestListDeadline.isValid &&
    promoDeadline.isValid;

  const hasErrors = 
    name.hasError ||
    date.hasError ||
    venueName.hasError ||
    venueAddress.hasError ||
    guestListDeadline.hasError ||
    promoDeadline.hasError;

  return {
    fields: {
      name,
      date,
      venueName,
      venueAddress,
      guestListDeadline,
      promoDeadline
    },
    isFormValid,
    hasErrors,
    isValidating: Object.values({
      name,
      date,
      venueName,
      venueAddress,
      guestListDeadline,
      promoDeadline
    }).some(field => field.isValidating)
  };
}