/**
 * Web Crypto API implementation using Effect for type-safe error handling
 *
 * This module provides AES-256-GCM encryption using the browser's Web Crypto API
 * with Effect for composable, type-safe operations and proper resource management.
 */

import { Effect, Layer, pipe } from 'effect';
import {
	CryptoProvider,
	PlatformDetector,
	SecureKeyStorage,
	EncryptionError,
	DecryptionError,
	KeyDerivationError,
	UnsupportedPlatformError,
	EncryptedData,
	KeyDerivationParams,
	DEFAULT_CRYPTO_CONFIG,
	base64Encode,
	base64Decode,
	createEncryptedData,
	type Platform,
} from '@rite/shared-types';

// Utility to sanitize error messages in production
const sanitizeError = (error: unknown, fallbackMessage: string): unknown => {
	// In development, expose full error details for debugging
	if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
		return error;
	}
	// In production, only return generic message to prevent information leakage
	return fallbackMessage;
};

// Web Crypto utilities
const isWebCryptoSupported = (): boolean => {
	return (
		typeof window !== 'undefined' &&
		'crypto' in window &&
		'subtle' in window.crypto &&
		typeof window.crypto.subtle.encrypt === 'function'
	);
};

const detectWebPlatform = (): Platform => {
	// More robust platform detection logic
	// Check for Node.js/server environment first
	if (typeof window === 'undefined' || typeof document === 'undefined') {
		return 'unknown';
	}

	// Check for mobile-specific indicators
	const userAgent = window.navigator?.userAgent?.toLowerCase() || '';
	const isMobileUserAgent = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
	
	// Check for mobile viewport characteristics
	const isMobileViewport = window.screen?.width <= 768 && window.screen?.height <= 1024;
	
	// Check for touch capability
	const hasTouchCapability = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
	
	// Check for mobile-specific APIs or environments
	const hasDeviceMotion = 'DeviceMotionEvent' in window;
	const hasDeviceOrientation = 'DeviceOrientationEvent' in window;
	
	// Expo/React Native WebView detection
	const windowAny = window as any;
	const isExpoWebView = !!windowAny.expo || !!windowAny.ReactNativeWebView;
	
	// Cordova/PhoneGap detection
	const isCordova = !!windowAny.cordova || !!windowAny.phonegap;
	
	// Capacitor detection (Ionic)
	const isCapacitor = !!windowAny.Capacitor;
	
	// If any mobile indicators are present, classify as mobile
	if (
		isMobileUserAgent ||
		isExpoWebView ||
		isCordova ||
		isCapacitor ||
		(isMobileViewport && hasTouchCapability && (hasDeviceMotion || hasDeviceOrientation))
	) {
		return 'mobile';
	}
	
	// If we have a proper browser environment with DOM, classify as web
	if (window.location && window.history && typeof document.createElement === 'function') {
		return 'web';
	}
	
	// Fallback for unknown environments
	return 'unknown';
};

// Platform detector implementation for web
const WebPlatformDetector = Layer.succeed(
	PlatformDetector,
	PlatformDetector.of({
		detectPlatform: () => Effect.succeed(detectWebPlatform()),
		isWebCryptoSupported: () => Effect.succeed(isWebCryptoSupported()),
		isExpoCryptoSupported: () => Effect.succeed(false),
	})
);

// Secure key storage implementation using browser storage
const WebSecureKeyStorage = Layer.succeed(
	SecureKeyStorage,
	SecureKeyStorage.of({
		storeKey: (keyId: string, key: CryptoKey) =>
			Effect.tryPromise({
				try: async () => {
					// Export key for storage
					const exported = await window.crypto.subtle.exportKey('raw', key);
					const keyData = base64Encode(new Uint8Array(exported));

					// Store in sessionStorage for security (cleared on tab close)
					sessionStorage.setItem(`crypto_key_${keyId}`, keyData);
				},
				catch: (error) => new Error(`Failed to store key: ${error}`),
			}),

		retrieveKey: (keyId: string) =>
			Effect.tryPromise({
				try: async () => {
					const keyData = sessionStorage.getItem(`crypto_key_${keyId}`);
					if (!keyData) return null;

					// Import key from storage
					const keyBytes = base64Decode(keyData);
					const key = await window.crypto.subtle.importKey(
						'raw',
						keyBytes,
						{ name: 'AES-GCM' },
						false,
						['encrypt', 'decrypt']
					);
					return key;
				},
				catch: (error) => new Error(`Failed to retrieve key: ${error}`),
			}),

		deleteKey: (keyId: string) =>
			Effect.try({
				try: () => {
					sessionStorage.removeItem(`crypto_key_${keyId}`);
				},
				catch: (error) => new Error(`Failed to delete key: ${error}`),
			}),

		clearAllKeys: () =>
			Effect.try({
				try: () => {
					// Clear all crypto keys from storage
					for (let i = sessionStorage.length - 1; i >= 0; i--) {
						const key = sessionStorage.key(i);
						if (key?.startsWith('crypto_key_')) {
							sessionStorage.removeItem(key);
						}
					}
				},
				catch: (error) => new Error(`Failed to clear keys: ${error}`),
			}),
	})
);

