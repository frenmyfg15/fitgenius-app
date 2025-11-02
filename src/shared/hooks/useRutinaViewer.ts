// src/shared/components/misRutinas/hooks/useRutinaViewer.ts
import { useState, useMemo, useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import { useColorScheme } from "nativewind";
import Toast from "react-native-toast-message";

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
      const diasNormalizados = Array.isArray(rutinas.dias) ? rutinas.dias.map(normalizeDia) : [];
      const payload = {
        id: rutinas.id,
        nombre: rutinas.nombre ?? "",
        descripcion: rutinas.descripcion ?? "",
        usuarioId: usuario?.id ?? 1,
        dias: diasNormalizados,
      };
      AsyncStorage.setItem('crearRutinaState', JSON.stringify(payload));
      AsyncStorage.setItem('rutinaEditId', String(rutinas.id));
      nav.navigate("CrearRutina", { id: rutinas.id });
      setVer(false);
    } catch (e) {
      console.error("No se pudo preparar el estado para edición", e);
      Toast.show({ type: "error", text1: "No se pudo abrir el editor" });
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
    } catch (error: any) {
      Toast.show({ type: "error", text1: "Error", text2: error?.message || "Error al activar la rutina" });
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
    } catch (error: any) {
      Toast.show({ type: "error", text1: "Error", text2: error?.message || "Error al eliminar la rutina" });
    } finally {
      setConfirmDelete(false);
      setLoading(false);
    }
  }, [rutinas.id, usuario?.rutinaActivaId, setUsuario, clearCache, bumpRoutineRev, onDelete, setVer]);

  return {
    // tema
    bg, border, textTitle, textMuted, surface,
    // estado
    dias, setDias, day, setDay, option, setOption, confirmDelete, setConfirmDelete, loading,
    // acciones
    handleEditarRutina, handleUsarRutina, handleEliminarRutina,
  };
}
