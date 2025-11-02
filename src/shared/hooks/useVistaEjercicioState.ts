import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";

import { useUsuarioStore, UsuarioLogin } from "@/features/store/useUsuarioStore";
import { useSyncStore } from "@/features/store/useSyncStore";
import { guardarSesionEjercicio, obtenerEjercicio } from "@/features/api/ejercicios.api";
import { calcularCalorias } from "@/shared/lib/calcularCalorias";
import { useEjercicioCache } from "@/features/store/useEjercicioCache";

/* ---------------- Tipos compartidos ---------------- */
export type Params = {
  slug: string;                 // ← viene desde TarjetaHome
  asignadoId?: string;          // ← viene desde TarjetaHome
  nombre?: string;
  ejercicio?: any;              // opcional: si ya se pasó el objeto, lo usamos como “primer paint”
};

type Serie = { reps: number; peso: number };

export function useVistaEjercicioState(params: Params) {
  const navigation = useNavigation();
  const { slug, asignadoId, ejercicio: ejercicioPrefetch } = params;

  const [ejercicio, setEjercicio] = useState<any>(ejercicioPrefetch || null);
  const { usuario, setUsuario } = useUsuarioStore();

  // UI/local state expuesto a la vista
  const [series, setSeries] = useState<Serie[]>([{ reps: 0, peso: 0 }]);
  const [storageKey, setStorageKey] = useState<string | null>(null);
  const [infoVisible, setInfoVisible] = useState(false);
  const [estadisticaVisible, setEstadisticaVisible] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState<number | null>(null);
  const [descansando, setDescansando] = useState(false);
  const [festejo, setFestejo] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // constantes de negocio
  const experienciaPlus = 1.25;
  const calorias = useRef(0);

  // caché
  const cacheGet = useEjercicioCache((s) => s.get);
  const cacheSet = useEjercicioCache((s) => s.set);
  const cacheDel = useEjercicioCache((s) => s.del);

  /* ---------------- Descanso: contador ---------------- */
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

  /* ---------------- Series: helpers ---------------- */
  const agregar = () => setSeries((prev) => [...prev, { reps: 0, peso: 0 }]);

  const handleInputChange = (index: number, field: "reps" | "peso", value: number) => {
    const updated = [...series];
    updated[index][field] = value;
    setSeries(updated);
  };

  /* ---------------- Carga de ejercicio ---------------- */
  const applyEjercicio = useCallback(async (data: any) => {
    setEjercicio(data);
    const tiempo = data?.ejercicioAsignado?.descansoSeg || 60;
    setTiempoRestante(tiempo);
    const key = `series-${data.id}`;
    setStorageKey(key);
    try {
      const saved = await AsyncStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setSeries(parsed);
      }
    } catch {}
  }, []);

  useEffect(() => {
    let aborted = false;

    if (ejercicioPrefetch) {
      applyEjercicio(ejercicioPrefetch);
    }

    const hit = cacheGet(slug);
    if (hit) {
      applyEjercicio(hit);
    } else {
      (async () => {
        try {
          const res = await obtenerEjercicio(slug);
          if (aborted) return;
          applyEjercicio(res.data);
          cacheSet(slug, res.data);
        } catch (err) {
          if (!aborted) console.error("Error al obtener el ejercicio", err);
        }
      })();
    }

    return () => {
      aborted = true;
    };
  }, [slug, ejercicioPrefetch, cacheGet, cacheSet, applyEjercicio]);

  /* ---------------- Guardado de sesión ---------------- */
  const guardarSeries = async () => {
    if (!usuario?.id || !ejercicio?.id) return;

    const ejercicioAsignadoId = asignadoId ? Number(asignadoId) : undefined;
    if (!ejercicioAsignadoId || !Number.isInteger(ejercicioAsignadoId) || ejercicioAsignadoId <= 0) {
      Toast.show({ type: "error", text1: "No se encontró el ejercicio asignado." });
      return;
    }

    try {
      setGuardando(true);
      await guardarSesionEjercicio({
        usuarioId: usuario.id,
        ejercicioId: ejercicio.id,
        series,
        ejercicioAsignado: ejercicioAsignadoId, // legacy key soportada por backend
      });

      const caloriasPlus = calcularCalorias(series);
      calorias.current = caloriasPlus;

      setUsuario({
        ...(usuario as UsuarioLogin),
        experiencia: Number(usuario.experiencia) + Number(experienciaPlus),
        caloriasMes: Number(usuario.caloriasMes) + Number(caloriasPlus),
      } as UsuarioLogin);

      if (storageKey) await AsyncStorage.removeItem(storageKey);

      cacheDel(slug);
      useSyncStore.getState().bumpWorkoutRev();

      setFestejo(true);
      // cierra la pantalla luego de mostrar la celebración
      setTimeout(() => (navigation as any).goBack(), 3800);
    } catch (error) {
      console.error("Error al registrar la sesión:", error);
      setGuardando(false);
      Toast.show({ type: "error", text1: "Error al guardar. Inténtalo de nuevo." });
    }
  };

  /* ---------------- Persistencia local de series ---------------- */
  useEffect(() => {
    (async () => {
      if (!storageKey) return;
      try {
        await AsyncStorage.setItem(storageKey, JSON.stringify(series));
      } catch {}
    })();
  }, [series, storageKey]);

  /* ---------------- API del hook ---------------- */
  return {
    // datos
    ejercicio,
    series,
    tiempoRestante,
    descansando,
    guardando,
    festejo,
    experienciaPlus,
    calorias,

    // toggles/paneles
    infoVisible,
    setInfoVisible,
    estadisticaVisible,
    setEstadisticaVisible,

    // acciones
    handleInputChange,
    agregar,
    iniciarDescanso,
    finalizarDescanso,
    guardarSeries,
  };
}
