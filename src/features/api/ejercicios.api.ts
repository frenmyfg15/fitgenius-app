// src/features/api/ejercicios.api.ts

import { handleApiError } from "@/shared/lib/handleApiError";
import { api } from "./axios";
import { checkAuthTokenInvalid } from "@/shared/lib/checkAuthTokenInvalid"; // ✅ NUEVO

const log = (...args: any[]) => {
  if (__DEV__) console.log("[API ejercicios]", ...args);
};

/* ============================================================
   TIPOS BÁSICOS
============================================================ */

export type EjercicioDTO = {
  id: number;
  nombre: string;
  descripcion?: string | null;
  idGif: string;
  tipoEjercicio: string;
  grupoMuscular: string;
};

export type BuscarEjerciciosResponse = {
  items: EjercicioDTO[];
  nextCursor: number | null;
  hasMore: boolean;
};

export type BuscarEjerciciosParams = {
  search?: string;
  grupoMuscular?: string;
  tipoEjercicio?: string;
  take?: number;
  cursor?: number | null;
};

/* ============================================================
   EJERCICIO SIMPLE
============================================================ */
export const obtenerEjercicio = async (nombreEjercicio: string) => {
  try {
    log("obtenerEjercicio →", nombreEjercicio);

    const res = await api.get(
      `/ejercicios/${encodeURIComponent(nombreEjercicio)}`
    );

    const ejercicio = res.data?.data ?? res.data;

    log("obtenerEjercicio ← ok", {
      status: res.status,
      keys: Object.keys(ejercicio || {}),
    });

    return ejercicio;
  } catch (error) {
    log("obtenerEjercicio ← error", error);

    checkAuthTokenInvalid(error); // ✅

    return handleApiError(error, "Error al obtener el ejercicio");
  }
};

/* ============================================================
   GUARDAR SESIÓN SIMPLE (con AD_REQUIRED)
============================================================ */
export const guardarSesionEjercicio = async (
  payload: {
    usuarioId: number;
    ejercicioId: number;
    series: { peso: number; reps: number }[];
    ejercicioAsignado: number;
    nivelEstres?: number;
  },
  adToken?: string
) => {
  try {
    log("guardarSesionEjercicio →", { payload, adToken: !!adToken });

    const res = await api.post(
      "/ejercicios/sesion-ejercicio",
      payload,
      adToken ? { headers: { "X-Ad-Token": adToken } } : undefined
    );

    const sesion = res.data?.data ?? res.data;

    log("guardarSesionEjercicio ← ok", {
      status: res.status,
      keys: Object.keys(sesion || {}),
    });

    return sesion;
  } catch (error: any) {
    checkAuthTokenInvalid(error); // ✅ (antes del AD_REQUIRED)

    const errorCode =
      error?.response?.data?.errorCode || error?.response?.data?.code;

    if (errorCode === "AD_REQUIRED") {
      log("guardarSesionEjercicio ← AD_REQUIRED → se lanza error (sin toast)");
      throw {
        errorCode: "AD_REQUIRED",
        message:
          error?.response?.data?.message ??
          "Debes ver un anuncio para guardar la sesión.",
        raw: error,
      };
    }

    log("guardarSesionEjercicio ← error", {
      status: error?.response?.status,
      data: error?.response?.data,
    });

    return handleApiError(error, "Error al guardar la sesión del ejercicio");
  }
};

/* ============================================================
   COMPLETAR SESIÓN (simple)
============================================================ */
export const completarSesionEjercicio = async (payload: {
  usuarioId: number;
  ejercicioId: number;
}) => {
  try {
    log("completarSesionEjercicio →", payload);

    const res = await api.patch(
      "/ejercicios/sesion-ejercicio/completar",
      payload
    );

    const data = res.data?.data ?? res.data;

    log("completarSesionEjercicio ← ok", {
      status: res.status,
      keys: Object.keys(data || {}),
    });

    return data;
  } catch (error) {
    checkAuthTokenInvalid(error); // ✅

    const apiError = handleApiError(error, "Error al marcar como completado");
    throw apiError;
  }
};

/* ============================================================
   BUSCAR LISTA DE EJERCICIOS (paginado)
============================================================ */
export const buscarEjercicios = async ({
  search,
  grupoMuscular,
  tipoEjercicio,
  take = 30,
  cursor = null,
}: BuscarEjerciciosParams): Promise<BuscarEjerciciosResponse> => {
  try {
    const params = new URLSearchParams();

    if (search) params.set("search", search);
    if (grupoMuscular) params.set("grupoMuscular", grupoMuscular);
    if (tipoEjercicio) params.set("tipoEjercicio", tipoEjercicio);
    if (take) params.set("take", String(take));
    if (cursor != null) params.set("cursor", String(cursor));

    const url = `/ejercicios?${params.toString()}`;
    log("buscarEjercicios →", url);

    const res = await api.get(url);

    const payload = res.data?.data ?? res.data;

    log("buscarEjercicios ← ok", {
      status: res.status,
      items: payload?.items?.length,
      keys: Object.keys(payload || {}),
    });

    return payload;
  } catch (error) {
    log("buscarEjercicios ← error", error);

    checkAuthTokenInvalid(error); // ✅

    return handleApiError(error, "Error al buscar ejercicios");
  }
};

