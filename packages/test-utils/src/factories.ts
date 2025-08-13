/**
 * Test data factories for consistent test data generation
 * Following TDD principle: Use predictable, consistent test data
 */

// Using generic ID type to avoid dependency on generated types
type Id<T extends string> = string & { __tableName: T };

/**
 * Creates a mock event with optional overrides
 * @param overrides - Partial event data to override defaults
 * @returns Mock event object with Convex ID typing
 * @throws Error if required fields are missing or invalid
 * @example
 * const event = createMockEvent({ name: 'Summer Festival', capacity: 500 });
 */
export const createMockEvent = (overrides: Partial<MockEvent> = {}): MockEvent => {
	const event = {
		_id: 'event_123' as Id<'events'>,
		_creationTime: Date.now(),
		name: 'Test Event',
		date: '2025-02-01',
		startTime: '18:00',
		endTime: '04:00',
		venue: 'Test Venue',
		address: '123 Test St',
		description: 'Test event description',
		createdBy: 'user_123' as Id<'users'>,
		status: 'upcoming' as const,
		capacity: 100,
		...overrides,
	};

	// Validate required fields
	if (!event.name || event.name.trim() === '') {
		throw new Error('Mock event requires a non-empty name');
	}
	if (!event.date) {
		throw new Error('Mock event requires a date');
	}
	if (!event.venue || event.venue.trim() === '') {
		throw new Error('Mock event requires a venue');
	}
	if (event.capacity < 0) {
		throw new Error('Mock event capacity cannot be negative');
	}

	return event;
};

/**
 * Creates a mock user with optional overrides
 * @param overrides - Partial user data to override defaults
 * @returns Mock user object with Convex ID typing
 * @throws Error if required fields are missing or invalid
 * @example
 * const user = createMockUser({ name: 'DJ Alex', role: 'dj' });
 */
export const createMockUser = (overrides: Partial<MockUser> = {}): MockUser => {
	const user = {
		_id: 'user_123' as Id<'users'>,
		_creationTime: Date.now(),
		email: 'test@example.com',
		name: 'Test User',
		role: 'dj' as const,
		image: 'https://example.com/avatar.jpg',
		...overrides,
	};

	// Validate required fields
	if (!user.email || !user.email.includes('@')) {
		throw new Error('Mock user requires a valid email address');
	}
	if (!user.name || user.name.trim() === '') {
		throw new Error('Mock user requires a non-empty name');
	}
	if (!['admin', 'organizer', 'dj', 'guest'].includes(user.role)) {
		throw new Error('Mock user role must be one of: admin, organizer, dj, guest');
	}

	return user;
};

/**
 * Creates a mock timeslot with optional overrides
 * @param overrides - Partial timeslot data to override defaults
 * @returns Mock timeslot object with Convex ID typing
 * @throws Error if required fields are missing or invalid
 * @example
 * const timeslot = createMockTimeslot({ djName: 'DJ Shadow', startTime: '23:00' });
 */
export const createMockTimeslot = (overrides: Partial<MockTimeslot> = {}): MockTimeslot => {
	const timeslot = {
		_id: 'timeslot_123' as Id<'timeslots'>,
		_creationTime: Date.now(),
		eventId: 'event_123' as Id<'events'>,
		djName: 'Test DJ',
		startTime: '22:00',
		endTime: '23:00',
		submissionToken: 'token_abc123',
		order: 1,
		...overrides,
	};

	// Validate required fields
	if (!timeslot.djName || timeslot.djName.trim() === '') {
		throw new Error('Mock timeslot requires a non-empty DJ name');
	}
	if (!timeslot.submissionToken || timeslot.submissionToken.trim() === '') {
		throw new Error('Mock timeslot requires a submission token');
	}
	if (timeslot.order < 0) {
		throw new Error('Mock timeslot order cannot be negative');
	}

	return timeslot;
};

/**
 * Creates a mock submission with optional overrides
 * @param overrides - Partial submission data to override defaults
 * @returns Mock submission object with Convex ID typing
 * @throws Error if required fields are missing or invalid
 * @example
 * const submission = createMockSubmission({ djName: 'DJ Nova', email: 'nova@dj.com' });
 */