// Main crypto provider implementation
const WebCryptoProvider = Layer.succeed(
	CryptoProvider,
	CryptoProvider.of({
		encrypt: (plaintext: string, key?: CryptoKey) =>
			pipe(
				Effect.Do,
				Effect.bind('cryptoKey', () =>
					key
						? Effect.succeed(key)
						: Effect.tryPromise({
								try: () =>
									window.crypto.subtle.generateKey(
										{
											name: 'AES-GCM',
											length: DEFAULT_CRYPTO_CONFIG.keyLength,
										},
										false, // not extractable for security
										['encrypt', 'decrypt']
									),
								catch: (error) =>
									new KeyDerivationError({
										message: 'Key generation failed',
										cause: error,
									}),
							})
				),
				Effect.bind('iv', () =>
					Effect.sync(() =>
						window.crypto.getRandomValues(new Uint8Array(DEFAULT_CRYPTO_CONFIG.ivLength))
					)
				),
				Effect.bind('plaintextBytes', () =>
					Effect.try({
						try: () => new TextEncoder().encode(plaintext),
						catch: (error) =>
							new EncryptionError({
								message: 'Failed to encode plaintext',
								cause: error,
							}),
					})
				),
				Effect.bind('encrypted', ({ cryptoKey, iv, plaintextBytes }) =>
					Effect.tryPromise({
						try: () =>
							window.crypto.subtle.encrypt(
								{
									name: 'AES-GCM',
									iv,
								},
								cryptoKey,
								plaintextBytes
							),
						catch: (error) =>
							new EncryptionError({
								message: 'Encryption failed',
								cause: sanitizeError(error, 'Encryption operation failed'),
							}),
					})
				),
				Effect.map(({ encrypted, iv }) => {
					const encryptedArray = new Uint8Array(encrypted);
					const dataLength = encryptedArray.length - DEFAULT_CRYPTO_CONFIG.tagLength;

					// Split encrypted data and auth tag
					const encryptedData = encryptedArray.slice(0, dataLength);
					const authTag = encryptedArray.slice(dataLength);

					return createEncryptedData(
						base64Encode(encryptedData),
						base64Encode(iv),
						base64Encode(authTag)
					);
				})
			),

		decrypt: (data: EncryptedData, key?: CryptoKey) =>
			pipe(
				Effect.Do,
				Effect.bind('cryptoKey', () =>
					key
						? Effect.succeed(key)
						: Effect.fail(
								new DecryptionError({
									message: 'Decryption key required but not provided',
								})
							)
				),
				Effect.bind('encryptedBytes', () =>
					Effect.try({
						try: () => base64Decode(data.encryptedData),
						catch: (error) =>
							new DecryptionError({
								message: 'Failed to decode encrypted data',
								cause: error,
							}),
					})
				),
				Effect.bind('iv', () =>
					Effect.try({
						try: () => base64Decode(data.iv),
						catch: (error) =>
							new DecryptionError({
								message: 'Failed to decode IV',
								cause: error,
							}),
					})
				),
				Effect.bind('authTag', () =>
					Effect.try({
						try: () => base64Decode(data.authTag),
						catch: (error) =>
							new DecryptionError({
								message: 'Failed to decode auth tag',
								cause: error,
							}),
					})
				),
				Effect.bind('combinedData', ({ encryptedBytes, authTag }) =>
					Effect.try({
						try: () => {
							// Combine encrypted data and auth tag for Web Crypto API
							const combined = new Uint8Array(encryptedBytes.length + authTag.length);
							combined.set(encryptedBytes);
							combined.set(authTag, encryptedBytes.length);
							return combined;
						},
						catch: (error) =>
							new DecryptionError({
								message: 'Failed to combine encrypted data and auth tag',
								cause: error,
							}),
					})
				),
				Effect.bind('decrypted', ({ cryptoKey, iv, combinedData }) =>
					Effect.tryPromise({
						try: () =>
							window.crypto.subtle.decrypt(
								{
									name: 'AES-GCM',
									iv,
								},
								cryptoKey,
								combinedData
							),
						catch: (error) =>
							new DecryptionError({
								message: 'Decryption failed',
								cause: sanitizeError(error, 'Decryption operation failed'),
							}),
					})
				),
				Effect.map(({ decrypted }) => new TextDecoder().decode(decrypted))
			),

		generateKey: () =>
			Effect.tryPromise({
				try: () =>
					window.crypto.subtle.generateKey(
						{
							name: 'AES-GCM',
							length: DEFAULT_CRYPTO_CONFIG.keyLength,
						},
						false, // not extractable for security
						['encrypt', 'decrypt']
					),
				catch: (error) =>
					new KeyDerivationError({
						message: 'Key generation failed',
						cause: sanitizeError(error, 'Key generation operation failed'),
					}),
			}),

		deriveKey: (params: KeyDerivationParams) =>
			pipe(
				Effect.Do,
				Effect.bind('passwordKey', () =>
					Effect.tryPromise({
						try: () =>
							window.crypto.subtle.importKey(
								'raw',
								new TextEncoder().encode(params.password),
								'PBKDF2',
								false,
								['deriveKey']
							),
						catch: (error) =>
							new KeyDerivationError({
								message: 'Failed to import password',
								cause: sanitizeError(error, 'Password import operation failed'),
							}),
					})
				),
				Effect.flatMap(({ passwordKey }) =>
					Effect.tryPromise({
						try: () =>
							window.crypto.subtle.deriveKey(
								{
									name: 'PBKDF2',
									salt: params.salt,
									iterations: params.iterations,
									hash: 'SHA-256',
								},
								passwordKey,
								{
									name: 'AES-GCM',
									length: params.keyLength,
								},
								false,
								['encrypt', 'decrypt']
							),
						catch: (error) =>
							new KeyDerivationError({
								message: 'Key derivation failed',
								cause: sanitizeError(error, 'Key derivation operation failed'),
							}),
					})
				)
			),

		generateSalt: () =>
			Effect.succeed(
				window.crypto.getRandomValues(new Uint8Array(DEFAULT_CRYPTO_CONFIG.saltLength))
			),

		isSupported: () => Effect.succeed(isWebCryptoSupported()),
	})
);

