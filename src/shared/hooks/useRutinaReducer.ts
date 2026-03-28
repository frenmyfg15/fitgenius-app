// src/shared/hooks/useRutinaReducer.ts
import { useEffect, useReducer, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  CrearRutinaRequest,
  EjercicioAsignadoInput,
  Action as BaseAction,
} from "@/features/type/crearRutina";

const STORAGE_KEY = "crearRutinaState";

type DiaKey = string | number;
type PasteMode = "replace" | "append";

type ClipboardState = {
  clipboard?: EjercicioAsignadoInput[];
};

type State = CrearRutinaRequest & ClipboardState;

type CopyAction = {
  type: "COPY_DIA";
  payload: { diaSemana: DiaKey };
};

type PasteAction = {
  type: "PASTE_DIA";
  payload: { diaSemana: DiaKey; mode: PasteMode };
};

type HydrateAction = {
  type: "HYDRATE";
  payload: State;
};

type Action = BaseAction | CopyAction | PasteAction | HydrateAction;

const initialState: State = {
  nombre: "",
  descripcion: "",
  usuarioId: 1,
  dias: [],
  clipboard: undefined,
};

function cloneEjercicios(
  list: EjercicioAsignadoInput[]
): EjercicioAsignadoInput[] {
  return JSON.parse(JSON.stringify(list)) as EjercicioAsignadoInput[];
}

function normalizeOrdenMinClone<T extends { orden: number }>(arr: T[]): T[] {
  let changed = false;

  const out = arr.map((e, idx) => {
    const nextOrden = idx + 1;
    if (e.orden === nextOrden) return e;
    changed = true;
    return { ...(e as any), orden: nextOrden } as T;
  });

  return changed ? out : arr;
}

function sameRefArray(a: any[] | undefined, b: any[] | undefined) {
  return a === b;
}

