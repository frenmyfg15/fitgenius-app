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

// ── Tokens (mismo sistema compartido) ────────────────────────────────────────
const tokens = {
  color: {
    bgDark: "#080D17",
    bgLight: "#F8FAFC",
    tintDark: "#E2E8F0",
    tintLight: "#0F172A",
    spinnerDark: "#00E85A",
    spinnerLight: "#16A34A",
  },
  // Ajustamos el padding bottom para que el menú flotante no tape el contenido
  // 120 es ideal: 65 de altura del menú + 30/35 de su posición bottom + margen extra
  spacing: {
    sm: 8,
    md: 16,
    lg: 20,
    xl: 24,
    tabBarSafe: Platform.OS === "ios" ? 140 : 130
  },
} as const;

// ── Tipos ───────────────────────────────────────────────────────────────────
type DiaNombre =
  | "LUNES" | "MARTES" | "MIERCOLES" | "JUEVES"
  | "VIERNES" | "SABADO" | "DOMINGO";

type RutinaDia = {
  diaSemana: DiaNombre;
  ejercicios: Array<{ id: number; completadoHoy?: boolean }>;
  completadoHoy?: boolean;
};

type RutinaResp = {
  dias?: RutinaDia[];
  fechasCompletadas?: string[];
};

// ── Utils ────────────────────────────────────────────────────────────────────
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
    year: "numeric", month: "2-digit", day: "2-digit",
  });
  return (d: Date) => fmt.format(d);
})();

// ── Screen ────────────────────────────────────────────────────────────────────
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
  const [selectedYMD, setSelectedYMD] = useState<string>(() =>
    toMadridYMD(new Date())
  );

  const lastKeyRef = useRef<string | null>(null);
  const inflightRef = useRef<Promise<any> | null>(null);

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
      } catch { }
    },
    [usuario?.rutinaActivaId, routineRev, workoutRev, rutinaCache]
  );

  useEffect(() => { fetchRutina(false); }, [fetchRutina]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await fetchRutina(true); }
    finally { setRefreshing(false); }
  }, [fetchRutina]);

  const devolver = useCallback((diaNum: string, diaNombre: string, mes: string, año: string) => {
    setDia(normalizeEnum(diaNombre));

    // construimos YYYY-MM-DD con lo que Calendar manda
    const ymd = `${año}-${String(mes).padStart(2, "0")}-${String(diaNum).padStart(2, "0")}`;
    setSelectedYMD(ymd);
  }, []);

  const totalEjercicios = useMemo(() =>
    rutina?.dias?.find((i) => i.diaSemana === dia)?.ejercicios?.length || 0,
    [rutina, dia]
  );

  const completadasMap = useMemo(() => {
    if (!rutina?.fechasCompletadas) return {};
    const map: Record<string, boolean> = {};
    for (const ymd of rutina.fechasCompletadas) map[ymd] = true;
    return map;
  }, [rutina?.fechasCompletadas]);

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
      {/* ── Calendario ───────────────────────────────────────────────────── */}
      <View style={styles.calendarWrapper}>
        <Calendar devolverDato={devolver} completadas={completadasMap} />
      </View>

      {/* ── Resumen del día (solo con rutina activa) ──────────────────────── */}
      {rutina && (
        <Extra ejercicios={totalEjercicios} />
      )}

      {/* ── Tarjeta del día ───────────────────────────────────────────────── */}
      <View style={styles.cardWrapper}>
        <TarjetaHome
          rutina={rutina as any}
          dia={dia}
          selectedYMD={selectedYMD}
        />
      </View>

      {/* ── Estado vacío: sin rutina activa ───────────────────────────────── */}
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

// ── Estilos estáticos ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  scroll: {
    flex: 1
  },
  content: {
    padding: tokens.spacing.md,
    // El paddingBottom es la clave para no chocar con el menú flotante
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