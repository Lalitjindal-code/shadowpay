"use client";

import { useState } from "react";
import { IDKitRequestWidget, IDKitResult, orbLegacy } from "@worldcoin/idkit";
import { useWorldID } from "@/hooks/useWorldID";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

export default function WorldIDButton() {
  const { isVerified, verifySuccess } = useWorldID();
  const [open, setOpen] = useState(false);

  const handleVerify = async (result: IDKitResult) => {
    await verifySuccess(result);
  };

  if (isVerified) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center space-x-2 px-4 py-2 border border-green-500/20 bg-green-500/10 rounded-full text-green-400 text-sm font-medium backdrop-blur-md shadow-lg"
      >
        <ShieldCheck className="w-4 h-4" />
        <span>Verified Human</span>
      </motion.div>
    );
  }

  const worldAppId = process.env.NEXT_PUBLIC_WORLD_APP_ID;
  if (!worldAppId || worldAppId === 'FILL_THIS') {
    return (
      <div className="flex items-center gap-2 px-4 py-2 
                      rounded-xl bg-yellow-500/10 border 
                      border-yellow-500/20 text-yellow-400 
                      text-sm">
        <span>⚠</span>
        <span>World ID not configured</span>
      </div>
    );
  }

  return (
    <>
      <Button 
        onClick={() => setOpen(true)}
        className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 shadow-xl transition-all duration-300 rounded-full hover:scale-105"
      >
        <ShieldAlert className="w-4 h-4 mr-2 text-zinc-400" />
        Verify with World ID
      </Button>

      {/* @ts-expect-error Worldcoin IDKit v4 types quirk requiring dynamic internal props */}
      <IDKitRequestWidget
        app_id={process.env.NEXT_PUBLIC_WORLD_APP_ID as `app_${string}`}
        action={process.env.WORLD_ID_ACTION || "shadowpay-verify"}
        open={open}
        onOpenChange={setOpen}
        onSuccess={handleVerify}
        handleVerify={handleVerify}
        preset={orbLegacy()}
      />
    </>
  );
}
