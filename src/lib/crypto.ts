// AES Encryption/Decryption utilities for secure cookie storage

const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_COOKIE_SECRET || 'mkt-platform-secret-key-2024!@#$';

// Convert string to ArrayBuffer
function stringToArrayBuffer(str: string): ArrayBuffer {
  const encoder = new TextEncoder();
  return encoder.encode(str).buffer as ArrayBuffer;
}

// Convert ArrayBuffer to string
function arrayBufferToString(buffer: ArrayBuffer): string {
  const decoder = new TextDecoder();
  return decoder.decode(buffer);
}

// Convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert Base64 to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Generate a consistent key from the secret
async function getKey(): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    stringToArrayBuffer(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)),
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
  return keyMaterial;
}

// Encrypt data using AES-GCM
export async function encrypt(data: string): Promise<string> {
  try {
    const key = await getKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encodedData = stringToArrayBuffer(data);

    const encryptedData = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encodedData
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encryptedData.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encryptedData), iv.length);

    return arrayBufferToBase64(combined.buffer);
  } catch (error) {
    console.error('Encryption error:', error);
    // Fallback to base64 encoding if encryption fails
    return btoa(data);
  }
}

// Decrypt data using AES-GCM
export async function decrypt(encryptedData: string): Promise<string> {
  try {
    const key = await getKey();
    const combined = new Uint8Array(base64ToArrayBuffer(encryptedData));

    // Extract IV and data
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    const decryptedData = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );

    return arrayBufferToString(decryptedData);
  } catch (error) {
    console.error('Decryption error:', error);
    // Fallback: try base64 decoding
    try {
      return atob(encryptedData);
    } catch {
      throw new Error('Failed to decrypt data');
    }
  }
}

// Server-side encryption (Node.js)
export function encryptServer(data: string): string {
  try {
    const crypto = require('crypto');
    const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32), 'utf-8');
    const iv = crypto.randomBytes(12);

    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    let encrypted = cipher.update(data, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    const authTag = cipher.getAuthTag();

    // Combine IV + encrypted data + auth tag
    const combined = Buffer.concat([iv, encrypted, authTag]);
    return combined.toString('base64');
  } catch (error) {
    console.error('Server encryption error:', error);
    // Fallback to base64 encoding
    return Buffer.from(data).toString('base64');
  }
}

// Server-side decryption (Node.js)
export function decryptServer(encryptedData: string): string {
  try {
    const crypto = require('crypto');
    const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32), 'utf-8');
    const combined = Buffer.from(encryptedData, 'base64');

    const iv = combined.subarray(0, 12);
    const data = combined.subarray(12, combined.length - 16);
    const authTag = combined.subarray(combined.length - 16);

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(data, undefined, 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Server decryption error:', error);
    // Fallback: try base64 decoding
    try {
      return Buffer.from(encryptedData, 'base64').toString('utf-8');
    } catch {
      throw new Error('Failed to decrypt data');
    }
  }
}

// Cookie names (exported for consistency)
export const COOKIE_NAMES = {
  ACCESS_TOKEN: '_mkt_sid',
  REFRESH_TOKEN: '_mkt_rid',
};