// Combined web crypto layer
export const WebCryptoLive = Layer.mergeAll(
	WebPlatformDetector,
	WebSecureKeyStorage,
	WebCryptoProvider
);

// Convenience function to check support before using
export const ensureWebCryptoSupport = pipe(
	CryptoProvider,
	Effect.flatMap((crypto) =>
		pipe(
			crypto.isSupported(),
			Effect.flatMap((supported) =>
				supported
					? Effect.succeed(undefined)
					: Effect.fail(
							new UnsupportedPlatformError({
								message: 'Web Crypto API is not supported in this environment',
								platform: 'web',
							})
						)
			)
		)
	)
);

// Utility for creating a session-based encryption key
export const createSessionKey = (sessionId: string) =>
	pipe(
		Effect.Do,
		Effect.bind('salt', () =>
			pipe(
				CryptoProvider,
				Effect.flatMap((crypto) => crypto.generateSalt())
			)
		),
		Effect.flatMap(({ salt }) =>
			pipe(
				CryptoProvider,
				Effect.flatMap((crypto) =>
					crypto.deriveKey({
						password: sessionId,
						salt,
						iterations: DEFAULT_CRYPTO_CONFIG.iterations,
						keyLength: DEFAULT_CRYPTO_CONFIG.keyLength,
					})
				)
			)
		)
	);

// Utility for encrypting with auto-generated key
export const encryptWithAutoKey = (plaintext: string) =>
	pipe(
		CryptoProvider,
		Effect.flatMap((crypto) => crypto.encrypt(plaintext)),
		Effect.provide(WebCryptoLive)
	);

// Utility for decrypting with stored key
export const decryptWithStoredKey = (data: EncryptedData, keyId: string) =>
	pipe(
		Effect.Do,
		Effect.bind('key', () =>
			pipe(
				SecureKeyStorage,
				Effect.flatMap((storage) => storage.retrieveKey(keyId))
			)
		),
		Effect.flatMap(({ key }) =>
			key
				? pipe(
						CryptoProvider,
						Effect.flatMap((crypto) => crypto.decrypt(data, key))
					)
				: Effect.fail(
						new DecryptionError({
							message: `Key not found: ${keyId}`,
						})
					)
		),
		Effect.provide(WebCryptoLive)
	);
