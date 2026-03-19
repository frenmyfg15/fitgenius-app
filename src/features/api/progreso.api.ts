import { api } from "./axios";
import { handleApiError } from "@/shared/lib/handleApiError";
import { checkAuthTokenInvalid } from "@/shared/lib/checkAuthTokenInvalid";

const log = (...args: any[]) => {
    if (__DEV__) console.log("[API progreso]", ...args);
};

export type SeguimientoDecision =
    | "MANTENER"
    | "AJUSTAR"
    | "REEMPLAZAR"
    | "INSIGHT";

export type CheckSeguimientoResponse = {
    ok: boolean;
    data: {
        mostrar: boolean;
        motivo?: "TIEMPO" | "SESIONES" | null;
        sesionesDesdeUltimo?: number;
    };
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

export type AnalizarSeguimientoResponse = {
    ok: boolean;
    data: AnalisisSeguimientoData;
};

export type AplicarSeguimientoData = {
    decision: SeguimientoDecision;
    mensaje: string;
    adherencia: number;
    estres: number;
    progreso: number;
    diasEsperados: number;
    diasCompletados: number;
    aplicado?: boolean;
    accion?: "RUTINA_AJUSTADA" | "RUTINA_REEMPLAZADA";
    nuevaRutinaId?: number;
};

export type AplicarSeguimientoResponse = {
    ok: boolean;
    data: AplicarSeguimientoData;
};

export const checkSeguimiento = async (): Promise<CheckSeguimientoResponse["data"] | null> => {
    try {
        log("checkSeguimiento →");

        const res = await api.get("/progreso/check");

        log("checkSeguimiento ← ok", res.data);

        return res.data?.data ?? null;
    } catch (err: any) {
        checkAuthTokenInvalid(err);
        return handleApiError(err, "No se pudo comprobar el seguimiento");
    }
};

export const analizarSeguimiento = async (): Promise<AnalisisSeguimientoData | null> => {
    try {
        log("analizarSeguimiento →");

        const res = await api.post("/progreso/analizar");

        log("analizarSeguimiento ← ok", res.data);

        return res.data?.data ?? null;
    } catch (err: any) {
        checkAuthTokenInvalid(err);
        return handleApiError(err, "No se pudo analizar tu seguimiento");
    }
};

export const aplicarSeguimiento = async (): Promise<AplicarSeguimientoData | null> => {
    try {
        log("aplicarSeguimiento →");

        const res = await api.post("/progreso/aplicar");

        log("aplicarSeguimiento ← ok", res.data);

        return res.data?.data ?? null;
    } catch (err: any) {
        checkAuthTokenInvalid(err);
        return handleApiError(err, "No se pudo aplicar la mejora de rutina");
    }
};