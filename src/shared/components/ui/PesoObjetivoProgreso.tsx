// src/features/fit/components/PesoObjetivoProgreso.tsx
import React, { useMemo, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
} from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import { Lock } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";

const R = 64;
const C = 2 * Math.PI * R;
const CX = 90;
const CY = 90;

type UnidadPeso = "KG" | "LB";

type PesoObjetivoProgresoProps = {
  peso?: number | string | null;
  objetivo?: number | string | null;
  medidaPeso?: UnidadPeso;
};

const tokens = {
  color: {
    gradientStart: "rgb(0,255,64)",
    gradientMid: "rgb(94,230,157)",
    gradientEnd: "rgb(178,0,255)",

    cardBgDark: "rgba(15,24,41,1)",
    cardBgLight: "#FFFFFF",
    cardBorderDark: "rgba(255,255,255,0.08)",
    cardBorderLight: "rgba(0,0,0,0.06)",

    chipBgDark: "rgba(148,163,184,0.12)",
    chipBgLight: "#F1F5F9",
    chipBorderDark: "rgba(255,255,255,0.06)",
    chipBorderLight: "rgba(0,0,0,0.06)",

    metricBgDark: "rgba(15,24,41,0.55)",
    metricBgLight: "#FFFFFF",
    metricBorderDark: "rgba(255,255,255,0.06)",
    metricBorderLight: "rgba(0,0,0,0.06)",

    ringBaseDark: "rgba(148,163,184,0.22)",
    ringBaseLight: "#E5E7EB",

    barTrackDark: "rgba(148,163,184,0.18)",
    barTrackLight: "#E5E7EB",
    barBorderDark: "rgba(255,255,255,0.10)",
    barBorderLight: "#E5E7EB",

    textPrimaryDark: "#F1F5F9",
    textPrimaryLight: "#0F172A",
    textSecondaryDark: "#94A3B8",
    textSecondaryLight: "#475569",
    textMutedDark: "#64748B",
    textMutedLight: "#6B7280",

    lockCardBgDark: "rgba(15,23,42,0.80)",
    lockCardBgLight: "rgba(240,253,250,0.95)",
    lockCardBorderDark: "rgba(255,255,255,0.16)",
    lockCardBorderLight: "rgba(15,118,110,0.18)",
    lockIconBgDark: "rgba(15,23,42,1)",
    lockIconBgLight: "#FFFFFF",
    lockIconBorderDark: "rgba(148,163,184,0.50)",
    lockIconBorderLight: "rgba(16,185,129,0.35)",
    lockIconDark: "#A7F3D0",
    lockIconLight: "#047857",
    lockTitleDark: "#F1F5F9",
    lockTitleLight: "#065F46",
    lockTextDark: "#9CA3AF",
    lockTextLight: "#047857",
    lockCtaDark: "#A7F3D0",
    lockCtaLight: "#047857",
  },
  radius: { lg: 16, md: 12, sm: 10, full: 999 },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20 },
} as const;

const GRADIENT = [
  tokens.color.gradientStart,
  tokens.color.gradientMid,
  tokens.color.gradientEnd,
] as const;

function round1(n: number) {
  return Number.isFinite(n) ? Math.round(n * 10) / 10 : 0;
}

