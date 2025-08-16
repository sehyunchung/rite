/**
 * Effect-based cryptography types and interfaces for secure client-side encryption
 *
 * This module provides type-safe, composable cryptographic operations using Effect
 * to ensure proper error handling and resource management for sensitive data.
 */

import { Effect, Context, Data } from 'effect';

// Crypto Error Types
export class EncryptionError extends Data.TaggedError('EncryptionError')<{
	readonly message: string;
	readonly cause?: unknown;
}> {}

export class DecryptionError extends Data.TaggedError('DecryptionError')<{
	readonly message: string;
	readonly cause?: unknown;
}> {}

export class KeyDerivationError extends Data.TaggedError('KeyDerivationError')<{
	readonly message: string;
	readonly cause?: unknown;
}> {}

export class UnsupportedPlatformError extends Data.TaggedError('UnsupportedPlatformError')<{
	readonly message: string;
	readonly platform: string;
}> {}

// Crypto Data Types
export interface EncryptedData {
	readonly encryptedData: string; // Base64 encoded
	readonly iv: string; // Base64 encoded initialization vector
	readonly authTag: string; // Base64 encoded authentication tag (GCM mode)
	readonly version: 'AES_V1'; // Version for future compatibility
	readonly algorithm: 'AES-256-GCM';
}

export interface KeyDerivationParams {
	readonly password: string;
	readonly salt: Uint8Array;
	readonly iterations: number;
	readonly keyLength: number;
}

export interface CryptoConfig {
	readonly algorithm: 'AES-256-GCM';
	readonly keyLength: 256;
	readonly ivLength: 12; // 96 bits for GCM
	readonly tagLength: 16; // 128 bits for GCM
	readonly saltLength: 32; // 256 bits
	readonly iterations: 100000; // PBKDF2 iterations
}

// Default crypto configuration
export const DEFAULT_CRYPTO_CONFIG: CryptoConfig = {
	algorithm: 'AES-256-GCM',
	keyLength: 256,
	ivLength: 12,
	tagLength: 16,
	saltLength: 32,
	iterations: 100000,
} as const;

// Crypto Provider Interface
export interface CryptoProvider {
	readonly encrypt: (
		plaintext: string,
		key?: CryptoKey
	) => Effect.Effect<EncryptedData, EncryptionError | KeyDerivationError>;

	readonly decrypt: (
		data: EncryptedData,
		key?: CryptoKey
	) => Effect.Effect<string, DecryptionError | KeyDerivationError>;

	readonly generateKey: () => Effect.Effect<CryptoKey, KeyDerivationError>;

	readonly deriveKey: (params: KeyDerivationParams) => Effect.Effect<CryptoKey, KeyDerivationError>;

	readonly generateSalt: () => Effect.Effect<Uint8Array, never>;

	readonly isSupported: () => Effect.Effect<boolean, never>;
}

// Context tag for dependency injection
export const CryptoProvider = Context.GenericTag<CryptoProvider>('CryptoProvider');

// Platform detection
export type Platform = 'web' | 'mobile' | 'unknown';

export interface PlatformDetector {
	readonly detectPlatform: () => Effect.Effect<Platform, never>;
	readonly isWebCryptoSupported: () => Effect.Effect<boolean, never>;
	readonly isExpoCryptoSupported: () => Effect.Effect<boolean, never>;
}

export const PlatformDetector = Context.GenericTag<PlatformDetector>('PlatformDetector');

// Utility types for submission encryption
export interface SubmissionCrypto {
	readonly encryptPaymentInfo: (paymentInfo: {
		accountNumber: string;
		residentNumber: string;
		accountHolder: string;
		bankName: string;
		preferDirectContact: boolean;
	}) => Effect.Effect<
		{
			accountNumber: EncryptedData;
			residentNumber: EncryptedData;
			accountHolder: string;
			bankName: string;
			preferDirectContact: boolean;
		},
		EncryptionError
	>;

	readonly decryptPaymentInfo: (encryptedPaymentInfo: {
		accountNumber: EncryptedData;
		residentNumber: EncryptedData;
		accountHolder: string;
		bankName: string;
		preferDirectContact: boolean;
	}) => Effect.Effect<
		{
			accountNumber: string;
			residentNumber: string;
			accountHolder: string;
			bankName: string;
			preferDirectContact: boolean;
		},
		DecryptionError
	>;
}

export const SubmissionCrypto = Context.GenericTag<SubmissionCrypto>('SubmissionCrypto');

// Key management interface for secure storage
export interface SecureKeyStorage {
	readonly storeKey: (keyId: string, key: CryptoKey) => Effect.Effect<void, Error>;

	readonly retrieveKey: (keyId: string) => Effect.Effect<CryptoKey | null, Error>;

	readonly deleteKey: (keyId: string) => Effect.Effect<void, Error>;

	readonly clearAllKeys: () => Effect.Effect<void, Error>;
}

export const SecureKeyStorage = Context.GenericTag<SecureKeyStorage>('SecureKeyStorage');

// Migration utilities for existing encrypted data
export interface CryptoMigration {
	readonly migrateFromXOR: (
		xorEncryptedData: string
	) => Effect.Effect<EncryptedData, DecryptionError | EncryptionError>;

	readonly validateMigration: (
		original: string,
		migrated: EncryptedData
	) => Effect.Effect<boolean, DecryptionError>;
}

export const CryptoMigration = Context.GenericTag<CryptoMigration>('CryptoMigration');

// Utility functions for working with encrypted data
export const isEncryptedData = (value: unknown): value is EncryptedData => {
	return (
		typeof value === 'object' &&
		value !== null &&
		'encryptedData' in value &&
		'iv' in value &&
		'authTag' in value &&
		'version' in value &&
		'algorithm' in value &&
		(value as EncryptedData).version === 'AES_V1' &&
		(value as EncryptedData).algorithm === 'AES-256-GCM'
	);
};

export const createEncryptedData = (
	encryptedData: string,
	iv: string,
	authTag: string
): EncryptedData => ({
	encryptedData,
	iv,
	authTag,
	version: 'AES_V1',
	algorithm: 'AES-256-GCM',
});

// Base64 utility functions that work in both environments
export const base64Encode = (data: Uint8Array): string => {
	if (typeof btoa !== 'undefined') {
		// Browser environment
		return btoa(String.fromCharCode(...data));
	} else {
		// Node.js environment (for tests)
		return Buffer.from(data).toString('base64');
	}
};

export const base64Decode = (data: string): Uint8Array => {
	if (typeof atob !== 'undefined') {
		// Browser environment
		const binaryString = atob(data);
		return new Uint8Array(binaryString.length).map((_, i) => binaryString.charCodeAt(i));
	} else {
		// Node.js environment (for tests)
		return new Uint8Array(Buffer.from(data, 'base64'));
	}
};
