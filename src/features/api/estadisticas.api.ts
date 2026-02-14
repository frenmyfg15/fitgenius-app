// src/features/api/estadisticas.api.ts
import axios from "axios";
import { api } from "./axios";
import { handleApiError } from "@/shared/lib/handleApiError";
import { checkAuthTokenInvalid } from "@/shared/lib/checkAuthTokenInvalid"; // ✅ NUEVO

const log = (...args: any[]) => {
  if (__DEV__) console.log("[API estadisticas]", ...args);
};

type StatsError = {
  errorCode?: string;
  message?: string;
  raw?: any;
};

const isDayPassError = (error: unknown): StatsError | null => {
  if (!axios.isAxiosError(error)) return null;
  const data = error.response?.data as any;
  if (!data) return null;

  if (data.errorCode === "AD_REQUIRED_STATS_DAYPASS") {
    return {
      errorCode: data.errorCode,
      message: data.message,
      raw: error,
    };
  }

  return null;
};

/* ============================================================
   ACTIVIDAD RECIENTE
============================================================ */
export const obtenerActividadReciente = async () => {
  try {
    log("obtenerActividadReciente → /estadisticas/actividad-reciente");
    const res = await api.get("/estadisticas/actividad-reciente");
    log("obtenerActividadReciente ← ok", {
      status: res.status,
      keys: Object.keys(res.data || {}),
    });
    return res.data?.data;
  } catch (error) {
    // 🔐 1) token inválido → logout
    checkAuthTokenInvalid(error);

    // 🎟️ 2) day pass
    const dayPass = isDayPassError(error);
    if (dayPass) {
      throw dayPass;
    }

    // ❌ 3) error normal
    throw handleApiError(
      error,
      "Error al obtener actividad reciente"
    );
  }
};

export const obtenerDistribucionMuscular = async () => {
  try {
    log("obtenerDistribucionMuscular → /estadisticas/distribucion-muscular");
    const res = await api.get("/estadisticas/distribucion-muscular");
    log("obtenerDistribucionMuscular ← ok", {
      status: res.status,
      keys: Object.keys(res.data || {}),
    });
    return res.data?.data;
  } catch (error) {
    checkAuthTokenInvalid(error);

    const dayPass = isDayPassError(error);
    if (dayPass) {
      throw dayPass;
    }

    throw handleApiError(
      error,
      "Error al obtener distribución muscular"
    );
  }
};

export const obtenerEstadisticasCalorias = async () => {
  try {
    log("obtenerEstadisticasCalorias → /estadisticas/calorias");
    const res = await api.get("/estadisticas/calorias");
    log("obtenerEstadisticasCalorias ← ok", {
      status: res.status,
      keys: Object.keys(res.data || {}),
    });
    return res.data?.data;
  } catch (error) {
    checkAuthTokenInvalid(error);

    const dayPass = isDayPassError(error);
    if (dayPass) {
      throw dayPass;
    }

    throw handleApiError(
      error,
      "Error al obtener calorías quemadas"
    );
  }
};

export const obtenerAdherenciaYConsistencia = async () => {
  try {
    log("obtenerAdherenciaYConsistencia → /estadisticas/adherencia-consistencia");
    const res = await api.get("/estadisticas/adherencia-consistencia");
    log("obtenerAdherenciaYConsistencia ← ok", {
      status: res.status,
      keys: Object.keys(res.data || {}),
    });
    return res.data?.data;
  } catch (error) {
    checkAuthTokenInvalid(error);

    const dayPass = isDayPassError(error);
    if (dayPass) {
      throw dayPass;
    }

    throw handleApiError(
      error,
      "Error al obtener adherencia y consistencia"
    );
  }
};

/** 🆕 Carga interna semanal */
export const obtenerCargaInternaSemanal = async (semanas?: number) => {
  try {
    log("obtenerCargaInternaSemanal → /estadisticas/carga-interna", {
      semanas,
    });

    const res = await api.get("/estadisticas/carga-interna", {
      params: semanas ? { semanas } : undefined,
    });

    log("obtenerCargaInternaSemanal ← ok", {
      status: res.status,
      keys: Object.keys(res.data || {}),
    });

    return res.data?.data;
  } catch (error) {
    checkAuthTokenInvalid(error);

    const dayPass = isDayPassError(error);
    if (dayPass) {
      throw dayPass;
    }

    throw handleApiError(
      error,
      "Error al obtener la carga interna semanal"
    );
  }
};

/** 🆕 Días por color de estrés */
export const obtenerDiasColorEstres = async (dias?: number) => {
  try {
    log("obtenerDiasColorEstres → /estadisticas/dias-color-estres", {
      dias,
    });

    const res = await api.get("/estadisticas/dias-color-estres", {
      params: dias ? { dias } : undefined,
    });

    log("obtenerDiasColorEstres ← ok", {
      status: res.status,
      keys: Object.keys(res.data || {}),
    });

    return res.data?.data;
  } catch (error) {
    checkAuthTokenInvalid(error);

    const dayPass = isDayPassError(error);
    if (dayPass) {
      throw dayPass;
    }

    throw handleApiError(
      error,
      "Error al obtener los días por nivel de estrés"
    );
  }
};

/** 🆕 Progreso subjetivo por ejercicio */
export const obtenerProgresoSubjetivoEjercicios = async (opts?: {
  dias?: number;
  top?: number;
}) => {
  try {
    const params: Record<string, number> = {};
    if (opts?.dias) params.dias = opts.dias;
    if (opts?.top) params.top = opts.top;

    log(
      "obtenerProgresoSubjetivoEjercicios → /estadisticas/progreso-subjetivo-ejercicios",
      { params }
    );

    const res = await api.get(
      "/estadisticas/progreso-subjetivo-ejercicios",
      { params: Object.keys(params).length ? params : undefined }
    );

    log("obtenerProgresoSubjetivoEjercicios ← ok", {
      status: res.status,
      keys: Object.keys(res.data || {}),
    });

    return res.data?.data;
  } catch (error) {
    checkAuthTokenInvalid(error);

    const dayPass = isDayPassError(error);
    if (dayPass) {
      throw dayPass;
    }

    throw handleApiError(
      error,
      "Error al obtener el progreso subjetivo por ejercicio"
    );
  }
};
