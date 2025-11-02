'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { obtenerRutinas } from "@/features/api/rutinas.api";
import { Rutina } from "@/features/type/rutinas";
import Toast from "react-native-toast-message";
import { useSyncStore } from "@/features/store/useSyncStore";
import { useRutinasCache } from "@/features/store/useRutinasCache";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";

export function useMisRutinas() {
  const [rutinas, setRutinas] = useState<Rutina[]>([]);
  const [ver, setVer] = useState(false);
  const [idMostrar, setIdMostrar] = useState<number | null>(null);
  const [reloadKey, setReloadKey] = useState(false);
  const [loading, setLoading] = useState(false);

  const routineRev = useSyncStore((s) => s.routineRev);

  const rutinasCache = useRutinasCache();
  const cacheGetRef = useRef(rutinasCache.get);
  const cacheSetRef = useRef(rutinasCache.set);
  useEffect(() => {
    cacheGetRef.current = rutinasCache.get;
    cacheSetRef.current = rutinasCache.set;
  }, [rutinasCache]);

  const planActual = useUsuarioStore((s) => s.usuario?.planActual);
  const haPagado = useUsuarioStore((s) => s.usuario?.haPagado ?? false);
  const totalIA = useUsuarioStore((s) => s.usuario?.rutinasIACreadas ?? 0);
  const totalManual = useUsuarioStore((s) => s.usuario?.rutinasManualCreadas ?? 0);

  const isPremiumActive = planActual === "PREMIUM" && haPagado;
  const maxManual = isPremiumActive ? 50 : 5;
  const maxIA = isPremiumActive ? 15 : 1;
  const lockedManual = totalManual >= maxManual;

  const mountedRef = useRef(true);
  useEffect(() => () => { mountedRef.current = false; }, []);
  const setIfMounted = useCallback(<T,>(setter: (v: T) => void, v: T) => {
    if (mountedRef.current) setter(v);
  }, []);

  const mostrar = useCallback((id: number) => {
    setIdMostrar(id);
    setVer(true);
  }, []);

  const cerrarVisor = useCallback(() => {
    setVer(false);
    setTimeout(() => setIdMostrar(null), 300);
  }, []);

  const fetchRutinas = useCallback(async () => {

    setLoading(true);

    try {
      const res = await obtenerRutinas();
      const list: Rutina[] = res?.data?.rutinas ?? [];
      setIfMounted(setRutinas, list);
      cacheSetRef.current?.(list);
      setLoading(false)
    } catch (err: any) {
      console.error("🔴 [MisRutinas] Error al cargar rutinas", err);
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "No se pudieron cargar tus rutinas";

      // ✅ Uso correcto de react-native-toast-message
      Toast.show({
        type: "error",
        text1: "Error al cargar rutinas",
        text2: msg,
      });
    } finally {
      setLoading(false);
    }
  }, [setIfMounted]);

  useEffect(() => {
    const cached = cacheGetRef.current?.();
    if (cached && Array.isArray(cached) && cached.length) {
      setRutinas(cached);
      return;
    }
    fetchRutinas();
  }, [fetchRutinas]);

  useEffect(() => {
    fetchRutinas();
  }, [routineRev, reloadKey, fetchRutinas]);

  const rutinaSeleccionada = useMemo(
    () => (idMostrar != null ? rutinas.find((r) => r.id === idMostrar) ?? null : null),
    [idMostrar, rutinas]
  );

  const toggleReload = useCallback(() => setReloadKey((p) => !p), []);

  return {
    rutinas,
    rutinaSeleccionada,
    ver,
    loading,
    idMostrar,
    mostrar,
    cerrarVisor,
    toggleReload,
    isPremiumActive,
    maxManual,
    maxIA,
    lockedManual,
    totalIA,
    totalManual,
  };
}
