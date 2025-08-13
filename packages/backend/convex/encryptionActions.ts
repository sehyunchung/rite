"use node";

import { action } from './_generated/server';
import { v } from 'convex/values';
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
  if (keyBuffer.length !== KEY_LENGTH) {
    throw new Error(`Encryption key must be exactly ${KEY_LENGTH} bytes`);
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
 */
export const encrypt = action({
  args: {
    data: v.string(),
  },
  handler: async (ctx, args) => {
    const key = getEncryptionKey();
    const iv = randomBytes(IV_LENGTH);
    
    const cipher = createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(args.data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Combine IV + encrypted data + auth tag
    const combined = Buffer.concat([
      iv,
      Buffer.from(encrypted, 'hex'),
      authTag
    ]);
    
    return combined.toString('base64');
  },
});

/**
 * Decrypt sensitive data using AES-256-GCM
 */
export const decrypt = action({
  args: {
    encryptedData: v.string(),
  },
  handler: async (ctx, args) => {
    const key = getEncryptionKey();
    const combined = Buffer.from(args.encryptedData, 'base64');
    
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
  },
});

/**
 * Create a deterministic hash for searchable encrypted data
 */
export const hash = action({
  args: {
    data: v.string(),
  },
  handler: async (ctx, args) => {
    const salt = getHashSalt();
    const hash = createHash('sha256');
    hash.update(args.data + salt);
    return hash.digest('hex');
  },
});

/**
 * Batch encrypt multiple pieces of data
 */
export const encryptBatch = action({
  args: {
    data: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const key = getEncryptionKey();
    const results: string[] = [];
    
    for (const item of args.data) {
      const iv = randomBytes(IV_LENGTH);
      const cipher = createCipheriv(ALGORITHM, key, iv);
      
      let encrypted = cipher.update(item, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const authTag = cipher.getAuthTag();
      
      const combined = Buffer.concat([
        iv,
        Buffer.from(encrypted, 'hex'),
        authTag
      ]);
      
      results.push(combined.toString('base64'));
    }
    
    return results;
  },
});

/**
 * Batch hash multiple pieces of data
 */
export const hashBatch = action({
  args: {
    data: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const salt = getHashSalt();
    const results: string[] = [];
    
    for (const item of args.data) {
      const hash = createHash('sha256');
      hash.update(item + salt);
      results.push(hash.digest('hex'));
    }
    
    return results;
  },
});