export const createMockSubmission = (overrides: Partial<MockSubmission> = {}): MockSubmission => {
	const submission = {
		_id: 'submission_123' as Id<'submissions'>,
		_creationTime: Date.now(),
		timeslotId: 'timeslot_123' as Id<'timeslots'>,
		djName: 'Test DJ',
		email: 'dj@example.com',
		phone: '+1234567890',
		instagram: '@testdj',
		guestList: ['Guest 1', 'Guest 2'],
		notes: 'Test notes',
		submittedAt: Date.now(),
		...overrides,
	};

	// Validate required fields
	if (!submission.djName || submission.djName.trim() === '') {
		throw new Error('Mock submission requires a non-empty DJ name');
	}
	if (!submission.email || !submission.email.includes('@')) {
		throw new Error('Mock submission requires a valid email address');
	}
	if (!Array.isArray(submission.guestList)) {
		throw new Error('Mock submission requires guestList to be an array');
	}

	return submission;
};

/**
 * Creates a mock Instagram connection with optional overrides
 * @param overrides - Partial Instagram connection data to override defaults
 * @returns Mock Instagram connection object with Convex ID typing
 * @throws Error if required fields are missing or invalid
 * @example
 * const connection = createMockInstagramConnection({ username: 'dj_official' });
 */
export const createMockInstagramConnection = (
	overrides: Partial<MockInstagramConnection> = {}
): MockInstagramConnection => {
	const connection = {
		_id: 'ig_123' as Id<'instagramConnections'>,
		_creationTime: Date.now(),
		userId: 'user_123' as Id<'users'>,
		instagramId: 'ig_user_123',
		username: 'testuser',
		accessToken: 'token_xyz',
		profilePicture: 'https://instagram.com/pic.jpg',
		...overrides,
	};

	// Validate required fields
	if (!connection.username || connection.username.trim() === '') {
		throw new Error('Mock Instagram connection requires a non-empty username');
	}
	if (!connection.instagramId || connection.instagramId.trim() === '') {
		throw new Error('Mock Instagram connection requires an Instagram ID');
	}
	if (!connection.accessToken || connection.accessToken.trim() === '') {
		throw new Error('Mock Instagram connection requires an access token');
	}

	return connection;
};

// Type Definitions
export interface MockEvent {
	_id: Id<'events'>;
	_creationTime: number;
	name: string;
	date: string;
	startTime: string;
	endTime: string;
	venue: string;
	address: string;
	description: string;
	createdBy: Id<'users'>;
	status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
	capacity: number;
}

export interface MockUser {
	_id: Id<'users'>;
	_creationTime: number;
	email: string;
	name: string;
	role: 'admin' | 'organizer' | 'dj' | 'guest';
	image?: string;
}

export interface MockTimeslot {
	_id: Id<'timeslots'>;
	_creationTime: number;
	eventId: Id<'events'>;
	djName: string;
	startTime: string;
	endTime: string;
	submissionToken: string;
	order: number;
}

export interface MockSubmission {
	_id: Id<'submissions'>;
	_creationTime: number;
	timeslotId: Id<'timeslots'>;
	djName: string;
	email: string;
	phone?: string;
	instagram?: string;
	guestList: string[];
	notes?: string;
	submittedAt: number;
}

export interface MockInstagramConnection {
	_id: Id<'instagramConnections'>;
	_creationTime: number;
	userId: Id<'users'>;
	instagramId: string;
	username: string;
	accessToken: string;
	profilePicture?: string;
}

/**
 * Creates multiple mock events with optional overrides
 * @param count - Number of events to create
 * @param overrides - Partial event data to apply to all events
 * @returns Array of mock event objects
 * @example
 * const events = createMockEvents(5, { status: 'upcoming' });
 */
export const createMockEvents = (
	count: number,
	overrides: Partial<MockEvent> = {}
): MockEvent[] => {
	return Array.from({ length: count }, (_, i) =>
		createMockEvent({
			_id: `event_${i}` as Id<'events'>,
			name: `Test Event ${i + 1}`,
			...overrides,
		})
	);
};

/**
 * Creates multiple mock timeslots for an event
 * @param eventId - The event ID to associate timeslots with
 * @param count - Number of timeslots to create
 * @returns Array of mock timeslot objects
 * @example
 * const timeslots = createMockTimeslots('event_123' as Id<'events'>, 4);
 */
export const createMockTimeslots = (eventId: Id<'events'>, count: number): MockTimeslot[] => {
	return Array.from({ length: count }, (_, i) => {
		const startHour = 20 + i;
		return createMockTimeslot({
			_id: `timeslot_${i}` as Id<'timeslots'>,
			eventId,
			djName: `DJ ${i + 1}`,
			startTime: `${startHour}:00`,
			endTime: `${startHour + 1}:00`,
			order: i,
			submissionToken: `token_${i}`,
		});
	});
};
