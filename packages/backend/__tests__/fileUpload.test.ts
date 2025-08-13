import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateUploadUrl, saveSubmission, updateSubmission, getFileUrl, deleteSubmission } from '../convex/submissions';
import type { MutationCtx, QueryCtx } from '../convex/_generated/server';
import type { Id } from '../convex/_generated/dataModel';

// Mock the auth module
vi.mock('../convex/auth', () => ({
	requireAuth: vi.fn().mockResolvedValue('user123'),
}));

// Mock the eventStatus module
vi.mock('../convex/eventStatus', () => ({
	computeEventCapabilities: vi.fn().mockReturnValue({
		canAcceptSubmissions: true,
		canEdit: true,
		canPublish: true,
	}),
}));

// Mock the encryption module
vi.mock('../convex/encryption', () => ({
	encryptSensitiveData: vi.fn((data) => `ENC_V2_${btoa(data)}`),
	decryptSensitiveData: vi.fn((data) => {
		if (data.startsWith('ENC_V2_')) {
			return atob(data.slice(7));
		}
		return data;
	}),
	hashData: vi.fn((data) => `hash_${data}`),
}));

// Import the mocked function for use in tests
import { computeEventCapabilities } from '../convex/eventStatus';

// Mock Convex contexts
const createMockMutationCtx = () =>
	({
		storage: {
			generateUploadUrl: vi.fn().mockResolvedValue('https://example.com/upload'),
			get: vi.fn(),
		},
		db: {
			get: vi.fn(),
			insert: vi.fn(),
			patch: vi.fn(),
			delete: vi.fn(),
			query: vi.fn(() => ({
				filter: vi.fn(() => ({
					first: vi.fn(),
					collect: vi.fn(),
				})),
			})),
		},
	}) as unknown as MutationCtx;

const createMockQueryCtx = () =>
	({
		storage: {
			getUrl: vi.fn().mockResolvedValue('https://example.com/file-url'),
			get: vi.fn(),
		},
		db: {
			get: vi.fn(),
			query: vi.fn(() => ({
				filter: vi.fn(() => ({
					first: vi.fn(),
					collect: vi.fn(),
				})),
			})),
		},
	}) as unknown as QueryCtx;

