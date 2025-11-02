// src/shared/hooks/useRutinaReducer.ts
import { useEffect, useReducer, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  CrearRutinaRequest,
  EjercicioAsignadoInput,
  Action as BaseAction,
} from '@/features/type/crearRutina';

const STORAGE_KEY = "crearRutinaState";

/** --- Extensiones locales de tipo --- */
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

/** --- Estado inicial --- */
const initialState: State = {
  nombre: "",
  descripcion: "",
  usuarioId: 1,
  dias: [],
  clipboard: undefined,
};

/** Helper: clonar profundo ejercicios (incluye compuestos) */
function cloneEjercicios(list: EjercicioAsignadoInput[]): EjercicioAsignadoInput[] {
  // json deep clone suficiente aquí
  return JSON.parse(JSON.stringify(list)) as EjercicioAsignadoInput[];
}

function rutinaReducer(state: State, action: Action): State {
  switch (action.type) {
    case "HYDRATE":
      // Reemplaza todo el estado por el del storage
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
          dias: [...newDias, { diaSemana, ejercicios: [{ ...ejercicio, orden: 1 }] }],
        };
      }

      const ejerciciosActuales = [...state.dias[diaIndex].ejercicios];
      const maxOrden =
        ejerciciosActuales.length > 0 ? Math.max(...ejerciciosActuales.map((e) => e.orden)) : 0;

      newDias[diaIndex] = {
        diaSemana,
        ejercicios: [...ejerciciosActuales, { ...ejercicio, orden: maxOrden + 1 }],
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
                  "compuesto" in e ? e : e.orden === ejercicio.orden ? { ...e, ...ejercicio } : e
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
          ejercicios: dia.ejercicios.map((ej) =>
            "compuesto" in ej &&
            ej.ejerciciosCompuestos?.some((ec) => ec.ejercicioCompuestoId === compuestoId)
              ? {
                  ...ej,
                  nombreCompuesto: nombre,
                  tipoCompuesto: tipo,
                  descansoCompuesto: descansoSeg,
                }
              : ej
          ),
        })),
      };
    }

    case "REORDER_EJERCICIOS": {
      const { diaSemana, ejercicios } = action.payload;
      return {
        ...state,
        dias: state.dias.map((dia) => (dia.diaSemana === diaSemana ? { ...dia, ejercicios } : dia)),
      };
    }

    case "REMOVE_EJERCICIO": {
      const { diaSemana, orden, compuestoId } = action.payload;
      return {
        ...state,
        dias: state.dias.map((dia) => {
          if (dia.diaSemana !== diaSemana) return dia;

          let nuevaLista = dia.ejercicios;

          if (compuestoId) {
            nuevaLista = dia.ejercicios.filter(
              (ej) =>
                !(
                  "compuesto" in ej &&
                  ej.compuesto &&
                  Array.isArray(ej.ejerciciosCompuestos) &&
                  ej.ejerciciosCompuestos.length > 0 &&
                  ej.ejerciciosCompuestos[0].ejercicioCompuestoId === compuestoId
                )
            );
          } else if (typeof orden === "number") {
            nuevaLista = dia.ejercicios.filter((ej) => ej.orden !== orden);
          }

          const reordenados = nuevaLista.map((ej, idx) => ({
            ...ej,
            orden: idx + 1,
          }));

          return { ...dia, ejercicios: reordenados };
        }),
      };
    }

    case "ADD_EJERCICIO_COMPUESTO": {
      const { diaSemana, ejercicios, descansoSeg, nombre, tipo, compuestoId } = action.payload;
      const diaIndex = state.dias.findIndex((d) => d.diaSemana === diaSemana);
      const newDias = [...state.dias];
      const maxOrden = newDias[diaIndex]?.ejercicios.length || 0;

      const compuesto: EjercicioAsignadoInput = {
        orden: maxOrden + 1,
        compuesto: true,
        ejerciciosCompuestos: ejercicios,
        nombreCompuesto: nombre,
        tipoCompuesto: tipo,
        descansoCompuesto: descansoSeg,
        ejercicioCompuestoId: compuestoId,
      };

      if (diaIndex === -1) {
        return {
          ...state,
          dias: [...state.dias, { diaSemana, ejercicios: [compuesto] }],
        };
      }

      newDias[diaIndex] = {
        ...newDias[diaIndex],
        ejercicios: [...newDias[diaIndex].ejercicios, compuesto],
      };

      return { ...state, dias: newDias };
    }

    /** --- NUEVO: copiar todos los ejercicios de un día --- */
    case "COPY_DIA": {
      const { diaSemana } = action.payload;
      const dia = state.dias.find((d) => d.diaSemana === diaSemana);
      if (!dia) return { ...state, clipboard: undefined };

      return {
        ...state,
        clipboard: cloneEjercicios(dia.ejercicios),
      };
    }

    /** --- NUEVO: pegar en un día con 2 modos (replace | append) --- */
    case "PASTE_DIA": {
      const { diaSemana, mode } = action.payload;
      if (!state.clipboard || state.clipboard.length === 0) return state;

      const ejerciciosCopiados = cloneEjercicios(state.clipboard);

      const diaIndex = state.dias.findIndex((d) => d.diaSemana === diaSemana);
      const newDias = [...state.dias];

      if (diaIndex === -1) {
        // crear día destino
        const reordenados = ejerciciosCopiados.map((ej, idx) => ({
          ...ej,
          orden: idx + 1,
        }));
        return {
          ...state,
          //@ts-ignore
          dias: [...newDias, { diaSemana, ejercicios: reordenados }],
        };
      }

      const destino = newDias[diaIndex];

      if (mode === "replace") {
        // sustituir por completo
        const reordenados = ejerciciosCopiados.map((ej, idx) => ({
          ...ej,
          orden: idx + 1,
        }));
        newDias[diaIndex] = {
          ...destino,
          ejercicios: reordenados,
        };
      } else {
        // append: agregar al final respetando orden existente
        const base = destino.ejercicios ?? [];
        const maxOrden = base.length > 0 ? Math.max(...base.map((e) => e.orden)) : 0;

        const reordenados = ejerciciosCopiados.map((ej, i) => ({
          ...ej,
          orden: maxOrden + i + 1,
        }));

        newDias[diaIndex] = {
          ...destino,
          ejercicios: [...base, ...reordenados],
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

/**
 * Hook con persistencia en AsyncStorage (React Native).
 * - Hidrata una vez al montar.
 * - No sobreescribe el storage antes de hidratar.
 * - Mantiene la misma API: [state, dispatch]
 */
export function useRutinaReducer() {
  const [state, dispatch] = useReducer(rutinaReducer, initialState);
  const [hydrated, setHydrated] = useState(false);
  const savingRef = useRef(false);

  // HIDRATAR desde AsyncStorage al montar
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
          const base = JSON.parse(raw) as CrearRutinaRequest & Partial<ClipboardState>;
          parsed = {
            nombre: base?.nombre ?? "",
            descripcion: base?.descripcion ?? "",
            usuarioId: typeof base?.usuarioId === "number" ? base.usuarioId : 1,
            dias: Array.isArray(base?.dias) ? base!.dias : [],
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
        if (!cancelled) setHydrated(true); // continúa sin persistencia
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // GUARDAR en AsyncStorage cuando cambie el estado (solo tras hidratar)
  useEffect(() => {
    if (!hydrated) return;
    if (savingRef.current) return;

    savingRef.current = true;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      .catch(() => {
        // noop: evita romper la app si falla el guardado
      })
      .finally(() => {
        savingRef.current = false;
      });
  }, [state, hydrated]);

  return [state, dispatch] as const;
}
