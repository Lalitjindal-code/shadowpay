import { Connection } from "@solana/web3.js";

export function getShadowPayConnection() {
  const url = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_SOLANA_RPC_URL is not defined");
  }
  return new Connection(url, "confirmed");
}
