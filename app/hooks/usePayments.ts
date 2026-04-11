import { useQuery } from "@tanstack/react-query";
import { useAnchorProgram } from "./useAnchorProgram";
import { useWallet } from "@solana/wallet-adapter-react";
import { decryptAmount, decryptMemo } from "../lib/arcium/decrypt";

export function usePayments() {
  const { program } = useAnchorProgram();
  const { publicKey } = useWallet();

  return useQuery({
    queryKey: ["payments", publicKey?.toBase58()],
    queryFn: async () => {
      if (!program || !publicKey) return [];

      // Fetch payment records where user is either sender or recipient
      // @ts-expect-error IDL type bypass
      const records = await program.account.paymentRecord.all([
        {
          memcmp: {
            offset: 8, // Sender pubkey offset
            bytes: publicKey.toBase58(),
          },
        },
      ]);
      
      // @ts-expect-error IDL type bypass
      const receivedRecords = await program.account.paymentRecord.all([
        {
          memcmp: {
            offset: 8 + 32, // Recipient pubkey offset
            bytes: publicKey.toBase58(),
          },
        },
      ]);

      const allRecords = [...records, ...receivedRecords];
      
      // Decrypt data simultaneously
      return Promise.all(allRecords.map(async (record) => {
        const amount = await decryptAmount(new Uint8Array(record.account.encryptedAmount));
        const memo = await decryptMemo(new Uint8Array(record.account.encryptedMemo));
        
        return {
          publicKey: record.publicKey.toBase58(),
          sender: record.account.sender.toBase58(),
          recipient: record.account.recipient.toBase58(),
          amount,
          memo,
          timestamp: record.account.timestamp.toNumber() * 1000,
          isSent: record.account.sender.equals(publicKey),
        };
      })).then(list => list.sort((a, b) => b.timestamp - a.timestamp));
    },
    enabled: !!program && !!publicKey,
  });
}
