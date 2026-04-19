"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Lock, 
  Unlock, 
  Clock, 
  MoreVertical,
  ExternalLink
} from "lucide-react";
import { usePayments, PaymentRecord } from "../../hooks/usePayments";
import { usePrivacyStore } from "../../store/usePrivacyStore";
import { decryptAmount, decryptMemo } from "../../lib/arcium/decrypt";
import { formatDistanceToNow } from "date-fns";

export function ActivityFeed({ walletAddress }: { walletAddress: string }) {
  const { data: payments, isLoading } = usePayments(
    walletAddress ? new PublicKey(walletAddress) : null
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!payments || payments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-white/10 rounded-3xl">
        <Clock className="text-white/10 mb-4" size={48} />
        <p className="text-white/30 text-sm">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {payments.map((p) => (
        <PaymentItem key={p.signature} payment={p} />
      ))}
    </div>
  );
}

function PaymentItem({ payment }: { payment: PaymentRecord }) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [decryptedData, setDecryptedData] = useState<{ amount: number; memo: string } | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  
  const { arciumPrivateKey, isUnlocked } = usePrivacyStore();

  const handleReveal = async () => {
    if (isRevealed) {
      setIsRevealed(false);
      return;
    }

    if (!isUnlocked || !arciumPrivateKey) {
      toast.error("Privacy session not unlocked");
      return;
    }

    setIsDecrypting(true);
    try {
      const amount = await decryptAmount(payment.encryptedAmount, arciumPrivateKey);
      const memo = await decryptMemo(payment.encryptedMemo, arciumPrivateKey);
      setDecryptedData({ amount, memo });
      setIsRevealed(true);
    } catch (e) {
      toast.error("Decryption failed");
    } finally {
      setIsDecrypting(false);
    }
  };

  const isSent = payment.type === "sent";
  const partner = isSent ? payment.recipient : payment.sender;

  return (
    <div className="group relative flex items-center justify-between p-4 rounded-2xl bg-white/2 border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all">
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-xl ${isSent ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"}`}>
          {isSent ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
        </div>
        
        <div className="flex flex-col">
          <p className="text-sm font-bold text-white flex items-center gap-2">
            {isSent ? "Sent to" : "Received from"}
            <span className="text-purple-400 font-mono text-xs">
              {partner.toBase58().slice(0, 4)}...{partner.toBase58().slice(-4)}
            </span>
          </p>
          <p className="text-[10px] text-white/30">
            {formatDistanceToNow(payment.timestamp * 1000, { addSuffix: true })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <AnimatePresence mode="wait">
            {isRevealed && decryptedData ? (
              <motion.p
                initial={{ opacity: 0, filter: "blur(4px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                className={`text-sm font-bold font-mono ${isSent ? "text-red-400" : "text-green-400"}`}
              >
                {isSent ? "-" : "+"}${decryptedData.amount.toFixed(2)}
              </motion.p>
            ) : (
              <p className="text-sm font-bold text-white/20 font-mono italic">$ ••••••</p>
            )}
          </AnimatePresence>
          {isRevealed && decryptedData?.memo && (
            <p className="text-[10px] text-white/40 italic">{decryptedData.memo}</p>
          )}
        </div>

        <button
          onClick={handleReveal}
          disabled={isDecrypting}
          className={`p-2 rounded-lg transition-colors ${
            isRevealed 
              ? "bg-purple-500/20 text-purple-400" 
              : "bg-white/5 text-white/20 hover:text-white"
          }`}
        >
          {isDecrypting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : isRevealed ? (
            <Unlock size={16} />
          ) : (
            <Lock size={16} />
          )}
        </button>
      </div>
    </div>
  );
}

// Add these imports to usePayments if not present
import { getShadowPayProgram } from "../../lib/solana/program";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { PublicKey } from "@solana/web3.js";
