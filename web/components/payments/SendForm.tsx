"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Send, AtSign, Loader2, DollarSign, CheckCircle2 } from "lucide-react";
import { useSendPayment } from "../../hooks/useSendPayment";
import { PublicKey } from "@solana/web3.js";
import { toast } from "react-hot-toast";

export function SendForm() {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  const { mutate: sendPayment, isPending, isSuccess } = useSendPayment();

  // Debounced search for users
  useEffect(() => {
    if (recipient.length < 2 || selectedUser) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/users?query=${recipient}`);
        const data = await res.json();
        setSearchResults(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Search failed", e);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [recipient, selectedUser]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser || !amount) {
      toast.error("Please select a recipient and enter an amount");
      return;
    }

    sendPayment({
      recipient: new PublicKey(selectedUser.walletAddress),
      amount: parseFloat(amount),
      memo: memo,
    });
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center gap-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="h-16 w-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center"
        >
          <CheckCircle2 size={32} />
        </motion.div>
        <h3 className="text-xl font-bold text-white">Payment Sent Privately</h3>
        <p className="text-sm text-white/50 max-w-[200px]">
          Your transaction has been encrypted and broadcast to the Solana network.
        </p>
        <button 
          onClick={() => {
            setSelectedUser(null);
            setAmount("");
            setMemo("");
            setRecipient("");
          }}
          className="mt-4 text-xs font-bold uppercase tracking-widest text-purple-400 hover:text-purple-300 transition-colors"
        >
          Send Another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-1">
      {/* Recipient Search */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold uppercase tracking-widest text-white/30 px-1">Recipient</label>
        <div className="relative">
          {selectedUser ? (
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-purple-500/30">
              <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold">
                {selectedUser.username?.[0]?.toUpperCase() || "?"}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">@{selectedUser.username}</p>
                <p className="text-[10px] text-white/30 truncate max-w-[180px] font-mono">
                  {selectedUser.walletAddress}
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setSelectedUser(null)}
                className="text-[10px] text-purple-400 font-bold hover:underline"
              >
                Change
              </button>
            </div>
          ) : (
            <>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input
                  type="text"
                  placeholder="Username or address"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full rounded-2xl bg-white/5 border border-white/10 p-4 pl-12 text-sm text-white focus:border-purple-500/50 focus:outline-none transition-all"
                />
                {isSearching && (
                  <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-400 animate-spin" size={18} />
                )}
              </div>
              
              <AnimatePresence>
                {searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-20 mt-2 w-full rounded-2xl bg-[#0a0a0f] border border-white/10 shadow-2xl overflow-hidden"
                  >
                    {searchResults.map((user) => (
                      <button
                        key={user.walletAddress}
                        type="button"
                        onClick={() => setSelectedUser(user)}
                        className="flex items-center gap-3 w-full p-3 hover:bg-white/5 text-left border-b border-white/5 last:border-0"
                      >
                        <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-white/50">
                          {user.username?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">@{user.username}</p>
                          <p className="text-[10px] text-white/30 font-mono">{user.walletAddress.slice(0, 8)}...{user.walletAddress.slice(-4)}</p>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>

      {/* Amount Input */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold uppercase tracking-widest text-white/30 px-1">Amount</label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 font-bold">$</div>
          <input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-2xl bg-white/5 border border-white/10 p-4 pl-8 text-2xl font-bold text-white focus:border-purple-500/50 focus:outline-none transition-all placeholder:text-white/5"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-purple-400">
            USDC
          </div>
        </div>
      </div>

      {/* Memo */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold uppercase tracking-widest text-white/30 px-1">Memo (Private)</label>
        <input
          type="text"
          placeholder="What's this for?"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          className="w-full rounded-2xl bg-white/5 border border-white/10 p-4 text-sm text-white focus:border-purple-500/50 focus:outline-none transition-all"
        />
      </div>

      <button
        type="submit"
        disabled={isPending || !selectedUser || !amount}
        className="group relative w-full overflow-hidden rounded-2xl bg-white p-4 font-bold text-black transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100"
      >
        <div className="relative z-10 flex items-center justify-center gap-2">
          {isPending ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <Send size={20} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          )}
          <span>{isPending ? "Broadcasting..." : "Send Payment"}</span>
        </div>
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
    </form>
  );
}
