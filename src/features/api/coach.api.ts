// src/features/api/coach.api.ts

import { api } from "./axios";
import { handleApiError } from "@/shared/lib/handleApiError";
import { checkAuthTokenInvalid } from "@/shared/lib/checkAuthTokenInvalid";

const log = (...args: any[]) => {
  if (__DEV__) console.log("[API coach]", ...args);
};

// ─── Tipos análisis diario ─────────────────────────────────────────────────────

export type MoodDiario = "FUEGO" | "SOLIDO" | "RECUPERA";

export type AnalisisDiarioData = {
  saludo: string;
  resumen: string;
  puntos: string[];
  recomendacion: string;
  mood: MoodDiario;
  stats: {
    ejerciciosCompletados: number;
    volumenTotal: number;
    caloriasQuemadas: number;
    estresPromedio: number | null;
  };
};

// ─── Tipos análisis semanal ────────────────────────────────────────────────────

export type MoodSemanal =
  | "SEMANA_ELITE"
  | "SEMANA_SOLIDA"
  | "SEMANA_IRREGULAR"
  | "SEMANA_RECUPERA";

export type DiaSemanaInfo = {
  dia: string;
  completado: boolean;
};

export type GrupoMuscularSemana = {
  grupo: string;
  sesiones: number;
  volumen: number;
};

export type AnalisisSemanalData = {
  saludo: string;
  resumen: string;
  puntos: string[];
  recomendacion: string;
  mood: MoodSemanal;
  diasSemana: DiaSemanaInfo[];
  gruposMusculares: GrupoMuscularSemana[];
  stats: {
    diasCompletados: number;
    diasPlanificados: number;
    ejerciciosTotales: number;
    volumenTotal: number;
    caloriasTotal: number;
    estresPromedio: number | null;
    adherencia: number;
  };
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
    | "general"
    | "rir"
    | "calentamiento"
    | "objetivo"
    | "periodizacion"
    | "frecuencia";
};

export type ObjetivoSesion = {
  series: number;
  repeticiones: number;
  pesoKg: number | null;
  volumenObjetivo: number | null;
  rir: number;
};

export type SesionPico = {
  vol: number;
  cargaMedia: number;
  fecha: string;
};

export type CoachAnalysisData = {
  ultimasSesiones: any[];
  // Promedios
  estresPromedio: number | null;
  volumenPromedio: number | null;
  cargaPromedio: number | null;
  // Tendencias
  tendenciaVolumen?: "SUBIENDO" | "BAJANDO" | "ESTABLE" | "SIN_DATOS";
  tendenciaCarga?: "SUBIENDO" | "BAJANDO" | "ESTABLE" | "SIN_DATOS";
  // Estado
  mood?: "PROGRESAR" | "MANTENER" | "DESCARGAR";
  grupoEstancado?: boolean;
  plateauEjercicio?: boolean;
  readinessScore?: number | null;
  // Métricas avanzadas
  unRMEstimado?: number | null;
  porcentajeUnRM?: number | null;
  frecuenciaMedia?: number | null;
  sesionPico?: SesionPico | null;
  // Prescripción
  objetivoSesion?: ObjetivoSesion | null;
  programacion?: {
    seriesSugeridas: number | null;
    repeticionesSugeridas: number | null;
    pesoSugerido: number | null;
  } | null;
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
    checkAuthTokenInvalid(err);

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
      log("[API coach] 404 → sin análisis disponible para ejercicioId:", ejercicioId);
      return null;
    }

    return handleApiError(err, "No se pudo obtener el análisis del Coach");
  }
};

/**
 * Obtiene el análisis diario del Coach Premium al completar todos los ejercicios del día.
 */
export const obtenerAnalisisDiario = async (): Promise<AnalisisDiarioData | null> => {
  try {
    log("obtenerAnalisisDiario →");
    const res = await api.get("/coach/analisis-diario");
    log("obtenerAnalisisDiario ← ok", res.data);
    return res.data?.data as AnalisisDiarioData;
  } catch (err: any) {
    checkAuthTokenInvalid(err);
    const status = err?.response?.status;
    if (status === 403 || status === 402) return null;
    return handleApiError(err, "No se pudo obtener el análisis del día");
  }
};

/**
 * Obtiene el análisis semanal del Coach Premium al completar todos los días de la semana.
 */
export const obtenerAnalisisSemanal = async (): Promise<AnalisisSemanalData | null> => {
  try {
    log("obtenerAnalisisSemanal →");
    const res = await api.get("/coach/analisis-semanal");
    log("obtenerAnalisisSemanal ← ok", res.data);
    return res.data?.data as AnalisisSemanalData;
  } catch (err: any) {
    checkAuthTokenInvalid(err);
    const status = err?.response?.status;
    if (status === 403 || status === 402) return null;
    return handleApiError(err, "No se pudo obtener el análisis semanal");
  }
};

/**
 * Obtiene el feedback del Coach Premium para un ejercicio compuesto.
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
    checkAuthTokenInvalid(err);

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
      log("[API coach] 404 → sin análisis disponible para compuestoId:", compuestoId);
      return null;
    }

    return handleApiError(
      err,
      "No se pudo obtener el análisis del Coach para el compuesto"
    );
  }
};
