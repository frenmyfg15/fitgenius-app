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
import IaGenerateAuto from "@/shared/components/ui/IaGenerateAuto";
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
    "DOMINGO", "LUNES", "MARTES", "MIERCOLES",
    "JUEVES", "VIERNES", "SABADO",
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

const getWeekMonday = (d: Date) => {
  const day = d.getDay();
  const mondayOffset = (day + 6) % 7;
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

  // ── Auto-generación primera vez ──────────────────────────────────────────
  const [autoGenerating, setAutoGenerating] = useState(false);
  const autoGenTriggered = useRef(false);

  useEffect(() => {
    if (autoGenTriggered.current) return;
    if (!usuario) return;
    if ((usuario.rutinasIACreadas ?? 0) > 0) return;

    autoGenTriggered.current = true;
    setAutoGenerating(true);
  }, [usuario]);

  const lastKeyRef = useRef<string | null>(null);
  const inflightRef = useRef<Promise<any> | null>(null);

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
      if (!id) { setRutina(null); return; }

      const key = `${id}|${routineRev}|${workoutRev}`;
      if (!force && lastKeyRef.current === key) return;
      lastKeyRef.current = key;

      const cached = rutinaCache.get(id);
      if (cached && !force) setRutina(cached);

      try {
        if (!force) setLoading(true);

        const p = obtenerRutina(id)
          .then((data) => {
            const rutinaResp = (data ?? null) as RutinaResp | null;
            setRutina(rutinaResp);
            if (rutinaResp) rutinaCache.set(id, rutinaResp);
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
    setRefreshing(true);
    try { await fetchRutina(true); }
    finally { setRefreshing(false); }
  }, [fetchRutina]);

  const devolver = useCallback((ymd: string, diaEnum: string) => {
    setDia(normalizeEnum(diaEnum));
    setSelectedYMD(typeof ymd === "string" && isYMD(ymd) ? ymd : toMadridYMD(new Date()));
  }, []);

  const totalEjercicios = useMemo(() => {
    return rutina?.dias?.find((i) => i.diaSemana === dia)?.ejercicios?.length || 0;
  }, [rutina, dia]);

  const completadasMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const ymd of rutina?.fechasCompletadas ?? []) map[ymd] = true;
    for (const [ymd, ids] of Object.entries(rutina?.completadosPorFecha ?? {})) {
      if (Array.isArray(ids) && ids.length > 0) map[ymd] = true;
    }
    return map;
  }, [rutina?.fechasCompletadas, rutina?.completadosPorFecha]);

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
          completado = (rutina.completadosPorAsignacion?.[String(e.id)] ?? []).includes(selectedYMD);
        } else {
          completado = !!e.completadoHoy;
        }
        return { ...e, completadoHoy: completado };
      });

      const diaCompleto = ejerciciosH.length > 0 && ejerciciosH.every((e) => !!e.completadoHoy);
      return { ...d, ejercicios: ejerciciosH, completadoHoy: diaCompleto };
    });

    return { ...rutina, dias: diasH };
  }, [rutina, selectedYMD, dia]);

  if (loading && !rutina) return <HomeSkeleton />;

  const bg = isDark ? tokens.color.bgDark : tokens.color.bgLight;

  return (
    <>
      {/* ── Auto-generación primera vez ──────────────────────────────────── */}
      {autoGenerating && (
        <IaGenerateAuto
          onDone={() => setAutoGenerating(false)}
          onError={() => setAutoGenerating(false)}
        />
      )}

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

        {!usuario?.rutinaActivaId && !autoGenerating && (
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
    </>
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
  calendarWrapper: { width: "100%", alignItems: "center" },
  cardWrapper: { width: "100%", alignItems: "center" },
  emptyWrapper: { alignItems: "center", gap: tokens.spacing.xl },
  iaWrapper: { alignItems: "center" },
});