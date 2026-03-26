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
  Dimensions,
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
  LayoutList,
} from "lucide-react-native";

import MensajeVacio from "../ui/MensajeVacio";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";
import ReplaceEjercicioAsignadoFlow from "@/shared/components/rutina/ReplaceEjercicioAsignadoFlow";
import { kgToLb } from "@/shared/utils/kgToLb";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// ── Tokens ───────────────────────────────────────────────────────────────────
const tokens = {
  color: {
    gradientStart: "rgb(0,255,64)",
    gradientMid: "rgb(94,230,157)",
    gradientEnd: "rgb(178,0,255)",

    cardBgDark: "#0F1829",
    cardBgLight: "#FFFFFF",
    cardBorderDark: "rgba(255,255,255,0.07)",
    cardBorderLight: "rgba(0,0,0,0.08)",

    cardHighlightBorder: "#22C55E",
    cardHighlightBorderSoft: "rgba(34,197,94,0.28)",

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

    checkBgDark: "rgba(0,232,90,0.12)",
    checkBgLight: "rgba(0,196,77,0.10)",
    checkBorderDark: "rgba(0,232,90,0.30)",
    checkBorderLight: "rgba(0,196,77,0.25)",
    checkColor: "#22C55E",

    replaceBg: "rgba(34,197,94,0.10)",
    replaceBgPressed: "rgba(34,197,94,0.22)",
    replaceBgLoading: "rgba(34,197,94,0.06)",
    replaceBorder: "rgba(34,197,94,0.30)",
    replaceText: "#22C55E",

    ctaPrimaryBg: "#22C55E",
    ctaPrimaryBgPressed: "#16A34A",
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

// ── Assets ───────────────────────────────────────────────────────────────────
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
  if (i.ejercicioCompuesto) return `${i.descansoSeg ?? 0} s descanso`;
  const sets = i.seriesSugeridas ?? "—";
  const reps = i.repeticionesSugeridas ?? "—";
  const peso =
    i.pesoSugerido != null
      ? formatPesoDisplay(i.pesoSugerido, medidaPeso)
      : `— ${medidaPeso}`;
  return `${sets} series · ${reps} reps · ${peso}`;
};

const toMadridYMD = (() => {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return (d: Date) => fmt.format(d);
})();

const getFechasParaUI = (ej: EjercicioDia) => {
  if (Array.isArray(ej.fechasCompletadasAsignacionUI)) return ej.fechasCompletadasAsignacionUI;
  if (Array.isArray(ej.fechasPlanificadasCompletadasAsignacion)) return ej.fechasPlanificadasCompletadasAsignacion;
  return ej.fechasCompletadasAsignacion ?? [];
};

const isCompletedOnDate = (ej: EjercicioDia, selectedYMD?: string) => {
  const fechas = getFechasParaUI(ej);
  if (!selectedYMD) {
    const hoy = toMadridYMD(new Date());
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
      params: { id: String(e.ejercicioCompuesto.id), ...(asignadoId && { asignadoId }), nombre, ejercicio: e },
    };
  }
  return {
    routeName: "VistaEjercicio",
    params: { slug: encodeURIComponent(nombre), ...(asignadoId && { asignadoId }), nombre, ejercicio: e },
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

  const statPills = useMemo(() => {
    if (isCompuesto) {
      return [{ label: "Descanso", value: `${ejercicio.descansoSeg ?? 0}s` }];
    }
    const pills: { label: string; value: string }[] = [];
    if (ejercicio.seriesSugeridas != null)
      pills.push({ label: "Series", value: String(ejercicio.seriesSugeridas) });
    if (ejercicio.repeticionesSugeridas != null)
      pills.push({ label: "Reps", value: String(ejercicio.repeticionesSugeridas) });
    if (ejercicio.pesoSugerido != null)
      pills.push({ label: "Peso", value: formatPesoDisplay(ejercicio.pesoSugerido, medidaPeso) });
    if (ejercicio.descansoSeg != null)
      pills.push({ label: "Descanso", value: `${ejercicio.descansoSeg}s` });
    return pills.slice(0, 3);
  }, [ejercicio, medidaPeso, isCompuesto]);

  return (
    <TouchableOpacity
      activeOpacity={0.97}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Siguiente ejercicio: ${nombre}. Toca para empezar.`}
      style={[
        heroStyles.container,
        { backgroundColor: isDark ? tokens.color.heroBgDark : tokens.color.heroBgLight },
      ]}
    >
      <View style={heroStyles.row}>
        <View style={heroStyles.imageArea}>
          {img ? (
            <Image source={img} style={heroStyles.image} resizeMode="contain" />
          ) : (
            <View style={heroStyles.imagePlaceholder}>
              <Dumbbell size={36} color="rgba(100,116,139,0.3)" strokeWidth={1.5} />
            </View>
          )}
        </View>

        <View style={heroStyles.infoArea}>
          <View
            style={[
              heroStyles.tag,
              {
                backgroundColor: isDark ? tokens.color.tagBgDark : tokens.color.tagBgLight,
                borderColor: isDark ? tokens.color.tagBorderDark : tokens.color.tagBorderLight,
              },
            ]}
          >
            <Text
              style={[
                heroStyles.tagText,
                { color: isDark ? tokens.color.tagTextDark : tokens.color.tagTextLight },
              ]}
            >
              {tagSuperior || "—"}
            </Text>
          </View>

          <Text
            numberOfLines={2}
            style={[
              heroStyles.name,
              { color: isDark ? tokens.color.nameDark : tokens.color.nameLight },
            ]}
          >
            {nombre}
          </Text>

          {statPills.length > 0 && (
            <View style={heroStyles.pillsRow}>
              {statPills.map((p) => (
                <View
                  key={p.label}
                  style={[
                    heroStyles.pill,
                    {
                      backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                      borderColor: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.07)",
                    },
                  ]}
                >
                  <Text
                    style={[
                      heroStyles.pillLabel,
                      { color: isDark ? "#475569" : "#94A3B8" },
                    ]}
                  >
                    {p.label}
                  </Text>
                  <Text
                    style={[
                      heroStyles.pillValue,
                      { color: isDark ? tokens.color.nameDark : tokens.color.nameLight },
                    ]}
                  >
                    {p.value}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <LinearGradient
              colors={["#22C55E", "#16A34A"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={heroStyles.ctaButton}
            >
              <Text style={heroStyles.ctaText}>Empezar</Text>
              <ChevronRight size={16} color="#fff" strokeWidth={2.5} />
            </LinearGradient>
          </Animated.View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const heroStyles = StyleSheet.create({
  container: {
    borderRadius: tokens.radius.xl,
    overflow: "hidden",
    width: "100%",
  },
  row: {
    flexDirection: "row",
    alignItems: "stretch",
    minHeight: 222,
  },
  imageArea: {
    width: 132,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  image: {
    width: "100%",
    height: 132,
  },
  imagePlaceholder: {
    width: "100%",
    height: 132,
    alignItems: "center",
    justifyContent: "center",
  },
  infoArea: {
    flex: 1,
    paddingHorizontal: tokens.spacing.md,
    paddingTop: tokens.spacing.md,
    paddingBottom: tokens.spacing.md,
    gap: 10,
    justifyContent: "center",
  },
  tag: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: tokens.radius.sm,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  name: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.2,
    lineHeight: 22,
  },
  pillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: tokens.spacing.xs,
  },
  pill: {
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 5,
    alignItems: "center",
    minWidth: 58,
  },
  pillLabel: {
    fontSize: 8,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 1,
  },
  pillValue: {
    fontSize: 12,
    fontWeight: "700",
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: tokens.radius.full,
    paddingVertical: 11,
    paddingHorizontal: 18,
    alignSelf: "flex-start",
  },
  ctaText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.2,
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
              color={loading ? "rgba(34,197,94,0.4)" : tokens.color.replaceText}
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

const ReplaceInlineButton = memo(function ReplaceInlineButton({
  rutinaId,
  diaRutinaId,
  asignadoId,
}: {
  rutinaId: number;
  diaRutinaId: number;
  asignadoId: number;
}) {
  return (
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
            compactStyles.replaceButtonInline,
            pressed && compactStyles.replaceButtonPressed,
            loading && compactStyles.replaceButtonLoading,
          ]}
        >
          <RefreshCcw
            size={14}
            color={loading ? "rgba(34,197,94,0.4)" : tokens.color.replaceText}
            strokeWidth={2.5}
          />
          <Text
            style={[
              compactStyles.replaceButtonText,
              loading && compactStyles.replaceButtonTextLoading,
            ]}
          >
            {loading ? "..." : "Cambiar"}
          </Text>
        </Pressable>
      )}
    </ReplaceEjercicioAsignadoFlow>
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
    color: "rgba(34,197,94,0.4)",
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

          {canReplace && (
            <View style={compactStyles.inlineActionRow}>
              <ReplaceInlineButton
                rutinaId={Number(rutinaId)}
                diaRutinaId={Number(diaRutinaId)}
                asignadoId={Number(asignadoId)}
              />
            </View>
          )}
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
  inlineActionRow: {
    marginTop: 6,
    alignItems: "flex-start",
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
  replaceButtonInline: {
    minHeight: 30,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: tokens.color.replaceBg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: tokens.color.replaceBorder,
    borderRadius: tokens.radius.full,
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
    color: "rgba(34,197,94,0.4)",
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
  const completados = ejercicios.filter((e) => isCompletedOnDate(e, selectedYMD)).length;
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
        <View>
          <Text
            style={[
              sheetStyles.headerTitle,
              { color: isDark ? tokens.color.nameDark : tokens.color.nameLight },
            ]}
          >
            Todos los ejercicios
          </Text>
          <Text style={sheetStyles.headerSub}>
            {completados}/{ejercicios.length} completados
          </Text>
        </View>

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

      <View style={sheetStyles.progressWrapper}>
        <ProgressBar completados={completados} total={ejercicios.length} isDark={isDark} />
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
      <ProgressBar
        completados={completados.length}
        total={ejercicios.length}
        isDark={isDark}
      />

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
        <LinearGradient
          colors={GRADIENT as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={rootStyles.allDoneGradient}
        >
          <View
            style={[
              rootStyles.allDoneCard,
              { backgroundColor: isDark ? tokens.color.cardBgDark : tokens.color.cardBgLight },
            ]}
          >
            <CheckCircle2 size={36} color={tokens.color.checkColor} strokeWidth={2} />
            <Text
              style={[
                rootStyles.allDoneTitle,
                { color: isDark ? tokens.color.nameDark : tokens.color.nameLight },
              ]}
            >
              ¡Sesión completada!
            </Text>
            <Text style={rootStyles.allDoneSub}>
              Has terminado todos los ejercicios de hoy. ¡Gran trabajo!
            </Text>
          </View>
        </LinearGradient>
      ) : null}

      {ejercicios.length > 0 && (
        <Pressable
          onPress={() => setSheetVisible(true)}
          style={({ pressed }) => [
            rootStyles.verTodoBtn,
            {
              backgroundColor: isDark
                ? pressed
                  ? "rgba(255,255,255,0.09)"
                  : "rgba(255,255,255,0.05)"
                : pressed
                  ? "rgba(0,0,0,0.08)"
                  : "rgba(0,0,0,0.04)",
              borderColor: isDark
                ? "rgba(255,255,255,0.09)"
                : "rgba(0,0,0,0.08)",
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Ver todos los ejercicios"
        >
          <LayoutList size={14} color={isDark ? "#64748B" : "#94A3B8"} strokeWidth={2} />
          <Text
            style={[
              rootStyles.verTodoText,
              { color: isDark ? "#64748B" : "#94A3B8" },
            ]}
          >
            Ver todos los ejercicios
          </Text>
          <View style={rootStyles.verTodoBadge}>
            <Text style={rootStyles.verTodoBadgeText}>{ejercicios.length}</Text>
          </View>
          <ChevronRight size={13} color={isDark ? "#334155" : "#CBD5E1"} strokeWidth={2.5} />
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
        onPressNavegar={navigate}
      />
    </View>
  );
}

const rootStyles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: tokens.spacing.sm,
    gap: tokens.spacing.lg,
  },
  allDoneGradient: {
    borderRadius: tokens.radius.xl,
    padding: 2,
  },
  allDoneCard: {
    borderRadius: tokens.radius.xl - 2,
    paddingVertical: tokens.spacing.xl * 1.5,
    paddingHorizontal: tokens.spacing.xl,
    alignItems: "center",
    gap: tokens.spacing.md,
  },
  allDoneTitle: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  allDoneSub: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 19,
  },
  verTodoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.sm,
    borderRadius: tokens.radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 11,
    paddingHorizontal: tokens.spacing.md,
  },
  verTodoText: {
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  verTodoBadge: {
    backgroundColor: "rgba(34,197,94,0.12)",
    borderRadius: tokens.radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  verTodoBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: tokens.color.checkColor,
  },
});