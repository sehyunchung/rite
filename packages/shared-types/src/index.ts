// Common types that can be shared between Next.js and SvelteKit apps

// Export Effect schemas for type-safe validation and undefined pollution elimination
export * from './effect-schemas';

// Export file validation utilities
export * from './file-validation';

export interface Event {
	id: string;
	name: string;
	venue: string;
	date: string;
	budget: number;
	paymentPerDJ: number;
	guestLimitPerDJ: number;
	description?: string;
	instagramHashtags?: string[];
	promoDeadline: string;
	guestListDeadline: string;
	status: 'draft' | 'active' | 'completed' | 'cancelled';
	createdAt: string;
	updatedAt: string;
}

export interface Timeslot {
	id: string;
	eventId: string;
	startTime: string;
	endTime: string;
	djName?: string;
	instagramHandle?: string;
	submissionToken: string;
	status: 'available' | 'booked' | 'submitted';
	createdAt: string;
}

export interface Submission {
	id: string;
	timeslotId: string;
	djName: string;
	instagramHandle: string;
	guestList: GuestEntry[];
	paymentInfo: PaymentInfo;
	promoMaterials?: string[];
	submittedAt: string;
	status: 'pending' | 'approved' | 'rejected';
}

export interface GuestEntry {
	name: string;
	phoneNumber?: string;
}

export interface PaymentInfo {
	bankName: string;
	accountNumber: string;
	accountHolder: string;
	residentRegistrationNumber: string;
}

export interface User {
	id: string;
	email: string;
	name?: string;
	image?: string;
	createdAt: string;
}

// Instagram OAuth types
export interface InstagramConnection {
	id: string;
	userId: string;
	instagramUserId: string;
	username: string;
	accountType: 'BUSINESS' | 'CREATOR';
	profilePictureUrl?: string;
	accessToken: string;
	connectedAt: string;
}
