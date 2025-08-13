import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveSubmission, updateSubmission, getSubmissionByToken } from '../convex/submissions';
import { encryptSensitiveData, decryptSensitiveData, hashData } from '../convex/encryption';
import type { MutationCtx, QueryCtx } from '../convex/_generated/server';
import type { Id } from '../convex/_generated/dataModel';

// Mock encryption functions
vi.mock('../convex/encryption', () => ({
  encryptSensitiveData: vi.fn((data: string) => `encrypted_${data}`),
  decryptSensitiveData: vi.fn((encrypted: string) => encrypted.replace('encrypted_', '')),
  hashData: vi.fn((data: string) => `hash_${data}`),
}));

const createMockMutationCtx = () => ({
  storage: {
    generateUploadUrl: vi.fn(),
    get: vi.fn(),
  },
  db: {
    get: vi.fn(),
    insert: vi.fn(),
    patch: vi.fn(),
    query: vi.fn(() => ({
      filter: vi.fn(() => ({
        first: vi.fn(),
        collect: vi.fn(),
      })),
    })),
  },
}) as unknown as MutationCtx;

const createMockQueryCtx = () => ({
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

describe('Encrypted Submissions', () => {
  let mockMutationCtx: MutationCtx;
  let mockQueryCtx: QueryCtx;

  const mockTimeslotId = 'timeslot_123' as Id<'timeslots'>;
  const mockEventId = 'event_123' as Id<'events'>;
  const mockStorageId = 'storage_123' as Id<'_storage'>;
  const mockSubmissionId = 'submission_123' as Id<'submissions'>;

  beforeEach(() => {
    mockMutationCtx = createMockMutationCtx();
    mockQueryCtx = createMockQueryCtx();
    vi.clearAllMocks();

    // Setup environment variables for encryption
    process.env.CONVEX_ENCRYPTION_KEY = 'test-encryption-key-32-chars!!!!';  // Exactly 32 bytes
    process.env.CONVEX_HASH_SALT = 'test-hash-salt-for-testing';

    // Reset mocked functions to their default implementations
    vi.mocked(encryptSensitiveData).mockImplementation((data: string) => `encrypted_${data}`);
    vi.mocked(decryptSensitiveData).mockImplementation((encrypted: string) => encrypted.replace('encrypted_', ''));
    vi.mocked(hashData).mockImplementation((data: string) => `hash_${data}`);

    // Mock storage.get for file content validation
    vi.mocked(mockMutationCtx.storage.get).mockImplementation(async () => {
      // Return valid JPEG content for file validation
      return new Blob([new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0])], { type: 'image/jpeg' });
    });
  });

  describe('saveSubmission with encryption', () => {
    it('should encrypt sensitive payment data when creating submission', async () => {
      const submissionToken = 'valid-token-123';

      // Mock timeslot validation
      const mockTimeslot = {
        _id: mockTimeslotId,
        submissionToken,
        eventId: mockEventId,
      };
      vi.mocked(mockMutationCtx.db.get).mockResolvedValue(mockTimeslot);

      // Mock no existing submission
      vi.mocked(mockMutationCtx.db.query).mockReturnValue({
        filter: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(null),
          collect: vi.fn(),
        }),
      } as any);

      // Mock successful insertion
      vi.mocked(mockMutationCtx.db.insert).mockResolvedValue(mockSubmissionId);
      vi.mocked(mockMutationCtx.db.patch).mockResolvedValue(undefined);

      const args = {
        eventId: mockEventId,
        timeslotId: mockTimeslotId,
        submissionToken,
        promoFiles: [
          {
            fileName: 'promo.jpg',
            fileType: 'image/jpeg',
            fileSize: 1024,
            storageId: mockStorageId,
          },
        ],
        promoDescription: 'DJ promo material',
        guestList: [{ name: 'Guest 1', phone: '010-1234-5678' }],
        paymentInfo: {
          accountHolder: '김철수',
          bankName: '국민은행',
          accountNumber: '123-456-789-000',
          residentNumber: '123456-1234567',
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
      expect(result.submissionId).toBe(mockSubmissionId);

      // Verify encryption functions were called for sensitive data
      expect(encryptSensitiveData).toHaveBeenCalledWith('123-456-789-000');
      expect(encryptSensitiveData).toHaveBeenCalledWith('123456-1234567');
      expect(hashData).toHaveBeenCalledWith('123-456-789-000');
      expect(hashData).toHaveBeenCalledWith('123456-1234567');

      // Verify the submission data contains encrypted values
      const insertCall = vi.mocked(mockMutationCtx.db.insert).mock.calls[0];
      expect(insertCall[0]).toBe('submissions');
      const submissionData = insertCall[1];
      
      expect(submissionData.paymentInfo.accountNumber).toBe('encrypted_123-456-789-000');
      expect(submissionData.paymentInfo.residentNumber).toBe('encrypted_123456-1234567');
      expect(submissionData.paymentInfo.accountNumberHash).toBe('hash_123-456-789-000');
      expect(submissionData.paymentInfo.residentNumberHash).toBe('hash_123456-1234567');
      
      // Non-sensitive data should not be encrypted
      expect(submissionData.paymentInfo.accountHolder).toBe('김철수');
      expect(submissionData.paymentInfo.bankName).toBe('국민은행');
    });

    it('should handle empty sensitive data during encryption', async () => {
      const submissionToken = 'valid-token-123';

      const mockTimeslot = {
        _id: mockTimeslotId,
        submissionToken,
        eventId: mockEventId,
      };
      vi.mocked(mockMutationCtx.db.get).mockResolvedValue(mockTimeslot);

      vi.mocked(mockMutationCtx.db.query).mockReturnValue({
        filter: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(null),
          collect: vi.fn(),
        }),
      } as any);

      vi.mocked(mockMutationCtx.db.insert).mockResolvedValue(mockSubmissionId);
      vi.mocked(mockMutationCtx.db.patch).mockResolvedValue(undefined);

      const args = {
        eventId: mockEventId,
        timeslotId: mockTimeslotId,
        submissionToken,
        promoFiles: [],
        promoDescription: '',
        guestList: [],
        paymentInfo: {
          accountHolder: '김철수',
          bankName: '국민은행',
          accountNumber: '', // Empty account number
          residentNumber: '', // Empty resident number
          preferDirectContact: false,
        },
        djContact: {
          email: 'dj@example.com',
        },
      };

      const result = await saveSubmission._handler(mockMutationCtx, args);

      expect(result.success).toBe(true);
      expect(encryptSensitiveData).toHaveBeenCalledWith('');
      expect(hashData).toHaveBeenCalledWith('');
    });
  });

  describe('updateSubmission with encryption', () => {
    it('should encrypt sensitive payment data when updating submission', async () => {
      const submissionToken = 'valid-token-123';
      const mockSubmission = {
        _id: mockSubmissionId,
        uniqueLink: submissionToken,
        eventId: mockEventId,
        timeslotId: mockTimeslotId,
        paymentInfo: {
          accountHolder: '김철수',
          bankName: '국민은행',
          accountNumber: 'encrypted_old-account',
          residentNumber: 'encrypted_old-resident',
          accountNumberHash: 'hash_old-account',
          residentNumberHash: 'hash_old-resident',
        },
        promoMaterials: {
          files: [],
          description: 'old description',
        },
      };

      const mockEvent = {
        _id: mockEventId,
        date: new Date(Date.now() + 86400000).toISOString(), // Future event
        deadlines: {
          promoMaterials: new Date(Date.now() + 43200000).toISOString(), // 12 hours from now
          guestList: new Date(Date.now() + 21600000).toISOString(), // 6 hours from now
        },
        phase: 'planning',
      };

      // Mock successful lookups
      vi.mocked(mockMutationCtx.db.get)
        .mockResolvedValueOnce(mockSubmission)
        .mockResolvedValueOnce(mockEvent);

      // Mock timeslots and submissions queries for capability check
      vi.mocked(mockMutationCtx.db.query).mockReturnValue({
        filter: vi.fn().mockReturnValue({
          collect: vi.fn().mockResolvedValue([]),
        }),
      } as any);

      vi.mocked(mockMutationCtx.db.patch).mockResolvedValue(undefined);

      const args = {
        submissionId: mockSubmissionId,
        submissionToken,
        paymentInfo: {
          accountHolder: '이영희',
          bankName: '신한은행',
          accountNumber: '987-654-321-000',
          residentNumber: '654321-7654321',
          preferDirectContact: true,
        },
      };

      const result = await updateSubmission._handler(mockMutationCtx, args);

      expect(result.success).toBe(true);

      // Verify encryption functions were called for new sensitive data
      expect(encryptSensitiveData).toHaveBeenCalledWith('987-654-321-000');
      expect(encryptSensitiveData).toHaveBeenCalledWith('654321-7654321');
      expect(hashData).toHaveBeenCalledWith('987-654-321-000');
      expect(hashData).toHaveBeenCalledWith('654321-7654321');

      // Verify the patch data contains encrypted values
      const patchCall = vi.mocked(mockMutationCtx.db.patch).mock.calls[0];
      expect(patchCall[0]).toBe(mockSubmissionId);
      const updateData = patchCall[1];
      
      expect(updateData.paymentInfo.accountNumber).toBe('encrypted_987-654-321-000');
      expect(updateData.paymentInfo.residentNumber).toBe('encrypted_654321-7654321');
      expect(updateData.paymentInfo.accountNumberHash).toBe('hash_987-654-321-000');
      expect(updateData.paymentInfo.residentNumberHash).toBe('hash_654321-7654321');
    });
  });

  describe('getSubmissionByToken with decryption', () => {
    it('should decrypt sensitive payment data when retrieving submission', async () => {
      const submissionToken = 'valid-token-123';
      const mockSubmission = {
        _id: mockSubmissionId,
        uniqueLink: submissionToken,
        eventId: mockEventId,
        timeslotId: mockTimeslotId,
        paymentInfo: {
          accountHolder: '김철수',
          bankName: '국민은행',
          accountNumber: 'encrypted_123-456-789-000',
          residentNumber: 'encrypted_123456-1234567',
          accountNumberHash: 'hash_123-456-789-000',
          residentNumberHash: 'hash_123456-1234567',
          preferDirectContact: false,
        },
        promoMaterials: {
          files: [],
          description: 'promo description',
        },
        guestList: [],
        djContact: {
          email: 'dj@example.com',
        },
      };

      const mockTimeslot = {
        _id: mockTimeslotId,
        djName: 'DJ Test',
      };

      const mockEvent = {
        _id: mockEventId,
        title: 'Test Event',
      };

      // Mock database queries
      vi.mocked(mockQueryCtx.db.query).mockReturnValue({
        filter: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(mockSubmission),
        }),
      } as any);

      vi.mocked(mockQueryCtx.db.get)
        .mockResolvedValueOnce(mockTimeslot)
        .mockResolvedValueOnce(mockEvent);

      const result = await getSubmissionByToken._handler(mockQueryCtx, {
        submissionToken,
      });

      expect(result).toBeDefined();
      expect(result?.paymentInfo).toBeDefined();

      // Verify decryption functions were called
      expect(decryptSensitiveData).toHaveBeenCalledWith('encrypted_123-456-789-000');
      expect(decryptSensitiveData).toHaveBeenCalledWith('encrypted_123456-1234567');

      // Verify the returned data contains decrypted values
      expect(result?.paymentInfo.accountNumber).toBe('123-456-789-000');
      expect(result?.paymentInfo.residentNumber).toBe('123456-1234567');
      
      // Non-sensitive data should remain unchanged
      expect(result?.paymentInfo.accountHolder).toBe('김철수');
      expect(result?.paymentInfo.bankName).toBe('국민은행');
      
      // Hash fields should be removed from response (internal only)
      expect(result?.paymentInfo.accountNumberHash).toBeUndefined();
      expect(result?.paymentInfo.residentNumberHash).toBeUndefined();
    });

    it('should return null for non-existent submission token', async () => {
      vi.mocked(mockQueryCtx.db.query).mockReturnValue({
        filter: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(null),
        }),
      } as any);

      const result = await getSubmissionByToken._handler(mockQueryCtx, {
        submissionToken: 'non-existent-token',
      });

      expect(result).toBeNull();
      expect(decryptSensitiveData).not.toHaveBeenCalled();
    });
  });

  describe('Error handling with encryption', () => {
    it('should handle encryption errors gracefully', async () => {
      const submissionToken = 'valid-token-123';

      const mockTimeslot = {
        _id: mockTimeslotId,
        submissionToken,
        eventId: mockEventId,
      };
      vi.mocked(mockMutationCtx.db.get).mockResolvedValue(mockTimeslot);

      vi.mocked(mockMutationCtx.db.query).mockReturnValue({
        filter: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(null),
          collect: vi.fn(),
        }),
      } as any);

      // Mock encryption failure
      vi.mocked(encryptSensitiveData).mockImplementation(() => {
        throw new Error('Encryption failed');
      });

      const args = {
        eventId: mockEventId,
        timeslotId: mockTimeslotId,
        submissionToken,
        promoFiles: [],
        promoDescription: '',
        guestList: [],
        paymentInfo: {
          accountHolder: '김철수',
          bankName: '국민은행',
          accountNumber: '123-456-789-000',
          residentNumber: '123456-1234567',
          preferDirectContact: false,
        },
        djContact: {
          email: 'dj@example.com',
        },
      };

      await expect(
        saveSubmission._handler(mockMutationCtx, args)
      ).rejects.toThrow('Encryption failed');

      // Verify database operations were not attempted
      expect(mockMutationCtx.db.insert).not.toHaveBeenCalled();
    });

    it('should handle decryption errors gracefully', async () => {
      const submissionToken = 'valid-token-123';
      const mockSubmission = {
        _id: mockSubmissionId,
        uniqueLink: submissionToken,
        paymentInfo: {
          accountNumber: 'corrupted_encrypted_data',
          residentNumber: 'corrupted_encrypted_data',
        },
      };

      vi.mocked(mockQueryCtx.db.query).mockReturnValue({
        filter: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(mockSubmission),
        }),
      } as any);

      // Mock decryption failure
      vi.mocked(decryptSensitiveData).mockImplementation(() => {
        throw new Error('Decryption failed');
      });

      await expect(
        getSubmissionByToken._handler(mockQueryCtx, { submissionToken })
      ).rejects.toThrow('Decryption failed');
    });
  });

  describe('Data integrity with encryption', () => {
    it('should maintain referential integrity when encrypting payment data', async () => {
      const submissionToken = 'valid-token-123';

      const mockTimeslot = {
        _id: mockTimeslotId,
        submissionToken,
        eventId: mockEventId,
      };
      vi.mocked(mockMutationCtx.db.get).mockResolvedValue(mockTimeslot);

      vi.mocked(mockMutationCtx.db.query).mockReturnValue({
        filter: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(null),
          collect: vi.fn(),
        }),
      } as any);

      vi.mocked(mockMutationCtx.db.insert).mockResolvedValue(mockSubmissionId);
      vi.mocked(mockMutationCtx.db.patch).mockResolvedValue(undefined);

      const args = {
        eventId: mockEventId,
        timeslotId: mockTimeslotId,
        submissionToken,
        promoFiles: [],
        promoDescription: '',
        guestList: [],
        paymentInfo: {
          accountHolder: '김철수',
          bankName: '국민은행',
          accountNumber: '123-456-789-000',
          residentNumber: '123456-1234567',
          preferDirectContact: false,
        },
        djContact: {
          email: 'dj@example.com',
        },
      };

      await saveSubmission._handler(mockMutationCtx, args);

      // Verify the submission data maintains proper structure
      const insertCall = vi.mocked(mockMutationCtx.db.insert).mock.calls[0];
      const submissionData = insertCall[1];
      
      // Verify all required fields are present
      expect(submissionData.eventId).toBe(mockEventId);
      expect(submissionData.timeslotId).toBe(mockTimeslotId);
      expect(submissionData.uniqueLink).toBe(submissionToken);
      expect(submissionData.paymentInfo).toBeDefined();
      expect(submissionData.paymentInfo.accountHolder).toBe('김철수');
      expect(submissionData.paymentInfo.bankName).toBe('국민은행');
      
      // Verify encrypted fields and hashes are present
      expect(submissionData.paymentInfo.accountNumber).toMatch(/^encrypted_/);
      expect(submissionData.paymentInfo.residentNumber).toMatch(/^encrypted_/);
      expect(submissionData.paymentInfo.accountNumberHash).toMatch(/^hash_/);
      expect(submissionData.paymentInfo.residentNumberHash).toMatch(/^hash_/);
      
      // Verify timestamps are added
      expect(submissionData.submittedAt).toBeDefined();
      expect(submissionData.lastUpdatedAt).toBeDefined();
    });
  });
});