function Chip({
  label,
  value,
  isDark,
}: {
  label: string;
  value: string;
  isDark: boolean;
}) {
  return (
    <View
      style={[
        styles.metric,
        {
          backgroundColor: isDark ? tokens.color.metricBgDark : tokens.color.metricBgLight,
          borderColor: isDark ? tokens.color.metricBorderDark : tokens.color.metricBorderLight,
        },
      ]}
    >
      <Text
        style={[
          styles.metricLabel,
          { color: isDark ? tokens.color.textSecondaryDark : tokens.color.textMutedLight },
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          styles.metricValue,
          { color: isDark ? tokens.color.textPrimaryDark : tokens.color.textPrimaryLight },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function PesoObjetivoSkeleton({ isDark }: { isDark: boolean }) {
  const base = isDark ? "rgba(148,163,184,0.16)" : "#E5E7EB";
  const border = isDark ? "rgba(255,255,255,0.06)" : "#E5E7EB";

  return (
    <View pointerEvents="none">
      <View style={styles.skelHeader}>
        <View style={[styles.skelBarLg, { backgroundColor: base }]} />
        <View style={[styles.skelBarSm, { backgroundColor: base }]} />
      </View>

      <View style={styles.skelGrid}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={[
              styles.skelCard,
              {
                borderColor: border,
                backgroundColor: isDark ? "rgba(15,24,41,0.55)" : "#FFFFFF",
              },
            ]}
          >
            <View style={[styles.skelLineSm, { backgroundColor: base }]} />
            <View style={[styles.skelLineMd, { backgroundColor: base }]} />
          </View>
        ))}
      </View>

      <View style={styles.skelRingWrap}>
        <View style={[styles.skelRing, { borderColor: base }]}>
          <View style={[styles.skelLineLg, { backgroundColor: base }]} />
          <View style={[styles.skelLineWide, { backgroundColor: base }]} />
        </View>
      </View>

      <View style={styles.skelBarArea}>
        <View style={[styles.skelBarFull, { backgroundColor: base }]} />
        <View style={[styles.skelFooterLine, { backgroundColor: base }]} />
      </View>
    </View>
  );
}

export default function PesoObjetivoProgreso({
  peso,
  objetivo,
  medidaPeso = "KG",
}: PesoObjetivoProgresoProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const usuario = useUsuarioStore((s) => s.usuario);
  const navigation = useNavigation<any>();

  const planActual = usuario?.planActual;
  const haPagado = usuario?.haPagado ?? false;
  const locked = !(planActual === "PREMIUM" && haPagado);

  const handleGoPremium = useCallback(() => {
    navigation.navigate("Perfil", { screen: "PremiumPayment" });
  }, [navigation]);

  const pesoNum = Number(peso ?? 0);
  const objetivoNum = Number(objetivo ?? 0);

  const unidadPesoLabel = medidaPeso === "LB" ? "lb" : "kg";

  const hasData = Boolean(pesoNum && objetivoNum);

  const rumbo: "bajar" | "subir" | "igual" = useMemo(() => {
    if (!hasData) return "igual";
    if (objetivoNum === pesoNum) return "igual";
    return objetivoNum < pesoNum ? "bajar" : "subir";
  }, [hasData, objetivoNum, pesoNum]);

  const pct = useMemo(() => {
    if (!hasData) return 0;
    if (rumbo === "igual") return 1;
    return objetivoNum > pesoNum
      ? Math.min(pesoNum / objetivoNum, 1)
      : Math.min(objetivoNum / pesoNum, 1);
  }, [hasData, rumbo, objetivoNum, pesoNum]);

  const delta = useMemo(() => (hasData ? objetivoNum - pesoNum : 0), [hasData, objetivoNum, pesoNum]);
  const alcanzado = rumbo === "igual";
  const dash = C * (1 - pct);

  const estado = useMemo(() => {
    if (!hasData) return "";
    if (alcanzado) return "¡Has alcanzado tu objetivo!";
    const abs = Math.abs(delta).toFixed(1);
    return delta < 0 ? `Te sobran ${abs} ${unidadPesoLabel}` : `Te faltan ${abs} ${unidadPesoLabel}`;
  }, [hasData, alcanzado, delta, unidadPesoLabel]);

  const chipLabel = useMemo(() => {
    if (alcanzado) return "Objetivo logrado";
    return objetivoNum < pesoNum ? "Objetivo: bajar" : "Objetivo: subir";
  }, [alcanzado, objetivoNum, pesoNum]);

  const textPrimary = isDark ? tokens.color.textPrimaryDark : tokens.color.textPrimaryLight;
  const textSecondary = isDark ? tokens.color.textSecondaryDark : tokens.color.textSecondaryLight;
  const textMuted = isDark ? tokens.color.textMutedDark : tokens.color.textMutedLight;

  const ringBase = isDark ? tokens.color.ringBaseDark : tokens.color.ringBaseLight;

  if (locked) {
    return (
      <View style={styles.root}>
        <LinearGradient
          colors={GRADIENT as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.frame}
        >
          <View
            style={[
              styles.card,
              {
                backgroundColor: isDark ? tokens.color.cardBgDark : tokens.color.cardBgLight,
                borderColor: isDark ? tokens.color.cardBorderDark : tokens.color.cardBorderLight,
              },
            ]}
          >
            <PesoObjetivoSkeleton isDark={isDark} />

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleGoPremium}
              style={[
                styles.lockCta,
                {
                  borderColor: isDark ? tokens.color.lockCardBorderDark : tokens.color.lockCardBorderLight,
                  backgroundColor: isDark ? tokens.color.lockCardBgDark : tokens.color.lockCardBgLight,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Hazte Premium para ver el progreso hacia tu peso objetivo"
            >
              <View
                style={[
                  styles.lockIconWrap,
                  {
                    backgroundColor: isDark ? tokens.color.lockIconBgDark : tokens.color.lockIconBgLight,
                    borderColor: isDark ? tokens.color.lockIconBorderDark : tokens.color.lockIconBorderLight,
                  },
                ]}
              >
                <Lock
                  size={18}
                  color={isDark ? tokens.color.lockIconDark : tokens.color.lockIconLight}
                  strokeWidth={2}
                />
              </View>

              <View style={styles.lockTextWrap}>
                <Text
                  style={[
                    styles.lockTitle,
                    { color: isDark ? tokens.color.lockTitleDark : tokens.color.lockTitleLight },
                  ]}
                >
                  Progreso hacia tu peso objetivo Premium
                </Text>
                <Text
                  style={[
                    styles.lockDesc,
                    { color: isDark ? tokens.color.lockTextDark : tokens.color.lockTextLight },
                  ]}
                >
                  Hazte Premium para seguir tu avance hacia el peso objetivo con anillos y métricas
                  detalladas.
                </Text>
              </View>

              <Text
                style={[
                  styles.lockMore,
                  { color: isDark ? tokens.color.lockCtaDark : tokens.color.lockCtaLight },
                ]}
              >
                Ver más
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  if (!hasData) return null;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={GRADIENT as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.frame}
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor: isDark ? tokens.color.cardBgDark : tokens.color.cardBgLight,
              borderColor: isDark ? tokens.color.cardBorderDark : tokens.color.cardBorderLight,
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: textPrimary }]}>Progreso hacia tu peso objetivo</Text>

            <View
              style={[
                styles.statusChip,
                {
                  backgroundColor: isDark ? tokens.color.chipBgDark : tokens.color.chipBgLight,
                  borderColor: isDark ? tokens.color.chipBorderDark : tokens.color.chipBorderLight,
                },
              ]}
            >
              <Text style={[styles.statusText, { color: textSecondary }]}>{chipLabel}</Text>
            </View>
          </View>

          <View style={styles.chipsRow}>
            <Chip label="Actual" value={`${round1(pesoNum)} ${unidadPesoLabel}`} isDark={isDark} />
            <Chip label="Objetivo" value={`${round1(objetivoNum)} ${unidadPesoLabel}`} isDark={isDark} />
            <Chip
              label="Diferencia"
              value={`${delta > 0 ? "+" : ""}${round1(delta)} ${unidadPesoLabel}`}
              isDark={isDark}
            />
          </View>

          <View style={styles.ringWrap}>
            <View style={styles.ringBox}>
              <Svg
                width="100%"
                height="100%"
                viewBox="0 0 180 180"
                style={styles.ringSvg}
                accessibilityRole="image"
                accessibilityLabel="Progreso hacia el peso objetivo"
              >
                <Defs>
                  <SvgLinearGradient id="kGrad" x1="0" y1="0" x2="1" y2="1">
                    <Stop offset="0%" stopColor={tokens.color.gradientStart} />
                    <Stop offset="50%" stopColor={tokens.color.gradientMid} />
                    <Stop offset="100%" stopColor={tokens.color.gradientEnd} />
                  </SvgLinearGradient>
                  <SvgLinearGradient id="kGradMuted" x1="0" y1="0" x2="1" y2="1">
                    <Stop offset="0%" stopColor="rgba(0,255,64,0.5)" />
                    <Stop offset="50%" stopColor="rgba(94,230,157,0.5)" />
                    <Stop offset="100%" stopColor="rgba(178,0,255,0.5)" />
                  </SvgLinearGradient>
                </Defs>

                <Circle cx={CX} cy={CY} r={R} stroke={ringBase} strokeWidth={12} fill="transparent" />

                <Circle
                  cx={CX}
                  cy={CY}
                  r={R}
                  stroke={alcanzado ? "url(#kGrad)" : "url(#kGradMuted)"}
                  strokeWidth={12}
                  fill="transparent"
                  strokeDasharray={C}
                  strokeDashoffset={dash}
                  strokeLinecap="round"
                />
              </Svg>

              <View style={styles.ringCenter} pointerEvents="none">
                <Text style={[styles.ringKicker, { color: textSecondary }]}>Progreso</Text>
                <Text style={[styles.ringValue, { color: textPrimary }]}>{Math.round(pct * 100)}%</Text>
                <Text style={[styles.ringDesc, { color: textSecondary }]}>{estado}</Text>
              </View>
            </View>
          </View>

          <View
            style={[
              styles.barTrack,
              {
                backgroundColor: isDark ? tokens.color.barTrackDark : tokens.color.barTrackLight,
                borderColor: isDark ? tokens.color.barBorderDark : tokens.color.barBorderLight,
              },
            ]}
            accessibilityRole="progressbar"
            accessibilityLabel="Barra de progreso"
            accessibilityValue={{ min: 0, max: 1, now: pct }}
          >
            <LinearGradient
              colors={["#8bff62", "#39ff14", "#a855f7"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.barFill, { width: `${pct * 100}%` }]}
            />
          </View>

          <Text style={[styles.footnote, { color: textSecondary }]}>
            Mantén hábitos sostenibles: el progreso lento y constante suele ser más efectivo y fácil
            de mantener a largo plazo.
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: "100%",
    maxWidth: 520,
  },

  frame: {
    borderRadius: tokens.radius.lg,
    padding: 1.5,
    overflow: "hidden",
  },

  card: {
    borderRadius: tokens.radius.lg - 1,
    borderWidth: 1,
    padding: tokens.spacing.xl,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: tokens.spacing.md,
  },

  title: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.2,
  },

  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: tokens.radius.sm,
    borderWidth: 1,
    maxWidth: 220,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 14,
  },

  chipsRow: {
    marginTop: tokens.spacing.md,
    flexDirection: "row",
    gap: tokens.spacing.md,
  },

  metric: {
    flex: 1,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    padding: tokens.spacing.md,
  },

  metricLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "600",
  },

  metricValue: {
    marginTop: 2,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "800",
    letterSpacing: 0.1,
  },

  ringWrap: {
    marginTop: tokens.spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },

  ringBox: {
    width: 176,
    height: 176,
    position: "relative",
  },

  ringSvg: {
    position: "absolute",
    inset: 0,
    transform: [{ rotate: "-90deg" }],
  },

  ringCenter: {
    position: "absolute",
    inset: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: tokens.spacing.md,
  },

  ringKicker: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "700",
  },

  ringValue: {
    marginTop: 2,
    fontSize: 22,
    lineHeight: 26,
    fontWeight: "900",
    letterSpacing: -0.4,
  },

  ringDesc: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "700",
    textAlign: "center",
  },

  barTrack: {
    marginTop: tokens.spacing.lg,
    height: 10,
    width: "100%",
    borderRadius: tokens.radius.full,
    overflow: "hidden",
    borderWidth: 1,
  },

  barFill: {
    height: "100%",
  },

  footnote: {
    marginTop: tokens.spacing.md,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },

  lockCta: {
    marginTop: tokens.spacing.lg,
    borderRadius: tokens.radius.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
  },

  lockIconWrap: {
    height: 32,
    width: 32,
    borderRadius: tokens.radius.full,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    borderWidth: 1,
    flexShrink: 0,
  },

  lockTextWrap: {
    flex: 1,
    minWidth: 0,
  },

  lockTitle: {
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 16,
  },

  lockDesc: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "600",
  },

  lockMore: {
    marginLeft: 8,
    fontSize: 11,
    fontWeight: "800",
  },

  skelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: tokens.spacing.md,
  },

  skelBarLg: {
    width: 180,
    height: 16,
    borderRadius: 6,
  },

  skelBarSm: {
    width: 90,
    height: 14,
    borderRadius: 6,
  },

  skelGrid: {
    marginTop: tokens.spacing.md,
    flexDirection: "row",
    gap: tokens.spacing.md,
  },

  skelCard: {
    flex: 1,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    padding: tokens.spacing.md,
    gap: tokens.spacing.sm,
  },

  skelLineSm: {
    width: 70,
    height: 10,
    borderRadius: 6,
  },

  skelLineMd: {
    width: 90,
    height: 14,
    borderRadius: 6,
  },

  skelRingWrap: {
    marginTop: tokens.spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },

  skelRing: {
    width: 176,
    height: 176,
    borderRadius: 999,
    borderWidth: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  skelLineLg: {
    width: 80,
    height: 12,
    borderRadius: 6,
  },

  skelLineWide: {
    marginTop: 8,
    width: 140,
    height: 10,
    borderRadius: 6,
  },

  skelBarArea: {
    marginTop: tokens.spacing.lg,
  },

  skelBarFull: {
    height: 10,
    width: "100%",
    borderRadius: 999,
  },

  skelFooterLine: {
    marginTop: tokens.spacing.md,
    height: 12,
    width: "100%",
    borderRadius: 6,
  },
});
