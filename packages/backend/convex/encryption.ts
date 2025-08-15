/**
 * ⚠️ WARNING: BASIC OBFUSCATION ONLY - NOT CRYPTOGRAPHICALLY SECURE ⚠️
 *
 * This module provides basic data obfuscation that works in Convex's V8 runtime.
 * It uses XOR encoding which is NOT suitable for protecting sensitive data.
 *
 * DO NOT USE FOR:
 * - Credit card numbers, SSNs, or government IDs
 * - Medical records or HIPAA-protected data
 * - Passwords or authentication credentials
 * - Any data requiring regulatory compliance (GDPR, PCI-DSS, etc.)
 *
 * PRODUCTION RECOMMENDATIONS:
 * 1. Use client-side encryption (Web Crypto API) before sending to Convex
 * 2. Integrate with KMS services (AWS KMS, Azure Key Vault, HashiCorp Vault)
 * 3. Consider zero-knowledge architectures where server never sees plaintext
 *
 * CURRENT LIMITATIONS:
 * - XOR cipher is easily breakable with cryptanalysis
 * - djb2 hash has known collision vulnerabilities
 * - No key rotation mechanism
 * - No authentication tags (vulnerable to tampering)
 */

/**
 * Get encryption key from environment variables
 */
function getEncryptionKey(): string {
	const key = process.env.CONVEX_ENCRYPTION_KEY;
	if (!key) {
		throw new Error(
			'CONVEX_ENCRYPTION_KEY not configured. Please set a 32+ character key in environment variables.'
		);
	}

	// Validate key length for security
	if (key.length < 32) {
		throw new Error(
			`CONVEX_ENCRYPTION_KEY must be at least 32 characters for security. Current length: ${key.length}`
		);
	}

	return key;
}

/**
 * Get hash salt from environment variables
 */
function getHashSalt(): string {
	const salt = process.env.CONVEX_HASH_SALT;
	if (!salt) {
		throw new Error(
			'CONVEX_HASH_SALT not configured. Please set a salt value in environment variables.'
		);
	}
	return salt;
}

/**
 * Simple reversible encoding for sensitive data
 * This provides basic obfuscation but NOT cryptographic security
 */
export function encryptSensitiveData(data: string): string {
	const key = getEncryptionKey();

	// Convert to UTF-8 bytes first to handle Unicode properly
	const encoder = new TextEncoder();
	const dataBytes = encoder.encode(data);
	const keyBytes = encoder.encode(key);

	// XOR each byte
	const resultBytes = new Uint8Array(dataBytes.length);
	for (let i = 0; i < dataBytes.length; i++) {
		resultBytes[i] = dataBytes[i] ^ keyBytes[i % keyBytes.length];
	}

	// Convert to base64 for safe storage
	// btoa requires a binary string, so convert bytes to chars
	let binaryString = '';
	for (let i = 0; i < resultBytes.length; i++) {
		binaryString += String.fromCharCode(resultBytes[i]);
	}
	const base64 = btoa(binaryString);

	// Add version prefix for future compatibility
	return `ENC_V2_${base64}`;
}

/**
 * Decode sensitive data
 */
export function decryptSensitiveData(encryptedData: string): string {
	if (!encryptedData.startsWith('ENC_V2_')) {
		// Handle legacy format
		if (encryptedData.startsWith('ENC_V1_')) {
			const encoded = encryptedData.slice(7);
			return atob(encoded);
		}
		throw new Error(
			`Invalid encrypted data format. Expected ENC_V2_ or ENC_V1_ prefix, got: ${encryptedData.substring(0, 7)}`
		);
	}

	const key = getEncryptionKey();
	const encoder = new TextEncoder();
	const keyBytes = encoder.encode(key);

	const base64 = encryptedData.slice(7); // Remove 'ENC_V2_' prefix
	const binaryString = atob(base64);

	// Convert binary string back to bytes
	const encodedBytes = new Uint8Array(binaryString.length);
	for (let i = 0; i < binaryString.length; i++) {
		encodedBytes[i] = binaryString.charCodeAt(i);
	}

	// Reverse the XOR encoding
	const resultBytes = new Uint8Array(encodedBytes.length);
	for (let i = 0; i < encodedBytes.length; i++) {
		resultBytes[i] = encodedBytes[i] ^ keyBytes[i % keyBytes.length];
	}

	// Convert bytes back to string
	const decoder = new TextDecoder();
	return decoder.decode(resultBytes);
}

/**
 * Create a deterministic hash for searchable encrypted data
 * Uses a simple hash function that works synchronously in V8
 */
export function hashData(data: string): string {
	const salt = getHashSalt();
	const input = data + salt;

	// djb2 hash algorithm - simple but has known collision risks
	// For production, consider using a proper cryptographic hash
	let hash = 5381;
	for (let i = 0; i < input.length; i++) {
		hash = (hash << 5) + hash + input.charCodeAt(i);
		hash = hash & hash; // Convert to 32-bit integer
	}

	// Convert to hex string with consistent length
	return Math.abs(hash).toString(16).padStart(16, '0');
}

/**
 * Migrate data from V1 to V2 encryption format
 * V1 was simple base64 encoding, V2 uses XOR obfuscation
 */
export function migrateEncryptionV1ToV2(encryptedV1Data: string): string {
	if (!encryptedV1Data.startsWith('ENC_V1_')) {
		throw new Error(
			`Cannot migrate non-V1 data. Expected ENC_V1_ prefix, got: ${encryptedV1Data.substring(0, 7)}`
		);
	}

	// Decrypt V1 (simple base64)
	const encoded = encryptedV1Data.slice(7);
	const plaintext = atob(encoded);

	// Re-encrypt with V2
	return encryptSensitiveData(plaintext);
}

/**
 * IMPORTANT SECURITY NOTICE:
 *
 * This implementation provides only basic obfuscation, NOT cryptographic security.
 * It's suitable for development and preventing casual data exposure, but should
 * NOT be relied upon for:
 * - Compliance with data protection regulations (GDPR, HIPAA, etc.)
 * - Protection against determined attackers
 * - Storage of highly sensitive data (SSNs, credit cards, etc.)
 *
 * For production use with sensitive data, consider:
 * 1. Client-side encryption before sending to Convex
 * 2. Using external encryption services (AWS KMS, HashiCorp Vault)
 * 3. Implementing field-level encryption in your database
 * 4. Using Convex actions with Node.js runtime for proper crypto
 *
 * The current implementation is synchronous and works within Convex's
 * mutation/query constraints while providing basic data obfuscation.
 */
