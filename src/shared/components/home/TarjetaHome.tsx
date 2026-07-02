// File: src/shared/components/home/TarjetaHome.tsx
import React, { useMemo, memo, useEffect, useRef, useCallback, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import { useNavigation } from "@react-navigation/native";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import {
  RefreshCcw,
  ChevronRight,
  X,
  Dumbbell,
  CheckCircle2,
} from "lucide-react-native";
import LottieView from "lottie-react-native";

import MensajeVacio from "../ui/MensajeVacio";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";
import ReplaceEjercicioAsignadoFlow from "@/shared/components/rutina/ReplaceEjercicioAsignadoFlow";
import { kgToLb } from "@/shared/utils/kgToLb";

/* ── Assets ─────────────────────────────────────────────────────────────────── */
const confettiAnim = require("../../../../assets/lootie/feliticitaciones.json");

// ── Tokens ───────────────────────────────────────────────────────────────────
const tokens = {
  color: {
    gradientStart: "#39FF14",
    gradientMid: "#39FF14",
    gradientEnd: "#39FF14",

    cardBgDark: "#0F1829",
    cardBgLight: "#FFFFFF",
    cardBorderDark: "rgba(255,255,255,0.07)",
    cardBorderLight: "rgba(0,0,0,0.08)",

    cardHighlightBorder: "#39FF14",
    cardHighlightBorderSoft: "rgba(57,255,20,0.28)",

    thumbBgDark: "rgba(255,255,255,0.06)",
    thumbBgLight: "#F8FAFC",
    thumbBorderDark: "rgba(255,255,255,0.10)",
    thumbBorderLight: "rgba(0,0,0,0.07)",

    tagBgDark: "rgba(255,255,255,0.05)",
    tagBgLight: "#F1F5F9",
    tagBorderDark: "rgba(255,255,255,0.10)",
    tagBorderLight: "rgba(0,0,0,0.07)",
    tagTextDark: "#64748B",
    tagTextLight: "#64748B",

    nameDark: "#F1F5F9",
    nameLight: "#0F172A",
    detailsDark: "#64748B",
    detailsLight: "#64748B",

    checkBgDark: "rgba(57,255,20,0.12)",
    checkBgLight: "rgba(57,255,20,0.10)",
    checkBorderDark: "rgba(57,255,20,0.30)",
    checkBorderLight: "rgba(57,255,20,0.25)",
    checkColor: "#39FF14",

    replaceBg: "rgba(57,255,20,0.10)",
    replaceBgPressed: "rgba(57,255,20,0.22)",
    replaceBgLoading: "rgba(57,255,20,0.06)",
    replaceBorder: "rgba(57,255,20,0.30)",
    replaceText: "#39FF14",

    ctaPrimaryBg: "#39FF14",
    ctaPrimaryBgPressed: "#2DB800",
    ctaPrimaryText: "#FFFFFF",

    progressTrackDark: "rgba(255,255,255,0.07)",
    progressTrackLight: "rgba(0,0,0,0.07)",

    heroBgDark: "#0A1020",
    heroBgLight: "#F0F4F8",

    sheetBgDark: "#0F1829",
    sheetBgLight: "#FFFFFF",
    sheetHandleDark: "rgba(255,255,255,0.15)",
    sheetHandleLight: "rgba(0,0,0,0.15)",
    backdropColor: "rgba(0,0,0,0.6)",
  },
  radius: { xl: 24, lg: 16, md: 10, sm: 6, full: 999 },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 },
} as const;

const GRADIENT = [
  tokens.color.gradientStart,
  tokens.color.gradientMid,
  tokens.color.gradientEnd,
] as const;

// ── Tipos ────────────────────────────────────────────────────────────────────
type GrupoMuscular =
  | "BRAZOS"
  | "CARDIO"
  | "CORE"
  | "ESPALDA"
  | "GLUTEO"
  | "HOMBROS"
  | "PECHOS"
  | "PIERNAS";

type MedidaPeso = "kg" | "lb" | string;

interface EjercicioSimple {
  id?: string | number;
  idGif?: string | number;
  nombre: string;
  grupoMuscular: GrupoMuscular;
}

interface EjercicioCompuesto {
  id: number;
  nombre: string;
  tipoCompuesto: string;
  ejerciciosComponentes?: any[];
}

interface EjercicioDia {
  id?: string | number;
  orden?: number;
  completadoHoy?: boolean;
  fechasCompletadasAsignacion?: string[];
  ultimaFechaCompletado?: string | null;
  fechasPlanificadasCompletadasAsignacion?: string[];
  ultimaFechaPlanificadaCompletada?: string | null;
  fechasCompletadasAsignacionReal?: string[];
  fechasCompletadasAsignacionUI?: string[];
  ejercicio?: EjercicioSimple;
  ejercicioCompuesto?: EjercicioCompuesto | null;
  seriesSugeridas?: number;
  repeticionesSugeridas?: number | string;
  pesoSugerido?: number | string;
  descansoSeg?: number;
}

