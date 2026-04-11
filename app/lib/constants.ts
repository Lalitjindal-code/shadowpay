
import { PublicKey } from "@solana/web3.js";

// Solana Program Constants
export const SHADOWPAY_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_SHADOWPAY_PROGRAM_ID || "11111111111111111111111111111111"
);

// Token mint addresses
export const USDC_MINT_DEVNET = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");
export const USDC_MINT_MAINNET = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");

export const USDC_MINT =
  process.env.NEXT_PUBLIC_SOLANA_NETWORK === "mainnet-beta"
    ? USDC_MINT_MAINNET
    : USDC_MINT_DEVNET;

// PDA Seeds Strings
export const SEED_USER_PROFILE = "user_profile";
export const SEED_PAYMENT_RECORD = "payment_record";
export const SEED_PAYMENT_REQUEST = "payment_request";
