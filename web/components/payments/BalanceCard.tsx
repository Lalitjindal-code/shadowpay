"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Lock, Unlock, TrendingUp, ShieldCheck } from "lucide-react";
import { useBalance } from "../../hooks/useBalance";
import { usePrivacyStore } from "../../store/usePrivacyStore";
import { PublicKey } from "@solana/web3.js";

interface BalanceCardProps {
  walletAddress: string;
}

export function BalanceCard({ walletAddress }: BalanceCardProps) {
  const [showBalance, setShowBalance] = useState(false);
  const { arciumPrivateKey, isUnlocked } = usePrivacyStore();
  const { data: balance, isLoading } = useBalance(
    walletAddress ? new PublicKey(walletAddress) : null,
    showBalance ? arciumPrivateKey || undefined : undefined
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-black p-8 shadow-2xl"
    >
      {/* Background Decor */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-purple-600/20 blur-[100px]" />
      <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-blue-600/10 blur-[100px]" />

      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-white/50">
            <ShieldCheck size={16} className="text-purple-400" />
            <span>Private Balance</span>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-white/5 px-3 py-1 text-[10px] uppercase tracking-wider text-white/30 border border-white/5">
            USDC — Solana
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between">
            <AnimatePresence mode="wait">
              {showBalance && isUnlocked ? (
                <motion.h2
                  key="visible"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-5xl font-bold tracking-tight text-white font-mono"
                >
                  {isLoading ? (
                    <span className="opacity-20">••••••</span>
                  ) : (
                    `$${balance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  )}
                </motion.h2>
              ) : (
                <motion.h2
                  key="hidden"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-5xl font-bold tracking-tight text-white/20 font-mono"
                >
                  $ ••••••
                </motion.h2>
              )}
            </AnimatePresence>

            <button
              onClick={() => setShowBalance(!showBalance)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-all border border-white/10"
            >
              {showBalance ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-green-400/80">
            <TrendingUp size={12} />
            <span>+0.00% (Last 24h)</span>
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <button className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-black hover:bg-white/90 transition-all active:scale-95">
            <Unlock size={16} />
            Add Funds
          </button>
          <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white hover:bg-white/10 transition-all active:scale-95">
            <Lock size={16} />
            Withdraw
          </button>
        </div>
      </div>
    </motion.div>
  );
}
