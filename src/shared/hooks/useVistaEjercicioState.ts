// src/shared/hooks/useVistaEjercicioState.ts
import { useEffect, useRef, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";

import { useUsuarioStore, UsuarioLogin } from "@/features/store/useUsuarioStore";
import { useSyncStore } from "@/features/store/useSyncStore";
import {
  guardarSesionCompuesta,
  guardarSesionEjercicio,
  obtenerEjercicio,
} from "@/features/api/ejercicios.api";
import {
  calcularCalorias,
  calcularCaloriasCompuesto,
} from "@/shared/lib/calcularCalorias";
import { useEjercicioCache } from "@/features/store/useEjercicioCache";
import { obtenerCoach, obtenerCoachCompuesto } from "@/features/api/coach.api";
import type { CoachResponse } from "@/features/api/coach.api";

export type Params = {
  slug: string;
  asignadoId?: string;
  nombre?: string;
  ejercicio?: any;
};

type Serie = { reps: number; peso: number };

const COACH_AUTO_DISABLED_KEY = "coach:autoDisabled:v1";

const toPositiveInt = (v: any): number | null => {
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  const i = Math.trunc(n);
  return i > 0 ? i : null;
};

export function useVistaEjercicioState(params: Params) {
  const { slug, asignadoId, ejercicio: ejercicioPrefetch } = params;

  const [ejercicio, setEjercicio] = useState<any>(ejercicioPrefetch || null);
  const { usuario, setUsuario } = useUsuarioStore();

  const [series, setSeries] = useState<Serie[]>([{ reps: 0, peso: 0 }]);
  const [storageKey, setStorageKey] = useState<string | null>(null);

  const [infoVisible, setInfoVisible] = useState(false);
  const [estadisticaVisible, setEstadisticaVisible] = useState(false);

  const [tiempoRestante, setTiempoRestante] = useState<number | null>(null);
  const [descansando, setDescansando] = useState(false);

  const [festejo, setFestejo] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [premiumModalVisible, setPremiumModalVisible] = useState(false);
  const [nivelEstres, setNivelEstres] = useState<number | null>(null);

  const [coachData, setCoachData] = useState<CoachResponse | null>(null);
  const [coachLoading, setCoachLoading] = useState(false);
  const [coachVisible, setCoachVisible] = useState(false);

  const [coachAutoDisabled, setCoachAutoDisabled] = useState(false);
  const [coachPrefLoaded, setCoachPrefLoaded] = useState(false);
  const didAutoShowRef = useRef<string | null>(null);

  const experienciaPlus = 1.25;
  const calorias = useRef(0);

  const cacheGet = useEjercicioCache((s) => s.get);
  const cacheSet = useEjercicioCache((s) => s.set);
  const cacheDel = useEjercicioCache((s) => s.del);

  const getSimpleEjercicioId = useCallback((e: any): number | null => {
    return (
      toPositiveInt(e?.ejercicioId) ??
      toPositiveInt(e?.ejercicioAsignado?.ejercicioId) ??
      toPositiveInt(e?.ejercicio?.id) ??
      toPositiveInt(e?.id) ??
      null
    );
  }, []);

  const getCompuestoId = useCallback((e: any): number | null => {
    return (
      toPositiveInt(e?.ejercicioCompuestoId) ??
      toPositiveInt(e?.ejercicioCompuesto?.id) ??
      null
    );
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const v = await AsyncStorage.getItem(COACH_AUTO_DISABLED_KEY);
        setCoachAutoDisabled(v === "1");
      } catch { }
      finally {
        setCoachPrefLoaded(true);
      }
    })();
  }, []);

  const setCoachAutoDisabledPersist = useCallback(async (next: boolean) => {
    setCoachAutoDisabled(next);
    try {
      await AsyncStorage.setItem(COACH_AUTO_DISABLED_KEY, next ? "1" : "0");
    } catch { }
  }, []);

  const quitar = () =>
    setSeries((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));

  useEffect(() => {
    if (!descansando || tiempoRestante == null) return;
    if (tiempoRestante <= 0) {
      setDescansando(false);
      return;
    }
    const id = setInterval(() => {
      setTiempoRestante((prev) => (prev != null ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [descansando, tiempoRestante]);

  const iniciarDescanso = useCallback(() => {
    const descanso = ejercicio?.ejercicioAsignado?.descansoSeg || 60;
    setTiempoRestante(descanso);
    setDescansando(true);
  }, [ejercicio]);

  const finalizarDescanso = () => setDescansando(false);

  const agregar = () => setSeries((prev) => [...prev, { reps: 0, peso: 0 }]);

  const handleInputChange = (
    index: number,
    field: "reps" | "peso",
    value: number
  ) => {
    setSeries((prev) => {
      const next = prev.slice();
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const applyEjercicio = useCallback(
    async (data: any) => {
      setEjercicio(data);

      const tiempo = data?.ejercicioAsignado?.descansoSeg || 60;
      setTiempoRestante(tiempo);

      const isCompuesto = Boolean(getCompuestoId(data));
      if (isCompuesto) {
        setStorageKey(null);
        return;
      }

      const simpleId =
        Number.isFinite(Number(data?.ejercicioId)) && Number(data?.ejercicioId) > 0
          ? Number(data.ejercicioId)
          : Number.isFinite(Number(data?.ejercicio?.id)) && Number(data?.ejercicio?.id) > 0
            ? Number(data.ejercicio.id)
            : Number.isFinite(Number(data?.id)) && Number(data?.id) > 0
              ? Number(data.id)
              : undefined;

      if (!simpleId) {
        setStorageKey(null);
        return;
      }

      const key = `series-${simpleId}`;
      setStorageKey(key);

      try {
        const saved = await AsyncStorage.getItem(key);
        if (!saved) return;
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setSeries(parsed);
      } catch { }
    },
    [getCompuestoId]
  );

  useEffect(() => {
    let aborted = false;

    if (ejercicioPrefetch) {
      applyEjercicio(ejercicioPrefetch);
    }

    const slugValido =
      typeof slug === "string" &&
      slug.trim() !== "" &&
      slug !== "undefined" &&
      slug !== "null";

    if (!slugValido) return;

    const hit = cacheGet(slug);
    if (hit) {
      applyEjercicio(hit);
      return;
    }

    (async () => {
      try {
        const res = await obtenerEjercicio(slug);
        if (aborted) return;
        applyEjercicio(res);
        cacheSet(slug, res);
      } catch { }
    })();

    return () => {
      aborted = true;
    };
  }, [slug, ejercicioPrefetch, cacheGet, cacheSet, applyEjercicio]);

  const fetchCoach = useCallback(async () => {
    const compuestoId = getCompuestoId(ejercicio);
    const isCompuesto = Boolean(compuestoId);

    const id = isCompuesto ? compuestoId : getSimpleEjercicioId(ejercicio);
    if (!id) return;

    try {
      setCoachLoading(true);
      const res = isCompuesto
        ? await obtenerCoachCompuesto(id)
        : await obtenerCoach(id);

      setCoachData(res);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "No se pudo cargar el análisis",
      });
    } finally {
      setCoachLoading(false);
    }
  }, [ejercicio, getCompuestoId, getSimpleEjercicioId]);

  const mostrarCoach = useCallback(() => {
    setCoachVisible(true);
    if (!coachData && !coachLoading) fetchCoach();
  }, [coachData, coachLoading, fetchCoach]);

  const ocultarCoach = useCallback(() => {
    setCoachVisible(false);
  }, []);

  useEffect(() => {
    if (!coachPrefLoaded) return;

    const userIsPremium = Boolean(usuario?.haPagado);
    if (!userIsPremium) return;
    if (coachAutoDisabled) return;

    const compuestoId = getCompuestoId(ejercicio);
    const isCompuesto = Boolean(compuestoId);

    const id = isCompuesto ? compuestoId : getSimpleEjercicioId(ejercicio);
    if (!id) return;

    const key = isCompuesto ? `compuesto:${id}` : `ejercicio:${id}`;

    if (didAutoShowRef.current === key) return;
    didAutoShowRef.current = key;
    mostrarCoach();
  }, [
    coachPrefLoaded,
    usuario?.haPagado,
    coachAutoDisabled,
    ejercicio,
    getCompuestoId,
    getSimpleEjercicioId,
    mostrarCoach,
  ]);

  const guardarSeries = async (): Promise<boolean> => {
    if (guardando) return false;
    if (!usuario?.id) return false;

    const simpleId = getSimpleEjercicioId(ejercicio);
    if (!simpleId) return false;

    const ejercicioAsignadoId = asignadoId ? Number(asignadoId) : undefined;
    if (!ejercicioAsignadoId || !Number.isFinite(ejercicioAsignadoId)) return false;

    const payload = {
      usuarioId: usuario.id,
      ejercicioId: simpleId,
      series,
      ejercicioAsignado: ejercicioAsignadoId,
      nivelEstres: nivelEstres ?? undefined,
    };

    try {
      setGuardando(true);
      await guardarSesionEjercicio(payload);

      const caloriasPlus = calcularCalorias(series);
      calorias.current = caloriasPlus;

      setUsuario({
        ...(usuario as UsuarioLogin),
        experiencia: Number(usuario.experiencia ?? 0) + Number(experienciaPlus),
        caloriasMes:
          Number((usuario as any).caloriasMes ?? 0) + Number(caloriasPlus),
      } as UsuarioLogin);

      if (storageKey) await AsyncStorage.removeItem(storageKey);
      cacheDel(slug);
      useSyncStore.getState().bumpWorkoutRev();

      setCoachData(null);
      if (!coachAutoDisabled && Boolean(usuario?.haPagado)) {
        setCoachVisible(true);
        fetchCoach();
      }

      return true;
    } catch (error: any) {
      if (error?.errorCode === "PREMIUM_REQUIRED") {
        setPremiumModalVisible(true);
      } else {
        Toast.show({
          type: "error",
          text1: "No se pudo guardar la sesión",
        });
      }
      return false;
    } finally {
      setGuardando(false);
    }
  };

  const guardarSeriesCompuesto = async (
    seriesComp: {
      ejercicioId: number;
      pesoKg?: number;
      repeticiones?: number;
      duracionSegundos?: number;
    }[][]
  ): Promise<boolean> => {
    if (guardando) return false;
    if (!usuario?.id) return false;

    const compuestoId = getCompuestoId(ejercicio);
    if (!compuestoId) return false;

    const payload = {
      usuarioId: usuario.id,
      ejercicioCompuestoId: Number(compuestoId),
      series: seriesComp,
      nivelEstres: nivelEstres ?? undefined,
    };

    try {
      setGuardando(true);
      await guardarSesionCompuesta(payload);

      const caloriasPlus = calcularCaloriasCompuesto(seriesComp as any);
      calorias.current = caloriasPlus;

      setUsuario({
        ...(usuario as UsuarioLogin),
        experiencia: Number(usuario.experiencia ?? 0) + Number(experienciaPlus),
        caloriasMes:
          Number((usuario as any).caloriasMes ?? 0) + Number(caloriasPlus),
      } as UsuarioLogin);

      if (storageKey) await AsyncStorage.removeItem(storageKey);
      cacheDel(slug);
      useSyncStore.getState().bumpWorkoutRev();

      setCoachData(null);
      if (!coachAutoDisabled && Boolean(usuario?.haPagado)) {
        setCoachVisible(true);
        fetchCoach();
      }

      return true;
    } catch (error: any) {
      if (error?.errorCode === "PREMIUM_REQUIRED") {
        setPremiumModalVisible(true);
      } else {
        Toast.show({
          type: "error",
          text1: "No se pudo guardar la sesión",
        });
      }
      return false;
    } finally {
      setGuardando(false);
    }
  };

  useEffect(() => {
    (async () => {
      if (!storageKey) return;
      try {
        await AsyncStorage.setItem(storageKey, JSON.stringify(series));
      } catch { }
    })();
  }, [series, storageKey]);

  return {
    ejercicio,
    series,
    tiempoRestante,
    descansando,
    guardando,
    festejo,
    setFestejo,
    experienciaPlus,
    calorias,
    nivelEstres,
    setNivelEstres,

    coachData,
    coachLoading,
    coachVisible,
    mostrarCoach,
    ocultarCoach,

    coachAutoDisabled,
    setCoachAutoDisabledPersist,

    infoVisible,
    setInfoVisible,
    estadisticaVisible,
    setEstadisticaVisible,

    handleInputChange,
    agregar,
    quitar,
    iniciarDescanso,
    finalizarDescanso,
    guardarSeries,
    guardarSeriesCompuesto,

    premiumModalVisible,
    setPremiumModalVisible,
  };
}