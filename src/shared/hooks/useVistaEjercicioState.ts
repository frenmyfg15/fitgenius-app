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
  obtenerEjercicioCompuesto, // ← devuelve el JSON (payload) directamente
} from "@/features/api/ejercicios.api";
import { calcularCalorias, calcularCaloriasCompuesto } from "@/shared/lib/calcularCalorias";
import { useEjercicioCache } from "@/features/store/useEjercicioCache";

/* ---------------- Tipos compartidos ---------------- */
export type Params = {
  slug: string;                 // viene desde TarjetaHome (simples)
  asignadoId?: string;          // viene desde TarjetaHome
  nombre?: string;
  ejercicio?: any;              // si ya se pasó el objeto, se usa como “primer paint”
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
  const applyEjercicio = useCallback(
    async (data: any, source: string = "desconocido") => {
      console.log(`✅ [EJ] apply (${source}) id=${data?.id ?? "sin-id"}`);
      setEjercicio(data);

      const tiempo = data?.ejercicioAsignado?.descansoSeg || 60;
      setTiempoRestante(tiempo);

      const key = `series-${data.id}`;
      setStorageKey(key);

      try {
        const saved = await AsyncStorage.getItem(key);
        if (saved) {
          console.log(`📥 [EJ] series desde AsyncStorage (${key})`);
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setSeries(parsed);
        } else {
          console.log(`📭 [EJ] sin series guardadas (${key})`);
        }
      } catch (e) {
        console.log("⚠️ [EJ] error leyendo series local:", e);
      }
    },
    []
  );

  useEffect(() => {
    let aborted = false;

    console.log("🔍 [EJ] init vista ejercicio", {
      slug,
      prefetch: !!ejercicioPrefetch,
    });

    // 1) Aplica prefetch si viene (primer paint)
    if (ejercicioPrefetch) {
      console.log("📦 [EJ] prefetch recibido, id:", ejercicioPrefetch?.id ?? "(sin id)");
      applyEjercicio(ejercicioPrefetch, "prefetch");
    }

    // ¿Es compuesto según el prefetch?
    const esCompuestoPrefetch = Boolean(
      ejercicioPrefetch?.ejercicioCompuestoId || ejercicioPrefetch?.ejercicioCompuesto
    );

    if (esCompuestoPrefetch) {
      console.log("🧩 [EJ] ruta COMPUESTO (por prefetch)");
      const compId =
        ejercicioPrefetch?.ejercicioCompuestoId ?? ejercicioPrefetch?.ejercicioCompuesto?.id;

      if (!compId) {
        console.warn("⚠️ [EJ] compuesto sin id; se mantiene solo prefetch");
        return () => {
          aborted = true;
          console.log("🧹 [EJ] cleanup compuesto sin id");
        };
      }

      console.log("🌐 [EJ] obtenerEjercicioCompuesto API, id:", compId);
      (async () => {
        try {
          const payload = await obtenerEjercicioCompuesto(compId); // ← payload JSON directo
          console.log("📨 [EJ] compuesto API OK, ultimaSesionId:", payload?.ultimaSesion?.id ?? null);

          if (aborted) {
            console.log("⏹️ [EJ] abort antes de apply (compuesto)");
            return;
          }

          const enriched = {
            ...(ejercicioPrefetch || {}),
            ejercicioCompuesto: payload?.compuesto || ejercicioPrefetch?.ejercicioCompuesto,
            ultimaSesion: payload?.ultimaSesion ?? null,
          };

          console.log("✅ [EJ] apply compuesto enriquecido");
          applyEjercicio(enriched, "api-compuesto");
        } catch (err) {
          if (!aborted) console.error("❌ [EJ] obtenerEjercicioCompuesto error:", err);
        }
      })();

      // Importante: no continuar con el flujo por slug
      return () => {
        aborted = true;
        console.log("🧹 [EJ] cleanup compuesto → abort");
      };
    }

    // 2) Si no hay slug válido (y no es compuesto), no consultes cache ni API
    const slugValido =
      typeof slug === "string" && slug.trim() !== "" && slug !== "undefined" && slug !== "null";

    if (!slugValido) {
      console.warn("⚠️ [EJ] slug inválido; omito cache/API");
      return () => {
        aborted = true;
        console.log("🧹 [EJ] cleanup (slug inválido) → abort");
      };
    }

    // 3) Cache / API para simples
    console.log("🔎 [EJ] ruta SIMPLE, slug:", slug);
    const hit = cacheGet(slug);
    if (hit) {
      console.log("⚡ [EJ] cache HIT slug=", slug, "id=", hit?.id);
      applyEjercicio(hit, "cache-simple");
    } else {
      console.log("🌐 [EJ] cache MISS → API (slug:", slug, ")");
      (async () => {
        try {
          const res = await obtenerEjercicio(slug); // este helper devuelve AxiosResponse
          if (aborted) {
            console.log("⏹️ [EJ] abort antes de apply (simple)", slug);
            return;
          }
          console.log("📨 [EJ] API simple OK, id:", res.data?.id ?? null);
          applyEjercicio(res.data, "api-simple");
          console.log("💾 [EJ] guardo en cache slug=", slug);
          cacheSet(slug, res.data);
        } catch (err) {
          if (!aborted) console.error("❌ [EJ] obtenerEjercicio error:", err);
        }
      })();
    }

    return () => {
      aborted = true;
      console.log("🧹 [EJ] cleanup efecto → abort:", slug);
    };
  }, [slug, ejercicioPrefetch, cacheGet, cacheSet, applyEjercicio]);

  /* ---------------- Guardado de sesión (simple) ---------------- */
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
        experiencia: Number(usuario.experiencia ?? 0) + Number(experienciaPlus),
        caloriasMes: Number((usuario as any).caloriasMes ?? 0) + Number(caloriasPlus),
      } as UsuarioLogin);

      if (storageKey) await AsyncStorage.removeItem(storageKey);

      cacheDel(slug);
      useSyncStore.getState().bumpWorkoutRev();

      setFestejo(true);
      setTimeout(() => (navigation as any).goBack(), 3800);
    } catch (error) {
      console.error("❌ guardarSesionEjercicio error:", error);
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
        // Log suave para no spamear demasiado
        // console.log("💿 [EJ] series guardadas en", storageKey);
      } catch (e) {
        console.log("⚠️ [EJ] error guardando series local:", e);
      }
    })();
  }, [series, storageKey]);

  /* ---------------- Guardado de sesión (compuesto) ---------------- */
  const guardarSeriesCompuesto = async (
    seriesComp: {
      ejercicioId: number;
      pesoKg?: number;
      repeticiones?: number;
      duracionSegundos?: number;
    }[][]
  ) => {
    if (!usuario?.id) return;

    const ejercicioCompuestoId =
      ejercicio?.ejercicioCompuestoId ?? ejercicio?.ejercicioCompuesto?.id;

    if (!ejercicioCompuestoId) {
      Toast.show({ type: "error", text1: "No se encontró el ejercicio compuesto." });
      return;
    }

    try {
      setGuardando(true);

      await guardarSesionCompuesta({
        usuarioId: usuario.id,
        ejercicioCompuestoId,
        series: seriesComp,
      });

      const caloriasPlus = calcularCaloriasCompuesto(seriesComp as any);
      calorias.current = caloriasPlus;

      setUsuario({
        ...(usuario as UsuarioLogin),
        experiencia: Number(usuario.experiencia ?? 0) + Number(experienciaPlus),
        caloriasMes: Number((usuario as any).caloriasMes ?? 0) + Number(caloriasPlus),
      } as UsuarioLogin);

      if (storageKey) await AsyncStorage.removeItem(storageKey);

      cacheDel(slug);
      useSyncStore.getState().bumpWorkoutRev();

      setFestejo(true);
      setTimeout(() => (navigation as any).goBack(), 3800);
    } catch (error) {
      console.error("❌ guardarSesionCompuesta error:", error);
      setGuardando(false);
      Toast.show({ type: "error", text1: "Error al guardar. Inténtalo de nuevo." });
    }
  };

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
    guardarSeriesCompuesto,
  };
}
