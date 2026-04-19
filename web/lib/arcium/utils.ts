import { ed25519 } from "@noble/curves/ed25519";
import { sha256 } from "@noble/hashes/sha256";

/**
 * Derives a deterministic 32-byte Arcium private key from a Solana wallet signature.
 * For MVP: Prompt user to sign a message like "Authorize ShadowPay Privacy".
 */
export async function deriveArciumKeyFromSignature(signature: Uint8Array): Promise<Uint8Array> {
  // Hash the signature to get a consistent 32-byte key
  return sha256(signature);
}

/**
 * Derives the corresponding public key for Arcium MPC.
 */
export function getArciumPublicKey(privateKey: Uint8Array): Uint8Array {
  return ed25519.getPublicKey(privateKey);
}
