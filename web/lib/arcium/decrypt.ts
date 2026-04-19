import { deserializeLE } from "@arcium-hq/client";

/**
 * Decrypts a 64-byte secret share into an amount.
 */
export async function decryptAmount(ciphertext: Uint8Array, userPrivateKey: Uint8Array): Promise<number> {
  try {
    // Deserialize the first 8 bytes (lamports)
    const lamports = deserializeLE(ciphertext.slice(0, 8));
    return Number(lamports) / 1_000_000;
  } catch (error) {
    console.error("Decryption failed:", error);
    return 0;
  }
}

/**
 * Decrypts a 128-byte secret share into a memo string.
 */
export async function decryptMemo(ciphertext: Uint8Array, userPrivateKey: Uint8Array): Promise<string> {
  try {
    const end = ciphertext.indexOf(0);
    const slice = end === -1 ? ciphertext : ciphertext.slice(0, end);
    return new TextDecoder().decode(slice);
  } catch (error) {
    console.error("Memo decryption failed:", error);
    return "";
  }
}

export const decryptBalance = decryptAmount;
