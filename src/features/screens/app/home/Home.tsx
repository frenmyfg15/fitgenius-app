import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { View, ScrollView, RefreshControl, StyleSheet, Platform, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";
import { useNavigation } from "@react-navigation/native";

import { useUsuarioStore } from "@/features/store/useUsuarioStore";
import { useSyncStore } from "@/features/store/useSyncStore";
import { obtenerRutina } from "@/features/api/rutinas.api";
import { useRutinaCache } from "@/features/store/useRutinaCache";

import Calendar from "@/shared/components/home/Calendar";
import TarjetaHome from "@/shared/components/home/TarjetaHome";
import MensajeVacio from "@/shared/components/ui/MensajeVacio";
import IaGenerate from "@/shared/components/ui/IaGenerate";
import IaGenerateAuto from "@/shared/components/ui/IaGenerateAuto";
import OnboardingModal from "@/shared/components/ui/OnboardingModal";
import HomeSkeleton from "@/shared/components/skeleton/HomeSkeleton";
import { useSeguimientoInteligente } from "@/shared/hooks/useSeguimientoInteligente";
import { useSyncAnalisis } from "@/shared/hooks/useSyncAnalisis";
// Notificaciones push desactivadas por ahora, ver uso más abajo.
// import { usePushNotifications } from "@/shared/hooks/usePushNotifications";
import SeguimientoInteligenteModal from "@/shared/components/home/SeguimientoInteligenteModal";
import AnalisisDiarioModal from "@/shared/components/home/AnalisisDiarioModal";
import AnalisisSemanalModal from "@/shared/components/home/AnalisisSemanalModal";
import { useOverlayPresenter } from "@/shared/overlay/useOverlayPresenter";
import { Colors, scheme } from "@/shared/constants/colors";
import { Font, TextStyle } from "@/shared/constants/typography";

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
  fechasPlanificadasCompletadasAsignacion?: string[];
  ultimaFechaPlanificadaCompletada?: string | null;
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
  completadosPlanificadosPorFecha?: Record<string, number[]>;
  completadosPlanificadosPorAsignacion?: Record<string, string[]>;
};

// ── Utils ────────────────────────────────────────────────────────────────────

const getDiaActualEnum = (): DiaNombre => {
  const dias: DiaNombre[] = [
    "DOMINGO", "LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO",
  ];
  return dias[new Date().getDay()] as DiaNombre;
};

const normalizeEnum = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase() as DiaNombre;

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

const TAB_BAR_SAFE = Platform.OS === "ios" ? 140 : 130;

// ── Screen ───────────────────────────────────────────────────────────────────

