import { api } from "./axios";
import { handleApiError } from "@/shared/lib/handleApiError";
import { checkAuthTokenInvalid } from "@/shared/lib/checkAuthTokenInvalid";

const log = (...args: any[]) => {
    if (__DEV__) console.log("[API progreso]", ...args);
};

// ─── Tipos base ───────────────────────────────────────────────────────────────

export type SeguimientoDecision =
    | "MANTENER"
    | "AJUSTAR"
    | "REEMPLAZAR"
    | "INSIGHT";

export type SeguimientoAccion =
    | "RUTINA_AJUSTADA"
    | "RUTINA_REEMPLAZADA"
    | "SIN_CAMBIOS";

export type SeguimientoCambio = {
    ejercicioId: number;
    nombreEjercicio: string;
    antes: { series?: number; repeticiones?: number; peso?: number };
    despues: { series?: number; repeticiones?: number; peso?: number };
};

export type SeguimientoMetricas = {
    adherencia: number;
    estres: number;
    progreso: number;
};

// ─── Respuestas de endpoint ───────────────────────────────────────────────────

export type CheckSeguimientoData = {
    mostrar: boolean;
    motivo: "TIEMPO" | "SESIONES" | null;
    sesionesDesdeUltimo: number;
    diasDesdeUltimo: number | null;
};

export type AnalisisSeguimientoData = {
    decision: SeguimientoDecision;
    mensaje: string;
    adherencia: number;
    estres: number;
    progreso: number;
    diasEsperados: number;
    diasCompletados: number;
};

export type AplicarSeguimientoData =
    | (AnalisisSeguimientoData & { aplicado: false })
    | (AnalisisSeguimientoData & {
        aplicado: true;
        accion: SeguimientoAccion;
        logId: number;
        nuevaRutinaId?: number;
    });

export type ModalSeguimientoData = {
    logId: number;
    decision: SeguimientoDecision;
    accion: SeguimientoAccion;
    mensaje: string;
    metricas: SeguimientoMetricas;
    cambios: SeguimientoCambio[];
    rutinaNuevaId?: number;
} | null;

// ─── Llamadas ─────────────────────────────────────────────────────────────────

export const checkSeguimiento = async (): Promise<CheckSeguimientoData | null> => {
    try {
        log("checkSeguimiento →");
        const res = await api.get("/progreso/seguimiento/check");
        log("checkSeguimiento ←", res.data);
        return res.data?.data ?? null;
    } catch (err: any) {
        checkAuthTokenInvalid(err);
        return handleApiError(err, "No se pudo comprobar el seguimiento");
    }
};

export const analizarSeguimiento = async (): Promise<AnalisisSeguimientoData | null> => {
    try {
        log("analizarSeguimiento →");
        const res = await api.get("/progreso/seguimiento/analizar");
        log("analizarSeguimiento ←", res.data);
        return res.data?.data ?? null;
    } catch (err: any) {
        checkAuthTokenInvalid(err);
        return handleApiError(err, "No se pudo analizar tu seguimiento");
    }
};

export const aplicarSeguimiento = async (): Promise<AplicarSeguimientoData | null> => {
    try {
        log("aplicarSeguimiento →");
        const res = await api.post("/progreso/seguimiento/aplicar");
        log("aplicarSeguimiento ←", res.data);
        return res.data?.data ?? null;
    } catch (err: any) {
        checkAuthTokenInvalid(err);
        return handleApiError(err, "No se pudo aplicar la mejora de rutina");
    }
};

export const omitirSeguimiento = async (): Promise<void> => {
    try {
        log("omitirSeguimiento →");
        await api.post("/progreso/seguimiento/omitir");
        log("omitirSeguimiento ← ok");
    } catch (err: any) {
        checkAuthTokenInvalid(err);
        handleApiError(err, "No se pudo omitir el seguimiento");
    }
};

export const obtenerModalSeguimiento = async (): Promise<ModalSeguimientoData> => {
    try {
        log("obtenerModalSeguimiento →");
        const res = await api.get("/progreso/seguimiento/modal");
        log("obtenerModalSeguimiento ←", res.data);
        return res.data?.data ?? null;
    } catch (err: any) {
        checkAuthTokenInvalid(err);
        return handleApiError(err, "No se pudo obtener el resumen de seguimiento");
    }
};

export const marcarSeguimientoVisto = async (logId: number): Promise<void> => {
    try {
        log("marcarSeguimientoVisto →", logId);
        await api.patch(`/progreso/seguimiento/modal/${logId}/visto`);
        log("marcarSeguimientoVisto ← ok");
    } catch (err: any) {
        checkAuthTokenInvalid(err);
        handleApiError(err, "No se pudo marcar el seguimiento como visto");
    }
};