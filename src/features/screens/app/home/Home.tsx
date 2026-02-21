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
  id: number; // 👈 importante: este id debe ser el mismo que viene en completadosPorFecha
  completadoHoy?: boolean; // lo “hidratamos” según selectedYMD
};

type RutinaDia = {
  id?: number;
  diaSemana: DiaNombre;
  ejercicios: Ejercicio[];
  completadoHoy?: boolean; // opcional: también lo puedes hidratar
};

type RutinaResp = {
  id?: number;
  dias?: RutinaDia[];

  // día completado (full day)
  fechasCompletadas?: string[];

  // ✅ completados por fecha: { "YYYY-MM-DD": [ids...] }
  completadosPorFecha?: Record<string, number[]>;

  // ✅ completados por asignación: { "id": ["YYYY-MM-DD", ...] }
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

  const fetchRutina = useCallback(
    async (force = false) => {
      const id = usuario?.rutinaActivaId;
      if (!id) {
        setRutina(null);
        return;
      }

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

  useEffect(() => {
    fetchRutina(false);
  }, [fetchRutina]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchRutina(true);
    } finally {
      setRefreshing(false);
    }
  }, [fetchRutina]);

  // Calendar actual: manda (diaNum, diaNombre, mes, año)
  const devolver = useCallback((d: string, diaNombre: string) => {
    setDia(normalizeEnum(diaNombre));

    // d debería venir como "YYYY-MM-DD" desde Calendar
    if (typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
      setSelectedYMD(d);
    } else {
      // fallback seguro (por si Calendar manda otro formato)
      setSelectedYMD(toMadridYMD(new Date()));
    }
  }, []);

  const totalEjercicios = useMemo(
    () => rutina?.dias?.find((i) => i.diaSemana === dia)?.ejercicios?.length || 0,
    [rutina, dia]
  );

  // ✅ Para el punto verde del calendario (día completado)
  const completadasMap = useMemo(() => {
    const map: Record<string, boolean> = {};

    // 1) días completados al 100%
    for (const ymd of rutina?.fechasCompletadas ?? []) {
      map[ymd] = true;
    }

    // 2) días con al menos 1 ejercicio completado
    const porFecha = rutina?.completadosPorFecha ?? {};
    for (const [ymd, ids] of Object.entries(porFecha)) {
      if (Array.isArray(ids) && ids.length > 0) map[ymd] = true;
    }

    return map;
  }, [rutina?.fechasCompletadas, rutina?.completadosPorFecha]);

  /**
   * ✅ FIX CLAVE:
   * “Hidratamos” rutina.dias[].ejercicios[].completadoHoy en base a selectedYMD
   * usando completadosPorFecha (o fallback con completadosPorAsignacion).
   *
   * Así TarjetaHome vuelve a poder marcar checks por ejercicio aunque el backend ya
   * no lo meta dentro de cada ejercicio.
   */
  const rutinaHidratada = useMemo(() => {
    if (!rutina?.dias) return rutina;

    // Preferimos completadosPorFecha porque es directo por día
    const idsCompletadosEnFecha = new Set<number>(rutina.completadosPorFecha?.[selectedYMD] ?? []);

    const usarAsignacionFallback = idsCompletadosEnFecha.size === 0 && !!rutina.completadosPorAsignacion;

    const diasH = rutina.dias.map((d) => {
      const ejerciciosH = (d.ejercicios ?? []).map((e) => {
        let completado = false;

        if (idsCompletadosEnFecha.size > 0) {
          completado = idsCompletadosEnFecha.has(e.id);
        } else if (usarAsignacionFallback) {
          const fechas = rutina.completadosPorAsignacion?.[String(e.id)] ?? [];
          completado = fechas.includes(selectedYMD);
        } else {
          // si no hay mapas, respetamos lo que venga (por compat)
          completado = !!e.completadoHoy;
        }

        return { ...e, completadoHoy: completado };
      });

      // opcional: completar el flag del día si TODOS los ejercicios están completos
      const diaCompleto =
        ejerciciosH.length > 0 ? ejerciciosH.every((e) => !!e.completadoHoy) : false;

      return { ...d, ejercicios: ejerciciosH, completadoHoy: diaCompleto };
    });

    // Logs útiles (puedes quitarlos luego)
    console.log("[Home] rutinaHidratada", {
      selectedYMD,
      completadosPorFecha: rutina.completadosPorFecha?.[selectedYMD] ?? [],
      ejemploDia: diasH.find((x) => x.diaSemana === dia)?.ejercicios?.slice?.(0, 5),
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
      {/* Calendario */}
      <View style={styles.calendarWrapper}>
        <Calendar devolverDato={devolver} completadas={completadasMap} />
      </View>

      {/* Resumen */}
      {rutinaHidratada && <Extra ejercicios={totalEjercicios} />}

      {/* Tarjeta del día */}
      <View style={styles.cardWrapper}>
        <TarjetaHome rutina={rutinaHidratada as any} dia={dia} selectedYMD={selectedYMD} />
      </View>

      {/* Estado vacío */}
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