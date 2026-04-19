import { useQuery } from "@tanstack/react-query";
import { PublicKey } from "@solana/web3.js";
import { useAnchorProgram } from "./useAnchorProgram";

export interface PaymentRecord {
  signature: string;
  sender: PublicKey;
  recipient: PublicKey;
  encryptedAmount: Uint8Array;
  encryptedMemo: Uint8Array;
  timestamp: number;
  type: "sent" | "received";
}

export function usePayments(walletAddress: PublicKey | null) {
  const { program, isReady } = useAnchorProgram();

  return useQuery({
    queryKey: ["payments", walletAddress?.toString()],
    queryFn: async (): Promise<PaymentRecord[]> => {
      if (!walletAddress || !program) return [];

      // Fetch all PaymentRecord accounts where this wallet is sender
      const sent = await program.account.paymentRecord.all([
        {
          memcmp: {
            offset: 8, // Discriminator
            bytes: walletAddress.toBase58(),
          },
        },
      ]);

      // Fetch all PaymentRecord accounts where this wallet is recipient
      const received = await program.account.paymentRecord.all([
        {
          memcmp: {
            offset: 8 + 32, // Discriminator + Sender pubkey
            bytes: walletAddress.toBase58(),
          },
        },
      ]);

      const allPayments: PaymentRecord[] = [
        ...sent.map((p: any) => ({
          signature: p.publicKey.toString(),
          sender: p.account.sender,
          recipient: p.account.recipient,
          encryptedAmount: new Uint8Array(p.account.encryptedAmount),
          encryptedMemo: new Uint8Array(p.account.encryptedMemo),
          timestamp: p.account.timestamp.toNumber(),
          type: "sent" as const,
        })),
        ...received.map((p: any) => ({
          signature: p.publicKey.toString(),
          sender: p.account.sender,
          recipient: p.account.recipient,
          encryptedAmount: new Uint8Array(p.account.encryptedAmount),
          encryptedMemo: new Uint8Array(p.account.encryptedMemo),
          timestamp: p.account.timestamp.toNumber(),
          type: "received" as const,
        })),
      ];

      return allPayments.sort((a, b) => b.timestamp - a.timestamp);
    },
    enabled: isReady && !!walletAddress,
  });
}
