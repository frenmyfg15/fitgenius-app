import { useState, useCallback } from "react";
import {
    checkSeguimiento,
    analizarSeguimiento,
    aplicarSeguimiento,
    marcarSeguimientoVisto,
} from "@/features/api/progreso.api";
import type { AnalisisSeguimientoData, ModalSeguimientoData } from "@/features/api/progreso.api";

type Estado = "idle" | "checking" | "applying" | "error";

type UseSeguimientoInteligente = {
    estado: Estado;
    modalData: AnalisisSeguimientoData | null;
    modalVisible: boolean;
    applying: boolean;
    iniciar: () => Promise<void>;
    confirmar: () => Promise<void>;
    cerrar: () => void;
};

export function useSeguimientoInteligente(): UseSeguimientoInteligente {
    const [estado, setEstado] = useState<Estado>("idle");
    const [modalData, setModalData] = useState<AnalisisSeguimientoData | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [applying, setApplying] = useState(false);
    const [logId, setLogId] = useState<number | null>(null);

    /**
     * Fase 1: check → analizar → mostrar modal.
     * NO toca la BD todavía, solo lee.
     */
    const iniciar = useCallback(async () => {
        if (estado !== "idle") return;

        try {
            setEstado("checking");

            const check = await checkSeguimiento();
            if (!check?.mostrar) {
                setEstado("idle");
                return;
            }

            const analisis = await analizarSeguimiento();
            if (!analisis) {
                setEstado("idle");
                return;
            }

            // Solo MANTENER e INSIGHT no necesitan confirmación del usuario
            if (analisis.decision === "MANTENER" || analisis.decision === "INSIGHT") {
                setEstado("idle");
                return;
            }

            setModalData(analisis);
            setModalVisible(true);
            setEstado("idle");
        } catch {
            setEstado("error");
        }
    }, [estado]);

    /**
     * Fase 2: el usuario acepta en el modal → aplicar → guardar log.
     * Aquí es cuando se modifica la BD.
     */
    const confirmar = useCallback(async () => {
        if (!modalData) return;

        try {
            setApplying(true);

            const resultado = await aplicarSeguimiento();

            if (resultado?.aplicado && "logId" in resultado) {
                setLogId(resultado.logId);
            }
        } catch {
            // El modal puede mostrar un error si se necesita
        } finally {
            setApplying(false);
            setModalVisible(false);
            setModalData(null);
        }
    }, [modalData]);

    /**
     * El usuario cierra sin aceptar. No se aplica nada.
     * Si había un log ya creado (no debería en este flujo), lo marca visto.
     */
    const cerrar = useCallback(() => {
        if (logId) {
            marcarSeguimientoVisto(logId).catch(() => { });
            setLogId(null);
        }
        setModalVisible(false);
        setModalData(null);
        setEstado("idle");
    }, [logId]);

    return {
        estado,
        modalData,
        modalVisible,
        applying,
        iniciar,
        confirmar,
        cerrar,
    };
}