export default function Home() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const t = scheme(isDark);
  const navigation = useNavigation<any>();

  const { usuario } = useUsuarioStore();
  const routineRev = useSyncStore((s) => s.routineRev);
  const workoutRev = useSyncStore((s) => s.workoutRev);
  const analisisDiarioPendiente = useSyncStore((s) => s.analisisDiarioPendiente);
  const setAnalisisDiarioPendiente = useSyncStore((s) => s.setAnalisisDiarioPendiente);
  const analisisSemanalPendiente = useSyncStore((s) => s.analisisSemanalPendiente);
  const setAnalisisSemanalPendiente = useSyncStore((s) => s.setAnalisisSemanalPendiente);
  const rutinaCache = useRutinaCache();

  const diarioOverlay = useOverlayPresenter();
  const semanalOverlay = useOverlayPresenter();

  // ── Auto-generación ───────────────────────────────────────────────────
  const [autoGenerating, setAutoGenerating] = useState(false);
  const autoGenTriggered = useRef(false);

  const shouldAutoGenerate =
    !!usuario &&
    !autoGenTriggered.current &&
    (usuario.rutinasIACreadas ?? 0) === 0;

  useEffect(() => {
    if (!shouldAutoGenerate) return;
    autoGenTriggered.current = true;
    setAutoGenerating(true);
  }, [shouldAutoGenerate]);

  // ── Seguimiento inteligente ───────────────────────────────────────────
  useSyncAnalisis(usuario?.id);
  // Notificaciones push desactivadas por ahora — no pedir permiso todavía.
  // usePushNotifications(usuario?.id);
  const seguimiento = useSeguimientoInteligente();

  useEffect(() => {
    if (
      !usuario?.id ||
      autoGenerating ||
      shouldAutoGenerate ||
      usuario?.haVistoOnboarding === false
    ) return;
    seguimiento.iniciar();
  }, [usuario?.id, autoGenerating, shouldAutoGenerate, usuario?.haVistoOnboarding]);

  // ── Análisis diario ───────────────────────────────────────────────────
  useEffect(() => {
    if (!analisisDiarioPendiente) return;
    setAnalisisDiarioPendiente(false);
    diarioOverlay.present(
      <AnalisisDiarioModal
        visible
        onClose={() => diarioOverlay.dismiss()}
        onGoPremium={() => navigation.navigate("Perfil", { screen: "PremiumPayment" })}
      />
    );
  }, [analisisDiarioPendiente]);

  // ── Análisis semanal ──────────────────────────────────────────────────
  useEffect(() => {
    if (!analisisSemanalPendiente) return;
    setAnalisisSemanalPendiente(false);
    const timer = setTimeout(() => {
      semanalOverlay.present(
        <AnalisisSemanalModal
          visible
          onClose={() => semanalOverlay.dismiss()}
          onGoPremium={() => navigation.navigate("Perfil", { screen: "PremiumPayment" })}
        />
      );
    }, 600);
    return () => clearTimeout(timer);
  }, [analisisSemanalPendiente]);

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
        console.log("[Home] fetchRutina error", e);
      }
    },
    [usuario?.rutinaActivaId, routineRev, workoutRev, rutinaCache]
  );

  useEffect(() => { fetchRutina(false); }, [fetchRutina]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await fetchRutina(true); }
    finally { setRefreshing(false); }
  }, [fetchRutina]);

  const devolver = useCallback((ymd: string, diaEnum: string) => {
    setDia(normalizeEnum(diaEnum));
    setSelectedYMD(typeof ymd === "string" && isYMD(ymd) ? ymd : toMadridYMD(new Date()));
  }, []);

  const completadasMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const ymd of rutina?.fechasCompletadas ?? []) map[ymd] = true;
    for (const [ymd, ids] of Object.entries(rutina?.completadosPorFecha ?? {})) {
      if (Array.isArray(ids) && ids.length > 0) map[ymd] = true;
    }
    return map;
  }, [rutina?.fechasCompletadas, rutina?.completadosPorFecha, rutina?.completadosPlanificadosPorFecha]);

  const rutinaHidratada = useMemo(() => {
    if (!rutina?.dias) return rutina;
    const diasH = rutina.dias.map((d) => {
      const ejerciciosH = (d.ejercicios ?? []).map((e) => {
        const fechasReales = e.fechasCompletadasAsignacion ?? [];
        const fechasPlanificadas = e.fechasPlanificadasCompletadasAsignacion ?? [];
        const fechasParaUI = fechasPlanificadas.length > 0 ? fechasPlanificadas : fechasReales;
        return {
          ...e,
          completadoHoy: fechasParaUI.includes(selectedYMD),
          fechasCompletadasAsignacionReal: fechasReales,
          fechasCompletadasAsignacionUI: fechasParaUI,
          fechasCompletadasAsignacion: fechasParaUI,
        };
      });
      return {
        ...d,
        ejercicios: ejerciciosH,
        completadoHoy: ejerciciosH.length > 0 && ejerciciosH.every((e) => !!e.completadoHoy),
      };
    });
    return { ...rutina, dias: diasH };
  }, [rutina, selectedYMD]);

  const progresoHoy = useMemo(() => {
    const ejercicios =
      rutinaHidratada?.dias?.find((d) => d.diaSemana === dia)?.ejercicios ?? [];
    return {
      total: ejercicios.length,
      completados: ejercicios.filter((e) => e.completadoHoy).length,
    };
  }, [rutinaHidratada, dia, selectedYMD]);

  const helperMessage = useMemo(() => {
    const { total, completados } = progresoHoy;
    if (total === 0) return "Día de descanso";
    if (completados === 0) return `${total} ejercicios para hoy`;
    if (completados < total) return `Te quedan ${total - completados} ejercicios`;
    return "Entrenamiento completado";
  }, [progresoHoy]);

  if (loading && !rutina) return <HomeSkeleton />;

  const bg = isDark ? Colors.primary : Colors.light.surface;
  const hasRutinaActiva = !!usuario?.rutinaActivaId;

  return (
    <>
      {autoGenerating && (
        <IaGenerateAuto
          onDone={() => setAutoGenerating(false)}
          onError={() => setAutoGenerating(false)}
        />
      )}

      <OnboardingModal
        visible={!!usuario && usuario.haVistoOnboarding === false}
        onClose={() => {}}
      />

      <SeguimientoInteligenteModal
        visible={seguimiento.modalVisible}
        lockedByPlan={usuario?.planActual === "GRATUITO"}
        applying={seguimiento.applying}
        data={seguimiento.modalData}
        onClose={() => seguimiento.cerrar()}
        onConfirm={() => seguimiento.confirmar()}
        onGoPremium={() => {
          seguimiento.cerrar();
          navigation.navigate("Premium");
        }}
      />

      <SafeAreaView edges={["top"]} style={[styles.scroll, { backgroundColor: bg }]}>
        <ScrollView
          style={{ flex: 1 }}
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
            tintColor={t.textPrimary}
            colors={[Colors.accent]}
            progressBackgroundColor={bg}
          />
        }
      >
        <View style={styles.header}>
          <Text style={[styles.eyebrow, { color: t.textSecondary }]}>HOY</Text>
          <Text style={[styles.title, { color: t.textPrimary }]}>Tu entrenamiento</Text>
          <Text style={[styles.subtitle, { color: t.textSecondary }]}>
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
            <View style={styles.cardWrapper}>
              <TarjetaHome rutina={rutinaHidratada as any} dia={dia} selectedYMD={selectedYMD} />
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
      </SafeAreaView>
    </>
  );
}

// ── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scroll: { flex: 1 },

  content: {
    padding: 16,
    paddingBottom: TAB_BAR_SAFE,
    gap: 20,
    minHeight: "100%",
  },

  header: {
    width: "100%",
    gap: 6,
  },

  eyebrow: {
    ...TextStyle.caption,
    fontFamily: Font.body.bold,
    letterSpacing: 1.2,
  },

  title: {
    ...TextStyle.h1,
    fontFamily: Font.title.bold,
  },

  subtitle: {
    ...TextStyle.body,
    fontFamily: Font.body.medium,
    maxWidth: "92%",
  },

  helperText: {
    ...TextStyle.label,
    fontFamily: Font.body.semiBold,
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
    gap: 24,
  },

  iaWrapper: {
    alignItems: "center",
  },
});
