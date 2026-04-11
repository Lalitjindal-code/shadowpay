import { useState, useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { USDC_MINT } from "../lib/constants";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { useAppStore } from "../store/useAppStore";

export function useBalance() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const setBalanceUSDC = useAppStore((state) => state.setBalanceUSDC);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!publicKey) return;

    let subscriptionId: number;

    const fetchBalance = async () => {
      try {
        setLoading(true);
        const ata = await getAssociatedTokenAddress(USDC_MINT, publicKey);
        const balance = await connection.getTokenAccountBalance(ata);
        const val = balance.value.uiAmount || 0;
        setBalanceUSDC(val);
      } catch (err) {
        // ATA might not exist yet if user has no USDC
        setBalanceUSDC(0);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();

    const fetchAta = async () => {
      const ata = await getAssociatedTokenAddress(USDC_MINT, publicKey);
      subscriptionId = connection.onAccountChange(ata, () => {
        // Refresh balance on incoming changes
        fetchBalance();
      });
    };
    
    fetchAta();

    return () => {
      if (subscriptionId !== undefined) {
        connection.removeAccountChangeListener(subscriptionId);
      }
    };
  }, [publicKey, connection, setBalanceUSDC]);

  return { loading };
}
