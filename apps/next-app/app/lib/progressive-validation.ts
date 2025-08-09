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
  
  // Enhanced address validation patterns
  const hasStreetNumber = /^\d+\s/.test(address.trim()) || /\s\d+(?:\s|$)/.test(address);
  const hasStreetName = /[a-zA-Z]{2,}/.test(address);
  const hasCommaOrCommonSeparators = /[,\s-]/.test(address);
  const hasKoreanAddress = /[가-힣]+/.test(address); // Korean characters for Korean addresses
  const hasCommonAddressWords = /\b(street|st|avenue|ave|road|rd|lane|ln|boulevard|blvd|drive|dr|court|ct|place|pl|way|circle|cir|동|구|시|로|가)\b/i.test(address);
  
  // Check for PO Box (usually invalid for venue addresses)
  const isPOBox = /\b(p\.?o\.?\s*box|post office box)\b/i.test(address);
  if (isPOBox) {
    return {
      isValid: false,
      error: 'Please provide a physical venue address, not a P.O. Box'
    };
  }
  
  // Very basic structure validation
  if (!hasStreetName) {
    return {
      isValid: false,
      error: 'Address should include a street or location name'
    };
  }
  
  // Enhanced scoring system for address completeness
  let completenessScore = 0;
  const suggestions = [];
  
  if (hasStreetNumber) completenessScore += 2;
  else suggestions.push('street number');
  
  if (hasCommaOrCommonSeparators) completenessScore += 1;
  
  if (hasKoreanAddress || hasCommonAddressWords) completenessScore += 2;
  else suggestions.push('city or district');
  
  // Check for minimum completeness
  if (completenessScore < 3) {
    const missingSuggestion = suggestions.length > 0 
      ? `Consider including: ${suggestions.join(', ')}`
      : 'Include more location details for better accuracy';
    
    return {
      isValid: completenessScore >= 2, // Minimum viable address
      error: completenessScore < 2 ? 'Address appears incomplete' : undefined,
      suggestion: missingSuggestion,
      confidence: 'medium'
    };
  }
  
  // High quality address detected
  if (completenessScore >= 4) {
    return { isValid: true, confidence: 'high' };
  }
  
  return { 
    isValid: true, 
    suggestion: 'Address looks good! Consider adding more details if needed',
    confidence: 'medium' 
  };
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

export const timeslotTimeValidator = (
  startTime: string, 
  endTime: string, 
  _context?: { timezone?: string; eventDate?: string }
): ValidationResult => {
  if (!startTime || !endTime) {
    return { isValid: false, error: 'Both start and end times are required' };
  }
  
  // Validate time format
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(startTime)) {
    return { isValid: false, error: 'Start time must be in HH:MM format' };
  }
  if (!timeRegex.test(endTime)) {
    return { isValid: false, error: 'End time must be in HH:MM format' };
  }
  
  // Time validation is done using minutes only, no date objects needed
  
  // Enhanced cross-midnight handling
  const startMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
  const endMinutes = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);
  
  let durationMinutes: number;
  let crossesMidnight = false;
  
  if (endMinutes <= startMinutes) {
    // Cross-midnight scenario
    crossesMidnight = true;
    durationMinutes = (24 * 60) - startMinutes + endMinutes;
  } else {
    durationMinutes = endMinutes - startMinutes;
  }
  
  // Validation checks
  if (durationMinutes < 15) {
    return { isValid: false, error: 'Timeslot must be at least 15 minutes' };
  }
  
  if (durationMinutes > 12 * 60) { // 12 hours max
    return {
      isValid: false,
      error: 'Timeslot cannot exceed 12 hours. Please split into multiple slots.'
    };
  }
  
  // Provide contextual feedback
  if (crossesMidnight && durationMinutes > 8 * 60) {
    return {
      isValid: true,
      suggestion: 'Very long cross-midnight sets may require special venue arrangements',
      confidence: 'medium'
    };
  }
  
  if (crossesMidnight) {
    return {
      isValid: true,
      suggestion: `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m cross-midnight set - confirm venue hours`,
      confidence: 'medium'
    };
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
  
  return { 
    isValid: true, 
    confidence: 'high',
    suggestion: `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m duration`
  };
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

export const djEmailValidator = (email: string): ValidationResult => {
  if (!email || email.trim().length === 0) {
    return { isValid: false, error: 'Email address is required for notifications' };
  }
  
  // Enhanced email validation regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  // Check for common mistakes
  const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'naver.com', 'daum.net', 'hanmail.net'];
  const domain = email.split('@')[1]?.toLowerCase();
  
  if (domain && !commonDomains.includes(domain)) {
    // Check for common typos in popular domains
    const typoSuggestions: Record<string, string> = {
      'gmial.com': 'gmail.com',
      'gmai.com': 'gmail.com',
      'yahooo.com': 'yahoo.com',
      'yaho.com': 'yahoo.com',
      'hotmai.com': 'hotmail.com',
      'outlok.com': 'outlook.com',
      'navr.com': 'naver.com',
      'daun.net': 'daum.net'
    };
    
    const suggestion = typoSuggestions[domain];
    if (suggestion) {
      return {
        isValid: true,
        suggestion: `Did you mean ${email.replace(domain, suggestion)}?`,
        confidence: 'medium'
      };
    }
  }
  
  // Check for temporary/disposable email domains (basic check)
  const disposableDomains = ['10minutemail.com', 'tempmail.org', 'guerrillamail.com', 'mailinator.com'];
  if (domain && disposableDomains.includes(domain)) {
    return {
      isValid: false,
      error: 'Please use a permanent email address for notifications'
    };
  }
  
  return { isValid: true, confidence: 'high' };
};

export const djPhoneValidator = (phone: string): ValidationResult => {
  if (!phone || phone.trim().length === 0) {
    return {
      isValid: true,
      suggestion: 'Phone number helps organizers contact you directly',
      confidence: 'medium'
    };
  }
  
  // Remove common formatting characters
  const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, '');
  
  // Basic phone number validation (supports international formats)
  const phoneRegex = /^\d{8,15}$/;
  
  if (!phoneRegex.test(cleanPhone)) {
    return {
      isValid: false,
      error: 'Please enter a valid phone number (8-15 digits)'
    };
  }
  
  // Korean phone number specific validation
  if (cleanPhone.length === 11 && cleanPhone.startsWith('010')) {
    return { isValid: true, confidence: 'high' };
  }
  
  // International format validation
  if (cleanPhone.length >= 10 && cleanPhone.length <= 15) {
    return { isValid: true, confidence: 'high' };
  }
  
  return {
    isValid: true,
    suggestion: 'Verify phone number format for your region',
    confidence: 'medium'
  };
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