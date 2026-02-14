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
import { useRewardedAd } from "@/shared/lib/ads/useRewardedAd";
import { obtenerCoach, obtenerCoachCompuesto } from "@/features/api/coach.api";
import type { CoachResponse } from "@/features/api/coach.api";

/* ---------------- helpers ---------------- */

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/* ---------------- Tipos compartidos ---------------- */
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

  // UI/local state expuesto a la vista
  const [series, setSeries] = useState<Serie[]>([{ reps: 0, peso: 0 }]);
  const [storageKey, setStorageKey] = useState<string | null>(null);
  const [infoVisible, setInfoVisible] = useState(false);
  const [estadisticaVisible, setEstadisticaVisible] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState<number | null>(null);
  const [descansando, setDescansando] = useState(false);
  const [festejo, setFestejo] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // modal premium
  const [premiumModalVisible, setPremiumModalVisible] = useState(false);

  // modal "no hay anuncios"
  const [noAdsModalVisible, setNoAdsModalVisible] = useState(false);
  const [noAdsRetrying, setNoAdsRetrying] = useState(false);

  // 🆕 nivel de estrés (1–10, o null si no se ha elegido)
  const [nivelEstres, setNivelEstres] = useState<number | null>(null);

  // 🆕 Coach Premium
  const [coachData, setCoachData] = useState<CoachResponse | null>(null);
  const [coachLoading, setCoachLoading] = useState(false);
  const [coachVisible, setCoachVisible] = useState(false);
  const [coachAutoPending, setCoachAutoPending] = useState(false);
  const coachAutoKeyRef = useRef<string | null>(null);

  // constantes de negocio
  const experienciaPlus = 1.25;
  const calorias = useRef(0);

  // caché
  const cacheGet = useEjercicioCache((s) => s.get);
  const cacheSet = useEjercicioCache((s) => s.set);
  const cacheDel = useEjercicioCache((s) => s.del);

  // rewarded para este flujo (simple y compuesto)
  const { mostrarAnuncioYObtenerToken } = useRewardedAd(
    "feature:sesion-ejercicio"
  );
  const quitar = () =>
  setSeries((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));

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

  /* ---------------- Carga de ejercicio ---------------- */
  const applyEjercicio = useCallback(
    async (rawData: any, source: string = "desconocido") => {
      const data =
        rawData?.id != null
          ? rawData
          : rawData?.data?.id != null
            ? rawData.data
            : rawData;

      console.log(
        `✅ [EJ] apply (${source}) id=${data?.id ?? "sin-id"}`
      );
      setEjercicio(data);

      const tiempo = data?.ejercicioAsignado?.descansoSeg || 60;
      setTiempoRestante(tiempo);

      if (!data?.id) {
        console.log(
          "⚠️ [EJ] ejercicio sin id → no se configura storageKey"
        );
        setStorageKey(null);
        return;
      }

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

    if (ejercicioPrefetch) {
      console.log(
        "📦 [EJ] prefetch recibido, id:",
        ejercicioPrefetch?.id ?? "(sin id)"
      );
      applyEjercicio(ejercicioPrefetch, "prefetch");
    }

    const esCompuestoPrefetch = Boolean(
      ejercicioPrefetch?.ejercicioCompuestoId ||
      ejercicioPrefetch?.ejercicioCompuesto
    );

    if (esCompuestoPrefetch) {
      console.log("🧩 [EJ] ruta COMPUESTO (por prefetch)");
      const compId =
        ejercicioPrefetch?.ejercicioCompuestoId ??
        ejercicioPrefetch?.ejercicioCompuesto?.id;

      if (!compId) {
        console.warn(
          "⚠️ [EJ] compuesto sin id; se mantiene solo prefetch"
        );
        return () => {
          aborted = true;
          console.log("🧹 [EJ] cleanup compuesto sin id");
        };
      }

      console.log(
        "🌐 [EJ] obtenerEjercicioCompuesto API, id:",
        compId
      );
      (async () => {
        try {
          const payload = await obtenerEjercicioCompuesto(compId);
          console.log(
            "📨 [EJ] compuesto API OK, ultimaSesionId:",
            payload?.ultimaSesion?.id ?? null
          );

          if (aborted) {
            console.log("⏹️ [EJ] abort antes de apply (compuesto)");
            return;
          }

          const enriched = {
            ...(ejercicioPrefetch || {}),
            ejercicioCompuesto:
              payload?.compuesto ||
              ejercicioPrefetch?.ejercicioCompuesto,
            ultimaSesion: payload?.ultimaSesion ?? null,
          };

          console.log("✅ [EJ] apply compuesto enriquecido");
          applyEjercicio(enriched, "api-compuesto");
        } catch (err) {
          if (!aborted)
            console.error(
              "❌ [EJ] obtenerEjercicioCompuesto error:",
              err
            );
        }
      })();

      return () => {
        aborted = true;
        console.log("🧹 [EJ] cleanup compuesto → abort");
      };
    }

    const slugValido =
      typeof slug === "string" &&
      slug.trim() !== "" &&
      slug !== "undefined" &&
      slug !== "null";

    if (!slugValido) {
      console.warn("⚠️ [EJ] slug inválido; omito cache/API");
      return () => {
        aborted = true;
        console.log("🧹 [EJ] cleanup (slug inválido) → abort");
      };
    }

    console.log("🔎 [EJ] ruta SIMPLE, slug:", slug);
    const hit = cacheGet(slug);
    if (hit) {
      console.log(
        "⚡ [EJ] cache HIT slug=",
        slug,
        "id=",
        (hit as any)?.id
      );
      const normalized =
        (hit as any)?.id != null
          ? hit
          : (hit as any)?.data?.id != null
            ? (hit as any).data
            : hit;

      if (normalized !== hit && (normalized as any)?.id != null) {
        console.log(
          "♻️ [EJ] normalizo cache viejo y lo vuelvo a guardar"
        );
        cacheSet(slug, normalized);
      }

      applyEjercicio(normalized, "cache-simple");
    } else {
      console.log("🌐 [EJ] cache MISS → API (slug:", slug, ")");
      (async () => {
        try {
          const res = await obtenerEjercicio(slug);
          if (aborted) {
            console.log("⏹️ [EJ] abort antes de apply (simple)", slug);
            return;
          }
          console.log("📨 [EJ] API simple OK, id:", res?.id ?? null);
          applyEjercicio(res, "api-simple");
          console.log("💾 [EJ] guardo en cache slug=", slug);
          cacheSet(slug, res);
        } catch (err) {
          if (!aborted)
            console.error("❌ [EJ] obtenerEjercicio error:", err);
        }
      })();
    }

    return () => {
      aborted = true;
      console.log("🧹 [EJ] cleanup efecto → abort:", slug);
    };
  }, [slug, ejercicioPrefetch, cacheGet, cacheSet, applyEjercicio]);

  /* ---------------- Coach Premium: fetch + auto show ---------------- */

  // Inicializamos flag de "ya se mostró auto" por ejercicio simple o compuesto
  useEffect(() => {
    if (!ejercicio) return;

    const esCompuestoLocal = Boolean(
      ejercicio.ejercicioCompuestoId || ejercicio.ejercicioCompuesto
    );

    const targetId = esCompuestoLocal
      ? ejercicio.ejercicioCompuestoId ??
      ejercicio.ejercicioCompuesto?.id ??
      null
      : ejercicio.id ?? null;

    if (!targetId) return;

    const key = esCompuestoLocal
      ? `coach-auto-shown-comp-${targetId}`
      : `coach-auto-shown-ej-${targetId}`;

    coachAutoKeyRef.current = key;

    (async () => {
      try {
        const value = await AsyncStorage.getItem(key);
        if (!value) {
          // Nunca se ha mostrado auto para este ejercicio/compuesto
          setCoachAutoPending(true);
        }
      } catch (e) {
        console.log("⚠️ [COACH] error leyendo flag auto:", e);
      }
    })();
  }, [
    ejercicio?.id,
    ejercicio?.ejercicioCompuestoId,
    ejercicio?.ejercicioCompuesto,
  ]);

  const fetchCoach = useCallback(async () => {
    if (!ejercicio) return;

    const esCompuestoLocal = Boolean(
      ejercicio.ejercicioCompuestoId || ejercicio.ejercicioCompuesto
    );

    const targetId = esCompuestoLocal
      ? ejercicio.ejercicioCompuestoId ??
      ejercicio.ejercicioCompuesto?.id ??
      null
      : ejercicio.id ?? null;

    if (!targetId) return;

    try {
      setCoachLoading(true);

      const res = esCompuestoLocal
        ? await obtenerCoachCompuesto(targetId)
        : await obtenerCoach(targetId);

      setCoachData(res); // null => "sin datos"
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "No se pudo cargar el análisis",
        text2: "Intenta de nuevo en unos segundos.",
      });
    } finally {
      setCoachLoading(false);
    }
  }, [
    ejercicio,
    ejercicio?.id,
    ejercicio?.ejercicioCompuestoId,
    ejercicio?.ejercicioCompuesto,
  ]);

  const mostrarCoach = useCallback(() => {
    setCoachVisible(true);
    if (!coachData && !coachLoading) {
      fetchCoach();
    }
  }, [coachData, coachLoading, fetchCoach]);

  const ocultarCoach = useCallback(() => {
    setCoachVisible(false);
  }, []);

  // Autoabrir una vez por ejercicio cuando tengamos al menos una última sesión
  useEffect(() => {
    if (!coachAutoPending) return;
    if (!ejercicio) return;

    // Si no hay última sesión todavía, no abrimos auto
    if (!ejercicio.ultimaSesion) {
      setCoachAutoPending(false);
      return;
    }

    mostrarCoach();
    setCoachAutoPending(false);

    const key = coachAutoKeyRef.current;
    if (key) {
      AsyncStorage.setItem(key, "1").catch((e) =>
        console.log("⚠️ [COACH] error guardando flag auto:", e)
      );
    }
  }, [coachAutoPending, ejercicio, mostrarCoach]);

  /* ---------------- Guardado de sesión (simple + anuncio) ---------------- */
  const guardarSeries = async () => {
    if (guardando) return;
    if (!usuario?.id || !ejercicio?.id) return;

    const ejercicioAsignadoId = asignadoId ? Number(asignadoId) : undefined;
    if (
      !ejercicioAsignadoId ||
      !Number.isInteger(ejercicioAsignadoId) ||
      ejercicioAsignadoId <= 0
    ) {
      return;
    }

    const payload = {
      usuarioId: usuario.id,
      ejercicioId: ejercicio.id,
      series,
      ejercicioAsignado: ejercicioAsignadoId,
      nivelEstres: nivelEstres ?? undefined,
    };

    try {
      setGuardando(true);

      // 1) intento sin anuncio
      try {
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

        // ✅ sin Toast de éxito
        setFestejo(true);
        setTimeout(() => (navigation as any).goBack(), 3800);
        return;
      } catch (error: any) {
        // Sólo si el backend exige anuncio seguimos al paso 2
        if (error?.errorCode !== "AD_REQUIRED") {
          throw error;
        }
      }

      // 2) ver anuncio y reintentar con token (único intento aquí)
      try {
        const adToken = await mostrarAnuncioYObtenerToken();

        if (!adToken) {
          // usuario cerró / canceló → upsell premium
          setPremiumModalVisible(true);
          return;
        }

        await guardarSesionEjercicio(payload, adToken);

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

        // ✅ sin Toast de éxito
        setFestejo(true);
        setTimeout(() => (navigation as any).goBack(), 3800);
      } catch (error: any) {
        console.error(
          "❌ guardarSesionEjercicio (con anuncio) error:",
          error
        );

        const isNoInventory =
          error?.code === "NO_AD_AVAILABLE" ||
          error?.code === "NO_FILL" ||
          error?.reason === "no-ad";

        const isAdLoadError =
          typeof error?.message === "string" &&
          error.message.includes("No se pudo cargar el anuncio");

        if (isNoInventory || isAdLoadError) {
          // 👇 aquí mostramos el modal sincero de "no hay anuncios / no se pudo cargar"
          setNoAdsModalVisible(true);
          return;
        }

        // Otros errores raros: de momento solo log
        // (si quieres aquí puedes poner un Toast genérico)
      }
    } finally {
      setGuardando(false);
    }
  };

  /* ---------------- Persistencia local de series ---------------- */
  useEffect(() => {
    (async () => {
      if (!storageKey) return;
      try {
        await AsyncStorage.setItem(storageKey, JSON.stringify(series));
      } catch (e) {
        console.log("⚠️ [EJ] error guardando series local:", e);
      }
    })();
  }, [series, storageKey]);

  /* ---------------- Guardado de sesión (compuesto + anuncio) ---------------- */
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

    if (!ejercicioCompuestoId) {
      return;
    }

    const payload = {
      usuarioId: usuario.id,
      ejercicioCompuestoId,
      series: seriesComp,
      nivelEstres: nivelEstres ?? undefined,
    };

    try {
      setGuardando(true);

      // 1) intento sin anuncio
      try {
        await guardarSesionCompuesta(payload);

        const caloriasPlus = calcularCaloriasCompuesto(
          seriesComp as any
        );
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

        // ✅ sin Toast de éxito
        setFestejo(true);
        setTimeout(() => (navigation as any).goBack(), 3800);
        return;
      } catch (error: any) {
        if (error?.errorCode !== "AD_REQUIRED") {
          throw error;
        }
      }

      // 2) ver anuncio y reintentar con token (único intento aquí)
      try {
        const adToken = await mostrarAnuncioYObtenerToken();

        if (!adToken) {
          setPremiumModalVisible(true);
          return;
        }

        await guardarSesionCompuesta(payload, adToken);

        const caloriasPlus = calcularCaloriasCompuesto(
          seriesComp as any
        );
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

        // ✅ sin Toast de éxito
        setFestejo(true);
        setTimeout(() => (navigation as any).goBack(), 3800);
      } catch (error: any) {
        if (
          error?.code === "NO_AD_AVAILABLE" ||
          error?.code === "NO_FILL" ||
          error?.reason === "no-ad"
        ) {
          setNoAdsModalVisible(true);
          return;
        }

        console.error(
          "❌ guardarSesionCompuesta (con anuncio) error:",
          error
        );
      }
    } finally {
      setGuardando(false);
    }
  };

  /* ---------------- Reintento: buscar anuncio hasta 1 minuto (simple) ---------------- */
  const reintentarAnuncioSimple = useCallback(async () => {
    if (noAdsRetrying) return;
    if (!usuario?.id || !ejercicio?.id) return;

    const ejercicioAsignadoId = asignadoId ? Number(asignadoId) : undefined;
    if (
      !ejercicioAsignadoId ||
      !Number.isInteger(ejercicioAsignadoId) ||
      ejercicioAsignadoId <= 0
    ) {
      return;
    }

    const payload = {
      usuarioId: usuario.id,
      ejercicioId: ejercicio.id,
      series,
      ejercicioAsignado: ejercicioAsignadoId,
      nivelEstres: nivelEstres ?? undefined,
    };

    setNoAdsRetrying(true);
    const start = Date.now();

    try {
      let adToken: string | null = null;

      while (!adToken && Date.now() - start < 60_000) {
        try {
          adToken = await mostrarAnuncioYObtenerToken();
          if (adToken) break;
        } catch (error: any) {
          if (
            error?.code === "NO_AD_AVAILABLE" ||
            error?.code === "NO_FILL" ||
            error?.reason === "no-ad"
          ) {
            // esperamos 5s y reintentamos
            await sleep(5000);
            continue;
          }

          console.error("❌ Error buscando anuncio (simple):", error);
          Toast.show({
            type: "error",
            text1: "Error al cargar el anuncio",
            text2: "Intenta de nuevo en unos segundos.",
          });
          return;
        }
      }

      if (!adToken) {
        Toast.show({
          type: "info",
          text1: "Seguimos sin anuncios",
          text2:
            "No hemos encontrado anuncios ahora mismo. Prueba más tarde o usa la versión Premium desde tu perfil.",
        });
        return;
      }

      // tenemos anuncio → intentamos guardar con token
      try {
        setGuardando(true);
        await guardarSesionEjercicio(payload, adToken);

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

        setNoAdsModalVisible(false);
        setFestejo(true);
        setTimeout(() => (navigation as any).goBack(), 3800);
      } catch (error: any) {
        console.error(
          "❌ guardarSesionEjercicio (reintento anuncio) error:",
          error
        );
        Toast.show({
          type: "error",
          text1: "No se pudo guardar la sesión",
          text2: "Inténtalo de nuevo en unos minutos.",
        });
      } finally {
        setGuardando(false);
      }
    } finally {
      setNoAdsRetrying(false);
    }
  }, [
    noAdsRetrying,
    usuario,
    ejercicio,
    asignadoId,
    series,
    nivelEstres,
    mostrarAnuncioYObtenerToken,
    setUsuario,
    storageKey,
    slug,
    experienciaPlus,
    navigation,
  ]);

  /* ---------------- Reintento: buscar anuncio hasta 1 minuto (compuesto) ---------------- */
  const reintentarAnuncioCompuesto = useCallback(
    async (
      seriesComp: {
        ejercicioId: number;
        pesoKg?: number;
        repeticiones?: number;
        duracionSegundos?: number;
      }[][]
    ) => {
      if (noAdsRetrying) return;
      if (!usuario?.id) return;

      const ejercicioCompuestoId =
        ejercicio?.ejercicioCompuestoId ??
        ejercicio?.ejercicioCompuesto?.id;

      if (!ejercicioCompuestoId) {
        return;
      }

      const payload = {
        usuarioId: usuario.id,
        ejercicioCompuestoId,
        series: seriesComp,
        nivelEstres: nivelEstres ?? undefined,
      };

      setNoAdsRetrying(true);
      const start = Date.now();

      try {
        let adToken: string | null = null;

        while (!adToken && Date.now() - start < 60_000) {
          try {
            adToken = await mostrarAnuncioYObtenerToken();
            if (adToken) break;
          } catch (error: any) {
            if (
              error?.code === "NO_AD_AVAILABLE" ||
              error?.code === "NO_FILL" ||
              error?.reason === "no-ad"
            ) {
              await sleep(5000);
              continue;
            }

            console.error(
              "❌ Error buscando anuncio (compuesto):",
              error
            );
            Toast.show({
              type: "error",
              text1: "Error al cargar el anuncio",
              text2: "Intenta de nuevo en unos segundos.",
            });
            return;
          }
        }

        if (!adToken) {
          Toast.show({
            type: "info",
            text1: "Seguimos sin anuncios",
            text2:
              "No hemos encontrado anuncios ahora mismo. Prueba más tarde o usa la versión Premium desde tu perfil.",
          });
          return;
        }

        // tenemos anuncio → intentamos guardar con token
        try {
          setGuardando(true);
          await guardarSesionCompuesta(payload, adToken);

          const caloriasPlus = calcularCaloriasCompuesto(
            seriesComp as any
          );
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

          setNoAdsModalVisible(false);
          setFestejo(true);
          setTimeout(() => (navigation as any).goBack(), 3800);
        } catch (error: any) {
          console.error(
            "❌ guardarSesionCompuesta (reintento anuncio) error:",
            error
          );
          Toast.show({
            type: "error",
            text1: "No se pudo guardar la sesión",
            text2: "Inténtalo de nuevo en unos minutos.",
          });
        } finally {
          setGuardando(false);
        }
      } finally {
        setNoAdsRetrying(false);
      }
    },
    [
      noAdsRetrying,
      usuario,
      ejercicio,
      nivelEstres,
      mostrarAnuncioYObtenerToken,
      setUsuario,
      storageKey,
      slug,
      experienciaPlus,
      navigation,
    ]
  );

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
    nivelEstres,
    setNivelEstres,

    // Coach Premium
    coachData,
    coachLoading,
    coachVisible,
    mostrarCoach,
    ocultarCoach,

    // toggles/paneles
    infoVisible,
    setInfoVisible,
    estadisticaVisible,
    setEstadisticaVisible,

    // acciones
    handleInputChange,
    agregar,
    quitar,
    iniciarDescanso,
    finalizarDescanso,
    guardarSeries,
    guardarSeriesCompuesto,

    // modal premium
    premiumModalVisible,
    setPremiumModalVisible,

    // modal "no hay anuncios"
    noAdsModalVisible,
    setNoAdsModalVisible,
    noAdsRetrying,
    reintentarAnuncioSimple,
    reintentarAnuncioCompuesto,
  };
}
