import { useQuery } from "@tanstack/react-query";
import { PublicKey } from "@solana/web3.js";
import { useAnchorProgram } from "./useAnchorProgram";
import { getUserProfilePDA } from "../lib/solana/pdas";

export function useBalance(walletAddress: PublicKey | null, arciumPrivateKey?: Uint8Array) {
  const { program, isReady } = useAnchorProgram();

  return useQuery({
    queryKey: ["balance", walletAddress?.toString(), !!arciumPrivateKey],
    queryFn: async () => {
      if (!walletAddress || !program) return 0;

      const [profilePDA] = getUserProfilePDA(walletAddress);

      try {
        const profile: any = await program.account.userProfile.fetch(profilePDA);
        
        if (!arciumPrivateKey) {
          // If no private key provided, we return null to signal "Locked/Encrypted"
          return null;
        }

        const res = await fetch("/api/arcium/decrypt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ciphertext: Buffer.from(profile.encryptedBalance).toString("base64"),
            privateKey: Buffer.from(arciumPrivateKey).toString("base64"),
            type: "amount",
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        const balance = data.result;
        
        return balance;
      } catch (e) {
        // Account doesn't exist yet, return 0
        return 0;
      }
    },
    enabled: isReady && !!walletAddress,
    refetchInterval: 30000, // Sync every 30s
  });
}
