import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { useAnchorProgram } from "./useAnchorProgram";
import { getUserProfilePDA, getPaymentRecordPDA } from "../lib/solana/pdas";
import { encryptAmount, encryptMemo } from "../lib/arcium/encrypt";
import { USDC_MINT } from "../lib/constants";
import { toast } from "react-hot-toast";

export interface SendPaymentParams {
  recipient: PublicKey;
  amount: number;
  memo: string;
}

export function useSendPayment() {
  const { program, provider, isReady } = useAnchorProgram();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ recipient, amount, memo }: SendPaymentParams) => {
      if (!isReady || !program || !provider.wallet.publicKey) {
        throw new Error("Wallet not connected");
      }

      const sender = provider.wallet.publicKey;
      const [senderProfilePDA] = getUserProfilePDA(sender);
      const [recipientProfilePDA] = getUserProfilePDA(recipient);

      // 1. Fetch recipient's profile to get their arcium_pubkey
      const recipientProfile: any = await program.account.userProfile.fetch(recipientProfilePDA);
      const recipientArciumPubkey = new Uint8Array(recipientProfile.arciumPubkey);

      // 2. Fetch sender's profile for the next payment index
      const senderProfile: any = await program.account.userProfile.fetch(senderProfilePDA);
      const paymentIndex = senderProfile.payment_count;

      // 3. Encrypt amount and memo for the recipient
      const encryptedAmount = await encryptAmount(amount, recipientArciumPubkey);
      const encryptedMemo = await encryptMemo(memo, recipientArciumPubkey);

      // 4. Calculate Token Accounts
      const senderTokenAccount = getAssociatedTokenAddressSync(USDC_MINT, sender);
      const recipientTokenAccount = getAssociatedTokenAddressSync(USDC_MINT, recipient);

      const [paymentRecordPDA] = getPaymentRecordPDA(sender, Number(paymentIndex));

      // 5. Execute instruction
      const tx = await program.methods
        .sendPayment(
          BigInt(Math.floor(amount * 1_000_000)), // plaintext amount for SPL transfer
          Array.from(encryptedAmount),
          Array.from(encryptedMemo)
        )
        .accounts({
          sender,
          senderProfile: senderProfilePDA,
          recipient,
          recipientProfile: recipientProfilePDA,
          senderTokenAccount,
          recipientTokenAccount,
          paymentRecord: paymentRecordPDA,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      return tx;
    },
    onSuccess: (signature) => {
      toast.success("Payment sent privately!");
      queryClient.invalidateQueries({ queryKey: ["balance"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
    onError: (error: any) => {
      console.error("Payment failed:", error);
      toast.error(`Payment failed: ${error.message}`);
    },
  });
}
