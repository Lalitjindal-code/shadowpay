"use client";
import { usePrivy } from "@privy-io/react-auth";
import { BalanceCard } from "../../../components/payments/BalanceCard";
import { SendForm } from "../../../components/payments/SendForm";
import { ActivityFeed } from "../../../components/payments/ActivityFeed";
import { PrivacyUnlocker } from "../../../components/auth/PrivacyUnlocker";
import { usePrivacyStore } from "../../../store/usePrivacyStore";
import { motion } from "framer-motion";
import { Search, Zap, Shield, Users } from "lucide-react";

import WorldIDButton from "../../../components/identity/WorldIDButton";

export default function HomePage() {
  const { user } = usePrivy();
  const { isUnlocked } = usePrivacyStore();
  const walletAddress = user?.wallet?.address || "";

  return (
    <div className="flex flex-col gap-8 pb-20">
      {/* Header Section */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Shadow Dashboard</h1>
            <p className="text-sm text-white/30">Privately managing your digital wealth.</p>
          </div>
          <div className="flex items-center gap-3">
            <WorldIDButton />
            <div className="flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Mainnet-Beta</span>
            </div>
          </div>
        </div>

        <BalanceCard walletAddress={walletAddress} />
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Actions / Send */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/30">Quick Actions</h3>
            <Zap size={14} className="text-purple-400" />
          </div>

          <div className="rounded-3xl border border-white/5 bg-white/2 p-6 backdrop-blur-sm">
            {!isUnlocked ? (
              <PrivacyUnlocker />
            ) : (
              <SendForm />
            )}
          </div>
        </section>

        {/* Right Column: Activity */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/30">Activity Feed</h3>
            <Shield size={14} className="text-blue-400" />
          </div>

          <div className="rounded-3xl border border-white/5 bg-white/2 p-4 backdrop-blur-sm min-h-[400px]">
            <ActivityFeed walletAddress={walletAddress} />
          </div>
        </section>

      </div>

      {/* Quick Nav / Footer Overlays could go here */}
    </div>
  );
}
