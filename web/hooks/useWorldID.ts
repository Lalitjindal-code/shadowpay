import { useAppStore } from "../store/useAppStore";
import { IDKitResult } from "@worldcoin/idkit";
import { toast } from "sonner";

export function useWorldID() {
  const hasWorldId = useAppStore((state) => state.hasWorldId);
  const setWorldIdStatus = useAppStore((state) => state.setWorldIdStatus);

  const verifySuccess = async (proof: IDKitResult) => {
    try {
      const res = await fetch("/api/worldid/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proof }),
      });

      if (res.ok) {
        setWorldIdStatus(true);
        toast.success("Identity verified successfully!");
        return true;
      } else {
        toast.error("Identity verification failed. Please try again.");
        return false;
      }
    } catch {
      toast.error("Network error during verification.");
      return false;
    }
  };

  return {
    isVerified: hasWorldId,
    verifySuccess,
  };
}
