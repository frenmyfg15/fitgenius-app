// src/features/store/useRegistroStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Usuario } from "../type/register";
// Importa tu tipo real

// Estado inicial (igual al que tenías en el useRef)
export const initialUsuario: Usuario = {
  nombre: "",
  apellido: "",
  correo: "",
  contrasena: "",
  objetivo: "" as unknown as Usuario["objetivo"],
  sexo: "" as unknown as Usuario["sexo"],
  enfoque: [] as unknown as Usuario["enfoque"],
  nivel: "" as unknown as Usuario["nivel"],
  actividad: "" as unknown as Usuario["actividad"],
  lugar: "" as unknown as Usuario["lugar"],
  equipamiento: [] as unknown as Usuario["equipamiento"],
  altura: 0,
  medidaAltura: "" as unknown as Usuario["medidaAltura"],
  peso: 0,
  medidaPeso: "" as unknown as Usuario["medidaPeso"],
  pesoObjetivo: 0,
  edad: undefined,
  dias: [] as unknown as Usuario["dias"],
  duracion: "" as unknown as Usuario["duracion"],
  limitaciones: [] as unknown as Usuario["limitaciones"],
};

type RegistroState = {
  usuario: Usuario;
  // acciones

  showWizard: boolean;                     // ⬅️ nuevo
  setShowWizard: (v: boolean) => void;
  setUsuario: (u: Usuario) => void;
  updateUsuario: (partial: Partial<Usuario>) => void;
  setField: <K extends keyof Usuario>(key: K, value: Usuario[K]) => void;
  resetUsuario: () => void;
};

export const useRegistroStore = create<RegistroState>()(
  persist(
    (set, get) => ({
      usuario: initialUsuario,

      showWizard: false,
      setShowWizard: (v) => set({ showWizard: v }),

      setUsuario: (u) => set({ usuario: u }),

      updateUsuario: (partial) => set({ usuario: { ...get().usuario, ...partial } }),

      setField: (key, value) =>
        set({ usuario: { ...get().usuario, [key]: value } as Usuario }),

      resetUsuario: () => set({ usuario: initialUsuario }),
    }),
    {
      name: "registro-usuario", // clave en AsyncStorage
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      // Si más adelante cambian campos, puedes migrar aquí:
      // migrate: (persisted, version) => { ... }
      // Si solo quieres persistir parte del estado:
      // partialize: (state) => ({ usuario: state.usuario }),
    }
  )
);