describe('File Upload System', () => {
	let mockMutationCtx: MutationCtx;
	let mockQueryCtx: QueryCtx;

	beforeEach(() => {
		mockMutationCtx = createMockMutationCtx();
		mockQueryCtx = createMockQueryCtx();
		vi.clearAllMocks();

		// Setup environment variables for encryption (required by submissions)
		process.env.CONVEX_ENCRYPTION_KEY = 'test-encryption-key-32-chars!!!!';  // Exactly 32 bytes
		process.env.CONVEX_HASH_SALT = 'test-hash-salt-for-testing';

		// Mock storage.get for file content validation (default behavior)
		vi.mocked(mockMutationCtx.storage.get).mockImplementation(async (storageId) => {
			// Return appropriate magic numbers for known test files
			if (storageId === 'kg2222222222222222') {
				// MP4 file - return MP4 magic number matching our validation
				return new Blob([new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x66, 0x74, 0x79, 0x70])], { type: 'video/mp4' });
			}
			if (storageId === 'kg3333333333333333') {
				// PDF file - return PDF magic number
				return new Blob([new Uint8Array([0x25, 0x50, 0x44, 0x46])], { type: 'application/pdf' });
			}
			// Default: return valid JPEG for any other unmocked storage IDs
			return new Blob([new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0])], { type: 'image/jpeg' });
		});
	});

	describe('generateUploadUrl', () => {
		it('should generate upload URL for valid file types and sizes', async () => {
			const args = {
				fileType: 'image/jpeg',
				fileSize: 1024 * 1024, // 1MB
			};

			const result = await generateUploadUrl._handler(mockMutationCtx, args);

			expect(result).toBeDefined();
			expect(typeof result).toBe('string');
			expect(mockMutationCtx.storage.generateUploadUrl).toHaveBeenCalledOnce();
		});

		it('should reject files exceeding maximum size limit', async () => {
			const args = {
				fileType: 'image/jpeg',
				fileSize: 51 * 1024 * 1024, // 51MB (exceeds 50MB limit)
			};

			await expect(generateUploadUrl._handler(mockMutationCtx, args)).rejects.toThrow(
				'File size 51MB exceeds maximum allowed size of 50MB'
			);

			expect(mockMutationCtx.storage.generateUploadUrl).not.toHaveBeenCalled();
		});

		it('should reject disallowed file types', async () => {
			const args = {
				fileType: 'application/exe',
				fileSize: 1024,
			};

			await expect(generateUploadUrl._handler(mockMutationCtx, args)).rejects.toThrow(
				'File type application/exe is not allowed'
			);

			expect(mockMutationCtx.storage.generateUploadUrl).not.toHaveBeenCalled();
		});

		it('should accept all allowed file types', async () => {
			const allowedTypes = [
				'image/jpeg',
				'image/jpg',
				'image/png',
				'image/gif',
				'image/webp',
				'video/mp4',
				'video/mov',
				'video/avi',
				'video/quicktime',
				'application/pdf',
			];

			for (const fileType of allowedTypes) {
				const args = { fileType, fileSize: 1024 };
				const result = await generateUploadUrl._handler(mockMutationCtx, args);

				expect(result).toBeDefined();
				expect(typeof result).toBe('string');
			}

			expect(mockMutationCtx.storage.generateUploadUrl).toHaveBeenCalledTimes(allowedTypes.length);
		});

		it('should handle edge case file sizes', async () => {
			// Test exactly at the limit
			const maxSize = 50 * 1024 * 1024; // Exactly 50MB
			const args = {
				fileType: 'image/jpeg',
				fileSize: maxSize,
			};

			const result = await generateUploadUrl._handler(mockMutationCtx, args);
			expect(result).toBeDefined();

			// Test just over the limit
			const oversizeArgs = {
				fileType: 'image/jpeg',
				fileSize: maxSize + 1,
			};

			await expect(generateUploadUrl._handler(mockMutationCtx, oversizeArgs)).rejects.toThrow(
				'exceeds maximum allowed size'
			);
		});

		it('should handle zero byte files', async () => {
			const args = {
				fileType: 'image/jpeg',
				fileSize: 0,
			};

			const result = await generateUploadUrl._handler(mockMutationCtx, args);
			expect(result).toBeDefined();
		});
	});

	describe('File Storage in Submissions', () => {
		beforeEach(() => {
			// Mock successful timeslot verification
			vi.mocked(mockMutationCtx.db.get).mockResolvedValueOnce({
				_id: 'timeslot123' as Id<'timeslots'>,
				submissionToken: 'valid-token',
				eventId: 'event123' as Id<'events'>,
			});

			// Mock no existing submission
			vi.mocked(mockMutationCtx.db.query).mockReturnValue({
				filter: vi.fn().mockReturnValue({
					first: vi.fn().mockResolvedValue(null),
				}),
			} as any);

			// Mock successful insertion
			vi.mocked(mockMutationCtx.db.insert).mockResolvedValue('submission123' as Id<'submissions'>);
			vi.mocked(mockMutationCtx.db.patch).mockResolvedValue();
		});

		it('should store file metadata correctly in submissions', async () => {
			const args = {
				eventId: 'event123' as Id<'events'>,
				timeslotId: 'timeslot123' as Id<'timeslots'>,
				submissionToken: 'valid-token',
				promoFiles: [
					{
						fileName: 'test-photo.jpg',
						fileType: 'image/jpeg',
						fileSize: 2048576, // 2MB
						storageId: 'kg1234567890abcdef' as Id<'_storage'>,
					},
				],
				promoDescription: 'Test promo materials',
				guestList: [{ name: 'Guest One', phone: '010-1234-5678' }],
				paymentInfo: {
					accountHolder: 'Test DJ',
					bankName: 'Test Bank',
					accountNumber: 'encrypted_account',
					residentNumber: 'encrypted_resident',
					preferDirectContact: false,
				},
				djContact: {
					email: 'dj@example.com',
					phone: '010-9876-5432',
					preferredContactMethod: 'email' as const,
				},
			};

			const result = await saveSubmission._handler(mockMutationCtx, args);

			expect(result.success).toBe(true);
			expect(result.submissionId).toBeDefined();

			// Verify db.insert was called with correct data structure
			expect(mockMutationCtx.db.insert).toHaveBeenCalledWith('submissions', 
				expect.objectContaining({
					promoMaterials: expect.objectContaining({
						files: expect.arrayContaining([
							expect.objectContaining({
								fileName: 'test-photo.jpg',
								fileType: 'image/jpeg',
								fileSize: 2048576,
								convexFileId: 'kg1234567890abcdef',
								uploadedAt: expect.any(String),
							}),
						]),
						description: 'Test promo materials',
					}),
				})
			);
		});

		it('should handle multiple file uploads in submission', async () => {
			const args = {
				eventId: 'event123' as Id<'events'>,
				timeslotId: 'timeslot123' as Id<'timeslots'>,
				submissionToken: 'valid-token',
				promoFiles: [
					{
						fileName: 'photo1.jpg',
						fileType: 'image/jpeg',
						fileSize: 1024576,
						storageId: 'kg1111111111111111' as Id<'_storage'>,
					},
					{
						fileName: 'video1.mp4',
						fileType: 'video/mp4',
						fileSize: 10485760,
						storageId: 'kg2222222222222222' as Id<'_storage'>,
					},
					{
						fileName: 'promo.pdf',
						fileType: 'application/pdf',
						fileSize: 512000,
						storageId: 'kg3333333333333333' as Id<'_storage'>,
					},
				],
				promoDescription: 'Multiple file test',
				guestList: [],
				paymentInfo: {
					accountHolder: 'Multi File DJ',
					bankName: 'Test Bank',
					accountNumber: 'encrypted_account',
					residentNumber: 'encrypted_resident',
					preferDirectContact: false,
				},
				djContact: {
					email: 'multifile@example.com',
				},
			};

			const result = await saveSubmission._handler(mockMutationCtx, args);

			expect(result.success).toBe(true);

			// Verify all files were included in the submission
			expect(mockMutationCtx.db.insert).toHaveBeenCalledWith('submissions',
				expect.objectContaining({
					promoMaterials: expect.objectContaining({
						files: expect.arrayContaining([
							expect.objectContaining({ fileName: 'photo1.jpg' }),
							expect.objectContaining({ fileName: 'video1.mp4' }),
							expect.objectContaining({ fileName: 'promo.pdf' }),
						]),
					}),
				})
			);
		});

		it('should reject submission with invalid token', async () => {
			// Mock timeslot with different token
			vi.mocked(mockMutationCtx.db.get).mockResolvedValueOnce({
				_id: 'timeslot123' as Id<'timeslots'>,
				submissionToken: 'different-token',
				eventId: 'event123' as Id<'events'>,
			});

			const args = {
				eventId: 'event123' as Id<'events'>,
				timeslotId: 'timeslot123' as Id<'timeslots'>,
				submissionToken: 'invalid-token',
				promoFiles: [],
				promoDescription: 'Test',
				guestList: [],
				paymentInfo: {
					accountHolder: 'Test',
					bankName: 'Test',
					accountNumber: 'test',
					residentNumber: 'test',
					preferDirectContact: false,
				},
				djContact: { email: 'test@example.com' },
			};

			await expect(saveSubmission._handler(mockMutationCtx, args)).rejects.toThrow(
				'Invalid submission token'
			);

			expect(mockMutationCtx.db.insert).not.toHaveBeenCalled();
		});
	});

	describe('File Access Control', () => {
		it('should provide file URLs for authenticated users', async () => {
			const args = {
				storageId: 'kg1234567890abcdef' as Id<'_storage'>,
			};

			const result = await getFileUrl._handler(mockQueryCtx, args);

			expect(result).toBeDefined();
			expect(mockQueryCtx.storage.getUrl).toHaveBeenCalledWith('kg1234567890abcdef');
		});
	});

	describe('File Validation Edge Cases', () => {
		it('should handle malformed file type strings', async () => {
			const emptyTypeArgs = {
				fileType: '',
				fileSize: 1024,
			};

			await expect(generateUploadUrl._handler(mockMutationCtx, emptyTypeArgs)).rejects.toThrow();

			const malformedTypeArgs = {
				fileType: 'invalid/type/format',
				fileSize: 1024,
			};

			await expect(generateUploadUrl._handler(mockMutationCtx, malformedTypeArgs)).rejects.toThrow();
		});

		it('should handle edge case file sizes', async () => {
			const negativeArgs = {
				fileType: 'image/jpeg',
				fileSize: -1,
			};

			// Negative sizes should be rejected by server-side validation
			await expect(generateUploadUrl._handler(mockMutationCtx, negativeArgs)).rejects.toThrow('File size must be a positive number');

			const extremelyLargeArgs = {
				fileType: 'image/jpeg',
				fileSize: Number.MAX_SAFE_INTEGER,
			};

			await expect(generateUploadUrl._handler(mockMutationCtx, extremelyLargeArgs)).rejects.toThrow();
		});
	});

	describe('File Update Operations', () => {
		beforeEach(() => {
			// Mock existing submission
			vi.mocked(mockMutationCtx.db.get).mockImplementation((id) => {
				if (id === 'submission123') {
					return Promise.resolve({
						_id: 'submission123' as Id<'submissions'>,
						uniqueLink: 'valid-token',
						eventId: 'event123' as Id<'events'>,
						timeslotId: 'timeslot123' as Id<'timeslots'>,
						promoMaterials: {
							files: [
								{
									fileName: 'old-file.jpg',
									fileType: 'image/jpeg',
									fileSize: 1024,
									convexFileId: 'kg_old_file' as Id<'_storage'>,
									uploadedAt: '2025-01-01T00:00:00.000Z',
								},
							],
							description: 'Old description',
						},
					});
				}
				if (id === 'event123') {
					return Promise.resolve({
						_id: 'event123' as Id<'events'>,
						organizerId: 'user123',
						name: 'Test Event',
						date: '2025-03-01',
						venue: { name: 'Test Venue', address: '123 Test St' },
						deadlines: {
							guestList: '2025-02-25',
							promoMaterials: '2025-02-28',
						},
						payment: {
							amount: 100000,
							currency: 'KRW',
							dueDate: '2025-03-01',
						},
						status: 'active',
						createdAt: '2025-01-01T00:00:00.000Z',
					});
				}
				return Promise.resolve(null);
			});

			// Mock timeslots query for capabilities check
			vi.mocked(mockMutationCtx.db.query).mockReturnValue({
				filter: vi.fn().mockReturnValue({
					collect: vi.fn().mockResolvedValue([]),
				}),
			} as any);

			vi.mocked(mockMutationCtx.db.patch).mockResolvedValue();
		});

		it('should handle file replacement in submission updates', async () => {
			const args = {
				submissionId: 'submission123' as Id<'submissions'>,
				submissionToken: 'valid-token',
				promoFiles: [
					{
						fileName: 'new-photo.jpg',
						fileType: 'image/jpeg',
						fileSize: 2048576,
						storageId: 'kg_new_file_id' as Id<'_storage'>,
					},
				],
				promoDescription: 'Updated files',
			};

			const result = await updateSubmission._handler(mockMutationCtx, args);

			expect(result.success).toBe(true);

			// Verify the submission was updated with new file metadata
			expect(mockMutationCtx.db.patch).toHaveBeenCalledWith('submission123',
				expect.objectContaining({
					promoMaterials: expect.objectContaining({
						files: expect.arrayContaining([
							expect.objectContaining({
								fileName: 'new-photo.jpg',
								convexFileId: 'kg_new_file_id',
							}),
						]),
						description: 'Updated files',
					}),
					lastUpdatedAt: expect.any(String),
				})
			);
		});

		it('should reject updates with invalid token', async () => {
			const args = {
				submissionId: 'submission123' as Id<'submissions'>,
				submissionToken: 'invalid-token',
				promoDescription: 'Updated description',
			};

			await expect(updateSubmission._handler(mockMutationCtx, args)).rejects.toThrow(
				'Invalid submission token'
			);

			expect(mockMutationCtx.db.patch).not.toHaveBeenCalled();
		});
	});

	describe('File Content Validation', () => {
		beforeEach(() => {
			// Mock successful timeslot verification (copied from File Storage tests)
			vi.mocked(mockMutationCtx.db.get).mockResolvedValueOnce({
				_id: 'timeslot123' as Id<'timeslots'>,
				submissionToken: 'valid-token',
				eventId: 'event123' as Id<'events'>,
			});

			// Mock no existing submission
			vi.mocked(mockMutationCtx.db.query).mockReturnValue({
				filter: vi.fn().mockReturnValue({
					first: vi.fn().mockResolvedValue(null),
				}),
			} as any);

			// Mock successful insertion
			vi.mocked(mockMutationCtx.db.insert).mockResolvedValue('submission123' as Id<'submissions'>);
			vi.mocked(mockMutationCtx.db.patch).mockResolvedValue();

			// Mock file content retrieval
			vi.mocked(mockMutationCtx.storage.get).mockImplementation(async (storageId) => {
				// Mock different file types based on storageId
				if (storageId === 'valid-jpeg-file' as Id<'_storage'>) {
					// JPEG magic number: FF D8 FF
					return new Blob([new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0])], { type: 'image/jpeg' });
				}
				if (storageId === 'fake-jpeg-file' as Id<'_storage'>) {
					// Fake JPEG (exe file with jpeg extension): MZ header
					return new Blob([new Uint8Array([0x4D, 0x5A, 0x90, 0x00])], { type: 'image/jpeg' });
				}
				if (storageId === 'valid-png-file' as Id<'_storage'>) {
					// PNG magic number: 89 50 4E 47
					return new Blob([new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])], { type: 'image/png' });
				}
				return null;
			});
		});

		it('should accept files with valid magic numbers', async () => {
			const args = {
				eventId: 'event123' as Id<'events'>,
				timeslotId: 'timeslot123' as Id<'timeslots'>,
				submissionToken: 'valid-token',
				promoFiles: [
					{
						fileName: 'valid.jpg',
						fileType: 'image/jpeg',
						fileSize: 1024,
						storageId: 'valid-jpeg-file' as Id<'_storage'>,
					},
				],
				promoDescription: 'Valid file upload',
				guestList: [],
				paymentInfo: {
					accountHolder: 'Test DJ',
					bankName: 'Test Bank',
					accountNumber: '1234567890',
					residentNumber: '1234567890123',
					preferDirectContact: false,
				},
				djContact: {
					email: 'test@example.com',
					phone: '010-1234-5678',
					preferredContactMethod: 'email' as const,
				},
			};

			const result = await saveSubmission._handler(mockMutationCtx, args);
			expect(result).toBeDefined();
			expect(mockMutationCtx.db.insert).toHaveBeenCalled();
		});

		it('should reject files with invalid magic numbers (spoofed file types)', async () => {
			const args = {
				eventId: 'event123' as Id<'events'>,
				timeslotId: 'timeslot123' as Id<'timeslots'>,
				submissionToken: 'valid-token',
				promoFiles: [
					{
						fileName: 'fake.jpg',
						fileType: 'image/jpeg',
						fileSize: 1024,
						storageId: 'fake-jpeg-file' as Id<'_storage'>,
					},
				],
				promoDescription: 'Fake file upload',
				guestList: [],
				paymentInfo: {
					accountHolder: 'Test DJ',
					bankName: 'Test Bank',
					accountNumber: '1234567890',
					residentNumber: '1234567890123',
					preferDirectContact: false,
				},
				djContact: {
					email: 'test@example.com',
					phone: '010-1234-5678',
					preferredContactMethod: 'email' as const,
				},
			};

			await expect(saveSubmission._handler(mockMutationCtx, args)).rejects.toThrow(
				'File content does not match declared MIME type'
			);
		});

		it('should handle multiple files with mixed validation results', async () => {
			const args = {
				eventId: 'event123' as Id<'events'>,
				timeslotId: 'timeslot123' as Id<'timeslots'>,
				submissionToken: 'valid-token',
				promoFiles: [
					{
						fileName: 'valid.jpg',
						fileType: 'image/jpeg',
						fileSize: 1024,
						storageId: 'valid-jpeg-file' as Id<'_storage'>,
					},
					{
						fileName: 'fake.jpg',
						fileType: 'image/jpeg',
						fileSize: 1024,
						storageId: 'fake-jpeg-file' as Id<'_storage'>,
					},
				],
				promoDescription: 'Mixed files',
				guestList: [],
				paymentInfo: {
					accountHolder: 'Test DJ',
					bankName: 'Test Bank',
					accountNumber: '1234567890',
					residentNumber: '1234567890123',
					preferDirectContact: false,
				},
				djContact: {
					email: 'test@example.com',
					phone: '010-1234-5678',
					preferredContactMethod: 'email' as const,
				},
			};

			await expect(saveSubmission._handler(mockMutationCtx, args)).rejects.toThrow(
				'File content does not match declared MIME type'
			);
		});
	});

	describe('Delete Submission', () => {
		beforeEach(() => {
			// Mock existing submission
			vi.mocked(mockMutationCtx.db.get).mockImplementation((id) => {
				if (id === 'submission123' as Id<'submissions'>) {
					return Promise.resolve({
						_id: 'submission123' as Id<'submissions'>,
						eventId: 'event123' as Id<'events'>,
						timeslotId: 'timeslot123' as Id<'timeslots'>,
						uniqueLink: 'valid-token',
						promoMaterials: {
							files: [
								{
									fileName: 'test.jpg',
									fileType: 'image/jpeg',
									fileSize: 1024,
									convexFileId: 'kg_test_file' as Id<'_storage'>,
									uploadedAt: '2025-01-01T00:00:00.000Z',
								},
							],
							description: 'Test promo',
						},
						guestList: [],
						paymentInfo: {
							accountHolder: 'Test DJ',
							bankName: 'Test Bank',
							accountNumber: 'encrypted_account',
							residentNumber: 'encrypted_resident',
							accountNumberHash: 'hash_account',
							residentNumberHash: 'hash_resident',
							preferDirectContact: false,
						},
						djContact: {
							email: 'test@example.com',
							phone: '010-1234-5678',
							preferredContactMethod: 'email' as const,
						},
						lastUpdatedAt: '2025-01-01T00:00:00.000Z',
					});
				}
				if (id === 'event123' as Id<'events'>) {
					return Promise.resolve({
						_id: 'event123' as Id<'events'>,
						title: 'Test Event',
						deadlines: {
							submission: '2025-12-31T23:59:59.000Z',
							editing: '2025-12-31T23:59:59.000Z',
						},
					});
				}
				if (id === 'timeslot123' as Id<'timeslots'>) {
					return Promise.resolve({
						_id: 'timeslot123' as Id<'timeslots'>,
						eventId: 'event123' as Id<'events'>,
						submissionId: 'submission123' as Id<'submissions'>,
						submissionToken: 'valid-token',
					});
				}
				return Promise.resolve(null);
			});

			// Mock query for timeslots and submissions (for event capabilities)
			vi.mocked(mockMutationCtx.db.query).mockReturnValue({
				filter: vi.fn().mockReturnValue({
					collect: vi.fn().mockResolvedValue([]),
					first: vi.fn().mockResolvedValue(null),
				}),
			} as any);

			// Mock successful deletion operations
			vi.mocked(mockMutationCtx.db.delete).mockResolvedValue();
			vi.mocked(mockMutationCtx.db.patch).mockResolvedValue();

			// Reset computeEventCapabilities to default (allow submissions)
			vi.mocked(computeEventCapabilities).mockReturnValue({
				canAcceptSubmissions: true,
				canEdit: true,
				canViewEvents: true,
				canPublish: true,
			});
		});

		it('should successfully delete a submission with valid token', async () => {
			const args = {
				submissionId: 'submission123' as Id<'submissions'>,
				submissionToken: 'valid-token',
			};

			const result = await deleteSubmission._handler(mockMutationCtx, args);

			expect(result.success).toBe(true);
			expect(mockMutationCtx.db.delete).toHaveBeenCalledWith('submission123');
			expect(mockMutationCtx.db.patch).toHaveBeenCalledWith('timeslot123', {
				submissionId: undefined,
			});
		});

		it('should throw error if submission does not exist', async () => {
			vi.mocked(mockMutationCtx.db.get).mockImplementation((id) => {
				if (id === 'nonexistent' as Id<'submissions'>) {
					return Promise.resolve(null);
				}
				// Return other mocks as normal
				return Promise.resolve({} as any);
			});

			const args = {
				submissionId: 'nonexistent' as Id<'submissions'>,
				submissionToken: 'any-token',
			};

			await expect(deleteSubmission._handler(mockMutationCtx, args)).rejects.toThrow(
				'Submission not found'
			);

			expect(mockMutationCtx.db.delete).not.toHaveBeenCalled();
		});

		it('should throw error if submission token is invalid', async () => {
			const args = {
				submissionId: 'submission123' as Id<'submissions'>,
				submissionToken: 'invalid-token',
			};

			await expect(deleteSubmission._handler(mockMutationCtx, args)).rejects.toThrow(
				'Invalid submission token'
			);

			expect(mockMutationCtx.db.delete).not.toHaveBeenCalled();
		});

		it('should throw error if event does not exist', async () => {
			vi.mocked(mockMutationCtx.db.get).mockImplementation((id) => {
				if (id === 'submission123' as Id<'submissions'>) {
					return Promise.resolve({
						_id: 'submission123' as Id<'submissions'>,
						eventId: 'nonexistent-event' as Id<'events'>,
						timeslotId: 'timeslot123' as Id<'timeslots'>,
						uniqueLink: 'valid-token',
					} as any);
				}
				if (id === 'nonexistent-event' as Id<'events'>) {
					return Promise.resolve(null);
				}
				return Promise.resolve({} as any);
			});

			const args = {
				submissionId: 'submission123' as Id<'submissions'>,
				submissionToken: 'valid-token',
			};

			await expect(deleteSubmission._handler(mockMutationCtx, args)).rejects.toThrow(
				'Event not found'
			);

			expect(mockMutationCtx.db.delete).not.toHaveBeenCalled();
		});

		it('should throw error if event capabilities do not allow submissions deletion', async () => {
			// Mock computeEventCapabilities to return false for canAcceptSubmissions
			vi.mocked(computeEventCapabilities).mockReturnValue({
				canAcceptSubmissions: false,
				canViewEvents: true,
				canPublish: false,
			});

			const args = {
				submissionId: 'submission123' as Id<'submissions'>,
				submissionToken: 'valid-token',
			};

			await expect(deleteSubmission._handler(mockMutationCtx, args)).rejects.toThrow(
				'Submissions can no longer be deleted for this event'
			);

			expect(mockMutationCtx.db.delete).not.toHaveBeenCalled();
		});

		it('should handle case where timeslot does not exist', async () => {
			vi.mocked(mockMutationCtx.db.get).mockImplementation((id) => {
				if (id === 'submission123' as Id<'submissions'>) {
					return Promise.resolve({
						_id: 'submission123' as Id<'submissions'>,
						eventId: 'event123' as Id<'events'>,
						timeslotId: 'nonexistent-timeslot' as Id<'timeslots'>,
						uniqueLink: 'valid-token',
					} as any);
				}
				if (id === 'event123' as Id<'events'>) {
					return Promise.resolve({
						_id: 'event123' as Id<'events'>,
						deadlines: {
							submission: '2025-12-31T23:59:59.000Z',
							editing: '2025-12-31T23:59:59.000Z',
						},
					} as any);
				}
				if (id === 'nonexistent-timeslot' as Id<'timeslots'>) {
					return Promise.resolve(null);
				}
				return Promise.resolve({} as any);
			});

			const args = {
				submissionId: 'submission123' as Id<'submissions'>,
				submissionToken: 'valid-token',
			};

			const result = await deleteSubmission._handler(mockMutationCtx, args);

			expect(result.success).toBe(true);
			expect(mockMutationCtx.db.delete).toHaveBeenCalledWith('submission123');
			// Should not try to patch a non-existent timeslot
			expect(mockMutationCtx.db.patch).not.toHaveBeenCalled();
		});

		it('should handle case where timeslot exists but has different submission ID', async () => {
			vi.mocked(mockMutationCtx.db.get).mockImplementation((id) => {
				if (id === 'submission123' as Id<'submissions'>) {
					return Promise.resolve({
						_id: 'submission123' as Id<'submissions'>,
						eventId: 'event123' as Id<'events'>,
						timeslotId: 'timeslot123' as Id<'timeslots'>,
						uniqueLink: 'valid-token',
					} as any);
				}
				if (id === 'event123' as Id<'events'>) {
					return Promise.resolve({
						_id: 'event123' as Id<'events'>,
						deadlines: {
							submission: '2025-12-31T23:59:59.000Z',
							editing: '2025-12-31T23:59:59.000Z',
						},
					} as any);
				}
				if (id === 'timeslot123' as Id<'timeslots'>) {
					return Promise.resolve({
						_id: 'timeslot123' as Id<'timeslots'>,
						eventId: 'event123' as Id<'events'>,
						submissionId: 'different-submission' as Id<'submissions'>,
						submissionToken: 'valid-token',
					} as any);
				}
				return Promise.resolve({} as any);
			});

			const args = {
				submissionId: 'submission123' as Id<'submissions'>,
				submissionToken: 'valid-token',
			};

			const result = await deleteSubmission._handler(mockMutationCtx, args);

			expect(result.success).toBe(true);
			expect(mockMutationCtx.db.delete).toHaveBeenCalledWith('submission123');
			// Should not patch timeslot since it references a different submission
			expect(mockMutationCtx.db.patch).not.toHaveBeenCalled();
		});
	});
});