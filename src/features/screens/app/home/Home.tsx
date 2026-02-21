// File: Home.tsx
import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { View, ScrollView, RefreshControl, StyleSheet, Platform } from "react-native";
import { useColorScheme } from "nativewind";

import { useUsuarioStore } from "@/features/store/useUsuarioStore";
import { useSyncStore } from "@/features/store/useSyncStore";
import { obtenerRutina } from "@/features/api/rutinas.api";
import { useRutinaCache } from "@/features/store/useRutinaCache";

import Calendar from "@/shared/components/home/Calendar";
import TarjetaHome from "@/shared/components/home/TarjetaHome";
import MensajeVacio from "@/shared/components/ui/MensajeVacio";
import Extra from "@/shared/components/home/Extra";
import IaGenerate from "@/shared/components/ui/IaGenerate";
import HomeSkeleton from "@/shared/components/skeleton/HomeSkeleton";

// ── Tokens ───────────────────────────────────────────────────────────────────
const tokens = {
  color: {
    bgDark: "#080D17",
    bgLight: "#F8FAFC",
    tintDark: "#E2E8F0",
    tintLight: "#0F172A",
    spinnerDark: "#00E85A",
    spinnerLight: "#16A34A",
  },
  spacing: {
    sm: 8,
    md: 16,
    lg: 20,
    xl: 24,
    tabBarSafe: Platform.OS === "ios" ? 140 : 130,
  },
} as const;

// ── Tipos ───────────────────────────────────────────────────────────────────
type DiaNombre =
  | "LUNES"
  | "MARTES"
  | "MIERCOLES"
  | "JUEVES"
  | "VIERNES"
  | "SABADO"
  | "DOMINGO";

type Ejercicio = {
  id: number;
  completadoHoy?: boolean;
};

type RutinaDia = {
  id?: number;
  diaSemana: DiaNombre;
  ejercicios: Ejercicio[];
  completadoHoy?: boolean;
};

type RutinaResp = {
  id?: number;
  dias?: RutinaDia[];

  fechasCompletadas?: string[];
  completadosPorFecha?: Record<string, number[]>;
  completadosPorAsignacion?: Record<string, string[]>;
};

// ── Utils ───────────────────────────────────────────────────────────────────
const getDiaActualEnum = (): DiaNombre => {
  const dias: DiaNombre[] = [
    "DOMINGO",
    "LUNES",
    "MARTES",
    "MIERCOLES",
    "JUEVES",
    "VIERNES",
    "SABADO",
  ];
  return dias[new Date().getDay()] as DiaNombre;
};

const normalizeEnum = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase() as DiaNombre;

const toMadridYMD = (() => {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return (d: Date) => fmt.format(d);
})();

// semana (lunes→domingo) basada en una fecha (LOCAL JS date)
// nota: esto es solo para diagnosticar qué semana “podría” estar mostrando Calendar
const getWeekMonday = (d: Date) => {
  const day = d.getDay(); // 0=domingo
  const mondayOffset = (day + 6) % 7; // lunes=0
  const monday = new Date(d);
  monday.setDate(d.getDate() - mondayOffset);
  monday.setHours(12, 0, 0, 0);
  return monday;
};
const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(d.getDate() + n);
  return x;
};

const isYMD = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);