interface DiaRutina {
  id?: number;
  diaSemana: string;
  ejercicios: EjercicioDia[];
}

interface Rutina {
  id?: number;
  dias?: DiaRutina[];
}

type Props = { rutina?: Rutina | null; dia?: string; selectedYMD?: string };

// ── Assets locales ────────────────────────────────────────────────────────────
const brazos = require("../../../../assets/fit/rutina/brazos.webp");
const cardio = require("../../../../assets/fit/rutina/cardio.webp");
const core = require("../../../../assets/fit/rutina/core.webp");
const espalda = require("../../../../assets/fit/rutina/espalda.webp");
const gluteo = require("../../../../assets/fit/rutina/gluteo.webp");
const hombros = require("../../../../assets/fit/rutina/hombros.webp");
const pechos = require("../../../../assets/fit/rutina/pechos.webp");
const piernas = require("../../../../assets/fit/rutina/piernas.webp");
const circuito = require("../../../../assets/fit/rutina/circuito.webp");

const IMAGENES_GRUPO: Record<GrupoMuscular, any> = {
  BRAZOS: brazos,
  CARDIO: cardio,
  CORE: core,
  ESPALDA: espalda,
  GLUTEO: gluteo,
  HOMBROS: hombros,
  PECHOS: pechos,
  PIERNAS: piernas,
};

const isGrupoMuscular = (v: string): v is keyof typeof IMAGENES_GRUPO =>
  v in IMAGENES_GRUPO;

const imagenPorGrupo = (grupo?: string) => {
  if (!grupo) return undefined;
  const key = grupo.toUpperCase();
  return isGrupoMuscular(key) ? IMAGENES_GRUPO[key] : undefined;
};

const gifUriPorEjercicio = (idGif?: string | number) => {
  if (idGif == null || idGif === "") return undefined;
  return `https://res.cloudinary.com/dcn4vq1n4/image/upload/v1752248579/ejercicios/${idGif}.gif`;
};

// ── Utils ────────────────────────────────────────────────────────────────────
const formatPesoDisplay = (
  pesoKg: number | string | undefined,
  medidaPeso: MedidaPeso = "kg"
) => {
  const pesoNum = Number(pesoKg);
  if (!Number.isFinite(pesoNum)) return `— ${medidaPeso}`;
  if (String(medidaPeso).toLowerCase() === "lb") return kgToLb(pesoNum);
  return `${pesoNum} kg`;
};

const formateaDetalles = (i: EjercicioDia, medidaPeso: MedidaPeso = "kg") => {
  if (i.ejercicioCompuesto) {
    const count = i.ejercicioCompuesto.ejerciciosComponentes?.length ?? 0;
    return `${count} ejercicios`;
  }
  const sets = i.seriesSugeridas ?? "—";
  const reps = i.repeticionesSugeridas ?? "—";
  const peso =
    i.pesoSugerido != null
      ? formatPesoDisplay(i.pesoSugerido, medidaPeso)
      : `— ${medidaPeso}`;
  return `${sets} series · ${reps} reps · ${peso}`;
};

const getFechasParaUI = (ej: EjercicioDia) => {
  if (Array.isArray(ej.fechasCompletadasAsignacionUI)) return ej.fechasCompletadasAsignacionUI;
  if (Array.isArray(ej.fechasPlanificadasCompletadasAsignacion)) return ej.fechasPlanificadasCompletadasAsignacion;
  return ej.fechasCompletadasAsignacion ?? [];
};

const isCompletedOnDate = (ej: EjercicioDia, selectedYMD?: string) => {
  const fechas = getFechasParaUI(ej);
  if (!selectedYMD) {
    const hoy = new Date().toISOString().slice(0, 10);
    return fechas.includes(hoy);
  }
  return fechas.includes(selectedYMD);
};

const routeForEjercicio = (e: EjercicioDia) => {
  const asignadoId = e.id != null ? String(e.id) : undefined;
  const nombre = e.ejercicioCompuesto?.nombre ?? e.ejercicio?.nombre ?? "ejercicio";
  if (e.ejercicioCompuesto?.id) {
    return {
      routeName: "VistaEjercicio",
      params: {
        id: String(e.ejercicioCompuesto.id),
        ...(asignadoId && { asignadoId }),
        nombre,
        ejercicio: e,
      },
    };
  }
  return {
    routeName: "VistaEjercicio",
    params: {
      slug: encodeURIComponent(nombre),
      ...(asignadoId && { asignadoId }),
      nombre,
      ejercicio: e,
    },
  };
};

const canReplaceEjercicio = (
  ejercicio: EjercicioDia | null | undefined,
  rutinaId?: number,
  diaRutinaId?: number
) => {
  const isCompuesto = Boolean(ejercicio?.ejercicioCompuesto);
  const asignadoId = ejercicio?.id != null ? Number(ejercicio.id) : undefined;

  return (
    !!ejercicio &&
    !isCompuesto &&
    Number.isFinite(Number(rutinaId)) &&
    Number.isFinite(Number(diaRutinaId)) &&
    Number.isFinite(Number(asignadoId))
  );
};

