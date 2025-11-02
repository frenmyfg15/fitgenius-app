'use client';

import { create } from 'zustand';
import { Rutina } from '../type/rutinas';

type State = {
  data?: Rutina[];
  set: (list: Rutina[]) => void;
  get: () => Rutina[] | undefined;
  clear: () => void;
};

export const useRutinasCache = create<State>((set, get) => ({
  data: undefined,
  set: (list) => set({ data: list }),
  get: () => get().data,
  clear: () => set({ data: undefined }),
}));
