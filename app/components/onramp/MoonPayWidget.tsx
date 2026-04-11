"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function MoonPayWidget() {
  const { publicKey } = useWallet();
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!publicKey) return;

    fetch("/api/moonpay/signed-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress: publicKey.toBase58() }),
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to fetch MoonPay URL");
      })
      .then((data) => {
        if (data.url) setSignedUrl(data.url);
      })
      .catch((err) => {
        console.error("MoonPay Error:", err);
      });
  }, [publicKey]);

  if (!publicKey) {
    return (
      <div className="flex items-center justify-center p-12 border border-white/5 bg-white/5 rounded-3xl text-zinc-400 backdrop-blur-md">
        Connect your wallet to purchase USDC
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full relative rounded-3xl overflow-hidden border border-white/10 bg-[#0a0a0f] shadow-[0_0_60px_-15px_rgba(255,255,255,0.1)] min-h-[600px]"
    >
      {!signedUrl && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/5 backdrop-blur-md">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
          <p className="text-zinc-400 font-medium">Generating secure checkout...</p>
        </div>
      )}
      
      {signedUrl && (
        <iframe
          src={signedUrl}
          allow="accelerometer; autoplay; camera; gyroscope; payment"
          frameBorder="0"
          className="w-full h-full min-h-[600px] border-none"
        />
      )}
    </motion.div>
  );
}
