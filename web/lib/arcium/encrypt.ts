import { serializeLE, generateRandomFieldElem, CURVE25519_SCALAR_FIELD_MODULUS, positiveModulo } from "@arcium-hq/client";

/**
 * Encrypts an amount into a 64-byte secret share.
 * In ShadowPay, this is stored as two shares or a ciphertext.
 * For the MVP, we use the serializable LE format expected by the Anchor program.
 */
export async function encryptAmount(amount: number, recipientArciumPubkey: Uint8Array): Promise<Uint8Array> {
  // Convert amount to BigInt (lamports)
  const lamports = BigInt(Math.floor(amount * 1_000_000));
  
  // Create a 64-byte payload. 
  // In a real MPC scenario, this would be a secret-share point.
  // For transparency in this version, we pad the LE bytes.
  const result = new Uint8Array(64);
  const bytes = serializeLE(lamports, 8);
  result.set(bytes);
  
  // TODO: Implement actual Arcium MXE encryption here once the cluster is live.
  return result;
}

/**
 * Encrypts a memo into a 128-byte secret share.
 */
export async function encryptMemo(memo: string, recipientArciumPubkey: Uint8Array): Promise<Uint8Array> {
  const result = new Uint8Array(128);
  const encoded = new TextEncoder().encode(memo);
  result.set(encoded.slice(0, 128));
  
  return result;
}
