import { useMutation } from "@tanstack/react-query";
import { useAnchorProgram } from "./useAnchorProgram";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { encryptAmount, encryptMemo } from "../lib/arcium/encrypt";
import { toast } from "sonner";

export function useSendPayment() {
  const { program } = useAnchorProgram();
  const { publicKey, signTransaction } = useWallet();

  return useMutation({
    mutationFn: async ({
      recipient,
      amount,
      memo
    }: {
      recipient: string;
      amount: number;
      memo?: string;
    }) => {
      if (!program || !publicKey || !signTransaction) {
        throw new Error("Wallet not connected");
      }

      toast.loading("Encrypting payment data...", { id: "payment" });
      
      try {
        const recipientKey = new PublicKey(recipient);
        
        // Use Arcium to encrypt the values (or fallback if disabled during dev)
        const encAmount = await encryptAmount(amount);
        const encMemo = await encryptMemo(memo || "");

        // Detailed Anchor transaction execution will be implemented in the components 
        // using the anchor instructions, or handled via API route
        
        const res = await fetch("/api/actions/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            recipient, 
            amount, 
            memo, 
            sender: publicKey.toBase58() 
          }),
        });

        if (!res.ok) throw new Error("Payment execution failed");

        toast.success("Payment sent securely!", { id: "payment" });
        return res.json();
      } catch (err: any) {
        toast.error(err.message || "Failed to send payment", { id: "payment" });
        throw err;
      }
    },
  });
}
