import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type StripeStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "unpaid";

export type UsuarioLogin = {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  imagenPerfil?: string;

  edad: number;
  altura: string;
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
  planActual: "GRATUITO" | "BASICO" | "PREMIUM";
  haPagado: boolean;
  haVistoOnboarding: boolean;

  caloriasMes: number;

  rutinasManualCreadas: number;
  rutinasIACreadas: number;

  // ✅ Stripe no sensible
  stripeStatus?: StripeStatus;
  stripeCurrentPeriodEnd?: string; // ISO string
  stripeCancelAtPeriodEnd?: boolean;
  stripeTrialEndsAt?: string; // ISO string
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

      updatePerfil: (data) =>
        set((state) => {
          if (!state.usuario) return state;

          return {
            usuario: {
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
            },
          };
        }),
    }),
    {
      name: "usuario-storage",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state, error) => {
        if (error) console.warn("Hydration error:", error);
        state?.setRehydrated();
      },
      version: 2,
    }
  )
);