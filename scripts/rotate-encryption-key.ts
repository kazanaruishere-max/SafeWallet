#!/usr/bin/env tsx
/**
 * SafeWallet Encryption Key Rotation Script
 * 
 * CRITICAL: Run this during maintenance window
 * Estimated time: 5-10 minutes per 10,000 records
 * 
 * Usage:
 *   OLD_KEY=xxx NEW_KEY=yyy tsx scripts/rotate-encryption-key.ts
 */

import { createClient } from "@supabase/supabase-js";
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const SALT_LENGTH = 64;

// Decrypt with old key
function decryptWithKey(encryptedData: string, key: string): string {
  const [saltHex, ivHex, authTagHex, encryptedHex] = encryptedData.split(":");
  
  if (!saltHex || !ivHex || !authTagHex || !encryptedHex) {
    throw new Error("Invalid encrypted data format");
  }
  
  const salt = Buffer.from(saltHex, "hex");
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const encrypted = Buffer.from(encryptedHex, "hex");
  
  const derivedKey = scryptSync(key, salt, 32);
  
  const decipher = createDecipheriv(ALGORITHM, derivedKey, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, undefined, "utf8");
  decrypted += decipher.final("utf8");
  
  return decrypted;
}

// Encrypt with new key
function encryptWithKey(text: string, key: string): string {
  const iv = randomBytes(IV_LENGTH);
  const salt = randomBytes(SALT_LENGTH);
  
  const derivedKey = scryptSync(key, salt, 32);
  
  const cipher = createCipheriv(ALGORITHM, derivedKey, iv);
  
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  const authTag = cipher.getAuthTag().toString("hex");
  
  return `${salt.toString("hex")}:${iv.toString("hex")}:${authTag}:${encrypted}`;
}

async function rotateEncryptionKey() {
  const oldKey = process.env.OLD_KEY;
  const newKey = process.env.NEW_KEY;

  
  if (!oldKey || oldKey.length < 32) {
    console.error("❌ OLD_KEY environment variable not set or too short");
    process.exit(1);
  }
  
  if (!newKey || newKey.length < 32) {
    console.error("❌ NEW_KEY environment variable not set or too short");
    process.exit(1);
  }
  
  if (oldKey === newKey) {
    console.error("❌ OLD_KEY and NEW_KEY must be different");
    process.exit(1);
  }
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Supabase credentials not set");
    process.exit(1);
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  console.log("🔄 Starting encryption key rotation...");
  console.log("⏰ Started at:", new Date().toISOString());
  
  // Fetch all encrypted records
  const { data: scans, error } = await supabase
    .from("scans")
    .select("id, encrypted_ocr_text, user_id")
    .not("encrypted_ocr_text", "is", null);
  
  if (error) {
    console.error("❌ Failed to fetch scans:", error);
    process.exit(1);
  }
  
  console.log(`📊 Found ${scans.length} records to re-encrypt`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < scans.length; i++) {
    const scan = scans[i];
    
    try {
      // Decrypt with old key
      const plaintext = decryptWithKey(scan.encrypted_ocr_text, oldKey);
      
      // Encrypt with new key
      const newEncrypted = encryptWithKey(plaintext, newKey);
      
      // Update database
      const { error: updateError } = await supabase
        .from("scans")
        .update({ encrypted_ocr_text: newEncrypted })
        .eq("id", scan.id);
      
      if (updateError) throw updateError;
      
      successCount++;
      
      if ((i + 1) % 100 === 0) {
        console.log(`✅ Progress: ${i + 1}/${scans.length} (${Math.round((i + 1) / scans.length * 100)}%)`);
      }
    } catch (err) {
      failCount++;
      console.error(`❌ Failed to re-encrypt scan ${scan.id}:`, err);
      
      // Log to audit_logs
      await supabase.from("audit_logs").insert({
        user_id: scan.user_id,
        action: "SECURITY_EVENT",
        status: "FAILED",
        request_id: crypto.randomUUID(),
        details: {
          event: "KEY_ROTATION_ERROR",
          scan_id: scan.id,
          error: String(err),
        },
      });
    }
  }
  
  console.log("\n🎉 Rotation complete!");
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log("⏰ Finished at:", new Date().toISOString());
  
  if (failCount > 0) {
    console.warn("\n⚠️  Some records failed to re-encrypt. Check audit_logs table.");
    process.exit(1);
  }
}

rotateEncryptionKey().catch((err) => {
  console.error("💥 Fatal error:", err);
  process.exit(1);
});
