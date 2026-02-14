// src/features/api/coach.api.ts

/**
 * API del Coach Premium
 *
 * Esta API consulta el endpoint:
 *    GET /coach/ejercicios/{ejercicioId}
 */

import { api } from "./axios";
import { handleApiError } from "@/shared/lib/handleApiError";
import { checkAuthTokenInvalid } from "@/shared/lib/checkAuthTokenInvalid"; // ✅ NUEVO

const log = (...args: any[]) => {
  if (__DEV__) console.log("[API coach]", ...args);
};

export type CoachSuggestion = {
  titulo: string;
  mensaje: string;
  categoria:
    | "carga"
    | "volumen"
    | "tecnica"
    | "estres"
    | "progresion"
    | "consistencia"
    | "riesgo"
    | "general";
};

export type CoachAnalysisData = {
  ultimasSesiones: any[];
  estresPromedio: number | null;
  volumenPromedio: number | null;
  cargaPromedio: number | null;
  sugerencias: CoachSuggestion[];
};

export type CoachResponse = {
  ok: boolean;
  ejercicioId: number;
  slug?: string;
  data: CoachAnalysisData;
};

/**
 * Obtiene el feedback del Coach Premium para un ejercicio específico.
 * Ahora por ejercicioId (numérico).
 */
export const obtenerCoach = async (
  ejercicioId: number
): Promise<CoachResponse | null> => {
  try {
    log("obtenerCoach → ejercicioId", ejercicioId);

    const res = await api.get(`/coach/ejercicios/${ejercicioId}`);

    log("obtenerCoach ← ok", res.data);

    return res.data as CoachResponse;
  } catch (err: any) {
    checkAuthTokenInvalid(err); // ✅

    const status = err?.response?.status;
    const errorCode = err?.response?.data?.errorCode || err?.response?.data?.code;

    if (errorCode === "UPGRADE_REQUIRED") {
      return {
        ok: false,
        ejercicioId,
        data: {
          ultimasSesiones: [],
          estresPromedio: null,
          volumenPromedio: null,
          cargaPromedio: null,
          sugerencias: [
            {
              titulo: "Activa Coach Premium",
              mensaje:
                "Desbloquea consejos personalizados, análisis de tus últimas sesiones y recomendaciones del entrenador personal.",
              categoria: "general",
            },
          ],
        },
      };
    }

    if (status === 404) {
      log(
        "[API coach] 404 → sin análisis disponible para ejercicioId:",
        ejercicioId
      );
      return null;
    }

    return handleApiError(err, "No se pudo obtener el análisis del Coach");
  }
};

/**
 * Obtiene el feedback del Coach Premium para un ejercicio compuesto.
 * Usa el mismo tipo CoachResponse para reutilizar el modal.
 */
export const obtenerCoachCompuesto = async (
  compuestoId: number
): Promise<CoachResponse | null> => {
  try {
    log("obtenerCoachCompuesto → compuestoId", compuestoId);

    const res = await api.get(`/coach/compuestos/${compuestoId}`);

    log("obtenerCoachCompuesto ← ok", res.data);

    return res.data as CoachResponse;
  } catch (err: any) {
    checkAuthTokenInvalid(err); // ✅

    const status = err?.response?.status;
    const errorCode = err?.response?.data?.errorCode || err?.response?.data?.code;

    if (errorCode === "UPGRADE_REQUIRED") {
      return {
        ok: false,
        ejercicioId: compuestoId,
        data: {
          ultimasSesiones: [],
          estresPromedio: null,
          volumenPromedio: null,
          cargaPromedio: null,
          sugerencias: [
            {
              titulo: "Activa Coach Premium",
              mensaje:
                "Desbloquea el análisis avanzado de tus superseries y circuitos (volumen total, carga y estrés acumulado).",
              categoria: "general",
            },
          ],
        },
      };
    }

    if (status === 404) {
      log(
        "[API coach] 404 → sin análisis disponible para compuestoId:",
        compuestoId
      );
      return null;
    }

    return handleApiError(
      err,
      "No se pudo obtener el análisis del Coach para el compuesto"
    );
  }
};
