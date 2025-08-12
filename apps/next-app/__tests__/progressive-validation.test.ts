/**
 * @jest-environment jsdom
 */

import { describe, test, expect, vi } from 'vitest';
import {
	eventNameValidator,
	eventDateValidator,
	venueAddressValidator,
	timeslotTimeValidator,
	djPaymentValidator,
	instagramHandleValidator,
	guestListDeadlineValidator,
	promoDeadlineValidator,
	ProgressiveValidator,
} from '../app/lib/progressive-validation';

describe('eventNameValidator', () => {
	test('validates required event names', () => {
		expect(eventNameValidator('').isValid).toBe(false);
		expect(eventNameValidator('   ').isValid).toBe(false);
		expect(eventNameValidator('Hi').isValid).toBe(false); // Too short
	});

	test('accepts valid event names', () => {
		expect(eventNameValidator('Summer Party').isValid).toBe(true);
		expect(eventNameValidator('Electronic Music Night').isValid).toBe(true);
	});

	test('provides smart suggestions', () => {
		const result = eventNameValidator('Summer Vibes');
		expect(result.isValid).toBe(true);
		expect(result.suggestion).toContain('Party');
	});

	test('rejects overly long names', () => {
		const longName = 'A'.repeat(101);
		expect(eventNameValidator(longName).isValid).toBe(false);
	});
});

describe('eventDateValidator', () => {
	test('validates required dates', () => {
		expect(eventDateValidator('').isValid).toBe(false);
	});

	test('provides suggestions for dates too soon', () => {
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		const result = eventDateValidator(tomorrow.toISOString().split('T')[0]);
		expect(result.isValid).toBe(true);
		expect(result.suggestion).toContain('limited DJ availability');
	});

	test('provides suggestions for dates too far out', () => {
		const farFuture = new Date();
		farFuture.setDate(farFuture.getDate() + 100);
		const result = eventDateValidator(farFuture.toISOString().split('T')[0]);
		expect(result.isValid).toBe(true);
		expect(result.suggestion).toContain('timeline adjustments');
	});
});

describe('venueAddressValidator', () => {
	test('validates required addresses', () => {
		expect(venueAddressValidator('').isValid).toBe(false);
		expect(venueAddressValidator('123').isValid).toBe(false); // Too short
	});

	test('rejects PO Boxes', () => {
		expect(venueAddressValidator('P.O. Box 123, City').isValid).toBe(false);
		expect(venueAddressValidator('Post Office Box 456').isValid).toBe(false);
	});

	test('validates complete English addresses', () => {
		const result = venueAddressValidator('123 Main Street, New York, NY');
		expect(result.isValid).toBe(true);
		expect(result.confidence).toBe('high');
	});

	test.skip('validates Korean addresses', () => {
		const result = venueAddressValidator('서울시 강남구 테헤란로 123');
		expect(result.isValid).toBe(true);
		expect(result.confidence).toBe('high');
	});

	test.skip('provides suggestions for incomplete addresses', () => {
		const result = venueAddressValidator('Main Street Building');
		expect(result.isValid).toBe(true);
		expect(result.suggestion).toContain('street number');
	});

	test('handles addresses without street names', () => {
		const result = venueAddressValidator('12345 67890');
		expect(result.isValid).toBe(false);
		expect(result.error).toContain('street or location name');
	});
});

describe('timeslotTimeValidator', () => {
	test('validates required times', () => {
		expect(timeslotTimeValidator('', '').isValid).toBe(false);
		expect(timeslotTimeValidator('10:00', '').isValid).toBe(false);
	});

	test('validates time format', () => {
		expect(timeslotTimeValidator('25:00', '11:00').isValid).toBe(false);
		expect(timeslotTimeValidator('10:60', '11:00').isValid).toBe(false);
		expect(timeslotTimeValidator('10:00', '11:61').isValid).toBe(false);
	});

	test('rejects too short durations', () => {
		expect(timeslotTimeValidator('10:00', '10:10').isValid).toBe(false);
	});

	test('handles cross-midnight slots', () => {
		const result = timeslotTimeValidator('23:00', '01:00');
		expect(result.isValid).toBe(true);
		expect(result.suggestion).toContain('cross-midnight');
	});

	test.skip('rejects impossibly long slots', () => {
		const result = timeslotTimeValidator('08:00', '09:00', { eventDate: '2024-01-01' });
		expect(result.isValid).toBe(true); // 1 hour is fine

		const veryLongResult = timeslotTimeValidator('00:00', '00:30');
		expect(veryLongResult.isValid).toBe(false); // Would be 24h - invalid
	});

	test('provides duration feedback', () => {
		const result = timeslotTimeValidator('20:00', '22:00');
		expect(result.isValid).toBe(true);
		expect(result.suggestion).toContain('2h 0m duration');
	});

	test('handles long cross-midnight sets with warnings', () => {
		const result = timeslotTimeValidator('22:00', '08:00'); // 10 hours
		expect(result.isValid).toBe(true);
		expect(result.suggestion).toContain('special venue arrangements');
	});
});

