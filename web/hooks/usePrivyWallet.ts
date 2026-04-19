import { useWallets } from "@privy-io/react-auth";
import { useEffect, useState } from "react";

export function usePrivyWallet() {
  const { wallets } = useWallets();
  const [solanaWallet, setSolanaWallet] = useState<any | null>(null);

  useEffect(() => {
    // Find the first Solana wallet provided by Privy
    // @ts-ignore - Privy wallet interface may vary based on exact version, safely looking for solana
    const solanaOnly = wallets.find((w) => w.walletClientType === "privy" || w.chainType === "solana" || w.address);
    if (solanaOnly) {
      setSolanaWallet(solanaOnly);
    }
  }, [wallets]);

  return { solanaWallet };
}
