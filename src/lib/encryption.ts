import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

/**
 * Advanced Encryption Standard (AES-256-GCM) Utility
 * Used for encrypting sensitive financial data before storage.
 */

const ALGORITHM = "aes-256-gcm";
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "fallback-secret-key-at-least-32-chars"; // Must be 32 bytes
const IV_LENGTH = 16;
const SALT_LENGTH = 64;

/**
 * Encrypts text using AES-256-GCM
 */
export function encrypt(text: string): string {
  const iv = randomBytes(IV_LENGTH);
  const salt = randomBytes(SALT_LENGTH);
  
  // Derive key from ENCRYPTION_KEY and salt
  const key = scryptSync(ENCRYPTION_KEY, salt, 32);
  
  const cipher = createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  const authTag = cipher.getAuthTag().toString("hex");
  
  // Format: salt:iv:authTag:encryptedData
  return `${salt.toString("hex")}:${iv.toString("hex")}:${authTag}:${encrypted}`;
}

/**
 * Decrypts text using AES-256-GCM
 */
export function decrypt(encryptedData: string): string {
  const [saltHex, ivHex, authTagHex, encryptedHex] = encryptedData.split(":");
  
  if (!saltHex || !ivHex || !authTagHex || !encryptedHex) {
    throw new Error("Invalid encrypted data format");
  }
  
  const salt = Buffer.from(saltHex, "hex");
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const encrypted = Buffer.from(encryptedHex, "hex");
  
  const key = scryptSync(ENCRYPTION_KEY, salt, 32);
  
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, undefined, "utf8");
  decrypted += decipher.final("utf8");
  
  return decrypted;
}
