// File: src/shared/components/ui/IaGenerateAuto.tsx
import React, { useEffect, useRef } from "react";
import { Modal } from "react-native";

import { crearRutina } from "@/features/api/rutinas.api";
import { useUsuarioStore, UsuarioLogin } from "@/features/store/useUsuarioStore";
import { useSyncStore } from "@/features/store/useSyncStore";
import { useRutinaCache } from "@/features/store/useRutinaCache";
import { useRutinasCache } from "@/features/store/useRutinasCache";
import { Toast } from "@/shared/components/ui/Toast";
import CargaRutina from "./CargaRutina";

type Props = {
    onDone?: () => void;
    onError?: () => void;
};

// ── Genera nombre e instrucción a partir del perfil ──────────────────────────

const OBJETIVO_MAP: Record<string, string> = {
    GANANCIA_MUSCULAR: "ganancia muscular",
    PERDIDA_PESO: "pérdida de peso",
    DEFINICION: "definición",
    RESISTENCIA: "resistencia",
    FUERZA: "fuerza",
    MANTENIMIENTO: "mantenimiento",
};

const NIVEL_MAP: Record<string, string> = {
    PRINCIPIANTE: "principiante",
    INTERMEDIO: "intermedio",
    AVANZADO: "avanzado",
};

const LUGAR_MAP: Record<string, string> = {
    GIMNASIO: "gimnasio",
    CASA: "casa",
    AIRE_LIBRE: "aire libre",
};

function buildPayload(usuario: UsuarioLogin): { nombre: string; instruccion: string } {
    const objetivo = OBJETIVO_MAP[usuario.objetivoPrincipal] ?? "fitness general";
    const nivel = NIVEL_MAP[usuario.nivelExperiencia] ?? "intermedio";
    const lugar = LUGAR_MAP[usuario.lugarEntrenamiento] ?? "gimnasio";
    const dias = usuario.dias?.length ?? 3;
    const duracion = usuario.duracionSesion ?? "45-60 min";

    const nombre = `Mi rutina de ${objetivo}`;

    const instruccion =
        `Crea una rutina de ${dias} días semanales para ${objetivo}, ` +
        `nivel ${nivel}, entrenando en ${lugar}. ` +
        `Duración por sesión: ${duracion}. ` +
        `Adapta los ejercicios al equipamiento disponible y al perfil del usuario.`;

    return { nombre, instruccion };
}

function getRutinaIdFromResponse(res: any): number | undefined {
    const rawId =
        res?.data?.rutina?.id ??
        res?.rutina?.id ??
        res?.data?.id ??
        res?.id;
    if (rawId == null) return undefined;
    const parsed = typeof rawId === "number" ? rawId : Number(rawId);
    return Number.isNaN(parsed) ? undefined : parsed;
}

// ── Componente ────────────────────────────────────────────────────────────────

export default function IaGenerateAuto({ onDone, onError }: Props) {
    const usuario = useUsuarioStore((s) => s.usuario);
    const setUsuario = useUsuarioStore((s) => s.setUsuario);
    const rutinasIACreadas = useUsuarioStore((s) => s.usuario?.rutinasIACreadas ?? 0);
    const hasRun = useRef(false);

    useEffect(() => {
        if (hasRun.current || !usuario) return;
        hasRun.current = true;

        const { nombre, instruccion } = buildPayload(usuario);

        crearRutina({ nombre, instruccion })
            .then((res) => {
                const rutinaId = getRutinaIdFromResponse(res);

                setUsuario({
                    ...usuario,
                    rutinaActivaId: rutinaId ?? usuario.rutinaActivaId,
                    rutinasIACreadas: rutinasIACreadas + 1,
                } as UsuarioLogin);

                Toast.show({
                    type: "success",
                    text1: "¡Rutina creada!",
                    text2: "Hemos generado tu primera rutina personalizada.",
                });

                useSyncStore.getState().bumpRoutineRev();
                useRutinasCache.getState().clear();
                useRutinaCache.getState().clear();

                onDone?.();
            })
            .catch((error: any) => {
                // Verificar si es error de límite de IA
                const errorCode = error?.response?.data?.code || error?.code;
                const isIALimitError = errorCode === "IA_LIMIT_REACHED";

                if (isIALimitError) {
                    Toast.show({
                        type: "error",
                        text1: "Límite de rutinas IA alcanzado",
                        text2: "En el plan gratuito solo puedes generar 1 rutina con IA. Mejora a Premium para crear más.",
                    });
                } else {
                    Toast.show({
                        type: "error",
                        text1: "No se pudo generar la rutina",
                        text2: "Puedes crearla manualmente cuando quieras.",
                    });
                }
                onError?.();
            });
    }, []);  // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <Modal visible transparent>
            <CargaRutina />
        </Modal>
    );
}