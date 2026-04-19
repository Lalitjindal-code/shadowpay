import { useQuery } from "@tanstack/react-query";
import { PublicKey } from "@solana/web3.js";
import { useAnchorProgram } from "./useAnchorProgram";
import { getUserProfilePDA } from "../lib/solana/pdas";
import { decryptBalance } from "../lib/arcium/decrypt";

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

        const balance = await decryptBalance(
          new Uint8Array(profile.encryptedBalance),
          arciumPrivateKey
        );
        
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
