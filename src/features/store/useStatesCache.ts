import { create } from 'zustand'

type StatsBundle = {
  actividad: any
  muscular: any
  calorias: any
  adherencia: any
}

type State = {
  data?: StatsBundle
  set: (bundle: StatsBundle) => void
  get: () => StatsBundle | undefined
  clear: () => void
}

export const useStatsCache = create<State>((set, get) => ({
  data: undefined,
  set: (bundle) => set({ data: bundle }),
  get: () => get().data,
  clear: () => set({ data: undefined }),
}))
