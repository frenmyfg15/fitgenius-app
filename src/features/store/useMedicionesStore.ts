import { create } from "zustand";

export type Medicion = {
  id: number;
  valor: number; // siempre en unidad base: KG para pesos, CM para alturas
  fecha: string; // ISO string
};

type MedicionesStore = {
  pesos: Medicion[];
  alturas: Medicion[];
  setPesos: (pesos: Medicion[]) => void;
  setAlturas: (alturas: Medicion[]) => void;
  addPeso: (m: Medicion) => void;
  addAltura: (m: Medicion) => void;
};

export const useMedicionesStore = create<MedicionesStore>()((set) => ({
  pesos: [],
  alturas: [],

  setPesos: (pesos) => set({ pesos }),
  setAlturas: (alturas) => set({ alturas }),

  addPeso: (m) => set((s) => ({ pesos: [...s.pesos, m] })),
  addAltura: (m) => set((s) => ({ alturas: [...s.alturas, m] })),
}));