function rutinaReducer(state: State, action: Action): State {
  switch (action.type) {
    case "HYDRATE":
      return { ...state, ...action.payload };

    case "SET_NOMBRE":
      return { ...state, nombre: action.payload };

    case "SET_DESCRIPCION":
      return { ...state, descripcion: action.payload };

    case "SET_USUARIO_ID":
      return { ...state, usuarioId: action.payload };

    case "ADD_EJERCICIO": {
      const { diaSemana, ejercicio } = action.payload;
      const diaIndex = state.dias.findIndex((d) => d.diaSemana === diaSemana);
      const newDias = [...state.dias];

      if (diaIndex === -1) {
        return {
          ...state,
          dias: [
            ...newDias,
            { diaSemana, ejercicios: [{ ...(ejercicio as any), orden: 1 }] },
          ],
        };
      }

      const ejerciciosActuales = state.dias[diaIndex].ejercicios ?? [];
      const maxOrden =
        ejerciciosActuales.length > 0
          ? Math.max(...ejerciciosActuales.map((e) => e.orden))
          : 0;

      const nextEjercicios = [
        ...ejerciciosActuales,
        { ...(ejercicio as any), orden: maxOrden + 1 },
      ];

      newDias[diaIndex] = {
        ...newDias[diaIndex],
        diaSemana,
        ejercicios: nextEjercicios,
      };

      return { ...state, dias: newDias };
    }

    case "UPDATE_EJERCICIO": {
      const { diaSemana, ejercicio } = action.payload;
      return {
        ...state,
        dias: state.dias.map((dia) =>
          dia.diaSemana === diaSemana
            ? {
              ...dia,
              ejercicios: dia.ejercicios.map((e) =>
                "compuesto" in (e as any)
                  ? e
                  : e.orden === ejercicio.orden
                    ? ({ ...(e as any), ...(ejercicio as any) } as any)
                    : e
              ),
            }
            : dia
        ),
      };
    }

    case "UPDATE_COMPUESTO": {
      const { compuestoId, nombre, tipo, descansoSeg } = action.payload;
      return {
        ...state,
        dias: state.dias.map((dia) => ({
          ...dia,
          ejercicios: dia.ejercicios.map((ej: any) => {
            if (
              "compuesto" in ej &&
              ej.compuesto === true &&
              ej.ejercicioCompuestoId === compuestoId
            ) {
              return {
                ...ej,
                nombreCompuesto: nombre,
                tipoCompuesto: tipo,
                descansoCompuesto: descansoSeg,
              };
            }
            return ej;
          }),
        })),
      };
    }

    case "UPDATE_COMPUESTO_COMPLETO": {
      const { diaSemana, compuestoId, nombre, tipo, descansoSeg, ejercicios } =
        action.payload;

      return {
        ...state,
        dias: state.dias.map((dia) => {
          if (dia.diaSemana !== diaSemana) return dia;

          return {
            ...dia,
            ejercicios: dia.ejercicios.map((ej: any) => {
              if (
                "compuesto" in ej &&
                ej.compuesto === true &&
                ej.ejercicioCompuestoId === compuestoId
              ) {
                // ✅ Reemplaza hijos con orden normalizado + actualiza metadata
                const hijosNormalizados = ejercicios.map((e, i) => ({
                  ...(e as any),
                  orden: i + 1,
                  ejercicioCompuestoId: compuestoId,
                }));

                return {
                  ...ej,
                  nombreCompuesto: nombre,
                  tipoCompuesto: tipo,
                  descansoCompuesto: descansoSeg,
                  ejerciciosCompuestos: hijosNormalizados,
                };
              }
              return ej;
            }),
          };
        }),
      };
    }

    case "REORDER_EJERCICIOS": {
      const { diaSemana, ejercicios } = action.payload;

      let changedDias = false;

      const nextDias = state.dias.map((dia) => {
        if (dia.diaSemana !== diaSemana) return dia;

        if (sameRefArray(dia.ejercicios as any, ejercicios as any)) {
          return dia;
        }

        const normalized = normalizeOrdenMinClone(ejercicios as any);

        if (sameRefArray(dia.ejercicios as any, normalized as any)) {
          return dia;
        }

        changedDias = true;
        return { ...dia, ejercicios: normalized as any };
      });

      if (!changedDias) return state;
      return { ...state, dias: nextDias };
    }

    case "REMOVE_EJERCICIO": {
      const { diaSemana, orden, compuestoId } = action.payload;

      let changedDias = false;

      const nextDias = state.dias.map((dia) => {
        if (dia.diaSemana !== diaSemana) return dia;

        const original = dia.ejercicios ?? [];
        let filtered = original;

        if (compuestoId !== undefined) {
          filtered = original.filter((ej: any) => {
            if (!("compuesto" in ej) || !ej.compuesto) return true;
            return ej.ejercicioCompuestoId !== compuestoId;
          });
        } else if (typeof orden === "number") {
          filtered = original.filter((ej: any) => ej.orden !== orden);
        }

        if (filtered === original) return dia;
        if (filtered.length === original.length) return dia;

        const normalized = normalizeOrdenMinClone(filtered as any);
        changedDias = true;
        return { ...dia, ejercicios: normalized as any };
      });

      if (!changedDias) return state;
      return { ...state, dias: nextDias };
    }

    case "ADD_EJERCICIO_COMPUESTO": {
      const { diaSemana, ejercicios, descansoSeg, nombre, tipo, compuestoId } =
        action.payload;

      const diaIndex = state.dias.findIndex((d) => d.diaSemana === diaSemana);
      const prevList =
        diaIndex === -1 ? [] : state.dias[diaIndex].ejercicios ?? [];

      const maxOrden =
        prevList.length > 0
          ? Math.max(...prevList.map((e: any) => Number(e.orden) || 0))
          : 0;

      const compuesto = {
        orden: maxOrden + 1,
        compuesto: true,
        ejercicioCompuestoId: compuestoId,
        ejerciciosCompuestos: ejercicios,
        nombreCompuesto: nombre,
        tipoCompuesto: tipo,
        descansoCompuesto: descansoSeg,
      } as any;

      if (diaIndex === -1) {
        return {
          ...state,
          dias: [...state.dias, { diaSemana, ejercicios: [compuesto] }],
        };
      }

      const newDias = [...state.dias];
      newDias[diaIndex] = {
        ...newDias[diaIndex],
        ejercicios: [...prevList, compuesto],
      };

      return { ...state, dias: newDias };
    }

    case "COPY_DIA": {
      const { diaSemana } = action.payload;
      const dia = state.dias.find((d) => d.diaSemana === diaSemana);

      if (!dia) return { ...state, clipboard: undefined };

      return {
        ...state,
        clipboard: cloneEjercicios(dia.ejercicios as any),
      };
    }

    case "PASTE_DIA": {
      const { diaSemana, mode } = action.payload;

      if (!state.clipboard || state.clipboard.length === 0) return state;

      const ejerciciosCopiados = cloneEjercicios(state.clipboard);
      const diaIndex = state.dias.findIndex((d) => d.diaSemana === diaSemana);
      const newDias = [...state.dias];

      if (diaIndex === -1) {
        const reordenados = normalizeOrdenMinClone(ejerciciosCopiados as any);
        return {
          ...state,
          // @ts-ignore
          dias: [...newDias, { diaSemana, ejercicios: reordenados }],
        };
      }

      const destino = newDias[diaIndex];

      if (mode === "replace") {
        const reordenados = normalizeOrdenMinClone(ejerciciosCopiados as any);
        newDias[diaIndex] = {
          ...destino,
          ejercicios: reordenados as any,
        };
      } else {
        const base = (destino.ejercicios ?? []) as any[];
        const maxOrden =
          base.length > 0 ? Math.max(...base.map((e) => e.orden)) : 0;

        const appended = ejerciciosCopiados.map((ej, i) => {
          const nextOrden = maxOrden + i + 1;
          return (ej as any).orden === nextOrden
            ? (ej as any)
            : ({ ...(ej as any), orden: nextOrden } as any);
        });

        newDias[diaIndex] = {
          ...destino,
          ejercicios: [...base, ...appended] as any,
        };
      }

      return { ...state, dias: newDias };
    }

    case "CLEAR":
      return initialState;

    default:
      return state;
  }
}

export function useRutinaReducer() {
  const [state, dispatch] = useReducer(rutinaReducer, initialState);
  const [hydrated, setHydrated] = useState(false);
  const savingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);

        if (!raw) {
          setHydrated(true);
          return;
        }

        let parsed: State = initialState;

        try {
          const base =
            JSON.parse(raw) as CrearRutinaRequest & Partial<ClipboardState>;

          parsed = {
            nombre: base?.nombre ?? "",
            descripcion: base?.descripcion ?? "",
            usuarioId: typeof base?.usuarioId === "number" ? base.usuarioId : 1,
            dias: Array.isArray(base?.dias) ? (base.dias as any) : [],
            clipboard: Array.isArray((base as any)?.clipboard)
              ? ((base as any).clipboard as EjercicioAsignadoInput[])
              : undefined,
          };
        } catch {
          parsed = initialState;
        }

        if (!cancelled) {
          dispatch({ type: "HYDRATE", payload: parsed });
          setHydrated(true);
        }
      } catch {
        if (!cancelled) setHydrated(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (savingRef.current) return;

    savingRef.current = true;

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      .catch(() => { })
      .finally(() => {
        savingRef.current = false;
      });
  }, [state, hydrated]);

  return [state, dispatch] as const;
}