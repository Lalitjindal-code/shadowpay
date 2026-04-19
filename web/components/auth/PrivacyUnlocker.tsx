"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, ShieldCheck, Fingerprint, Loader2 } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { deriveArciumKeyFromSignature, getArciumPublicKey } from "../../lib/arcium/utils";
import { usePrivacyStore } from "../../store/usePrivacyStore";
import { toast } from "react-hot-toast";

export function PrivacyUnlocker() {
  const { signMessage, publicKey } = useWallet();
  const { setSession, isUnlocked } = usePrivacyStore();
  const [isUnlocking, setIsUnlocking] = useState(false);

  const handleUnlock = async () => {
    if (!signMessage || !publicKey) {
      toast.error("Wallet not fully connected");
      return;
    }

    setIsUnlocking(true);
    try {
      const message = new TextEncoder().encode(
        `Authorize ShadowPay Privacy Session\n\nWallet: ${publicKey.toBase58()}\nTimestamp: ${Date.now()}`
      );
      const signature = await signMessage(message);
      
      const privKey = await deriveArciumKeyFromSignature(signature);
      const pubKey = getArciumPublicKey(privKey);
      
      setSession(privKey, pubKey);
      toast.success("Privacy session unlocked!");
    } catch (e: any) {
      console.error("Unlock failed", e);
      toast.error(e.message || "Failed to unlock session");
    } finally {
      setIsUnlocking(false);
    }
  };

  if (isUnlocked) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-8 text-center rounded-3xl border border-purple-500/20 bg-purple-500/5 backdrop-blur-xl"
    >
      <div className="h-16 w-16 bg-purple-500/10 text-purple-400 rounded-full flex items-center justify-center mb-4">
        <Fingerprint size={32} />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">Privacy Session Locked</h3>
      <p className="text-sm text-white/50 max-w-xs mb-6">
        Sign a secure message to derive your local encryption keys. This never leaves your browser.
      </p>
      
      <button
        onClick={handleUnlock}
        disabled={isUnlocking}
        className="flex items-center gap-2 rounded-xl bg-purple-600 px-8 py-3 text-sm font-bold text-white hover:bg-purple-500 transition-all active:scale-95 disabled:opacity-50"
      >
        {isUnlocking ? (
          <>
            <Loader2 className="animate-spin" size={18} />
            <span>Unlocking...</span>
          </>
        ) : (
          <>
            <ShieldCheck size={18} />
            <span>Unlock Privacy</span>
          </>
        )}
      </button>
    </motion.div>
  );
}
