import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";

import { obtenerRutinas } from "@/features/api/rutinas.api";
import { Rutina } from "@/features/type/rutinas";
import { useSyncStore } from "@/features/store/useSyncStore";
import { useRutinasCache } from "@/features/store/useRutinasCache";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";

export function useMisRutinas() {
  const [rutinas, setRutinas] = useState<Rutina[]>([]);
  const [ver, setVer] = useState(false);
  const [idMostrar, setIdMostrar] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const routineRev = useSyncStore((s) => s.routineRev);

  const rutinasCache = useRutinasCache();
  const cacheGetRef = useRef(rutinasCache.get);
  const cacheSetRef = useRef(rutinasCache.set);

  useEffect(() => {
    cacheGetRef.current = rutinasCache.get;
    cacheSetRef.current = rutinasCache.set;
  }, [rutinasCache]);

  const totalIA = useUsuarioStore((s) => s.usuario?.rutinasIACreadas ?? 0);
  const isPremium = useUsuarioStore().usuario?.haPagado;
  const maxIA = isPremium ? Number.POSITIVE_INFINITY : 1;

  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const setIfMounted = useCallback<<T,>(setter: (v: T) => void, v: T) => void>(
    (setter, v) => {
      if (mountedRef.current) setter(v);
    },
    []
  );

  const getReadableError = (
    err: unknown,
    fallback = "No se pudieron cargar tus rutinas."
  ) => {
    if (axios.isAxiosError(err)) {
      if (err.request && !err.response) {
        return "No se pudo contactar al servidor. Revisa tu conexión.";
      }

      const serverMsg =
        (err.response?.data as any)?.error ??
        (err.response?.data as any)?.message ??
        (err.response?.data as any)?.msg;

      if (serverMsg) return serverMsg;
      if (err.response?.status === 401)
        return "No estás autorizado para ver estas rutinas.";
      if (err.response?.status === 404)
        return "No se encontraron rutinas.";
      if (err.response?.status === 500)
        return "Fallo interno del servidor al cargar rutinas.";

      return err.message || fallback;
    }

    if (err instanceof Error) return err.message || fallback;
    return fallback;
  };

  const mostrar = useCallback((id: number) => {
    setIdMostrar(id);
    setVer(true);
  }, []);

  const cerrarVisor = useCallback(() => {
    setVer(false);
    setTimeout(() => setIdMostrar(null), 300);
  }, []);

  const fetchRutinas = useCallback(
    async (opts?: { force?: boolean }) => {
      setIfMounted(setLoading, true);

      try {
        const res = await obtenerRutinas();
        const list: Rutina[] = Array.isArray(res)
          ? res
          : (res as any)?.rutinas ?? [];

        setIfMounted(setRutinas, list);
        cacheSetRef.current?.(list);
      } catch (err) {
        getReadableError(err);

        if (!opts?.force) {
          const cached = cacheGetRef.current?.();
          if (cached && Array.isArray(cached) && cached.length) {
            setIfMounted(setRutinas, cached);
          }
        }
      } finally {
        setIfMounted(setLoading, false);
      }
    },
    [setIfMounted]
  );

  useEffect(() => {
    const cached = cacheGetRef.current?.();

    if (cached && Array.isArray(cached) && cached.length) {
      setRutinas(cached);
      fetchRutinas({ force: true });
      return;
    }

    fetchRutinas({ force: true });
  }, [fetchRutinas]);

  useEffect(() => {
    fetchRutinas({ force: true });
  }, [routineRev, fetchRutinas]);

  const reloadRutinas = useCallback(async () => {
    await fetchRutinas({ force: true });
  }, [fetchRutinas]);

  const rutinaSeleccionada = useMemo(
    () =>
      idMostrar != null
        ? rutinas.find((r) => r.id === idMostrar) ?? null
        : null,
    [idMostrar, rutinas]
  );

  return {
    rutinas,
    rutinaSeleccionada,
    ver,
    loading,
    idMostrar,
    mostrar,
    cerrarVisor,
    reloadRutinas,
    totalIA,
    maxIA,
    isPremium,
  };
}