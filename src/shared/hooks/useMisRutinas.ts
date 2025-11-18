"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import Toast from "react-native-toast-message";

import { obtenerRutinas } from "@/features/api/rutinas.api";
import { Rutina } from "@/features/type/rutinas";
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
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);
  const setIfMounted = useCallback(<T,>(setter: (v: T) => void, v: T) => {
    if (mountedRef.current) setter(v);
  }, []);

  const getReadableError = (err: unknown, fallback = "No se pudieron cargar tus rutinas.") => {
    if (axios.isAxiosError(err)) {
      if (err.request && !err.response) {
        return "No se pudo contactar al servidor. Revisa tu conexión.";
      }
      const serverMsg =
        (err.response?.data as any)?.error ??
        (err.response?.data as any)?.message ??
        (err.response?.data as any)?.msg;
      if (serverMsg) return serverMsg;
      if (err.response?.status === 401) return "No estás autorizado para ver estas rutinas.";
      if (err.response?.status === 404) return "No se encontraron rutinas.";
      if (err.response?.status === 500) return "Fallo interno del servidor al cargar rutinas.";
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

  const mostrar = useCallback((id: number) => {
    setIdMostrar(id);
    setVer(true);
  }, []);

  const cerrarVisor = useCallback(() => {
    setVer(false);
    setTimeout(() => setIdMostrar(null), 300);
  }, []);

  const fetchRutinas = useCallback(async () => {
    setIfMounted(setLoading, true);
    try {
      const res = await obtenerRutinas();
      const list: Rutina[] = res?.data?.rutinas ?? [];
      setIfMounted(setRutinas, list);
      cacheSetRef.current?.(list);
    } catch (err) {
      const msg = getReadableError(err);
      logWarning("MisRutinasFetchError", err, msg);
      Toast.show({
        type: "error",
        text1: "Error al cargar rutinas",
        text2: msg,
      });
    } finally {
      setIfMounted(setLoading, false);
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
