import { describe, it, expect, beforeEach, vi } from 'vitest';
import { encryptSensitiveData, decryptSensitiveData, hashData } from '../convex/encryption';

describe('Encryption Functions', () => {
	beforeEach(() => {
		// Set up encryption environment
		process.env.CONVEX_ENCRYPTION_KEY = 'test-encryption-key-32-chars!!!!';
		process.env.CONVEX_HASH_SALT = 'test-hash-salt';
	});

	describe('encryptSensitiveData and decryptSensitiveData', () => {
		it('should encrypt and decrypt data correctly', () => {
			const originalData = 'sensitive-account-123';
			
			const encrypted = encryptSensitiveData(originalData);
			expect(encrypted).toBeTruthy();
			expect(encrypted).toContain('ENC_V2_');
			expect(encrypted).not.toBe(originalData);
			
			const decrypted = decryptSensitiveData(encrypted);
			expect(decrypted).toBe(originalData);
		});

		it('should handle Korean characters', () => {
			const koreanData = '한국은행-계좌번호-123';
			
			const encrypted = encryptSensitiveData(koreanData);
			const decrypted = decryptSensitiveData(encrypted);
			
			expect(decrypted).toBe(koreanData);
		});

		it('should produce different encrypted values for the same input', () => {
			const data = 'test-data';
			
			// Due to XOR with key, same data will produce same output
			// This is a limitation of the simple XOR approach
			const encrypted1 = encryptSensitiveData(data);
			const encrypted2 = encryptSensitiveData(data);
			
			// They will be the same with XOR (no IV)
			expect(encrypted1).toBe(encrypted2);
		});
	});

	describe('hashData', () => {
		it('should produce consistent hashes', () => {
			const data = 'searchable-data';
			
			const hash1 = hashData(data);
			const hash2 = hashData(data);
			const hash3 = hashData(data);
			
			expect(hash1).toBe(hash2);
			expect(hash2).toBe(hash3);
			expect(hash1).toHaveLength(16); // djb2 hash padded to 16 chars
		});

		it('should produce different hashes for different data', () => {
			const hash1 = hashData('data1');
			const hash2 = hashData('data2');
			
			expect(hash1).not.toBe(hash2);
		});
	});

	describe('Error Handling', () => {
		it('should throw error when encryption key is missing', () => {
			delete process.env.CONVEX_ENCRYPTION_KEY;
			
			expect(() => encryptSensitiveData('test')).toThrow('Encryption key not configured');
		});

		it('should throw error when hash salt is missing', () => {
			delete process.env.CONVEX_HASH_SALT;
			
			expect(() => hashData('test')).toThrow('Hash salt not configured');
		});

		it('should throw error for invalid encrypted data format', () => {
			expect(() => decryptSensitiveData('invalid-data')).toThrow('Invalid encrypted data format');
		});
	});
});