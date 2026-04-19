"use client";

import { useAppStore } from "@/store/useAppStore";
import { motion } from "framer-motion";
import { Wallet, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useBalance } from "@/hooks/useBalance";

export default function BalanceDisplay() {
  const balanceUSDC = useAppStore((state) => state.balanceUSDC);
  const { loading } = useBalance();
  const [hideBalance, setHideBalance] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl p-8 border border-white/5 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-xl shadow-2xl"
    >
      <div className="absolute top-0 right-0 p-32 bg-primary/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
      
      <div className="relative z-10 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center space-x-2 text-zinc-400">
            <Wallet className="w-5 h-5 text-zinc-300" />
            <span className="font-medium tracking-wide text-sm uppercase">Total Balance</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-zinc-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            onClick={() => setHideBalance(!hideBalance)}
          >
            {hideBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        </div>

        <div>
          <motion.div 
            key={hideBalance ? "hidden" : "visible"}
            initial={{ opacity: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            className="flex items-baseline space-x-2"
          >
            <span className="text-6xl font-light tracking-tight text-white">
              {loading ? "..." : (hideBalance ? "****" : balanceUSDC?.toFixed(2) || "0.00")}
            </span>
            <span className="text-xl font-medium text-zinc-500">USDC</span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
