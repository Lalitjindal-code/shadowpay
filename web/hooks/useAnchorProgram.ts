import { useMemo } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { AnchorProvider } from "@coral-xyz/anchor";
import { getShadowPayProgram } from "../lib/solana/program";

export function useAnchorProgram() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const provider = useMemo(() => {
    if (!wallet || !wallet.publicKey) return null;
    return new AnchorProvider(connection, wallet as any, {
      preflightCommitment: "confirmed",
    });
  }, [connection, wallet]);

  const program = useMemo(() => {
    if (!provider) return null;
    return getShadowPayProgram(provider);
  }, [provider]);

  return { program, provider, isReady: !!program };
}
