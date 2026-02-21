import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";

import { useUsuarioStore, UsuarioLogin } from "@/features/store/useUsuarioStore";
import { useSyncStore } from "@/features/store/useSyncStore";
import {
  guardarSesionCompuesta,
  guardarSesionEjercicio,
  obtenerEjercicio,
  obtenerEjercicioCompuesto,
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

export function useVistaEjercicioState(params: Params) {
  const navigation = useNavigation();
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
  const [coachAutoPending, setCoachAutoPending] = useState(false);
  const coachAutoKeyRef = useRef<string | null>(null);

  const experienciaPlus = 1.25;
  const calorias = useRef(0);

  const cacheGet = useEjercicioCache((s) => s.get);
  const cacheSet = useEjercicioCache((s) => s.set);
  const cacheDel = useEjercicioCache((s) => s.del);

  const quitar = () =>
    setSeries((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));

  useEffect(() => {
    if (!descansando || tiempoRestante === null) return;
    if (tiempoRestante <= 0) {
      setDescansando(false);
      return;
    }
    const id = setInterval(() => {
      setTiempoRestante((prev) => (prev !== null ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [descansando, tiempoRestante]);

  const iniciarDescanso = useCallback(() => {
    const descanso = ejercicio?.ejercicioAsignado?.descansoSeg || 60;
    setTiempoRestante(descanso);
    setDescansando(true);
  }, [ejercicio]);

  const finalizarDescanso = () => setDescansando(false);

  const agregar = () =>
    setSeries((prev) => [...prev, { reps: 0, peso: 0 }]);

  const handleInputChange = (
    index: number,
    field: "reps" | "peso",
    value: number
  ) => {
    const updated = [...series];
    updated[index][field] = value;
    setSeries(updated);
  };

  const applyEjercicio = useCallback(async (data: any) => {
    setEjercicio(data);
    const tiempo = data?.ejercicioAsignado?.descansoSeg || 60;
    setTiempoRestante(tiempo);

    if (!data?.id) {
      setStorageKey(null);
      return;
    }

    const key = `series-${data.id}`;
    setStorageKey(key);

    try {
      const saved = await AsyncStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setSeries(parsed);
      }
    } catch { }
  }, []);

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
    } else {
      (async () => {
        try {
          const res = await obtenerEjercicio(slug);
          if (!aborted) {
            applyEjercicio(res);
            cacheSet(slug, res);
          }
        } catch { }
      })();
    }

    return () => {
      aborted = true;
    };
  }, [slug, ejercicioPrefetch, cacheGet, cacheSet, applyEjercicio]);

  const fetchCoach = useCallback(async () => {
    if (!ejercicio?.id) return;
    try {
      setCoachLoading(true);
      const res = await obtenerCoach(ejercicio.id);
      setCoachData(res);
    } catch {
      Toast.show({
        type: "error",
        text1: "No se pudo cargar el análisis",
      });
    } finally {
      setCoachLoading(false);
    }
  }, [ejercicio]);

  const mostrarCoach = useCallback(() => {
    setCoachVisible(true);
    if (!coachData && !coachLoading) fetchCoach();
  }, [coachData, coachLoading, fetchCoach]);

  const ocultarCoach = useCallback(() => {
    setCoachVisible(false);
  }, []);

  const guardarSeries = async () => {
    if (guardando) return;
    if (!usuario?.id || !ejercicio?.id) return;

    const ejercicioAsignadoId = asignadoId ? Number(asignadoId) : undefined;
    if (!ejercicioAsignadoId) return;

    const payload = {
      usuarioId: usuario.id,
      ejercicioId: ejercicio.id,
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
        experiencia:
          Number(usuario.experiencia ?? 0) +
          Number(experienciaPlus),
        caloriasMes:
          Number((usuario as any).caloriasMes ?? 0) +
          Number(caloriasPlus),
      } as UsuarioLogin);

      if (storageKey) await AsyncStorage.removeItem(storageKey);
      cacheDel(slug);
      useSyncStore.getState().bumpWorkoutRev();

      // ← setFestejo y goBack eliminados; los maneja CelebracionModal.onFinish
    } catch (error: any) {
      if (error?.errorCode === "PREMIUM_REQUIRED") {
        setPremiumModalVisible(true);
      } else {
        Toast.show({
          type: "error",
          text1: "No se pudo guardar la sesión",
        });
      }
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
  ) => {
    if (guardando) return;
    if (!usuario?.id) return;

    const ejercicioCompuestoId =
      ejercicio?.ejercicioCompuestoId ??
      ejercicio?.ejercicioCompuesto?.id;

    if (!ejercicioCompuestoId) return;

    const payload = {
      usuarioId: usuario.id,
      ejercicioCompuestoId,
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
        experiencia:
          Number(usuario.experiencia ?? 0) +
          Number(experienciaPlus),
        caloriasMes:
          Number((usuario as any).caloriasMes ?? 0) +
          Number(caloriasPlus),
      } as UsuarioLogin);

      if (storageKey) await AsyncStorage.removeItem(storageKey);
      cacheDel(slug);
      useSyncStore.getState().bumpWorkoutRev();

      // ← setFestejo y goBack eliminados; los maneja CelebracionModal.onFinish
    } catch (error: any) {
      if (error?.errorCode === "PREMIUM_REQUIRED") {
        setPremiumModalVisible(true);
      } else {
        Toast.show({
          type: "error",
          text1: "No se pudo guardar la sesión",
        });
      }
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
