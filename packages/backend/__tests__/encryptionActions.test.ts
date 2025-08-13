import { describe, it, expect, vi, beforeEach } from 'vitest';
import { encrypt, decrypt, hash, encryptBatch, hashBatch } from '../convex/encryptionActions';
import type { ActionCtx } from '../convex/_generated/server';

// Mock environment variables
beforeEach(() => {
	vi.clearAllMocks();
	
	// Set up encryption environment
	process.env.CONVEX_ENCRYPTION_KEY = 'test-encryption-key-32-chars!!!!';
	process.env.CONVEX_HASH_SALT = 'test-hash-salt';
});

// Create mock action context
const createMockActionCtx = () => ({}) as unknown as ActionCtx;

describe('Encryption Actions', () => {
	describe('encrypt and decrypt', () => {
		it('should encrypt and decrypt data correctly', async () => {
			const mockCtx = createMockActionCtx();
			const testData = 'sensitive-data-123';
			
			const encrypted = await encrypt._handler(mockCtx, { data: testData });
			expect(encrypted).toBeTruthy();
			expect(encrypted).not.toBe(testData);
			
			const decrypted = await decrypt._handler(mockCtx, { encryptedData: encrypted });
			expect(decrypted).toBe(testData);
		});

		it('should use unique IVs for each encryption', async () => {
			const mockCtx = createMockActionCtx();
			const testData = 'same-data-multiple-times';
			
			const encrypted1 = await encrypt._handler(mockCtx, { data: testData });
			const encrypted2 = await encrypt._handler(mockCtx, { data: testData });
			const encrypted3 = await encrypt._handler(mockCtx, { data: testData });
			
			// Each encryption should be unique due to different IVs
			expect(encrypted1).not.toBe(encrypted2);
			expect(encrypted2).not.toBe(encrypted3);
			expect(encrypted1).not.toBe(encrypted3);
		});

		it('should handle Korean characters', async () => {
			const mockCtx = createMockActionCtx();
			const koreanData = '한국은행-계좌번호-123-456';
			
			const encrypted = await encrypt._handler(mockCtx, { data: koreanData });
			const decrypted = await decrypt._handler(mockCtx, { encryptedData: encrypted });
			
			expect(decrypted).toBe(koreanData);
		});
	});

	describe('hash', () => {
		it('should produce consistent hashes for searching', async () => {
			const mockCtx = createMockActionCtx();
			const searchableData = 'account-for-searching';
			
			const hash1 = await hash._handler(mockCtx, { data: searchableData });
			const hash2 = await hash._handler(mockCtx, { data: searchableData });
			const hash3 = await hash._handler(mockCtx, { data: searchableData });
			
			// Hashes should be identical for the same input (for searching)
			expect(hash1).toBe(hash2);
			expect(hash2).toBe(hash3);
			expect(hash1.length).toBe(64); // SHA-256 produces 64 hex characters
		});

		it('should produce different hashes for different data', async () => {
			const mockCtx = createMockActionCtx();
			
			const hash1 = await hash._handler(mockCtx, { data: 'data1' });
			const hash2 = await hash._handler(mockCtx, { data: 'data2' });
			
			expect(hash1).not.toBe(hash2);
		});
	});

	describe('batch operations', () => {
		it('should encrypt multiple items in batch', async () => {
			const mockCtx = createMockActionCtx();
			const testData = ['account1', 'account2', 'account3'];
			
			const encrypted = await encryptBatch._handler(mockCtx, { data: testData });
			
			expect(encrypted).toHaveLength(3);
			expect(encrypted[0]).not.toBe(testData[0]);
			expect(encrypted[1]).not.toBe(testData[1]);
			expect(encrypted[2]).not.toBe(testData[2]);
			
			// Each should decrypt correctly
			const decrypted1 = await decrypt._handler(mockCtx, { encryptedData: encrypted[0] });
			const decrypted2 = await decrypt._handler(mockCtx, { encryptedData: encrypted[1] });
			const decrypted3 = await decrypt._handler(mockCtx, { encryptedData: encrypted[2] });
			
			expect(decrypted1).toBe(testData[0]);
			expect(decrypted2).toBe(testData[1]);
			expect(decrypted3).toBe(testData[2]);
		});

		it('should hash multiple items in batch', async () => {
			const mockCtx = createMockActionCtx();
			const testData = ['data1', 'data2', 'data3'];
			
			const hashed = await hashBatch._handler(mockCtx, { data: testData });
			
			expect(hashed).toHaveLength(3);
			expect(hashed[0]).toHaveLength(64);
			expect(hashed[1]).toHaveLength(64);
			expect(hashed[2]).toHaveLength(64);
			
			// Each hash should be unique
			expect(hashed[0]).not.toBe(hashed[1]);
			expect(hashed[1]).not.toBe(hashed[2]);
			expect(hashed[0]).not.toBe(hashed[2]);
		});
	});

	describe('Error Handling', () => {
		it('should not expose sensitive data in error messages', async () => {
			const mockCtx = createMockActionCtx();
			const sensitiveAccount = 'super-secret-12345';
			
			// Temporarily break encryption by setting invalid key
			process.env.CONVEX_ENCRYPTION_KEY = 'too-short';
			
			try {
				await encrypt._handler(mockCtx, { data: sensitiveAccount });
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : String(error);
				expect(errorMessage).not.toContain(sensitiveAccount);
				expect(errorMessage).toContain('32 bytes'); // Should mention key length requirement
			}
		});

		it('should handle missing encryption key gracefully', async () => {
			const mockCtx = createMockActionCtx();
			delete process.env.CONVEX_ENCRYPTION_KEY;
			
			await expect(encrypt._handler(mockCtx, { data: 'test' })).rejects.toThrow(
				'Encryption key not configured'
			);
		});

		it('should handle missing hash salt gracefully', async () => {
			const mockCtx = createMockActionCtx();
			delete process.env.CONVEX_HASH_SALT;
			
			await expect(hash._handler(mockCtx, { data: 'test' })).rejects.toThrow(
				'Hash salt not configured'
			);
		});

		it('should handle invalid encrypted data format', async () => {
			const mockCtx = createMockActionCtx();
			
			await expect(decrypt._handler(mockCtx, { encryptedData: 'invalid-base64!' })).rejects.toThrow();
		});
	});

	describe('Performance', () => {
		it('should complete encryption operations efficiently', async () => {
			const mockCtx = createMockActionCtx();
			const testData = 'performance-test-account';
			
			const start = Date.now();
			
			// Run 50 encrypt/decrypt cycles
			for (let i = 0; i < 50; i++) {
				const encrypted = await encrypt._handler(mockCtx, { data: testData });
				await decrypt._handler(mockCtx, { encryptedData: encrypted });
			}
			
			const duration = Date.now() - start;
			
			// Should complete 50 operations in under 1000ms (adjusted for action overhead)
			expect(duration).toBeLessThan(1000);
		});
	});
});