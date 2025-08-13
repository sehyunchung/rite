/**
 * Mock Convex client and utilities for testing
 * Following TDD principle: Mock external dependencies appropriately
 */

import { vi } from 'vitest';
// Using generic ID type to avoid dependency on generated types
type Id<T extends string> = string & { __tableName: T };

// Mock Convex mutation function
export const mockMutation = vi.fn().mockImplementation(async (name: string, args: any) => {
	// Default mock implementations
	switch (name) {
		case 'events.create':
			return 'event_new' as Id<'events'>;
		case 'users.create':
			return 'user_new' as Id<'users'>;
		case 'timeslots.create':
			return 'timeslot_new' as Id<'timeslots'>;
		case 'submissions.create':
			return 'submission_new' as Id<'submissions'>;
		default:
			return `mock_${name}_result`;
	}
});

// Mock Convex query function
export const mockQuery = vi.fn().mockImplementation(async (name: string, args: any) => {
	// Default mock implementations
	switch (name) {
		case 'events.list':
			return [];
		case 'events.get':
			return null;
		case 'users.current':
			return null;
		default:
			return null;
	}
});

// Mock Convex action function
export const mockAction = vi.fn().mockImplementation(async (name: string, args: any) => {
	// Default mock implementations
	return { success: true };
});

// Mock useQuery hook
export const mockUseQuery = vi.fn().mockImplementation((name: string, args?: any) => {
	// Return undefined by default (loading state)
	return undefined;
});

// Mock useMutation hook
export const mockUseMutation = vi.fn().mockImplementation((name: string) => {
	return mockMutation;
});

// Mock useAction hook
export const mockUseAction = vi.fn().mockImplementation((name: string) => {
	return mockAction;
});

// Mock ConvexReactClient
export class MockConvexReactClient {
	mutation = mockMutation;
	query = mockQuery;
	action = mockAction;

	// Mock subscription methods
	onUpdate = vi.fn();
	subscribe = vi.fn();
	unsubscribe = vi.fn();

	// Mock auth methods
	setAuth = vi.fn();
	clearAuth = vi.fn();
}

// Helper to reset all mocks
export const resetConvexMocks = () => {
	mockMutation.mockClear();
	mockQuery.mockClear();
	mockAction.mockClear();
	mockUseQuery.mockClear();
	mockUseMutation.mockClear();
	mockUseAction.mockClear();
};

// Helper to set up specific mock responses
export const setupConvexMock = (
	type: 'query' | 'mutation' | 'action',
	name: string,
	response: any
) => {
	const mock = type === 'query' ? mockQuery : type === 'mutation' ? mockMutation : mockAction;

	mock.mockImplementationOnce(async (fnName: string, args: any) => {
		if (fnName === name) {
			return typeof response === 'function' ? response(args) : response;
		}
		return null;
	});
};

// Helper for testing loading states
export const setupLoadingState = (queryName: string) => {
	mockUseQuery.mockImplementationOnce((name: string) => {
		if (name === queryName) {
			return undefined; // Loading state
		}
		return null;
	});
};

// Helper for testing error states
export const setupErrorState = (
	type: 'query' | 'mutation' | 'action',
	name: string,
	error: Error | string
) => {
	const mock = type === 'query' ? mockQuery : type === 'mutation' ? mockMutation : mockAction;

	mock.mockImplementationOnce(async (fnName: string) => {
		if (fnName === name) {
			throw typeof error === 'string' ? new Error(error) : error;
		}
		return null;
	});
};
