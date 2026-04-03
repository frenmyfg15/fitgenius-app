import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
  AnalisisDiarioData,
  AnalisisDiarioRegistro,
  AnalisisSemanalData,
  AnalisisSemanalRegistro,
} from "@/features/api/coach.api";

const MAX_DIARIO = 30;
const MAX_SEMANAL = 12;

type AnalisisState = {
  diario: Record<string, AnalisisDiarioData>;
  semanal: Record<string, AnalisisSemanalData>;
  guardarDiario: (fecha: string, data: AnalisisDiarioData) => void;
  guardarSemanal: (semana: string, data: AnalisisSemanalData) => void;
  poblarDesdeServidor: (
    diario: AnalisisDiarioRegistro[],
    semanal: AnalisisSemanalRegistro[]
  ) => void;
};

export const useAnalisisStore = create<AnalisisState>()(
  persist(
    (set) => ({
      diario: {},
      semanal: {},

      guardarDiario: (fecha, data) =>
        set((state) => {
          const next = { ...state.diario, [fecha]: data };
          const keys = Object.keys(next).sort().reverse().slice(0, MAX_DIARIO);
          return { diario: Object.fromEntries(keys.map((k) => [k, next[k]])) };
        }),

      guardarSemanal: (semana, data) =>
        set((state) => {
          const next = { ...state.semanal, [semana]: data };
          const keys = Object.keys(next).sort().reverse().slice(0, MAX_SEMANAL);
          return { semanal: Object.fromEntries(keys.map((k) => [k, next[k]])) };
        }),

      poblarDesdeServidor: (diarioArr, semanalArr) => {
        const diario: Record<string, AnalisisDiarioData> = {};
        for (const r of diarioArr) {
          const { fecha, ...data } = r;
          diario[fecha] = data;
        }
        const semanal: Record<string, AnalisisSemanalData> = {};
        for (const r of semanalArr) {
          const { semana, ...data } = r;
          semanal[semana] = data;
        }
        set({ diario, semanal });
      },
    }),
    {
      name: "analisis-coach-storage",
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    }
  )
);
