import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { View, ScrollView, RefreshControl, StyleSheet, Platform, Text } from "react-native";
import { useColorScheme } from "nativewind";
import { useNavigation } from "@react-navigation/native";

import { useUsuarioStore } from "@/features/store/useUsuarioStore";
import { useSyncStore } from "@/features/store/useSyncStore";
import { obtenerRutina } from "@/features/api/rutinas.api";
import { useRutinaCache } from "@/features/store/useRutinaCache";
import { useOnboardingStore } from "@/features/store/useOnboardingStore";

import Calendar from "@/shared/components/home/Calendar";
import TarjetaHome from "@/shared/components/home/TarjetaHome";
import MensajeVacio from "@/shared/components/ui/MensajeVacio";
import IaGenerate from "@/shared/components/ui/IaGenerate";
import IaGenerateAuto from "@/shared/components/ui/IaGenerateAuto";
import OnboardingModal from "@/shared/components/ui/OnboardingModal";
import HomeSkeleton from "@/shared/components/skeleton/HomeSkeleton";
import { useSeguimientoInteligente } from "@/shared/hooks/useSeguimientoInteligente";
import SeguimientoInteligenteModal from "@/shared/components/home/SeguimientoInteligenteModal";

// ── Tokens ───────────────────────────────────────────────────────────────────

const tokens = {
  color: {
    bgDark: "#080D17",
    bgLight: "#F8FAFC",
    tintDark: "#E2E8F0",
    tintLight: "#0F172A",
    spinnerDark: "#00E85A",
    spinnerLight: "#16A34A",
    textPrimaryDark: "#F1F5F9",
    textPrimaryLight: "#0F172A",
    textSecondaryDark: "rgba(226,232,240,0.72)",
    textSecondaryLight: "rgba(15,23,42,0.62)",
  },
  spacing: {
    sm: 8,
    md: 16,
    lg: 20,
    xl: 24,
    tabBarSafe: Platform.OS === "ios" ? 140 : 130,
  },
} as const;

// ── Tipos ────────────────────────────────────────────────────────────────────

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
  fechasCompletadasAsignacion?: string[];
  ultimaFechaCompletado?: string | null;

  // nuevo payload backend
  fechasPlanificadasCompletadasAsignacion?: string[];
  ultimaFechaPlanificadaCompletada?: string | null;

  // solo para depurar / uso interno del frontend
  fechasCompletadasAsignacionReal?: string[];
  fechasCompletadasAsignacionUI?: string[];
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

  // nuevo payload backend
  completadosPlanificadosPorFecha?: Record<string, number[]>;
  completadosPlanificadosPorAsignacion?: Record<string, string[]>;
};

// ── Utils ────────────────────────────────────────────────────────────────────

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

const isYMD = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);

// ── Screen ───────────────────────────────────────────────────────────────────

