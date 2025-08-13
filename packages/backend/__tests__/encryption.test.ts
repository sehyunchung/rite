import { describe, it, expect, vi, beforeEach } from 'vitest';
import { encryptSensitiveData, decryptSensitiveData, hashData } from '../convex/encryption';
import type { MutationCtx } from '../convex/_generated/server';
import type { Id } from '../convex/_generated/dataModel';

// Mock Convex context for environment variables
const createMockMutationCtx = () =>
	({
		storage: {
			generateUploadUrl: vi.fn(),
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

describe('Encryption System', () => {
	let mockMutationCtx: MutationCtx;

	beforeEach(() => {
		mockMutationCtx = createMockMutationCtx();
		vi.clearAllMocks();
		
		// Mock environment variables
		process.env.CONVEX_ENCRYPTION_KEY = 'test-encryption-key-32-chars!!!!';  // Exactly 32 bytes
		process.env.CONVEX_HASH_SALT = 'test-hash-salt-for-testing';
	});

	describe('encryptSensitiveData', () => {
		it('should encrypt sensitive payment data', () => {
			const sensitiveData = 'account-number-123456789';
			
			const encrypted = encryptSensitiveData(sensitiveData);
			
			expect(encrypted).toBeDefined();
			expect(typeof encrypted).toBe('string');
			expect(encrypted).not.toBe(sensitiveData); // Should be different from original
			expect(encrypted.length).toBeGreaterThan(sensitiveData.length); // Encrypted data is longer
		});

		it('should produce different outputs for same input (due to IV)', () => {
			const sensitiveData = 'same-account-number';
			
			const encrypted1 = encryptSensitiveData(sensitiveData);
			const encrypted2 = encryptSensitiveData(sensitiveData);
			
			expect(encrypted1).not.toBe(encrypted2); // Different IVs should produce different results
		});

		it('should handle empty strings', () => {
			const encrypted = encryptSensitiveData('');
			
			expect(encrypted).toBeDefined();
			expect(typeof encrypted).toBe('string');
		});

		it('should handle special characters and unicode', () => {
			const sensitiveData = '한국은행-계좌번호-123-456-789!@#';
			
			const encrypted = encryptSensitiveData(sensitiveData);
			
			expect(encrypted).toBeDefined();
			expect(typeof encrypted).toBe('string');
			expect(encrypted).not.toBe(sensitiveData);
		});

		it('should handle very long strings', () => {
			const longData = 'a'.repeat(1000);
			
			const encrypted = encryptSensitiveData(longData);
			
			expect(encrypted).toBeDefined();
			expect(typeof encrypted).toBe('string');
		});

		it('should throw error if encryption key is missing', () => {
			delete process.env.CONVEX_ENCRYPTION_KEY;
			
			expect(() => encryptSensitiveData('test-data')).toThrow('Encryption key not configured');
		});
	});

	describe('decryptSensitiveData', () => {
		it('should decrypt previously encrypted data', () => {
			const originalData = 'resident-number-123456-1234567';
			
			const encrypted = encryptSensitiveData(originalData);
			const decrypted = decryptSensitiveData(encrypted);
			
			expect(decrypted).toBe(originalData);
		});

		it('should handle empty string encryption/decryption', () => {
			const originalData = '';
			
			const encrypted = encryptSensitiveData(originalData);
			const decrypted = decryptSensitiveData(encrypted);
			
			expect(decrypted).toBe(originalData);
		});

		it('should handle unicode characters correctly', () => {
			const originalData = '주민번호: 123456-1234567 (한국)';
			
			const encrypted = encryptSensitiveData(originalData);
			const decrypted = decryptSensitiveData(encrypted);
			
			expect(decrypted).toBe(originalData);
		});

		it('should throw error for invalid encrypted data', () => {
			const invalidEncrypted = 'invalid-encrypted-string';
			
			expect(() => decryptSensitiveData(invalidEncrypted)).toThrow();
		});

		it('should throw error for tampered encrypted data', () => {
			const originalData = 'test-account-number';
			const encrypted = encryptSensitiveData(originalData);
			const tampered = encrypted.slice(0, -5) + 'xxxxx'; // Tamper with end
			
			expect(() => decryptSensitiveData(tampered)).toThrow();
		});

		it('should throw error if encryption key is missing during decryption', () => {
			const originalData = 'test-data';
			const encrypted = encryptSensitiveData(originalData);
			
			delete process.env.CONVEX_ENCRYPTION_KEY;
			
			expect(() => decryptSensitiveData(encrypted)).toThrow('Encryption key not configured');
		});

		it('should throw error if encryption key is too short', () => {
			process.env.CONVEX_ENCRYPTION_KEY = 'short-key';
			
			expect(() => encryptSensitiveData('test-data')).toThrow('Encryption key must be exactly 32 bytes');
		});

		it('should throw error if encryption key is too long', () => {
			process.env.CONVEX_ENCRYPTION_KEY = 'this-is-a-very-long-key-that-exceeds-32-bytes-and-should-be-rejected';
			
			expect(() => encryptSensitiveData('test-data')).toThrow('Encryption key must be exactly 32 bytes');
		});
	});

	describe('hashData', () => {
		it('should create consistent hash for same input', () => {
			const data = 'test-data-for-hashing';
			
			const hash1 = hashData(data);
			const hash2 = hashData(data);
			
			expect(hash1).toBe(hash2);
			expect(typeof hash1).toBe('string');
			expect(hash1.length).toBe(64); // SHA-256 produces 64 character hex string
		});

		it('should create different hashes for different inputs', () => {
			const data1 = 'first-data';
			const data2 = 'second-data';
			
			const hash1 = hashData(data1);
			const hash2 = hashData(data2);
			
			expect(hash1).not.toBe(hash2);
		});

		it('should handle empty string', () => {
			const hash = hashData('');
			
			expect(hash).toBeDefined();
			expect(typeof hash).toBe('string');
			expect(hash.length).toBe(64);
		});

		it('should handle unicode characters', () => {
			const unicodeData = '한국어 테스트 데이터 🎵';
			
			const hash = hashData(unicodeData);
			
			expect(hash).toBeDefined();
			expect(typeof hash).toBe('string');
			expect(hash.length).toBe(64);
		});

		it('should throw error if hash salt is missing', () => {
			delete process.env.CONVEX_HASH_SALT;
			
			expect(() => hashData('test-data')).toThrow('Hash salt not configured');
		});
	});

	describe('Encryption Integration Tests', () => {
		it('should maintain data integrity through multiple encrypt/decrypt cycles', () => {
			const originalData = 'sensitive-bank-account-987654321';
			
			// Multiple encryption/decryption cycles
			let current = originalData;
			for (let i = 0; i < 5; i++) {
				const encrypted = encryptSensitiveData(current);
				current = decryptSensitiveData(encrypted);
			}
			
			expect(current).toBe(originalData);
		});

		it('should handle batch encryption/decryption', () => {
			const sensitiveDataArray = [
				'account-123456789',
				'resident-123456-1234567',
				'bank-name-국민은행',
				'holder-김철수',
			];
			
			const encrypted = sensitiveDataArray.map(data => encryptSensitiveData(data));
			const decrypted = encrypted.map(enc => decryptSensitiveData(enc));
			
			expect(decrypted).toEqual(sensitiveDataArray);
		});

		it('should create searchable hashes for encrypted data', () => {
			const accountNumber = '123-456-789-000';
			
			// Encrypt for storage
			const encrypted = encryptSensitiveData(accountNumber);
			
			// Create hash for searching (without revealing actual data)
			const hash = hashData(accountNumber);
			
			expect(encrypted).not.toBe(accountNumber);
			expect(hash).not.toBe(accountNumber);
			expect(hash).not.toBe(encrypted);
			
			// Verify we can decrypt back to original
			expect(decryptSensitiveData(encrypted)).toBe(accountNumber);
			
			// Verify hash is consistent for searches
			expect(hashData(accountNumber)).toBe(hash);
		});
	});

	describe('Security Properties', () => {
		it('should not expose sensitive data in error messages', () => {
			const sensitiveData = 'super-secret-account-123456';
			
			try {
				// Simulate encryption error by corrupting environment
				process.env.CONVEX_ENCRYPTION_KEY = 'invalid-key';
				encryptSensitiveData(sensitiveData);
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : String(error);
				expect(errorMessage).not.toContain(sensitiveData);
			}
		});

		it('should use different initialization vectors for each encryption', () => {
			const data = 'same-input-data';
			const encryptions = new Set();
			
			// Generate multiple encryptions of same data
			for (let i = 0; i < 10; i++) {
				const encrypted = encryptSensitiveData(data);
				encryptions.add(encrypted);
			}
			
			// All encryptions should be unique due to different IVs
			expect(encryptions.size).toBe(10);
		});

		it('should produce deterministic hashes (for search/comparison)', () => {
			const data = 'consistent-data-for-hashing';
			const hashes = new Set();
			
			// Generate multiple hashes of same data
			for (let i = 0; i < 10; i++) {
				const hash = hashData(data);
				hashes.add(hash);
			}
			
			// All hashes should be identical
			expect(hashes.size).toBe(1);
		});
	});

	describe('Performance Tests', () => {
		it('should encrypt and decrypt within reasonable time', () => {
			const data = 'performance-test-data';
			
			const startTime = Date.now();
			
			for (let i = 0; i < 100; i++) {
				const encrypted = encryptSensitiveData(data);
				decryptSensitiveData(encrypted);
			}
			
			const endTime = Date.now();
			const duration = endTime - startTime;
			
			// Should complete 100 encrypt/decrypt cycles in under 1 second
			expect(duration).toBeLessThan(1000);
		});

		it('should hash data efficiently', () => {
			const data = 'hash-performance-test';
			
			const startTime = Date.now();
			
			for (let i = 0; i < 1000; i++) {
				hashData(data);
			}
			
			const endTime = Date.now();
			const duration = endTime - startTime;
			
			// Should complete 1000 hashes in under 500ms
			expect(duration).toBeLessThan(500);
		});
	});
});