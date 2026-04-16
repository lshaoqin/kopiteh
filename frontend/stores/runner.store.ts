import { create } from "zustand";
import { persist } from "zustand/middleware";

interface RunnerState {
  runnerName: string;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setRunnerName: (name: string) => void;
  setAuthenticated: (value: boolean) => void;
  logoutRunner: () => void;
  setHydrated: (value: boolean) => void;
}

export const useRunnerStore = create<RunnerState>()(
  persist(
    (set) => ({
      runnerName: "",
      isAuthenticated: false,
      isHydrated: false,

      setRunnerName: (name) => set({ runnerName: name }),
      setAuthenticated: (value) => set({ isAuthenticated: value }),
      logoutRunner: () => set({ runnerName: "", isAuthenticated: false }),
      setHydrated: (value) => set({ isHydrated: value }),
    }),
    {
      name: "runner-storage",
      partialize: (state) => ({
        runnerName: state.runnerName,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