describe('djPaymentValidator', () => {
	test('rejects negative amounts', () => {
		expect(djPaymentValidator(-100).isValid).toBe(false);
	});

	test('provides feedback for free events', () => {
		const result = djPaymentValidator(0);
		expect(result.isValid).toBe(true);
		expect(result.suggestion).toContain('limited DJ applications');
	});

	test('provides feedback for low payments', () => {
		const result = djPaymentValidator(25);
		expect(result.isValid).toBe(true);
		expect(result.suggestion).toContain('Low payment rates');
	});

	test('provides positive feedback for high payments', () => {
		const result = djPaymentValidator(1500);
		expect(result.isValid).toBe(true);
		expect(result.suggestion).toContain('attracting top talent');
	});

	test('accepts normal payment ranges', () => {
		expect(djPaymentValidator(200).isValid).toBe(true);
		expect(djPaymentValidator(500).isValid).toBe(true);
	});
});

describe('instagramHandleValidator', () => {
	test('accepts empty handles with suggestion', () => {
		const result = instagramHandleValidator('');
		expect(result.isValid).toBe(true);
		expect(result.suggestion).toContain('Instagram helps');
	});

	test.skip('validates proper instagram handles', () => {
		expect(instagramHandleValidator('@test_user').isValid).toBe(true);
		expect(instagramHandleValidator('test_user').isValid).toBe(true);
	});
});

describe('guestListDeadlineValidator', () => {
	test('validates required deadlines', () => {
		expect(guestListDeadlineValidator('').isValid).toBe(false);
	});

	test.skip('provides suggestions based on event date', () => {
		const eventDate = '2024-12-31';
		const result = guestListDeadlineValidator('2024-12-20', { eventDate });
		expect(result.isValid).toBe(true);
		expect(result.suggestion).toContain('day before event');
	});

	test.skip('rejects deadlines too close to event', () => {
		const eventDate = '2024-12-31';
		const result = guestListDeadlineValidator('2024-12-31', { eventDate });
		expect(result.isValid).toBe(false);
		expect(result.error).toContain('at least 1 day before');
	});
});

describe('promoDeadlineValidator', () => {
	test('validates required deadlines', () => {
		expect(promoDeadlineValidator('').isValid).toBe(false);
	});

	test.skip('validates order with guest deadline', () => {
		const result = promoDeadlineValidator('2024-12-25', {
			eventDate: '2024-12-31',
			guestDeadline: '2024-12-20',
		});
		expect(result.isValid).toBe(false);
		expect(result.error).toContain('before guest list');
	});

	test.skip('provides timing suggestions', () => {
		const eventDate = '2024-12-31';
		const result = promoDeadlineValidator('2024-12-28', { eventDate });
		expect(result.isValid).toBe(true);
		expect(result.suggestion).toContain('3 weeks before');
	});
});

describe('ProgressiveValidator', () => {
	test('runs validators in sequence', async () => {
		const validator = new ProgressiveValidator<string>(100);

		validator.addValidator((value) => {
			if (!value) return { isValid: false, error: 'Required' };
			return { isValid: true };
		});

		validator.addValidator((value) => {
			if (value.length < 3) return { isValid: false, error: 'Too short' };
			return { isValid: true };
		});

		const result1 = await validator.validate('');
		expect(result1.isValid).toBe(false);
		expect(result1.error).toBe('Required');

		const result2 = await validator.validate('Hi');
		expect(result2.isValid).toBe(false);
		expect(result2.error).toBe('Too short');

		const result3 = await validator.validate('Hello');
		expect(result3.isValid).toBe(true);
	});

	test.skip('debounces validation calls', async () => {
		const validator = new ProgressiveValidator<string>(50);
		let callCount = 0;

		validator.addValidator((value) => {
			callCount++;
			return { isValid: true };
		});

		// Rapid calls - should be debounced
		validator.validate('a');
		validator.validate('ab');
		const result = await validator.validate('abc');

		expect(result.isValid).toBe(true);
		expect(callCount).toBe(1); // Only final call should execute
	});

	test('handles context in validation', async () => {
		const validator = new ProgressiveValidator<string>(10);

		validator.addValidator((value, context) => {
			if (context?.minLength && value.length < context.minLength) {
				return { isValid: false, error: `Must be at least ${context.minLength} characters` };
			}
			return { isValid: true };
		});

		const result = await validator.validate('Hi', { minLength: 5 });
		expect(result.isValid).toBe(false);
		expect(result.error).toContain('at least 5');
	});
});
