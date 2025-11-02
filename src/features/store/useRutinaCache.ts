// store/useRutinaCache.ts
import { create } from 'zustand'

type CacheState = {
  byId: Record<number, any>
  set: (id: number, data: any) => void
  get: (id: number) => any | undefined
  clear: (id?: number) => void
}

export const useRutinaCache = create<CacheState>((set, get) => ({
  byId: {},
  set: (id, data) => set(s => ({ byId: { ...s.byId, [id]: data } })),
  get: (id) => get().byId[id],
  clear: (id) =>
    set(s => id == null ? { byId: {} } : { byId: Object.fromEntries(Object.entries(s.byId).filter(([k]) => Number(k) !== id)) }),
}))
