import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PrivacyState {
  arciumPrivateKey: Uint8Array | null;
  arciumPublicKey: Uint8Array | null;
  isUnlocked: boolean;
  setSession: (privateKey: Uint8Array, publicKey: Uint8Array) => void;
  clearSession: () => void;
}

export const usePrivacyStore = create<PrivacyState>()(
  persist(
    (set) => ({
      arciumPrivateKey: null,
      arciumPublicKey: null,
      isUnlocked: false,
      setSession: (privateKey, publicKey) => set({ 
        arciumPrivateKey: privateKey, 
        arciumPublicKey: publicKey, 
        isUnlocked: true 
      }),
      clearSession: () => set({ 
        arciumPrivateKey: null, 
        arciumPublicKey: null, 
        isUnlocked: false 
      }),
    }),
    {
      name: "shadowpay-privacy-session",
      // We don't want to persist the binary buffers easily in localStorage without encoding
      partialize: (state) => ({ isUnlocked: state.isUnlocked }),
    }
  )
);
