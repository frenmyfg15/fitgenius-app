import { useEffect, useRef } from "react";
import { obtenerHistorialDiario, obtenerHistorialSemanal } from "@/features/api/coach.api";
import { useAnalisisStore } from "@/features/store/useAnalisisStore";

/**
 * Sincroniza el historial de análisis del coach desde el servidor al store local.
 * Se ejecuta una única vez por sesión cuando el usuario está autenticado.
 */
export function useSyncAnalisis(usuarioId: number | undefined) {
  const poblarDesdeServidor = useAnalisisStore((s) => s.poblarDesdeServidor);
  const hasSynced = useRef(false);

  useEffect(() => {
    if (!usuarioId || hasSynced.current) return;
    hasSynced.current = true;

    Promise.all([obtenerHistorialDiario(), obtenerHistorialSemanal()])
      .then(([diario, semanal]) => {
        poblarDesdeServidor(diario ?? [], semanal ?? []);
      })
      .catch(() => {
        // Silencioso: el store ya tiene los datos de AsyncStorage como fallback
      });
  }, [usuarioId]);
}
