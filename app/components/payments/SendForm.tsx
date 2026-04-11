"use client";

import { useState } from "react";
import { useSendPayment } from "@/hooks/useSendPayment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Lock } from "lucide-react";
import { motion } from "framer-motion";

export default function SendForm() {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  
  const { mutate: sendPayment, isPending } = useSendPayment();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !amount) return;
    
    sendPayment({
      recipient,
      amount: parseFloat(amount),
      memo,
    });
  };

  return (
    <motion.form 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit} 
      className="space-y-6"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400 ml-1">Recipient Address</label>
          <Input 
            required 
            placeholder="Solana wallet address" 
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="bg-white/5 border-white/10 text-white h-12 focus:ring-primary/50 focus:border-primary/50 transition-all rounded-xl"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400 ml-1">Amount (USDC)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-medium">$</span>
            <Input 
              required 
              type="number" 
              step="0.01"
              placeholder="0.00" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-zinc-950/50 border-white/10 text-white h-16 text-2xl font-light pl-8 focus:ring-primary/50 focus:border-primary/50 shadow-inner rounded-xl transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center ml-1">
            <label className="text-sm font-medium text-zinc-400">Encrypted Memo</label>
            <Lock className="w-3 h-3 text-primary" />
          </div>
          <Input 
            placeholder="What's this for?" 
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className="bg-primary/5 border-primary/20 text-white h-12 focus:ring-primary/50 focus:border-primary/50 transition-all rounded-xl"
          />
        </div>
      </div>

      <Button 
        type="submit" 
        disabled={isPending}
        className="w-full h-14 bg-white text-black hover:bg-zinc-200 rounded-xl text-lg font-medium transition-all hover:scale-[1.02] shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:hover:scale-100"
      >
        {isPending ? (
          "Encrypting & Sending..."
        ) : (
          <>
            <Send className="w-5 h-5 mr-2" />
            Send Securely
          </>
        )}
      </Button>
    </motion.form>
  );
}