export default function Home() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const navigation = useNavigation<any>();

  const { usuario } = useUsuarioStore();
  const routineRev = useSyncStore((s) => s.routineRev);
  const workoutRev = useSyncStore((s) => s.workoutRev);
  const rutinaCache = useRutinaCache();

  // ── Onboarding ────────────────────────────────────────────────────────
  const onboardingCompletado = useOnboardingStore((s) => s.completado);
  const pendienteMostrar = useOnboardingStore((s) => s.pendienteMostrar);
  const hydrated = useOnboardingStore((s) => s.hydrated);
  const marcarPendiente = useOnboardingStore((s) => s.marcarPendiente);
  const limpiarPendiente = useOnboardingStore((s) => s.limpiarPendiente);

  // ── Auto-generación ───────────────────────────────────────────────────
  const [autoGenerating, setAutoGenerating] = useState(false);
  const autoGenTriggered = useRef(false);

  useEffect(() => {
    if (autoGenTriggered.current) return;
    if (!usuario) return;
    if ((usuario.rutinasIACreadas ?? 0) > 0) return;
    autoGenTriggered.current = true;
    setAutoGenerating(true);
  }, [usuario]);

  // ── Seguimiento inteligente ───────────────────────────────────────────
  const seguimiento = useSeguimientoInteligente();

  useEffect(() => {
    if (!usuario?.id || autoGenerating) return;
    seguimiento.iniciar();
  }, [usuario?.id, autoGenerating]);

  // ── Rutina ────────────────────────────────────────────────────────────
  const [rutina, setRutina] = useState<RutinaResp | null>(null);
  const [dia, setDia] = useState<DiaNombre>(getDiaActualEnum());
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedYMD, setSelectedYMD] = useState<string>(() => toMadridYMD(new Date()));

  const lastKeyRef = useRef<string | null>(null);
  const inflightRef = useRef<Promise<any> | null>(null);

  const fetchRutina = useCallback(
    async (force = false) => {
      const id = usuario?.rutinaActivaId;
      if (!id) {
        console.log("[Home] fetchRutina -> sin rutinaActivaId");
        setRutina(null);
        return;
      }

      const key = `${id}|${routineRev}|${workoutRev}`;
      console.log("[Home] fetchRutina -> start", {
        force,
        id,
        routineRev,
        workoutRev,
        key,
        lastKey: lastKeyRef.current,
      });

      if (!force && lastKeyRef.current === key) {
        console.log("[Home] fetchRutina -> skip por misma key", { key });
        return;
      }

      lastKeyRef.current = key;

      const cached = rutinaCache.get(id);
      if (cached && !force) {
        console.log("[Home] fetchRutina -> usando cache", {
          id,
          cachedDias: cached?.dias?.length ?? 0,
          cachedFechasCompletadas: cached?.fechasCompletadas ?? [],
          cachedCompletadosPorFecha: cached?.completadosPorFecha ?? {},
          cachedCompletadosPorAsignacion: cached?.completadosPorAsignacion ?? {},
          cachedCompletadosPlanificadosPorFecha:
            cached?.completadosPlanificadosPorFecha ?? {},
          cachedCompletadosPlanificadosPorAsignacion:
            cached?.completadosPlanificadosPorAsignacion ?? {},
        });
        setRutina(cached);
      } else {
        console.log("[Home] fetchRutina -> sin cache útil", { id, force });
      }

      try {
        if (!force) setLoading(true);

        const p = obtenerRutina(id)
          .then((data) => {
            const rutinaResp = (data ?? null) as RutinaResp | null;

            console.log(
              "[Home][fetchRutina] RAW API RESPONSE:",
              JSON.stringify(
                {
                  id: rutinaResp?.id,
                  diasCount: rutinaResp?.dias?.length,
                  fechasCompletadas: rutinaResp?.fechasCompletadas,
                  completadosPorFecha: rutinaResp?.completadosPorFecha,
                  completadosPorAsignacion: rutinaResp?.completadosPorAsignacion,
                  completadosPlanificadosPorFecha:
                    rutinaResp?.completadosPlanificadosPorFecha,
                  completadosPlanificadosPorAsignacion:
                    rutinaResp?.completadosPlanificadosPorAsignacion,
                  dias: rutinaResp?.dias?.map((d) => ({
                    diaSemana: d.diaSemana,
                    ejercicios: d.ejercicios?.map((e) => ({
                      id: e.id,
                      fechasCompletadasAsignacion: e.fechasCompletadasAsignacion,
                      fechasPlanificadasCompletadasAsignacion:
                        e.fechasPlanificadasCompletadasAsignacion,
                      ultimaFechaCompletado: e.ultimaFechaCompletado,
                      ultimaFechaPlanificadaCompletada:
                        e.ultimaFechaPlanificadaCompletada,
                    })),
                  })),
                },
                null,
                2
              )
            );

            setRutina(rutinaResp);
            if (rutinaResp) rutinaCache.set(id, rutinaResp);
          })
          .catch((err) => console.error("[Home] obtenerRutina error", err))
          .finally(() => {
            inflightRef.current = null;
            if (!force) setLoading(false);
            console.log("[Home] fetchRutina -> end", { force, id });
          });

        inflightRef.current = p;
        await p;
      } catch (e) {
        console.log("[Home] fetchRutina error", e);
      }
    },
    [usuario?.rutinaActivaId, routineRev, workoutRev, rutinaCache]
  );

  useEffect(() => {
    fetchRutina(false);
  }, [fetchRutina]);

  const onRefresh = useCallback(async () => {
    console.log("[Home] onRefresh -> start");
    setRefreshing(true);
    try {
      await fetchRutina(true);
    } finally {
      setRefreshing(false);
      console.log("[Home] onRefresh -> end");
    }
  }, [fetchRutina]);

  const devolver = useCallback((ymd: string, diaEnum: string) => {
    const newYMD =
      typeof ymd === "string" && isYMD(ymd) ? ymd : toMadridYMD(new Date());
    const newDia = normalizeEnum(diaEnum);

    console.log("[Home][devolver] CALENDAR SELECTION:", {
      ymdRecibido: ymd,
      ymdNormalizado: newYMD,
      diaEnumRecibido: diaEnum,
      diaEnumNormalizado: newDia,
    });

    setDia(newDia);
    setSelectedYMD(newYMD);
  }, []);

  const totalEjercicios = useMemo(() => {
    const total =
      rutina?.dias?.find((i) => i.diaSemana === dia)?.ejercicios?.length || 0;

    console.log("[Home] totalEjercicios", {
      dia,
      total,
    });

    return total;
  }, [rutina, dia]);

  const completadasMap = useMemo(() => {
    const map: Record<string, boolean> = {};

    for (const ymd of rutina?.fechasCompletadas ?? []) map[ymd] = true;
    for (const [ymd, ids] of Object.entries(rutina?.completadosPorFecha ?? {})) {
      if (Array.isArray(ids) && ids.length > 0) map[ymd] = true;
    }

    console.log("[Home][completadasMap] CALENDAR MARKS (fecha real entrenada):", {
      fechasCompletadasRaw: rutina?.fechasCompletadas,
      completadosPorFechaRaw: rutina?.completadosPorFecha,
      completadosPlanificadosPorFechaRaw: rutina?.completadosPlanificadosPorFecha,
      mapResultante: map,
    });

    return map;
  }, [
    rutina?.fechasCompletadas,
    rutina?.completadosPorFecha,
    rutina?.completadosPlanificadosPorFecha,
  ]);

  const rutinaHidratada = useMemo(() => {
    if (!rutina?.dias) {
      console.log("[Home] rutinaHidratada -> sin dias", {
        dia,
        selectedYMD,
      });
      return rutina;
    }

    const diasH = rutina.dias.map((d) => {
      const ejerciciosH = (d.ejercicios ?? []).map((e) => {
        const fechasReales = e.fechasCompletadasAsignacion ?? [];
        const fechasPlanificadas =
          e.fechasPlanificadasCompletadasAsignacion ?? [];

        // Para la UI del día seleccionado usamos SIEMPRE la dimensión planificada
        // si existe. Si aún no existe en backend, cae al comportamiento anterior.
        const fechasParaUI =
          fechasPlanificadas.length > 0 ? fechasPlanificadas : fechasReales;

        const completadoHoy = fechasParaUI.includes(selectedYMD);

        console.log(
          `[Home][rutinaHidratada] EJERCICIO id=${e.id} dia=${d.diaSemana}:`,
          {
            selectedYMD,
            fechasCompletadasAsignacionReal: fechasReales,
            fechasPlanificadasCompletadasAsignacion: fechasPlanificadas,
            fechasUsadasPorUI: fechasParaUI,
            completadoHoy,
            source:
              fechasPlanificadas.length > 0 ? "planificadas" : "reales(fallback)",
          }
        );

        return {
          ...e,
          completadoHoy,

          // importante:
          // dejamos la info real aparte para depurar y conservarla
          fechasCompletadasAsignacionReal: fechasReales,
          fechasCompletadasAsignacionUI: fechasParaUI,

          // y sobrescribimos esta propiedad en la rutina hidratada para que los
          // componentes que ya la consumen (TarjetaHome) funcionen sin tocarlos aún
          fechasCompletadasAsignacion: fechasParaUI,
        };
      });

      const diaCompleto =
        ejerciciosH.length > 0 && ejerciciosH.every((e) => !!e.completadoHoy);

      console.log(`[Home][rutinaHidratada] DIA=${d.diaSemana}:`, {
        totalEjercicios: ejerciciosH.length,
        completados: ejerciciosH.filter((e) => e.completadoHoy).length,
        diaCompleto,
        selectedYMD,
      });

      return { ...d, ejercicios: ejerciciosH, completadoHoy: diaCompleto };
    });

    console.log("[Home] rutinaHidratada resumen", {
      diaSeleccionado: dia,
      selectedYMD,
      dias: diasH.map((d) => ({
        diaSemana: d.diaSemana,
        completadoHoy: d.completadoHoy,
        ejercicios: d.ejercicios.map((e) => ({
          id: e.id,
          completadoHoy: e.completadoHoy,
          fechasCompletadasAsignacion: e.fechasCompletadasAsignacion,
          fechasCompletadasAsignacionReal: e.fechasCompletadasAsignacionReal,
          fechasPlanificadasCompletadasAsignacion:
            e.fechasPlanificadasCompletadasAsignacion,
        })),
      })),
    });

    return { ...rutina, dias: diasH };
  }, [rutina, selectedYMD, dia]);

  const progresoHoy = useMemo(() => {
    const ejercicios =
      rutinaHidratada?.dias?.find((d) => d.diaSemana === dia)?.ejercicios ?? [];

    const total = ejercicios.length;
    const completados = ejercicios.filter((e) => e.completadoHoy).length;

    console.log("[Home][progresoHoy] PROGRESO:", {
      diaActivo: dia,
      selectedYMD,
      total,
      completados,
      helperMessage:
        total === 0
          ? "Día de descanso"
          : completados === 0
            ? `${total} ejercicios para hoy`
            : completados < total
              ? `Te quedan ${total - completados} ejercicios`
              : "Entrenamiento completado",
      ejercicios: ejercicios.map((e) => ({
        id: e.id,
        completadoHoy: e.completadoHoy,
        fechasCompletadasAsignacion: e.fechasCompletadasAsignacion,
      })),
    });

    return { total, completados };
  }, [rutinaHidratada, dia, selectedYMD]);

  const helperMessage = useMemo(() => {
    const { total, completados } = progresoHoy;

    if (total === 0) return "Día de descanso";
    if (completados === 0) return `${total} ejercicios para hoy`;
    if (completados < total) return `Te quedan ${total - completados} ejercicios`;
    return "Entrenamiento completado";
  }, [progresoHoy]);

  useEffect(() => {
    console.log("[Home] render-state", {
      usuarioId: usuario?.id,
      rutinaActivaId: usuario?.rutinaActivaId,
      dia,
      selectedYMD,
      routineRev,
      workoutRev,
      loading,
      refreshing,
      autoGenerating,
      totalEjercicios,
      hasRutina: !!rutina,
    });
  }, [
    usuario?.id,
    usuario?.rutinaActivaId,
    dia,
    selectedYMD,
    routineRev,
    workoutRev,
    loading,
    refreshing,
    autoGenerating,
    totalEjercicios,
    rutina,
  ]);

  if (loading && !rutina) return <HomeSkeleton />;

  const bg = isDark ? tokens.color.bgDark : tokens.color.bgLight;
  const hasRutinaActiva = !!usuario?.rutinaActivaId;

  return (
    <>
      {autoGenerating && (
        <IaGenerateAuto
          onDone={() => {
            console.log("[Home] IaGenerateAuto onDone");
            setAutoGenerating(false);
            if (!onboardingCompletado) marcarPendiente();
          }}
          onError={() => {
            console.log("[Home] IaGenerateAuto onError");
            setAutoGenerating(false);
          }}
        />
      )}

      <OnboardingModal
        visible={hydrated && pendienteMostrar && !onboardingCompletado}
        onClose={() => {
          console.log("[Home] OnboardingModal onClose");
          limpiarPendiente();
        }}
      />

      <SeguimientoInteligenteModal
        visible={seguimiento.modalVisible}
        lockedByPlan={usuario?.planActual === "GRATUITO"}
        applying={seguimiento.applying}
        data={seguimiento.modalData}
        onClose={() => {
          console.log("[Home] SeguimientoInteligenteModal onClose");
          seguimiento.cerrar();
        }}
        onConfirm={() => {
          console.log("[Home] SeguimientoInteligenteModal onConfirm");
          seguimiento.confirmar();
        }}
        onGoPremium={() => {
          console.log("[Home] SeguimientoInteligenteModal onGoPremium");
          seguimiento.cerrar();
          navigation.navigate("Premium");
        }}
      />

      <ScrollView
        style={[styles.scroll, { backgroundColor: bg }]}
        contentContainerStyle={[
          styles.content,
          { backgroundColor: bg },
          !hasRutinaActiva && styles.contentEmpty,
        ]}
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
        <View style={styles.header}>
          <Text
            style={[
              styles.eyebrow,
              {
                color: isDark
                  ? tokens.color.textSecondaryDark
                  : tokens.color.textSecondaryLight,
              },
            ]}
          >
            HOY
          </Text>

          <Text
            style={[
              styles.title,
              {
                color: isDark
                  ? tokens.color.textPrimaryDark
                  : tokens.color.textPrimaryLight,
              },
            ]}
          >
            Tu entrenamiento
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                color: isDark
                  ? tokens.color.textSecondaryDark
                  : tokens.color.textSecondaryLight,
              },
            ]}
          >
            {hasRutinaActiva
              ? "Sigue tu planificación diaria y completa tus ejercicios."
              : "Empieza creando o generando una rutina personalizada."}
          </Text>
        </View>

        {hasRutinaActiva ? (
          <>
            <View style={styles.calendarWrapper}>
              <Calendar devolverDato={devolver} completadas={completadasMap} />
            </View>

            <Text
              style={[
                styles.helperText,
                {
                  color: isDark
                    ? tokens.color.textSecondaryDark
                    : tokens.color.textSecondaryLight,
                },
              ]}
            >
              {helperMessage}
            </Text>

            <View style={styles.cardWrapper}>
              <TarjetaHome
                rutina={rutinaHidratada as any}
                dia={dia}
                selectedYMD={selectedYMD}
              />
            </View>
          </>
        ) : (
          !autoGenerating && (
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
          )
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

  header: {
    width: "100%",
    gap: 6,
  },

  eyebrow: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "500",
    maxWidth: "92%",
  },

  helperText: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: -4,
  },

  contentEmpty: {
    justifyContent: "center",
  },

  extraWrapper: {
    width: "100%",
    alignItems: "center",
    marginTop: -4,
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