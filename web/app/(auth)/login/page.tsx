"use client";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const { login, authenticated, ready } = 
    usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready && authenticated) {
      router.push("/home");
    }
  }, [ready, authenticated, router]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] 
                    flex items-center 
                    justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm text-center"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <div className="w-20 h-20 rounded-3xl 
                          bg-purple-600/20 
                          border-2 border-purple-500/30
                          flex items-center 
                          justify-center
                          shadow-[0_0_40px_rgba(124,58,237,0.3)]">
            <span className="text-4xl">🔒</span>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-bold 
                     text-white mb-3 
                     tracking-tight"
        >
          ShadowPay
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-white/40 text-base 
                     mb-10 leading-relaxed"
        >
          Private payments on Solana.
          <br />
          Nobody sees your balance.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {!ready ? (
            <div className="flex justify-center">
              <div className="w-8 h-8 border-2 
                              border-purple-500 
                              border-t-transparent 
                              rounded-full 
                              animate-spin" />
            </div>
          ) : (
            <button
              onClick={login}
              className="w-full py-4 px-6 
                         rounded-2xl bg-purple-600 
                         hover:bg-purple-500
                         active:scale-95
                         text-white font-semibold 
                         text-lg transition-all 
                         duration-200
                         shadow-[0_0_30px_rgba(124,58,237,0.4)]"
            >
              Get Started
            </button>
          )}
        </motion.div>

        {/* Feature Pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 flex justify-center gap-3"
        >
          {[
            { icon: "🔒", label: "Encrypted" },
            { icon: "🌐", label: "World ID" },
            { icon: "⚡", label: "<400ms" },
          ].map((f) => (
            <div
              key={f.label}
              className="px-3 py-2 rounded-xl 
                         bg-white/3 border 
                         border-white/8
                         flex items-center gap-2"
            >
              <span className="text-sm">
                {f.icon}
              </span>
              <span className="text-xs 
                               text-white/40">
                {f.label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-10 text-xs text-white/20"
        >
          Built at Colosseum Frontier 2026
        </motion.p>
      </motion.div>
    </div>
  );
}
