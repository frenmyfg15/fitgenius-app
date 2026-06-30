import { create } from 'zustand';

type EstadisticasCache = {
  actividad: any;
  muscular: any;
  calorias: any;
  adherencia: any;
  cargaInterna: any;
  diasColorEstres: any;
  progresoSubjetivo: any;
  progresoMuscular: any;
};

type State = {
  data: EstadisticasCache | null;
  set: (data: EstadisticasCache) => void;
  get: () => EstadisticasCache | null;
  clear: () => void;
};

export const useEstadisticasCache = create<State>((set, get) => ({
  data: null,
  set: (data) => set({ data }),
  get: () => get().data,
  clear: () => set({ data: null }),
}));
