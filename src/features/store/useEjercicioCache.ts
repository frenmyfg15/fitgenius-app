import { create } from 'zustand'

type Entry = { data: any }

type State = {
  bySlug: Record<string, Entry>
  get: (slug: string) => any | undefined
  set: (slug: string, data: any) => void
  del: (slug: string) => void
  clear: () => void
}

export const useEjercicioCache = create<State>((set, get) => ({
  bySlug: {},

  get: (slug: string) => get().bySlug[slug]?.data,

  set: (slug: string, data: any) =>
    set((s) => ({ bySlug: { ...s.bySlug, [slug]: { data } } })),

  del: (slug: string) =>
    set((s) => {
      const next = { ...s.bySlug }
      delete next[slug]
      return { bySlug: next }
    }),

  clear: () => set({ bySlug: {} }),
}))
