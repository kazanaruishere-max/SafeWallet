import { createHash } from "crypto";

/**
 * Proof-of-Integrity (PoI) System — Immutable Audit Trail
 * v2 Update: SHA-256 hashing for every financial scan.
 * NOTE: This currently uses a centralized hashing log for integrity verification.
 * In production, these hashes should be anchored to a public ledger (e.g., Polygon/Ethereum).
 */

export interface BlockchainRecord {
  tx_id: string;
  hash: string;
  timestamp: string;
  metadata: Record<string, unknown>;
}

/**
 * Generates a SHA-256 hash of the scan result for integrity verification.
 * This hash can be compared against the stored database record to ensure no tampering.
 */
export function generateIntegrityHash(data: unknown): string {
  const serialized = JSON.stringify(data);
  return createHash("sha256").update(serialized).digest("hex");
}

/**
 * Simulates a blockchain transaction for "Immutable Audit Trail"
 * In a real-world scenario, this would interact with a smart contract on Polygon or similar.
 */
export async function recordOnBlockchain(
  userId: string,
  scanHash: string,
  metadata: Record<string, unknown>
): Promise<BlockchainRecord> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 500));

  const txId = `0x${createHash("sha1").update(userId + scanHash + Date.now()).digest("hex")}`;
  
  const record: BlockchainRecord = {
    tx_id: txId,
    hash: scanHash,
    timestamp: new Date().toISOString(),
    metadata,
  };

  console.log(`[Blockchain] Integrity proof recorded: ${txId}`);
  
  return record;
}

/**
 * Verifies if the current scan data matches its recorded blockchain hash.
 */
export function verifyIntegrity(data: unknown, recordedHash: string): boolean {
  const currentHash = generateIntegrityHash(data);
  return currentHash === recordedHash;
}
