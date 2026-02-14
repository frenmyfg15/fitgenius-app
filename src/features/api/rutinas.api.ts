// src/features/api/rutinas.api.ts
import { api } from "./axios";
import { handleApiError } from "@/shared/lib/handleApiError";
import { checkAuthTokenInvalid } from "@/shared/lib/checkAuthTokenInvalid"; // ✅ NUEVO

const log = (...args: any[]) => {
  if (__DEV__) console.log("[API rutinas]", ...args);
};

/* ============================================================
   CREAR RUTINA (IA / simple)  → admite adToken
============================================================ */
export const crearRutina = async (
  payload: { nombre: string; instruccion?: string },
  adToken?: string
) => {
  try {
    log("crearRutina → /rutinas/", { payload, hasAdToken: !!adToken });

    const config = adToken ? { headers: { "X-Ad-Token": adToken } } : undefined;

    const res = await api.post("/rutinas/", payload, config);

    log("crearRutina ← ok", {
      status: res.status,
      keys: Object.keys(res.data || {}),
    });

    const data = res.data?.data ?? res.data;
    return data;
  } catch (error: any) {
    log("crearRutina ← error", error);

    checkAuthTokenInvalid(error); // ✅ limpia store si token inválido

    const errorCode = error?.response?.data?.errorCode || error?.response?.data?.code;

    // ⚠️ AD_REQUIRED → no usamos handleApiError, el caller dispara anuncio
    if (errorCode === "AD_REQUIRED") {
      throw {
        errorCode: "AD_REQUIRED",
        message:
          error?.response?.data?.message ??
          "Debes ver un anuncio para crear esta rutina.",
        raw: error,
      };
    }

    // 👉 resto de errores
    return handleApiError(error, "Error al crear la rutina");
  }
};

/* ============================================================
   OBTENER UNA RUTINA
============================================================ */
export const obtenerRutina = async (idRutina: number) => {
  try {
    log("obtenerRutina →", idRutina);

    const res = await api.get(`/rutinas/${idRutina}`);

    log("obtenerRutina ← ok", {
      status: res.status,
      keys: Object.keys(res.data || {}),
    });

    const data = res.data?.data ?? res.data;
    return data;
  } catch (error) {
    log("obtenerRutina ← error", error);

    checkAuthTokenInvalid(error); // ✅

    return handleApiError(error, "Error al obtener la rutina");
  }
};

/* ============================================================
   OBTENER TODAS LAS RUTINAS DEL USUARIO
============================================================ */
export const obtenerRutinas = async () => {
  try {
    log("obtenerRutinas → /rutinas/todas/");

    const res = await api.get("/rutinas/todas/");

    log("obtenerRutinas ← ok", {
      status: res.status,
      keys: Object.keys(res.data || {}),
    });

    const data = res.data?.data ?? res.data;

    log("obtenerRutinas ← data shape", {
      isArray: Array.isArray(data),
      length: Array.isArray(data) ? data.length : undefined,
    });

    return data;
  } catch (error) {
    log("obtenerRutinas ← error", error);

    checkAuthTokenInvalid(error); // ✅

    return handleApiError(error, "Error al obtener tus rutinas");
  }
};

/* ============================================================
   ELIMINAR RUTINA
============================================================ */
export const eliminarRutinaPorId = async (rutinaId: number) => {
  try {
    log("eliminarRutinaPorId →", rutinaId);

    const res = await api.delete(`/rutinas/${rutinaId}`);

    log("eliminarRutinaPorId ← ok", {
      status: res.status,
      keys: Object.keys(res.data || {}),
    });

    const data = res.data?.data ?? res.data;
    return data;
  } catch (error) {
    log("eliminarRutinaPorId ← error", error);

    checkAuthTokenInvalid(error); // ✅

    return handleApiError(error, "Error al eliminar la rutina");
  }
};

/* ============================================================
   ACTUALIZAR RUTINA ACTIVA
============================================================ */
export const actualizarRutinaActiva = async (rutinaId: number) => {
  try {
    log("actualizarRutinaActiva →", { rutinaId });

    const res = await api.post("/rutinas/rutina-activa", { rutinaId });

    log("actualizarRutinaActiva ← ok", {
      status: res.status,
      keys: Object.keys(res.data || {}),
    });

    const data = res.data?.data ?? res.data;
    return data;
  } catch (error) {
    log("actualizarRutinaActiva ← error", error);

    checkAuthTokenInvalid(error); // ✅

    return handleApiError(error, "Error al actualizar la rutina activa");
  }
};

/* ============================================================
   CREAR / EDITAR RUTINA PERSONALIZADA  → admite adToken
============================================================ */
export const crearRutinaPersonalizada = async (data: any, id?: number, adToken?: string) => {
  try {
    const isUpdate = typeof id === "number";

    const config = {
      ...(adToken ? { headers: { "X-Ad-Token": adToken } } : {}),
      ...(isUpdate ? { params: { id } } : {}),
    };

    if (isUpdate) {
      /* ------------ UPDATE ------------ */
      log("crearRutinaPersonalizada[UPDATE] → /rutinas/crear", {
        id,
        hasAdToken: !!adToken,
      });

      const res = await api.put("/rutinas/crear", data, config);

      const payload = res.data?.data ?? res.data;

      log("crearRutinaPersonalizada[UPDATE] ← ok", {
        status: res.status,
        keys: Object.keys(payload || {}),
      });

      return payload;
    }

    /* ------------ CREATE ------------ */
    log("crearRutinaPersonalizada[CREATE] → /rutinas/crear", {
      hasAdToken: !!adToken,
    });

    const res = await api.post("/rutinas/crear", data, config);

    const payload = res.data?.data ?? res.data;

    log("crearRutinaPersonalizada[CREATE] ← ok", {
      status: res.status,
      keys: Object.keys(payload || {}),
    });

    return payload;
  } catch (error: any) {
    log("crearRutinaPersonalizada ← error", error);

    checkAuthTokenInvalid(error); // ✅

    const errorCode = error?.response?.data?.errorCode || error?.response?.data?.code;

    // ⭐ AD_REQUIRED → se lanza para que el caller gestione anuncio
    if (errorCode === "AD_REQUIRED") {
      throw {
        errorCode: "AD_REQUIRED",
        message:
          error?.response?.data?.message ??
          "Debes ver un anuncio o tener suscripción activa para usar esta función.",
        raw: error,
      };
    }

    const fallback =
      typeof id === "number" ? "Error al actualizar la rutina" : "Error al crear la rutina";

    return handleApiError(error, fallback);
  }
};

// Tip reutilizable (igual al de ejercicios)
export type ChatTurn = {
  role: "user" | "assistant";
  content: string;
};

export const preguntarRutinaManualIA = async (
  rutina: any,
  pregunta: string,
  historial: ChatTurn[] = []
): Promise<string | null> => {
  try {
    log("preguntarRutinaManualIA → /rutinas/manual/pregunta", {
      preguntaLength: pregunta?.length,
      historialLength: historial?.length,
      hasRutina: !!rutina,
    });

    const res = await api.post("/rutinas/manual/pregunta", {
      rutina,
      pregunta,
      historial,
    });

    const payload = res.data?.data ?? res.data;
    const respuesta: string = payload?.respuesta ?? payload;

    log("preguntarRutinaManualIA ← ok", {
      status: res.status,
      respuestaLength: respuesta?.length,
    });

    return respuesta;
  } catch (error) {
    checkAuthTokenInvalid(error); // ✅

    // handleApiError muestra el toast global y suele devolver null/undefined
    return handleApiError(error, "Error al preguntar sobre la rutina");
  }
};
