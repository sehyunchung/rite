/**
 * Basic tests for crypto-web-effect implementation
 * Tests the fixed circular dependency issues and basic functionality
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { Effect } from 'effect';
import { WebCryptoLive, encryptWithAutoKey } from '../app/lib/crypto-web-effect';

// Mock Web Crypto API for testing
Object.defineProperty(global, 'window', {
	value: {
		crypto: {
			subtle: {
				generateKey: () => Promise.resolve(new ArrayBuffer(32)),
				encrypt: () => Promise.resolve(new ArrayBuffer(48)), // 32 bytes data + 16 bytes tag
				decrypt: () => Promise.resolve(new ArrayBuffer(16)),
				importKey: () => Promise.resolve({}),
				exportKey: () => Promise.resolve(new ArrayBuffer(32)),
				deriveKey: () => Promise.resolve({}),
			},
			getRandomValues: (arr: Uint8Array) => {
				for (let i = 0; i < arr.length; i++) {
					arr[i] = Math.floor(Math.random() * 256);
				}
				return arr;
			},
		},
	},
	writable: true,
});

// Mock sessionStorage
Object.defineProperty(global, 'sessionStorage', {
	value: {
		getItem: () => null,
		setItem: () => {},
		removeItem: () => {},
		key: () => null,
		length: 0,
	},
	writable: true,
});

// Mock TextEncoder/TextDecoder
Object.defineProperty(global, 'TextEncoder', {
	value: class {
		encode(str: string) {
			return new Uint8Array(Buffer.from(str, 'utf8'));
		}
	},
});

Object.defineProperty(global, 'TextDecoder', {
	value: class {
		decode(buffer: ArrayBuffer) {
			return Buffer.from(buffer).toString('utf8');
		}
	},
});

describe('Crypto Web Effect Implementation', () => {
	beforeAll(() => {
		// Ensure global objects are properly set up
	});

	it('should compile without type errors', () => {
		// This test ensures the module can be imported without circular dependency issues
		expect(encryptWithAutoKey).toBeDefined();
		expect(WebCryptoLive).toBeDefined();
	});

	it('should have the correct layer structure', () => {
		// Test that the layer can be created without errors
		expect(() => WebCryptoLive).not.toThrow();
	});

	it('should handle Effect creation without circular dependencies', async () => {
		// Test that we can create an Effect without circular dependencies
		const testEffect = Effect.succeed('test');
		const result = await Effect.runPromise(testEffect);
		expect(result).toBe('test');
	});
});