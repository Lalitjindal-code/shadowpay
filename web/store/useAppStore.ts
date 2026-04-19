import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppState {
  isDarkMode: boolean;
  userProfile: any | null;
  hasWorldId: boolean;
  balanceUSDC: number | null;
  toggleTheme: () => void;
  setUserProfile: (profile: any) => void;
  setWorldIdStatus: (status: boolean) => void;
  setBalanceUSDC: (balance: number) => void;
  clearState: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isDarkMode: true,
      userProfile: null,
      hasWorldId: false,
      balanceUSDC: null,
      toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      setUserProfile: (profile) => set({ userProfile: profile }),
      setWorldIdStatus: (status) => set({ hasWorldId: status }),
      setBalanceUSDC: (balance) => set({ balanceUSDC: balance }),
      clearState: () => set({ userProfile: null, hasWorldId: false, balanceUSDC: null }),
    }),
    {
      name: "shadowpay-storage",
    }
  )
);
