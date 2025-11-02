// src/features/store/usuario.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type UsuarioLogin = {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  imagenPerfil?: string;

  edad: number;
  altura: number;
  medidaAltura: string;
  peso: number;
  medidaPeso: string;
  pesoObjetivo: number;

  nivelExperiencia: string;
  actividadDiaria: string;
  objetivoPrincipal: string;
  sexo: string;
  duracionSesion: string;
  lugarEntrenamiento: string;

  enfoquesMusculares?: string[];
  limitaciones?: string[];
  dias: string[];
  equipamiento?: string[];
  experiencia: number;

  rutinaActivaId?: number;
  planActual: "GRATUITO" | "PREMIUM";
  haPagado: boolean;

  caloriasMes: number;

  // 👇 NUEVOS CAMPOS
  rutinasManualCreadas: number;
  rutinasIACreadas: number;
};

export type PerfilFormData = {
  pesoObjetivo: number;
  sexo: string;
  nivel: string;
  actividad: string;
  objetivo: string;
  duracion: string;
  lugar: string;
  enfoque: string[];
  limitaciones: string[];
  dias: string[];
  equipamiento: string[];
};

type UsuarioStore = {
  usuario: UsuarioLogin | null;
  setUsuario: (usuario: UsuarioLogin | null) => void;
  logout: () => void;
  rehydrated: boolean;
  setRehydrated: () => void;
  updatePerfil: (data: PerfilFormData) => void;
};

export const useUsuarioStore = create<UsuarioStore>()(
  persist(
    (set, get) => ({
      usuario: null,
      setUsuario: (usuario) => set({ usuario }),
      logout: () => set({ usuario: null }),
      rehydrated: false,
      setRehydrated: () => set({ rehydrated: true }),
      updatePerfil: (data) => {
        set((state) => {
          if (!state.usuario) {
            console.warn("No hay usuario logueado para actualizar el perfil.");
            return state;
          }
          const updatedUsuario: UsuarioLogin = {
            ...state.usuario,
            pesoObjetivo: data.pesoObjetivo,
            sexo: data.sexo,
            nivelExperiencia: data.nivel,
            actividadDiaria: data.actividad,
            objetivoPrincipal: data.objetivo,
            duracionSesion: data.duracion,
            lugarEntrenamiento: data.lugar,
            enfoquesMusculares: data.enfoque,
            limitaciones: data.limitaciones,
            dias: data.dias,
            equipamiento: data.equipamiento,
          };
          return { usuario: updatedUsuario };
        });
      },
    }),
    {
      name: "usuario-storage",
      storage: createJSONStorage(() => AsyncStorage), // 👈 Persistencia real en RN
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn("Hydration error:", error);
        }
        state?.setRehydrated(); // 👈 evita spinner infinito
      },
      version: 1,
    }
  )
);