// ── Screen ───────────────────────────────────────────────────────────────────
export default function Home() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const { usuario } = useUsuarioStore();
  const routineRev = useSyncStore((s) => s.routineRev);
  const workoutRev = useSyncStore((s) => s.workoutRev);
  const rutinaCache = useRutinaCache();

  const [rutina, setRutina] = useState<RutinaResp | null>(null);
  const [dia, setDia] = useState<DiaNombre>(getDiaActualEnum());
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedYMD, setSelectedYMD] = useState<string>(() => toMadridYMD(new Date()));

  const lastKeyRef = useRef<string | null>(null);
  const inflightRef = useRef<Promise<any> | null>(null);

  // ── LOG: render y valores clave ─────────────────────────────────────────────
  useEffect(() => {
    console.log("[Home][render]", {
      rutinaActivaId: usuario?.rutinaActivaId,
      routineRev,
      workoutRev,
      dia,
      selectedYMD,
      hoyMadrid: toMadridYMD(new Date()),
      tieneRutina: !!rutina,
      fechasCompletadasCount: rutina?.fechasCompletadas?.length ?? 0,
      completadosPorFechaKeys: Object.keys(rutina?.completadosPorFecha ?? {}).length,
    });
  }, [usuario?.rutinaActivaId, routineRev, workoutRev, dia, selectedYMD, rutina]);

  const fetchRutina = useCallback(
    async (force = false) => {
      const id = usuario?.rutinaActivaId;

      console.log("[Home] fetchRutina()", { force, id, routineRev, workoutRev });

      if (!id) {
        console.log("[Home] no rutinaActivaId -> setRutina(null)");
        setRutina(null);
        return;
      }

      const key = `${id}|${routineRev}|${workoutRev}`;
      console.log("[Home] computed key", { key, lastKey: lastKeyRef.current });

      if (!force && lastKeyRef.current === key) {
        console.log("[Home] skip fetch (key igual, force=false)");
        return;
      }
      lastKeyRef.current = key;

      const cached = rutinaCache.get(id);
      console.log("[Home] cache get", {
        tieneCache: !!cached,
        cache_fechasCompletadas: cached?.fechasCompletadas?.slice?.(0, 10),
        cache_completadosPorFecha_keys: Object.keys(cached?.completadosPorFecha ?? {}).slice(0, 10),
      });

      if (cached && !force) {
        console.log("[Home] setRutina(cached)");
        setRutina(cached);
      }

      try {
        if (!force) setLoading(true);

        if (inflightRef.current) {
          console.log("[Home] inflight existente (no se cancela)");
        }

        const p = obtenerRutina(id)
          .then((data) => {
            console.log("[Home] obtenerRutina RAW (resumen)", {
              tieneData: !!data,
              fechasCompletadas: (data as any)?.fechasCompletadas,
              completadosPorFecha_keys: Object.keys((data as any)?.completadosPorFecha ?? {}),
              completadosPorFecha_sample: Object.entries((data as any)?.completadosPorFecha ?? {}).slice(0, 3),
            });

            const rutinaResp = (data ?? null) as RutinaResp | null;

            console.log("[Home] rutina normalizada", {
              tieneRutina: !!rutinaResp,
              fechasCompletadasCount: rutinaResp?.fechasCompletadas?.length ?? 0,
              fechasCompletadasSample: rutinaResp?.fechasCompletadas?.slice?.(0, 10),
              completadosPorFechaKeysCount: Object.keys(rutinaResp?.completadosPorFecha ?? {}).length,
            });

            setRutina(rutinaResp);
            if (rutinaResp) {
              rutinaCache.set(id, rutinaResp);
              console.log("[Home] cache set OK", { id });
            }
          })
          .catch((err) => console.error("[Home] obtenerRutina error", err))
          .finally(() => {
            inflightRef.current = null;
            if (!force) setLoading(false);
          });

        inflightRef.current = p;
        await p;
      } catch (e) {
        console.log("[Home] fetchRutina try/catch", e);
      }
    },
    [usuario?.rutinaActivaId, routineRev, workoutRev, rutinaCache]
  );

  useEffect(() => {
    fetchRutina(false);
  }, [fetchRutina]);

  const onRefresh = useCallback(async () => {
    console.log("[Home] onRefresh()");
    setRefreshing(true);
    try {
      await fetchRutina(true);
    } finally {
      setRefreshing(false);
      console.log("[Home] onRefresh() end");
    }
  }, [fetchRutina]);

  // devolverDato del Calendar: d = "YYYY-MM-DD"
  const devolver = useCallback((d: string, diaNombre: string) => {
    const normalized = normalizeEnum(diaNombre);
    setDia(normalized);

    const ok = typeof d === "string" && isYMD(d);
    const next = ok ? d : toMadridYMD(new Date());
    setSelectedYMD(next);

    console.log("[Home] Calendar devolverDato()", {
      raw: { d, diaNombre },
      normalizedDia: normalized,
      okYMD: ok,
      selectedYMD_next: next,
      hoyMadrid: toMadridYMD(new Date()),
    });
  }, []);

  const totalEjercicios = useMemo(() => {
    const total = rutina?.dias?.find((i) => i.diaSemana === dia)?.ejercicios?.length || 0;
    console.log("[Home] totalEjercicios", { dia, total });
    return total;
  }, [rutina, dia]);

  // ✅ completadasMap (día marcado) + diagnósticos
  const completadasMap = useMemo(() => {
    const map: Record<string, boolean> = {};

    const full = rutina?.fechasCompletadas ?? [];
    for (const ymd of full) map[ymd] = true;

    const porFecha = rutina?.completadosPorFecha ?? {};
    for (const [ymd, ids] of Object.entries(porFecha)) {
      if (Array.isArray(ids) && ids.length > 0) map[ymd] = true;
    }

    // ── LOG: claves y chequeo de “lunes” ────────────────────────────────────
    const keys = Object.keys(map).sort();
    const mondayThisWeek = (() => {
      const monday = getWeekMonday(new Date());
      return toMadridYMD(monday);
    })();

    const weekRange = (() => {
      const monday = getWeekMonday(new Date());
      const arr = Array.from({ length: 7 }, (_, i) => toMadridYMD(addDays(monday, i)));
      return { monday: arr[0], sunday: arr[6], days: arr };
    })();

    console.log("[Home] completadasMap build", {
      fechasCompletadasCount: full.length,
      completadosPorFechaKeysCount: Object.keys(porFecha).length,
      mapKeysCount: keys.length,
      mapKeysSample: keys.slice(0, 12),
      mondayThisWeek,
      mondayThisWeekMarked: !!map[mondayThisWeek],
      weekVisible_guess: weekRange, // 👈 esto te dirá si “ese lunes” está fuera
    });

    // si el usuario selecciona una fecha, comprobamos si está marcada
    console.log("[Home] selectedYMD in completadasMap?", {
      selectedYMD,
      marked: !!map[selectedYMD],
      completadosPorFecha_selected: rutina?.completadosPorFecha?.[selectedYMD] ?? [],
    });

    return map;
  }, [rutina?.fechasCompletadas, rutina?.completadosPorFecha, selectedYMD]);

  // Hidratación ejercicios
  const rutinaHidratada = useMemo(() => {
    if (!rutina?.dias) return rutina;

    const idsCompletadosEnFecha = new Set<number>(rutina.completadosPorFecha?.[selectedYMD] ?? []);
    const usarAsignacionFallback =
      idsCompletadosEnFecha.size === 0 && !!rutina.completadosPorAsignacion;

    const diasH = rutina.dias.map((d) => {
      const ejerciciosH = (d.ejercicios ?? []).map((e) => {
        let completado = false;

        if (idsCompletadosEnFecha.size > 0) {
          completado = idsCompletadosEnFecha.has(e.id);
        } else if (usarAsignacionFallback) {
          const fechas = rutina.completadosPorAsignacion?.[String(e.id)] ?? [];
          completado = fechas.includes(selectedYMD);
        } else {
          completado = !!e.completadoHoy;
        }

        return { ...e, completadoHoy: completado };
      });

      const diaCompleto = ejerciciosH.length > 0 ? ejerciciosH.every((e) => !!e.completadoHoy) : false;
      return { ...d, ejercicios: ejerciciosH, completadoHoy: diaCompleto };
    });

    // ── LOG: diagnóstico id mismatch ─────────────────────────────────────────
    const diaSel = diasH.find((x) => x.diaSemana === dia);
    const idsEjerciciosDia = (diaSel?.ejercicios ?? []).map((e) => e.id);
    const idsCompletadosArr = Array.from(idsCompletadosEnFecha);

    console.log("[Home] rutinaHidratada diag", {
      selectedYMD,
      dia,
      idsCompletadosEnFecha: idsCompletadosArr,
      idsEjerciciosDia_sample: idsEjerciciosDia.slice(0, 15),
      hayInterseccion:
        idsCompletadosArr.length > 0
          ? idsCompletadosArr.some((x) => idsEjerciciosDia.includes(x))
          : null,
      usandoFallbackAsignacion: usarAsignacionFallback,
    });

    return { ...rutina, dias: diasH };
  }, [rutina, selectedYMD, dia]);

  if (loading && !rutina) return <HomeSkeleton />;

  const bg = isDark ? tokens.color.bgDark : tokens.color.bgLight;

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: bg }]}
      contentContainerStyle={[styles.content, { backgroundColor: bg }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={isDark ? tokens.color.tintDark : tokens.color.tintLight}
          colors={[isDark ? tokens.color.spinnerDark : tokens.color.spinnerLight]}
          progressBackgroundColor={bg}
        />
      }
    >
      <View style={styles.calendarWrapper}>
        <Calendar devolverDato={devolver} completadas={completadasMap} />
      </View>

      {rutinaHidratada && <Extra ejercicios={totalEjercicios} />}

      <View style={styles.cardWrapper}>
        <TarjetaHome rutina={rutinaHidratada as any} dia={dia} selectedYMD={selectedYMD} />
      </View>

      {!usuario?.rutinaActivaId && (
        <View style={styles.emptyWrapper}>
          <MensajeVacio
            titulo="Aún no tienes una rutina"
            descripcion="No hemos encontrado una rutina activa. Puedes generar una personalizada con IA."
            textoBoton="Crear mi rutina"
            rutaDestino="/crear-rutina"
            nombreImagen="rutinas"
            mostrarBoton={false}
          />
          <View style={styles.iaWrapper}>
            <IaGenerate />
          </View>
        </View>
      )}
    </ScrollView>
  );
}

// ── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: {
    padding: tokens.spacing.md,
    paddingBottom: tokens.spacing.tabBarSafe,
    gap: tokens.spacing.lg,
    minHeight: "100%",
  },
  calendarWrapper: {
    width: "100%",
    alignItems: "center",
  },
  cardWrapper: {
    width: "100%",
    alignItems: "center",
  },
  emptyWrapper: {
    alignItems: "center",
    gap: tokens.spacing.xl,
  },
  iaWrapper: {
    alignItems: "center",
  },
});