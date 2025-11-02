// src/features/store/registration.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Usuario } from "../type/register";

type RegistrationState = {
  /** Datos del registro en curso */
  data: Partial<Usuario>;
  /** Actualiza una propiedad concreta */
  setField: <K extends keyof Usuario>(key: K, value: Usuario[K]) => void;
  /** Mezcla varios campos de golpe */
  merge: (partial: Partial<Usuario>) => void;
  /** Limpia todo el progreso */
  reset: () => void;
};

/**
 * ⚠️ Nota de seguridad:
 * - `contrasena` NO se persiste en disco (AsyncStorage). Solo vive en memoria.
 * - Al rehidratar desde disco, `contrasena` quedará `undefined`.
 */
export const useRegistrationStore = create<RegistrationState>()(
  persist(
    (set, get) => ({
      data: {
        // Inicializa arrays comunes a [] para evitar undefined durante el flujo
        enfoque: [],
        equipamiento: [],
        dias: [],
        limitaciones: [],
      },
      setField: (key, value) => {
        const next = { ...get().data, [key]: value };
        set({ data: next });
      },
      merge: (partial) => {
        const next = { ...get().data, ...partial };
        set({ data: next });
      },
      reset: () =>
        set({
          data: {
            enfoque: [],
            equipamiento: [],
            dias: [],
            limitaciones: [],
          },
        }),
    }),
    {
      name: "registration-v1",
      storage: createJSONStorage(() => AsyncStorage),
      // Excluye `contrasena` del estado persistido
      partialize: (state) => {
        const { data } = state;
        if (!data) return state;
        const { contrasena, ...rest } = data;
        return { data: rest } as RegistrationState;
      },
    }
  )
);
