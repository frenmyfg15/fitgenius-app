// store/useSyncStore.ts
import { create } from 'zustand'

type SyncState = {
  routineRev: number
  workoutRev: number
  analisisDiarioPendiente: boolean
  analisisSemanalPendiente: boolean
  bumpRoutineRev: () => void
  bumpWorkoutRev: () => void
  setAnalisisDiarioPendiente: (v: boolean) => void
  setAnalisisSemanalPendiente: (v: boolean) => void
  reset: () => void
}

export const useSyncStore = create<SyncState>((set) => ({
  routineRev: 0,
  workoutRev: 0,
  analisisDiarioPendiente: false,
  analisisSemanalPendiente: false,
  bumpRoutineRev: () => set(s => ({ routineRev: s.routineRev + 1 })),
  bumpWorkoutRev: () => set(s => ({ workoutRev: s.workoutRev + 1 })),
  setAnalisisDiarioPendiente: (v) => set({ analisisDiarioPendiente: v }),
  setAnalisisSemanalPendiente: (v) => set({ analisisSemanalPendiente: v }),
  reset: () => set({ routineRev: 0, workoutRev: 0, analisisDiarioPendiente: false, analisisSemanalPendiente: false }),
}))
