import { PublicKey } from "@solana/web3.js";
import { SHADOWPAY_PROGRAM_ID, SEED_USER_PROFILE, SEED_PAYMENT_RECORD, SEED_PAYMENT_REQUEST } from "../constants";

export function getUserProfilePDA(owner: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEED_USER_PROFILE), owner.toBuffer()],
    SHADOWPAY_PROGRAM_ID
  );
}

export function getPaymentRecordPDA(sender: PublicKey, paymentIndex: number): [PublicKey, number] {
  // Convert 64-bit uint (8 bytes format) little endian
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64LE(BigInt(paymentIndex), 0);
  
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEED_PAYMENT_RECORD), sender.toBuffer(), buffer],
    SHADOWPAY_PROGRAM_ID
  );
}

export function getPaymentRequestPDA(requestor: PublicKey, requestIdBytes: Uint8Array): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEED_PAYMENT_REQUEST), requestor.toBuffer(), requestIdBytes],
    SHADOWPAY_PROGRAM_ID
  );
}
