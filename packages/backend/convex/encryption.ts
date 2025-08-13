import { createHash, createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

/**
 * Get encryption key from environment variables
 */
function getEncryptionKey(): Buffer {
  const key = process.env.CONVEX_ENCRYPTION_KEY;
  if (!key) {
    throw new Error('Encryption key not configured');
  }
  
  // Ensure key is exactly 32 bytes for AES-256
  const keyBuffer = Buffer.from(key, 'utf8');
  if (keyBuffer.length < KEY_LENGTH) {
    // Pad key if too short
    const paddedKey = Buffer.alloc(KEY_LENGTH);
    keyBuffer.copy(paddedKey);
    return paddedKey;
  } else if (keyBuffer.length > KEY_LENGTH) {
    // Truncate key if too long
    return keyBuffer.subarray(0, KEY_LENGTH);
  }
  
  return keyBuffer;
}

/**
 * Get hash salt from environment variables
 */
function getHashSalt(): string {
  const salt = process.env.CONVEX_HASH_SALT;
  if (!salt) {
    throw new Error('Hash salt not configured');
  }
  return salt;
}

/**
 * Encrypt sensitive data using AES-256-GCM
 * @param data - The sensitive data to encrypt
 * @returns Base64 encoded encrypted data (IV + encrypted data + auth tag)
 */
export function encryptSensitiveData(data: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  
  const cipher = createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // Combine IV + encrypted data + auth tag
  const combined = Buffer.concat([
    iv,
    Buffer.from(encrypted, 'hex'),
    authTag
  ]);
  
  return combined.toString('base64');
}

/**
 * Decrypt sensitive data using AES-256-GCM
 * @param encryptedData - Base64 encoded encrypted data
 * @returns Decrypted original data
 */
export function decryptSensitiveData(encryptedData: string): string {
  const key = getEncryptionKey();
  const combined = Buffer.from(encryptedData, 'base64');
  
  if (combined.length < IV_LENGTH + TAG_LENGTH) {
    throw new Error('Invalid encrypted data format');
  }
  
  // Extract components
  const iv = combined.subarray(0, IV_LENGTH);
  const authTag = combined.subarray(-TAG_LENGTH);
  const encrypted = combined.subarray(IV_LENGTH, -TAG_LENGTH);
  
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, undefined, 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Create a deterministic hash for searchable encrypted data
 * @param data - The data to hash
 * @returns SHA-256 hash as hex string
 */
export function hashData(data: string): string {
  const salt = getHashSalt();
  const hash = createHash('sha256');
  hash.update(data + salt);
  return hash.digest('hex');
}