// ── ProgressBar ──────────────────────────────────────────────────────────────
const ProgressBar = memo(function ProgressBar({
  completados,
  total,
  isDark,
}: {
  completados: number;
  total: number;
  isDark: boolean;
}) {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const ratio = total > 0 ? completados / total : 0;

  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: ratio,
      useNativeDriver: false,
      tension: 60,
      friction: 10,
    }).start();
  }, [ratio, progressAnim]);

  const allDone = completados === total && total > 0;

  return (
    <View style={progressStyles.wrapper}>
      <View style={progressStyles.labelRow}>
        <View style={progressStyles.labelLeft}>
          {allDone ? (
            <CheckCircle2 size={14} color={tokens.color.checkColor} strokeWidth={2.5} />
          ) : (
            <Dumbbell size={14} color={isDark ? "#64748B" : "#94A3B8"} strokeWidth={2} />
          )}
          <Text
            style={[
              progressStyles.labelText,
              { color: allDone ? tokens.color.checkColor : isDark ? "#94A3B8" : "#64748B" },
            ]}
          >
            {allDone ? "¡Sesión completada!" : `${completados} de ${total} ejercicios`}
          </Text>
        </View>
        <Text
          style={[
            progressStyles.percentText,
            { color: allDone ? tokens.color.checkColor : isDark ? "#475569" : "#94A3B8" },
          ]}
        >
          {Math.round(ratio * 100)}%
        </Text>
      </View>

      <View
        style={[
          progressStyles.track,
          {
            backgroundColor: isDark
              ? tokens.color.progressTrackDark
              : tokens.color.progressTrackLight,
          },
        ]}
      >
        {allDone ? (
          <LinearGradient
            colors={GRADIENT as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={progressStyles.fillFull}
          />
        ) : (
          <Animated.View
            style={[
              progressStyles.fill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
              },
            ]}
          />
        )}
      </View>
    </View>
  );
});

const progressStyles = StyleSheet.create({
  wrapper: { gap: 6 },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  labelLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  labelText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
  percentText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  track: {
    height: 5,
    borderRadius: 999,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: tokens.color.ctaPrimaryBg,
    borderRadius: 999,
  },
  fillFull: {
    height: "100%",
    width: "100%",
    borderRadius: 999,
  },
});

