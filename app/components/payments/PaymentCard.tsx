"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft, Lock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export interface PaymentCardProps {
  amount: number;
  memo: string;
  timestamp: number;
  isSent: boolean;
  participantAddress: string;
}

export default function PaymentCard({ amount, memo, timestamp, isSent, participantAddress }: PaymentCardProps) {
  return (
    <motion.div 
      whileHover={{ scale: 1.01 }}
      className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all backdrop-blur-md"
    >
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-xl ${isSent ? 'bg-zinc-800/50 text-zinc-300' : 'bg-green-500/10 text-green-400'}`}>
          {isSent ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
        </div>
        
        <div>
          <div className="flex items-center space-x-2">
            <h4 className="font-medium text-white">
              {isSent ? "Sent Payment" : "Received"}
            </h4>
            {memo && (
              <span className="flex items-center px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full bg-primary/20 text-primary-foreground border border-primary/30">
                <Lock className="w-3 h-3 mr-1" />
                Encrypted
              </span>
            )}
          </div>
          <p className="text-sm text-zinc-500 font-mono mt-1">
            {participantAddress.slice(0, 6)}...{participantAddress.slice(-4)}
          </p>
        </div>
      </div>

      <div className="text-right">
        <span className={`block font-medium text-lg ${isSent ? 'text-zinc-100' : 'text-green-400'}`}>
          {isSent ? "-" : "+"}{amount.toFixed(2)} USDC
        </span>
        <span className="text-xs text-zinc-500">
          {formatDistanceToNow(timestamp, { addSuffix: true })}
        </span>
      </div>
    </motion.div>
  );
}
