// src/features/store/useOnboardingStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type OnboardingStore = {
    completado: boolean;
    pendienteMostrar: boolean;
    hydrated: boolean;
    setCompletado: () => void;
    marcarPendiente: () => void;
    limpiarPendiente: () => void;
    setHydrated: (v: boolean) => void;
};

export const useOnboardingStore = create<OnboardingStore>()(
    persist(
        (set) => ({
            completado: false,
            pendienteMostrar: false,
            hydrated: false,

            setCompletado: () =>
                set({
                    completado: true,
                    pendienteMostrar: false,
                }),

            marcarPendiente: () => set({ pendienteMostrar: true }),
            limpiarPendiente: () => set({ pendienteMostrar: false }),
            setHydrated: (v) => set({ hydrated: v }),
        }),
        {
            name: "onboarding-storage",
            storage: createJSONStorage(() => AsyncStorage),
            onRehydrateStorage: () => (state) => {
                state?.setHydrated(true);
            },
        }
    )
);