import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateUploadUrl, saveSubmission } from '../convex/submissions';
import type { MutationCtx } from '../convex/_generated/server';
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

// Mock Convex context
const createMockMutationCtx = () =>
	({
		storage: {
			generateUploadUrl: vi.fn(),
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

describe('File Upload Integration Tests', () => {
	let mockMutationCtx: MutationCtx;

	beforeEach(() => {
		mockMutationCtx = createMockMutationCtx();
		vi.clearAllMocks();

		// Setup environment variables for encryption
		process.env.CONVEX_ENCRYPTION_KEY = 'test-encryption-key-32-chars!!!!';
		process.env.CONVEX_HASH_SALT = 'test-hash-salt-for-testing';

		// Mock storage.generateUploadUrl
		vi.mocked(mockMutationCtx.storage.generateUploadUrl).mockResolvedValue(
			'https://upload-url.com'
		);

		// Mock storage.get for file validation
		vi.mocked(mockMutationCtx.storage.get).mockImplementation(async (storageId) => {
			// Return valid magic numbers based on the file type
			if (storageId === 'valid-jpeg-file' as Id<'_storage'>) {
				return new Blob([new Uint8Array([0xff, 0xd8, 0xff, 0xe0])], {
					type: 'image/jpeg',
				});
			}
			if (storageId === 'valid-png-file' as Id<'_storage'>) {
				return new Blob([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], {
					type: 'image/png',
				});
			}
			if (storageId === 'valid-mp4-file' as Id<'_storage'>) {
				return new Blob([new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x66, 0x74, 0x79, 0x70])], {
					type: 'video/mp4',
				});
			}
			// Default: return null for invalid files
			return null;
		});

		// Mock timeslot verification
		vi.mocked(mockMutationCtx.db.get).mockImplementation((id) => {
			if ((id as string).startsWith('timeslot')) {
				return Promise.resolve({
					_id: 'timeslot123' as Id<'timeslots'>,
					submissionToken: 'valid-token',
					eventId: 'event123' as Id<'events'>,
				});
			}
			return Promise.resolve(null);
		});

		// Mock no existing submission
		vi.mocked(mockMutationCtx.db.query).mockReturnValue({
			filter: vi.fn().mockReturnValue({
				first: vi.fn().mockResolvedValue(null),
			}),
		} as any);

		// Mock successful insertion
		vi.mocked(mockMutationCtx.db.insert).mockResolvedValue('submission123' as Id<'submissions'>);
	});

	describe('File Type and Size Validation Integration', () => {
		const validFileTypes = [
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

		it('should accept all supported file types for upload URL generation', async () => {
			for (const fileType of validFileTypes) {
				const args = {
					fileType,
					fileSize: 1024 * 1024, // 1MB
				};

				const result = await generateUploadUrl._handler(mockMutationCtx, args);

				expect(result).toBeDefined();
				expect(typeof result).toBe('string');
				expect(mockMutationCtx.storage.generateUploadUrl).toHaveBeenCalled();
			}
		});

		it('should reject unsupported file types', async () => {
			const unsupportedTypes = [
				'application/exe',
				'text/javascript',
				'application/x-sh',
				'text/html',
				'application/zip',
			];

			for (const fileType of unsupportedTypes) {
				const args = {
					fileType,
					fileSize: 1024,
				};

				await expect(generateUploadUrl._handler(mockMutationCtx, args)).rejects.toThrow(
					`File type ${fileType} is not allowed`
				);
			}
		});

		it('should enforce file size limits', async () => {
			const maxSize = 50 * 1024 * 1024; // 50MB

			// Test exactly at the limit (should pass)
			const validArgs = {
				fileType: 'image/jpeg',
				fileSize: maxSize,
			};

			const result = await generateUploadUrl._handler(mockMutationCtx, validArgs);
			expect(result).toBeDefined();

			// Test over the limit (should fail)
			const oversizeArgs = {
				fileType: 'image/jpeg',
				fileSize: maxSize + 1,
			};

			await expect(generateUploadUrl._handler(mockMutationCtx, oversizeArgs)).rejects.toThrow(
				'exceeds maximum allowed size'
			);
		});

		it('should validate negative file sizes', async () => {
			const args = {
				fileType: 'image/jpeg',
				fileSize: -1,
			};

			await expect(generateUploadUrl._handler(mockMutationCtx, args)).rejects.toThrow(
				'File size must be a positive number'
			);
		});
	});

	describe('End-to-End File Upload Integration', () => {
		it('should successfully process submission with multiple valid files', async () => {
			const submissionArgs = {
				eventId: 'event123' as Id<'events'>,
				timeslotId: 'timeslot123' as Id<'timeslots'>,
				submissionToken: 'valid-token',
				promoFiles: [
					{
						fileName: 'promo-image.jpg',
						fileType: 'image/jpeg',
						fileSize: 2 * 1024 * 1024, // 2MB
						storageId: 'valid-jpeg-file' as Id<'_storage'>,
					},
					{
						fileName: 'promo-video.mp4',
						fileType: 'video/mp4',
						fileSize: 10 * 1024 * 1024, // 10MB
						storageId: 'valid-mp4-file' as Id<'_storage'>,
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

			const result = await saveSubmission._handler(mockMutationCtx, submissionArgs);

			expect(result.success).toBe(true);
			expect(result.submissionId).toBeDefined();

			// Verify files were stored correctly
			expect(mockMutationCtx.db.insert).toHaveBeenCalledWith(
				'submissions',
				expect.objectContaining({
					promoMaterials: expect.objectContaining({
						files: expect.arrayContaining([
							expect.objectContaining({
								fileName: 'promo-image.jpg',
								fileType: 'image/jpeg',
								fileSize: 2 * 1024 * 1024,
								convexFileId: 'valid-jpeg-file',
								uploadedAt: expect.any(String),
							}),
							expect.objectContaining({
								fileName: 'promo-video.mp4',
								fileType: 'video/mp4',
								fileSize: 10 * 1024 * 1024,
								convexFileId: 'valid-mp4-file',
								uploadedAt: expect.any(String),
							}),
						]),
						description: 'Test promo materials',
					}),
				})
			);
		});

		it('should handle submission with no files', async () => {
			const submissionArgs = {
				eventId: 'event123' as Id<'events'>,
				timeslotId: 'timeslot123' as Id<'timeslots'>,
				submissionToken: 'valid-token',
				promoFiles: [], // No files
				promoDescription: 'No files uploaded',
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

			const result = await saveSubmission._handler(mockMutationCtx, submissionArgs);

			expect(result.success).toBe(true);
			expect(result.submissionId).toBeDefined();

			// Verify submission was created with empty files array
			expect(mockMutationCtx.db.insert).toHaveBeenCalledWith(
				'submissions',
				expect.objectContaining({
					promoMaterials: expect.objectContaining({
						files: [],
						description: 'No files uploaded',
					}),
				})
			);
		});

		it('should validate file content integrity with magic numbers', async () => {
			// Mock storage.get to return mismatched content
			vi.mocked(mockMutationCtx.storage.get).mockImplementation(async (storageId) => {
				if (storageId === 'fake-jpeg-file' as Id<'_storage'>) {
					// Return executable magic number instead of JPEG
					return new Blob([new Uint8Array([0x4d, 0x5a, 0x90, 0x00])], {
						type: 'image/jpeg',
					});
				}
				return null;
			});

			const submissionArgs = {
				eventId: 'event123' as Id<'events'>,
				timeslotId: 'timeslot123' as Id<'timeslots'>,
				submissionToken: 'valid-token',
				promoFiles: [
					{
						fileName: 'fake-image.jpg',
						fileType: 'image/jpeg',
						fileSize: 1024,
						storageId: 'fake-jpeg-file' as Id<'_storage'>,
					},
				],
				promoDescription: 'Test fake file',
				guestList: [],
				paymentInfo: {
					accountHolder: 'Test DJ',
					bankName: 'Test Bank',
					accountNumber: 'encrypted_account',
					residentNumber: 'encrypted_resident',
					preferDirectContact: false,
				},
				djContact: {
					email: 'dj@example.com',
				},
			};

			await expect(saveSubmission._handler(mockMutationCtx, submissionArgs)).rejects.toThrow(
				'File content does not match declared MIME type'
			);

			expect(mockMutationCtx.db.insert).not.toHaveBeenCalled();
		});
	});

	describe('File Size Edge Cases', () => {
		it('should handle maximum file size edge cases correctly', async () => {
			const maxSize = 50 * 1024 * 1024; // 50MB

			// Test different size scenarios
			const testCases = [
				{ size: 0, shouldPass: true, description: 'zero bytes' },
				{ size: 1, shouldPass: true, description: 'one byte' },
				{ size: maxSize - 1, shouldPass: true, description: 'just under limit' },
				{ size: maxSize, shouldPass: true, description: 'exactly at limit' },
				{ size: maxSize + 1, shouldPass: false, description: 'just over limit' },
				{ size: Number.MAX_SAFE_INTEGER, shouldPass: false, description: 'extremely large' },
			];

			for (const testCase of testCases) {
				const args = {
					fileType: 'image/jpeg',
					fileSize: testCase.size,
				};

				if (testCase.shouldPass) {
					const result = await generateUploadUrl._handler(mockMutationCtx, args);
					expect(result).toBeDefined();
				} else {
					await expect(generateUploadUrl._handler(mockMutationCtx, args)).rejects.toThrow();
				}
			}
		});

		it('should properly format file size error messages', async () => {
			const testCases = [
				{ size: 51 * 1024 * 1024, expectedMessage: '51MB exceeds maximum allowed size of 50MB' },
				{ size: 100 * 1024 * 1024, expectedMessage: '100MB exceeds maximum allowed size of 50MB' },
			];

			for (const testCase of testCases) {
				const args = {
					fileType: 'image/jpeg',
					fileSize: testCase.size,
				};

				await expect(generateUploadUrl._handler(mockMutationCtx, args)).rejects.toThrow(
					testCase.expectedMessage
				);
			}
		});
	});

	describe('File Type Validation Edge Cases', () => {
		it('should enforce case-sensitive file type validation for security', async () => {
			const invalidCaseTypes = [
				'IMAGE/JPEG',
				'Image/Jpeg',
				'image/JPEG', 
				'APPLICATION/PDF',
				'Video/MP4',
			];

			for (const fileType of invalidCaseTypes) {
				const args = {
					fileType,
					fileSize: 1024,
				};

				// Should reject invalid case variations for security
				await expect(generateUploadUrl._handler(mockMutationCtx, args)).rejects.toThrow(
					`File type ${fileType} is not allowed`
				);
			}

			// Test that correct lowercase types still work
			const validTypes = ['image/jpeg', 'application/pdf', 'video/mp4'];
			
			for (const fileType of validTypes) {
				const args = {
					fileType,
					fileSize: 1024,
				};

				const result = await generateUploadUrl._handler(mockMutationCtx, args);
				expect(result).toBeDefined();
			}
		});

		it('should reject malformed MIME types', async () => {
			const malformedTypes = [
				'',
				'invalidtype',
				'image/',
				'/jpeg',
				'image//jpeg',
				'image/jpeg/extra',
				'text/plain; charset=utf-8', // With parameters
			];

			for (const fileType of malformedTypes) {
				const args = {
					fileType,
					fileSize: 1024,
				};

				await expect(generateUploadUrl._handler(mockMutationCtx, args)).rejects.toThrow();
			}
		});
	});
});