/* ============================================================
   EJERCICIO COMPUESTO
============================================================ */
export const obtenerEjercicioCompuesto = async (id: number) => {
  try {
    log("obtenerEjercicioCompuesto →", id);

    const res = await api.get(`/ejercicios/compuestos/${id}`);

    const payload = res.data?.data ?? res.data;

    log("obtenerEjercicioCompuesto ← ok", {
      status: res.status,
      keys: Object.keys(payload || {}),
    });

    return payload;
  } catch (error) {
    log("obtenerEjercicioCompuesto ← error", error);

    checkAuthTokenInvalid(error); // ✅

    return handleApiError(error, "Error al obtener el ejercicio compuesto");
  }
};

/* ============================================================
   GUARDAR SESIÓN COMPUESTA (con AD_REQUIRED)
============================================================ */
export const guardarSesionCompuesta = async (
  payload: {
    usuarioId: number;
    ejercicioCompuestoId: number;
    series: {
      ejercicioId: number;
      pesoKg?: number;
      repeticiones?: number;
      duracionSegundos?: number;
    }[][];
    nivelEstres?: number;
  },
  adToken?: string
) => {
  try {
    log("guardarSesionCompuesta →", { payload, adToken: !!adToken });

    const config = adToken ? { headers: { "X-Ad-Token": adToken } } : undefined;

    const res = await api.post(
      "/ejercicios/sesiones/compuesta",
      payload,
      config
    );

    const sesionCompuesta = res.data?.data ?? res.data;

    log("guardarSesionCompuesta ← ok", {
      status: res.status,
      keys: Object.keys(sesionCompuesta || {}),
    });

    return sesionCompuesta;
  } catch (error: any) {
    checkAuthTokenInvalid(error); // ✅ (antes del AD_REQUIRED)

    const errorCode =
      error?.response?.data?.errorCode || error?.response?.data?.code;

    if (errorCode === "AD_REQUIRED") {
      log("guardarSesionCompuesta ← AD_REQUIRED → se lanza error (sin toast)");
      throw {
        errorCode: "AD_REQUIRED",
        message: error?.response?.data?.message ?? "Debes ver un anuncio.",
        raw: error,
      };
    }

    log("guardarSesionCompuesta ← error", error);
    return handleApiError(error, "Error al guardar la sesión compuesta");
  }
};

/* ============================================================
   IA (preguntas)
============================================================ */

export type ChatTurn = {
  role: "user" | "assistant";
  content: string;
};

export const preguntarEjercicioIA = async (
  ejercicioId: number,
  pregunta: string,
  historial: ChatTurn[] = []
): Promise<string | null> => {
  try {
    log("preguntarEjercicioIA →", {
      ejercicioId,
      pregunta,
      historialLength: historial.length,
    });

    const res = await api.post(`/ejercicios/${ejercicioId}/pregunta`, {
      pregunta,
      historial,
    });

    const payload = res.data?.data ?? res.data;
    const respuesta: string = payload?.respuesta ?? payload;

    log("preguntarEjercicioIA ← ok", {
      status: res.status,
      respuestaLength: respuesta?.length,
    });

    return respuesta;
  } catch (error) {
    log("preguntarEjercicioIA ← error", {
      status: (error as any)?.response?.status,
      data: (error as any)?.response?.data,
    });

    checkAuthTokenInvalid(error); // ✅

    return handleApiError(error, "Error al preguntar sobre el ejercicio");
  }
};

export const preguntarEjercicioCompuestoIA = async (
  ejercicioCompuestoId: number,
  pregunta: string,
  historial: ChatTurn[] = []
): Promise<string | null> => {
  try {
    log("preguntarEjercicioCompuestoIA →", {
      ejercicioCompuestoId,
      pregunta,
      historialLength: historial.length,
    });

    const res = await api.post(
      `/ejercicios/compuestos/${ejercicioCompuestoId}/pregunta`,
      { pregunta, historial }
    );

    const payload = res.data?.data ?? res.data;
    const respuesta: string = payload?.respuesta ?? payload;

    log("preguntarEjercicioCompuestoIA ← ok", {
      status: res.status,
      respuestaLength: respuesta?.length,
    });

    return respuesta;
  } catch (error) {
    log("preguntarEjercicioCompuestoIA ← error", {
      status: (error as any)?.response?.status,
      data: (error as any)?.response?.data,
    });

    checkAuthTokenInvalid(error); // ✅

    return handleApiError(
      error,
      "Error al preguntar sobre el ejercicio compuesto"
    );
  }
};
