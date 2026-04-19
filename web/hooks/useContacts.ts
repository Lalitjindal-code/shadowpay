import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useWallet } from "@solana/wallet-adapter-react";

export function useContacts() {
  const { publicKey } = useWallet();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["contacts", publicKey?.toBase58()],
    queryFn: async () => {
      if (!publicKey) return [];
      const res = await fetch(`/api/contacts?wallet=${publicKey.toBase58()}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.contacts || [];
    },
    enabled: !!publicKey,
  });

  const addContact = useMutation({
    mutationFn: async ({ contactWallet, nickname }: { contactWallet: string, nickname?: string }) => {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerWallet: publicKey?.toBase58(), contactWallet, nickname }),
      });
      if (!res.ok) throw new Error("Failed to add contact");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts", publicKey?.toBase58()] });
    },
  });

  return { ...query, addContact };
}
