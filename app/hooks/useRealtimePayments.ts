import { useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { subscribeToPayments } from "../lib/realtime/firebase";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useRealtimePayments() {
  const { publicKey } = useWallet();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!publicKey) return;

    const unsubscribe = subscribeToPayments(publicKey.toBase58(), (data) => {
      // Invalidate queries so history updates automatically
      queryClient.invalidateQueries({ queryKey: ["payments", publicKey.toBase58()] });
      
      // Avoid notifying sender of their own actions right now
      if (data && data.sender !== publicKey.toBase58()) {
        toast.info(`New payment received: ${data.amount ? data.amount + " USDC" : "Encrypted USDC"}`);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [publicKey, queryClient]);
}
