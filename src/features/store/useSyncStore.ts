// store/useSyncStore.ts
import { create } from 'zustand'

type SyncState = {
  routineRev: number
  workoutRev: number
  bumpRoutineRev: () => void
  bumpWorkoutRev: () => void
  reset: () => void
}

export const useSyncStore = create<SyncState>((set) => ({
  routineRev: 0,
  workoutRev: 0,
  bumpRoutineRev: () => set(s => ({ routineRev: s.routineRev + 1 })),
  bumpWorkoutRev: () => set(s => ({ workoutRev: s.workoutRev + 1 })),
  reset: () => set({ routineRev: 0, workoutRev: 0 }),
}))
