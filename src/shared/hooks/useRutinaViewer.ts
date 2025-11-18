// src/shared/components/misRutinas/hooks/useRutinaViewer.ts
import { useState, useMemo, useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import { useColorScheme } from "nativewind";
import Toast from "react-native-toast-message";
import axios from "axios";

import type { Rutina } from "@/features/type/rutinas";
import { actualizarRutinaActiva, eliminarRutinaPorId } from "@/features/api/rutinas.api";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";
import { useSyncStore } from "@/features/store/useSyncStore";
import { useRutinaCache } from "@/features/store/useRutinaCache";
import { normalizeDia } from "@/shared/utils/normalizarRutina";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Params = {
  rutinas: Rutina;
  setVer: (v: boolean) => void;
  onDelete: () => void;
};

export function useRutinaViewer({ rutinas, setVer, onDelete }: Params) {
  const nav = useNavigation<any>();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  // estado UI / datos
  const [dias, setDias] = useState(rutinas.dias);
  const [day, setDay] = useState<string>("LUNES");
  const [option, setOption] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loading, setLoading] = useState(false);

  // stores
  const { usuario, setUsuario } = useUsuarioStore();
  const bumpRoutineRev = useSyncStore((s) => s.bumpRoutineRev);
  const clearCache = useRutinaCache((s) => s.clear);

  const getReadableError = (err: unknown, fallback: string) => {
    if (axios.isAxiosError(err)) {
      if (err.request && !err.response) {
        return "No se pudo contactar al servidor. Revisa tu conexión.";
      }
      const serverMsg =
        (err.response?.data as any)?.error ??
        (err.response?.data as any)?.message ??
        (err.response?.data as any)?.msg;
      if (serverMsg) return serverMsg;
      if (err.response?.status === 401) return "No tienes permiso para esta acción.";
      if (err.response?.status === 404) return "La rutina no se encontró.";
      if (err.response?.status === 500) return "Fallo interno del servidor.";
      return err.message || fallback;
    }
    if (err instanceof Error) return err.message || fallback;
    return fallback;
  };

  const logWarning = (tag: string, err: unknown, userMsg: string) => {
    console.warn(`⚠️ [${tag}]`, {
      userMessage: userMsg,
      isAxiosError: axios.isAxiosError(err),
      status: axios.isAxiosError(err) ? err.response?.status : undefined,
      serverData: axios.isAxiosError(err) ? err.response?.data : undefined,
      rawError: err,
    });
  };

  // tema mínimo (memoizado)
  const { bg, border, textTitle, textMuted, surface } = useMemo(() => {
    const bg = isDark ? "#0b1220" : "#ffffff";
    const border = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.06)";
    const textTitle = isDark ? "#e5e7eb" : "#0f172a";
    const textMuted = isDark ? "#94a3b8" : "#64748b";
    const surface = isDark ? "rgba(255,255,255,0.06)" : "#f3f4f6";
    return { bg, border, textTitle, textMuted, surface };
  }, [isDark]);

  const handleEditarRutina = useCallback(() => {
    try {
      const diasNormalizados = Array.isArray(rutinas.dias)
        ? rutinas.dias.map(normalizeDia)
        : [];
      const payload = {
        id: rutinas.id,
        nombre: rutinas.nombre ?? "",
        descripcion: rutinas.descripcion ?? "",
        usuarioId: usuario?.id ?? 1,
        dias: diasNormalizados,
      };
      AsyncStorage.setItem("crearRutinaState", JSON.stringify(payload));
      AsyncStorage.setItem("rutinaEditId", String(rutinas.id));
      nav.navigate("CrearRutina", { id: rutinas.id });
      setVer(false);
    } catch (err) {
      const msg = getReadableError(err, "No se pudo preparar la rutina para editar.");
      logWarning("RutinaEditarError", err, msg);
      Toast.show({
        type: "error",
        text1: "No se pudo abrir el editor",
        text2: msg,
      });
    }
  }, [nav, rutinas, setVer, usuario?.id]);

  const handleUsarRutina = useCallback(async () => {
    try {
      setLoading(true);
      await actualizarRutinaActiva(rutinas.id);
      if (usuario) setUsuario({ ...usuario, rutinaActivaId: rutinas.id });
      clearCache();
      bumpRoutineRev();
      Toast.show({ type: "success", text1: "Rutina activada exitosamente" });
      setVer(false);
    } catch (err) {
      const msg = getReadableError(err, "Error al activar la rutina.");
      logWarning("RutinaActivarError", err, msg);
      Toast.show({
        type: "error",
        text1: "No se pudo activar la rutina",
        text2: msg,
      });
    } finally {
      setLoading(false);
    }
  }, [rutinas.id, usuario, setUsuario, clearCache, bumpRoutineRev, setVer]);

  const handleEliminarRutina = useCallback(async () => {
    try {
      setLoading(true);
      await eliminarRutinaPorId(rutinas.id);
      if (usuario?.rutinaActivaId === rutinas.id) {
        setUsuario({ ...usuario, rutinaActivaId: undefined });
      }
      clearCache();
      bumpRoutineRev();
      Toast.show({ type: "success", text1: "Rutina eliminada correctamente" });
      onDelete();
      setVer(false);
    } catch (err) {
      const msg = getReadableError(err, "Error al eliminar la rutina.");
      logWarning("RutinaEliminarError", err, msg);
      Toast.show({
        type: "error",
        text1: "No se pudo eliminar la rutina",
        text2: msg,
      });
    } finally {
      setConfirmDelete(false);
      setLoading(false);
    }
  }, [rutinas.id, usuario?.rutinaActivaId, setUsuario, clearCache, bumpRoutineRev, onDelete, setVer]);

  return {
    // tema
    bg,
    border,
    textTitle,
    textMuted,
    surface,
    // estado
    dias,
    setDias,
    day,
    setDay,
    option,
    setOption,
    confirmDelete,
    setConfirmDelete,
    loading,
    // acciones
    handleEditarRutina,
    handleUsarRutina,
    handleEliminarRutina,
  };
}