// ── HeroEjercicio ─────────────────────────────────────────────────────────────
const HeroEjercicio = memo(function HeroEjercicio({
  ejercicio,
  medidaPeso,
  onPress,
  isDark,
}: {
  ejercicio: EjercicioDia;
  medidaPeso: MedidaPeso;
  onPress: () => void;
  isDark: boolean;
}) {
  const isCompuesto = Boolean(ejercicio.ejercicioCompuesto);
  const nombre = isCompuesto
    ? ejercicio.ejercicioCompuesto!.nombre
    : ejercicio.ejercicio?.nombre ?? "Ejercicio";

  const tagSuperior = isCompuesto
    ? ejercicio.ejercicioCompuesto!.tipoCompuesto
    : ejercicio.ejercicio?.grupoMuscular ?? "";

  const gifUri = !isCompuesto ? gifUriPorEjercicio(ejercicio.ejercicio?.idGif) : undefined;
  const img = gifUri
    ? { uri: gifUri }
    : isCompuesto
      ? circuito
      : imagenPorGrupo(ejercicio.ejercicio?.grupoMuscular);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(1800),
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 650,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [shimmerAnim]);

  const statPills = useMemo(() => {
    if (isCompuesto) {
      const count = ejercicio.ejercicioCompuesto?.ejerciciosComponentes?.length ?? 0;
      return [{ label: "Ejercicios", value: String(count) }];
    }
    const pills: { label: string; value: string }[] = [];
    if (ejercicio.seriesSugeridas != null) {
      pills.push({ label: "Series", value: String(ejercicio.seriesSugeridas) });
    }
    if (ejercicio.repeticionesSugeridas != null) {
      pills.push({ label: "Reps", value: String(ejercicio.repeticionesSugeridas) });
    }
    if (ejercicio.pesoSugerido != null) {
      pills.push({
        label: "Peso",
        value: formatPesoDisplay(ejercicio.pesoSugerido, medidaPeso),
      });
    }
    if (ejercicio.descansoSeg != null) {
      pills.push({ label: "Descanso", value: `${ejercicio.descansoSeg}s` });
    }
    return pills.slice(0, 3);
  }, [ejercicio, medidaPeso, isCompuesto]);

  const cardBg = isDark ? tokens.color.heroBgDark : tokens.color.heroBgLight;

  return (
    <TouchableOpacity
      activeOpacity={0.97}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Siguiente ejercicio: ${nombre}. Toca para empezar.`}
      style={[heroStyles.container, { backgroundColor: cardBg }]}
    >
      {/* ── Imagen full-width ── */}
      <View style={heroStyles.imageWrapper}>
        {img ? (
          <Image source={img} style={heroStyles.image} resizeMode="cover" />
        ) : (
          <View style={[heroStyles.imagePlaceholder, { backgroundColor: isDark ? "#0A1020" : "#E2E8F0" }]}>
            <Dumbbell size={48} color="rgba(100,116,139,0.25)" strokeWidth={1.5} />
          </View>
        )}

        {/* Gradient fade hacia el fondo de la card */}
        <LinearGradient
          colors={["transparent", cardBg]}
          locations={[0.4, 1]}
          style={heroStyles.imageGradient}
        />

        {/* Tag flotante sobre la imagen */}
        {tagSuperior ? (
          <View style={heroStyles.tagBadge}>
            <Text style={heroStyles.tagBadgeText}>{tagSuperior}</Text>
          </View>
        ) : null}
      </View>

      {/* ── Contenido ── */}
      <View style={heroStyles.content}>
        <Text
          numberOfLines={2}
          style={[heroStyles.name, { color: isDark ? tokens.color.nameDark : tokens.color.nameLight }]}
        >
          {nombre}
        </Text>

        {statPills.length > 0 && (
          <View style={heroStyles.statsRow}>
            {statPills.map((p, i) => (
              <React.Fragment key={p.label}>
                {i > 0 && (
                  <Text style={[heroStyles.statsDot, { color: isDark ? "#334155" : "#CBD5E1" }]}>·</Text>
                )}
                <Text style={[heroStyles.statItem, { color: isDark ? "#94A3B8" : "#64748B" }]}>
                  <Text style={[heroStyles.statValue, { color: isDark ? tokens.color.nameDark : tokens.color.nameLight }]}>
                    {p.value}
                  </Text>
                  {"  "}{p.label}
                </Text>
              </React.Fragment>
            ))}
          </View>
        )}
      </View>

      {/* ── Botón full-width ── */}
      <Animated.View style={[heroStyles.ctaOuter, { transform: [{ scale: pulseAnim }] }]}>
        <View style={heroStyles.ctaWrapper}>
          <View style={heroStyles.ctaButton}>
            <Text style={heroStyles.ctaText}>Empezar</Text>
            <ChevronRight size={18} color="#111111" strokeWidth={2.5} />
          </View>
          <Animated.View
            pointerEvents="none"
            style={[
              heroStyles.shimmer,
              {
                transform: [
                  {
                    translateX: shimmerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-360, 360],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={heroStyles.shimmerInner} />
          </Animated.View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
});

const heroStyles = StyleSheet.create({
  container: {
    borderRadius: tokens.radius.xl,
    overflow: "hidden",
    width: "100%",
  },
  imageWrapper: {
    width: "100%",
    height: 260,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  imageGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  tagBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: tokens.radius.sm,
  },
  tagBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  content: {
    paddingHorizontal: tokens.spacing.lg,
    paddingTop: tokens.spacing.sm,
    paddingBottom: tokens.spacing.md,
    gap: 8,
  },
  name: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
    lineHeight: 26,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  statsDot: {
    fontSize: 14,
    fontWeight: "700",
  },
  statItem: {
    fontSize: 13,
    fontWeight: "500",
  },
  statValue: {
    fontSize: 13,
    fontWeight: "700",
  },
  ctaOuter: {
    marginHorizontal: tokens.spacing.lg,
    marginBottom: tokens.spacing.lg,
    marginTop: tokens.spacing.xs,
    borderRadius: tokens.radius.full,
    shadowColor: "#39FF14",
    shadowOpacity: 0.6,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  ctaWrapper: {
    borderRadius: tokens.radius.full,
    overflow: "hidden",
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 15,
    backgroundColor: "#39FF14",
  },
  ctaText: {
    color: "#111111",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  shimmer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 44,
  },
  shimmerInner: {
    flex: 1,
    width: 44,
    backgroundColor: "rgba(255,255,255,0.38)",
    transform: [{ skewX: "-20deg" }],
  },
});

// ── Replace controls ─────────────────────────────────────────────────────────
const ReplaceSwipeAction = memo(function ReplaceSwipeAction({
  rutinaId,
  diaRutinaId,
  asignadoId,
  compact = false,
}: {
  rutinaId: number;
  diaRutinaId: number;
  asignadoId: number;
  compact?: boolean;
}) {
  return (
    <View style={compact ? compactStyles.replaceWrapper : heroReplaceStyles.wrapper}>
      <ReplaceEjercicioAsignadoFlow
        rutinaId={rutinaId}
        diaRutinaId={diaRutinaId}
        asignadoId={asignadoId}
      >
        {({ open, loading }) => (
          <Pressable
            onPress={open}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Cambiar ejercicio"
            style={({ pressed }) => [
              compact ? compactStyles.replaceButton : heroReplaceStyles.button,
              pressed && (compact ? compactStyles.replaceButtonPressed : heroReplaceStyles.buttonPressed),
              loading && (compact ? compactStyles.replaceButtonLoading : heroReplaceStyles.buttonLoading),
            ]}
          >
            <RefreshCcw
              size={compact ? 14 : 16}
              color={loading ? "rgba(57,255,20,0.4)" : tokens.color.replaceText}
              strokeWidth={2.5}
            />
            <Text
              style={[
                compact ? compactStyles.replaceButtonText : heroReplaceStyles.buttonText,
                loading && (compact ? compactStyles.replaceButtonTextLoading : heroReplaceStyles.buttonTextLoading),
              ]}
            >
              {loading ? "..." : "Cambiar"}
            </Text>
          </Pressable>
        )}
      </ReplaceEjercicioAsignadoFlow>
    </View>
  );
});


const heroReplaceStyles = StyleSheet.create({
  wrapper: {
    alignItems: "stretch",
    justifyContent: "center",
    paddingLeft: tokens.spacing.sm,
  },
  button: {
    width: 88,
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    backgroundColor: tokens.color.replaceBg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: tokens.color.replaceBorder,
    borderRadius: tokens.radius.xl,
  },
  buttonPressed: {
    backgroundColor: tokens.color.replaceBgPressed,
  },
  buttonLoading: {
    backgroundColor: tokens.color.replaceBgLoading,
  },
  buttonText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: tokens.color.replaceText,
  },
  buttonTextLoading: {
    color: "rgba(57,255,20,0.4)",
  },
});

// ── TarjetaEjercicioCompacta ──────────────────────────────────────────────────
const TarjetaEjercicioCompacta = memo(function TarjetaEjercicioCompacta({
  ejercicio,
  medidaPeso = "kg",
  selectedYMD,
  onPressNavegar,
  rutinaId,
  diaRutinaId,
  isDark,
}: {
  ejercicio: EjercicioDia;
  medidaPeso?: MedidaPeso;
  selectedYMD?: string;
  onPressNavegar?: (routeName: string, params?: Record<string, any>) => void;
  rutinaId?: number;
  diaRutinaId?: number;
  isDark: boolean;
}) {
  const isCompuesto = Boolean(ejercicio.ejercicioCompuesto);
  const nombre = isCompuesto
    ? ejercicio.ejercicioCompuesto!.nombre
    : ejercicio.ejercicio?.nombre ?? "Ejercicio";

  const tagSuperior = isCompuesto
    ? ejercicio.ejercicioCompuesto!.tipoCompuesto
    : ejercicio.ejercicio?.grupoMuscular ?? "";

  const completado = isCompletedOnDate(ejercicio, selectedYMD);
  const detalles = formateaDetalles(ejercicio, medidaPeso);
  const { routeName, params } = routeForEjercicio(ejercicio);

  const gifUri = !isCompuesto ? gifUriPorEjercicio(ejercicio.ejercicio?.idGif) : undefined;
  const img = gifUri
    ? { uri: gifUri }
    : isCompuesto
      ? circuito
      : imagenPorGrupo(ejercicio.ejercicio?.grupoMuscular);

  const asignadoId = ejercicio.id != null ? Number(ejercicio.id) : undefined;
  const canReplace =
    !completado &&
    !isCompuesto &&
    Number.isFinite(Number(rutinaId)) &&
    Number.isFinite(Number(diaRutinaId)) &&
    Number.isFinite(Number(asignadoId));

  const handleNavigate = () => onPressNavegar?.(routeName, params);

  const cardInner = (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={handleNavigate}
      style={[
        compactStyles.card,
        {
          backgroundColor: isDark ? tokens.color.cardBgDark : tokens.color.cardBgLight,
          borderColor: completado
            ? tokens.color.cardHighlightBorderSoft
            : isDark
              ? tokens.color.cardBorderDark
              : tokens.color.cardBorderLight,
        },
      ]}
    >
      <View style={compactStyles.row}>
        <View
          style={[
            compactStyles.thumb,
            {
              backgroundColor: isDark ? tokens.color.thumbBgDark : tokens.color.thumbBgLight,
              borderColor: isDark ? tokens.color.thumbBorderDark : tokens.color.thumbBorderLight,
            },
          ]}
        >
          {img ? (
            <Image source={img} style={compactStyles.thumbImage} resizeMode="contain" />
          ) : (
            <Text style={compactStyles.thumbFallback}>—</Text>
          )}
        </View>

        <View style={compactStyles.info}>
          <View
            style={[
              compactStyles.tag,
              {
                backgroundColor: isDark ? tokens.color.tagBgDark : tokens.color.tagBgLight,
                borderColor: isDark ? tokens.color.tagBorderDark : tokens.color.tagBorderLight,
              },
            ]}
          >
            <Text
              style={[
                compactStyles.tagText,
                { color: isDark ? tokens.color.tagTextDark : tokens.color.tagTextLight },
              ]}
            >
              {tagSuperior || "—"}
            </Text>
          </View>

          <Text
            numberOfLines={1}
            style={[
              compactStyles.name,
              { color: isDark ? tokens.color.nameDark : tokens.color.nameLight },
            ]}
          >
            {nombre}
          </Text>

          <Text
            numberOfLines={1}
            style={[
              compactStyles.details,
              { color: isDark ? tokens.color.detailsDark : tokens.color.detailsLight },
            ]}
          >
            {detalles}
          </Text>

        </View>

        {completado ? (
          <View
            style={[
              compactStyles.checkCircle,
              {
                backgroundColor: isDark ? tokens.color.checkBgDark : tokens.color.checkBgLight,
                borderColor: isDark ? tokens.color.checkBorderDark : tokens.color.checkBorderLight,
              },
            ]}
          >
            <Text style={compactStyles.checkMark}>✓</Text>
          </View>
        ) : (
          <ChevronRight size={16} color={isDark ? "#334155" : "#CBD5E1"} strokeWidth={2} />
        )}
      </View>
    </TouchableOpacity>
  );

  const inner = completado ? (
    <LinearGradient
      colors={GRADIENT as any}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={compactStyles.gradientBorder}
    >
      {cardInner}
    </LinearGradient>
  ) : (
    cardInner
  );

  if (canReplace) {
    return (
      <Swipeable
        renderRightActions={() => (
          <ReplaceSwipeAction
            rutinaId={Number(rutinaId)}
            diaRutinaId={Number(diaRutinaId)}
            asignadoId={Number(asignadoId)}
            compact
          />
        )}
        overshootRight={false}
        rightThreshold={32}
        friction={2}
      >
        {inner}
      </Swipeable>
    );
  }

  return inner;
});

const compactStyles = StyleSheet.create({
  gradientBorder: {
    borderRadius: tokens.radius.lg,
    padding: 1.5,
    overflow: "hidden",
  },
  card: {
    borderRadius: tokens.radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.md,
  },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    overflow: "hidden",
  },
  thumbImage: {
    width: 44,
    height: 44,
    borderRadius: tokens.radius.md,
  },
  thumbFallback: {
    fontSize: 12,
    color: "#94A3B8",
  },
  info: {
    flex: 1,
    minWidth: 0,
    gap: tokens.spacing.xs,
  },
  tag: {
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: tokens.radius.sm,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  name: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.05,
  },
  details: {
    fontSize: 11,
    lineHeight: 15,
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: tokens.radius.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  checkMark: {
    fontSize: 12,
    fontWeight: "700",
    color: tokens.color.checkColor,
  },
  replaceWrapper: {
    alignItems: "stretch",
    justifyContent: "center",
    paddingLeft: tokens.spacing.sm,
  },
  replaceButton: {
    width: 76,
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: tokens.color.replaceBg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: tokens.color.replaceBorder,
    borderRadius: tokens.radius.lg,
  },
  replaceButtonPressed: {
    backgroundColor: tokens.color.replaceBgPressed,
  },
  replaceButtonLoading: {
    backgroundColor: tokens.color.replaceBgLoading,
  },
  replaceButtonText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: tokens.color.replaceText,
  },
  replaceButtonTextLoading: {
    color: "rgba(57,255,20,0.4)",
  },
});

// ── TodosEjerciciosSheet ──────────────────────────────────────────────────────
const TodosEjerciciosSheet = memo(function TodosEjerciciosSheet({
  visible,
  onClose,
  ejercicios,
  medidaPeso,
  selectedYMD,
  rutinaId,
  diaRutinaId,
  isDark,
  onPressNavegar,
}: {
  visible: boolean;
  onClose: () => void;
  ejercicios: EjercicioDia[];
  medidaPeso: MedidaPeso;
  selectedYMD?: string;
  rutinaId?: number;
  diaRutinaId?: number;
  isDark: boolean;
  onPressNavegar: (routeName: string, params?: Record<string, any>) => void;
}) {
  const insets = useSafeAreaInsets();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const wasVisible = useRef(false);

  const snapPoints = useMemo(() => ["55%", "88%"], []);
  const topInset = Math.max(insets.top, 12);
  const bottomPadding = insets.bottom + 100;

  useEffect(() => {
    if (visible && !wasVisible.current) {
      bottomSheetModalRef.current?.present();
      wasVisible.current = true;
    }
    if (!visible && wasVisible.current) {
      bottomSheetModalRef.current?.dismiss();
      wasVisible.current = false;
    }
  }, [visible]);

  const handleClosePress = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
  }, []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.35}
        pressBehavior="close"
      />
    ),
    []
  );

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={1}
      snapPoints={snapPoints}
      onDismiss={() => {
        wasVisible.current = false;
        onClose();
      }}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      enableOverDrag={false}
      overDragResistanceFactor={0}
      topInset={topInset}
      handleIndicatorStyle={{
        backgroundColor: isDark ? "#64748b" : "#94a3b8",
      }}
      backgroundStyle={{
        backgroundColor: isDark ? tokens.color.sheetBgDark : tokens.color.sheetBgLight,
      }}
      style={{
        zIndex: 1000,
        ...(Platform.OS === "android" ? { elevation: 1000 } : null),
      }}
      containerStyle={{
        zIndex: 1000,
        ...(Platform.OS === "android" ? { elevation: 1000 } : null),
      }}
    >
      <View style={sheetStyles.header}>
        <Text
          style={[
            sheetStyles.headerTitle,
            { color: isDark ? tokens.color.nameDark : tokens.color.nameLight },
          ]}
        >
          Todos los ejercicios
        </Text>

        <TouchableOpacity
          onPress={handleClosePress}
          activeOpacity={0.85}
          style={[
            sheetStyles.closeBtn,
            {
              backgroundColor: isDark ? "rgba(255,255,255,0.10)" : "#e5e5e5",
            },
          ]}
        >
          <X size={18} color={isDark ? "#e5e7eb" : "#0f172a"} />
        </TouchableOpacity>
      </View>

      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: tokens.spacing.lg,
          paddingBottom: bottomPadding,
          gap: tokens.spacing.sm,
        }}
      >
        {ejercicios.map((item, index) => {
          const key = String(
            (item.id as any) ??
            item.ejercicioCompuesto?.id ??
            `${item.ejercicio?.nombre}-${item.orden ?? "x"}-${index}`
          );

          return (
            <TarjetaEjercicioCompacta
              key={key}
              ejercicio={item}
              medidaPeso={medidaPeso}
              selectedYMD={selectedYMD}
              onPressNavegar={onPressNavegar}
              rutinaId={rutinaId}
              diaRutinaId={diaRutinaId}
              isDark={isDark}
            />
          );
        })}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

const sheetStyles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: tokens.spacing.lg,
    paddingTop: 8,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  headerSub: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748B",
    marginTop: 1,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  progressWrapper: {
    paddingHorizontal: tokens.spacing.lg,
    paddingBottom: tokens.spacing.md,
  },
});

// ── AllDoneView ───────────────────────────────────────────────────────────────
const AllDoneView = memo(function AllDoneView({ isDark }: { isDark: boolean }) {
  const [confettiDone, setConfettiDone] = useState(false);

  useEffect(() => {
    setConfettiDone(false);
  }, []);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        delay: 120,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 450,
        delay: 120,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 70,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, scaleAnim]);

  return (
    <View style={allDoneStyles.wrapper}>
      {!confettiDone && (
        <LottieView
          source={confettiAnim}
          autoPlay
          loop={false}
          onAnimationFinish={() => setConfettiDone(true)}
          style={allDoneStyles.confetti}
        />
      )}

      <Animated.View
        style={[
          allDoneStyles.cardOuter,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={
            isDark
              ? ["rgba(57,255,20,0.18)", "rgba(15,24,41,0.98)"]
              : ["rgba(57,255,20,0.10)", "rgba(255,255,255,0.98)"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            allDoneStyles.card,
            {
              borderColor: isDark
                ? "rgba(57,255,20,0.28)"
                : "rgba(57,255,20,0.20)",
              backgroundColor: isDark ? "#0F1829" : "#FFFFFF",
            },
          ]}
        >
          <View
            style={[
              allDoneStyles.iconWrap,
              {
                backgroundColor: isDark
                  ? "rgba(57,255,20,0.12)"
                  : "rgba(57,255,20,0.10)",
                borderColor: isDark
                  ? "rgba(57,255,20,0.28)"
                  : "rgba(57,255,20,0.22)",
              },
            ]}
          >
            <CheckCircle2
              size={30}
              color={tokens.color.checkColor}
              strokeWidth={2.6}
            />
          </View>

          <View style={allDoneStyles.textBlock}>
            <Text
              style={[
                allDoneStyles.title,
                { color: isDark ? tokens.color.nameDark : tokens.color.nameLight },
              ]}
            >
              Día completado
            </Text>

            <Text
              style={[
                allDoneStyles.subtitle,
                {
                  color: isDark
                    ? "rgba(241,245,249,0.72)"
                    : "rgba(15,23,42,0.68)",
                },
              ]}
            >
              Terminaste todos tus ejercicios de hoy. Gran trabajo, sigue así.
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>
    </View>
  );
});

const allDoneStyles = StyleSheet.create({
  wrapper: {
    width: "100%",
    overflow: "hidden",
    borderRadius: tokens.radius.xl,
  },
  confetti: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  cardOuter: {
    width: "100%",
  },
  card: {
    width: "100%",
    minHeight: 132,
    borderRadius: tokens.radius.xl,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,

    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  iconWrap: {
    width: 62,
    height: 62,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.5,
    lineHeight: 26,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 19,
  },
});

// ── TarjetaHome ──────────────────────────────────────────────────────────────
export default function TarjetaHome({ rutina, dia, selectedYMD }: Props) {
  const navigation = useNavigation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const rutinaActivaId = useUsuarioStore((s) => s.usuario?.rutinaActivaId);
  const medidaPeso = useUsuarioStore((s) => s.usuario?.medidaPeso ?? "kg");
  const hasRutinaActiva = Boolean(rutinaActivaId);

  const [sheetVisible, setSheetVisible] = useState(false);

  const rutinaDia = useMemo(() => {
    if (!rutina?.dias || !dia) return undefined;
    return rutina.dias.find((d) => d.diaSemana === dia);
  }, [rutina, dia]);

  const ejercicios = useMemo<EjercicioDia[]>(
    () => rutinaDia?.ejercicios ?? [],
    [rutinaDia]
  );

  const { completados, pendientes, primerPendiente } = useMemo(() => {
    const completados = ejercicios.filter((e) => isCompletedOnDate(e, selectedYMD));
    const pendientes = ejercicios.filter((e) => !isCompletedOnDate(e, selectedYMD));
    return {
      completados,
      pendientes,
      primerPendiente: pendientes[0] ?? null,
    };
  }, [ejercicios, selectedYMD]);

  const rutinaId = (rutina as any)?.id as number | undefined;
  const diaRutinaId = (rutinaDia as any)?.id as number | undefined;

  const navigate = useCallback(
    (routeName: string, params?: Record<string, any>) => {
      (navigation as any).navigate(routeName, params);
    },
    [navigation]
  );

  const navigateFromSheet = useCallback(
    (routeName: string, params?: Record<string, any>) => {
      setSheetVisible(false);
      (navigation as any).navigate(routeName, params);
    },
    [navigation]
  );

  const handlePressPrimerPendiente = useCallback(() => {
    if (!primerPendiente) return;
    const { routeName, params } = routeForEjercicio(primerPendiente);
    navigate(routeName, { ...params, esSiguiente: true });
  }, [primerPendiente, navigate]);

  if (!rutinaDia && hasRutinaActiva) {
    return (
      <MensajeVacio
        titulo="Día de descanso"
        descripcion="Hoy no tienes ejercicios asignados. Aprovecha para recuperarte y volver más fuerte."
        textoBoton="Ver mi rutina"
        rutaDestino="MisRutinas"
        nombreImagen="descanso"
        mostrarBoton
      />
    );
  }

  if (!rutinaDia) return null;

  const allDone = pendientes.length === 0 && ejercicios.length > 0;

  const canReplacePrimer =
    canReplaceEjercicio(primerPendiente, rutinaId, diaRutinaId) &&
    primerPendiente?.id != null;

  return (
    <View style={rootStyles.container}>
      <View style={rootStyles.content}>
        {!allDone && (
          <ProgressBar
            completados={completados.length}
            total={ejercicios.length}
            isDark={isDark}
          />
        )}

        {primerPendiente ? (
          canReplacePrimer ? (
            <Swipeable
              renderRightActions={() => (
                <ReplaceSwipeAction
                  rutinaId={Number(rutinaId)}
                  diaRutinaId={Number(diaRutinaId)}
                  asignadoId={Number(primerPendiente!.id)}
                />
              )}
              overshootRight={false}
              rightThreshold={32}
              friction={2}
            >
              <HeroEjercicio
                ejercicio={primerPendiente}
                medidaPeso={medidaPeso}
                onPress={handlePressPrimerPendiente}
                isDark={isDark}
              />
            </Swipeable>
          ) : (
            <HeroEjercicio
              ejercicio={primerPendiente}
              medidaPeso={medidaPeso}
              onPress={handlePressPrimerPendiente}
              isDark={isDark}
            />
          )
        ) : allDone ? (
          <AllDoneView isDark={isDark} />
        ) : null}
      </View>

      {ejercicios.length > 0 && (
        <Pressable
          onPress={() => setSheetVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Ver todos los ejercicios"
          style={rootStyles.floatingBtn}
        >
          {pendientes.length > 0 ? (
            <>
              <View style={rootStyles.floatingBadge}>
                <Text style={rootStyles.floatingBadgeNum}>{pendientes.length}</Text>
              </View>
              <Text style={rootStyles.floatingText}>
                {pendientes.length === 1 ? "pendiente" : "pendientes"}
              </Text>
            </>
          ) : (
            <Text style={rootStyles.floatingText}>
              {ejercicios.length} ejercicios
            </Text>
          )}
          <ChevronRight
            size={15}
            color="#111111"
            strokeWidth={2.8}
            style={{ transform: [{ rotate: "-90deg" }] }}
          />
        </Pressable>
      )}

      <TodosEjerciciosSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        ejercicios={ejercicios}
        medidaPeso={medidaPeso}
        selectedYMD={selectedYMD}
        rutinaId={rutinaId}
        diaRutinaId={diaRutinaId}
        isDark={isDark}
        onPressNavegar={navigateFromSheet}
      />
    </View>
  );
}

const rootStyles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
    paddingHorizontal: tokens.spacing.sm,
    paddingBottom: 72,
  },
  content: {
    width: "100%",
    gap: tokens.spacing.lg,
  },
  floatingBtn: {
    position: "absolute",
    right: tokens.spacing.sm,
    bottom: 0,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,

    height: 46,
    paddingHorizontal: 16,

    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.08)",
    borderRadius: 999,

    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,

    zIndex: 20,
  },
  floatingText: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.2,
    color: "#111111",
  },
  floatingBadge: {
    backgroundColor: "#39FF14",
    borderRadius: 999,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  floatingBadgeNum: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
    lineHeight: 14,
  },
});