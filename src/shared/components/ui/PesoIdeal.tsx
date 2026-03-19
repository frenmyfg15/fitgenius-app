// src/features/fit/components/PesoIdeal.tsx
import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
} from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";

const R = 64;
const C = 2 * Math.PI * R;
const CX = 90;
const CY = 90;

type UnidadPeso = "KG" | "LB";
type UnidadAltura = "CM" | "FT";

type PesoIdealProps = {
  peso?: number | string | null;
  altura?: number | string | null;
  medidaPeso?: UnidadPeso;
  medidaAltura?: UnidadAltura;
  soloGrafica?: boolean;
};

const KG_TO_LB = 2.2046226218;

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
    chipBgLight: "#F1F5F9)",
    chipBorderDark: "rgba(255,255,255,0.06)",
    chipBorderLight: "rgba(0,0,0,0.06)",

    metricBgDark: "rgba(15,24,41,0.55)",
    metricBgLight: "#FFFFFF",
    metricBorderDark: "rgba(255,255,255,0.06)",
    metricBorderLight: "rgba(0,0,0,0.06)",

    ringBaseDark: "rgba(148,163,184,0.22)",
    ringBaseLight: "#E5E7EB",

    fineStrokeDark: "#000000",
    fineStrokeLight: "#111827",
    fineOpacityDark: 0.25,
    fineOpacityLight: 0.15,

    markerStrokeDark: "rgba(0,0,0,0.35)",
    markerStrokeLight: "#111827",

    textPrimaryDark: "#F1F5F9",
    textPrimaryLight: "#0F172A",
    textSecondaryDark: "#94A3B8",
    textSecondaryLight: "#475569",
    textMutedDark: "#64748B",
    textMutedLight: "#6B7280",
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

export default function PesoIdeal({
  peso,
  altura,
  medidaPeso = "KG",
  medidaAltura = "CM",
  soloGrafica = false,
}: PesoIdealProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const textPrimary = isDark ? tokens.color.textPrimaryDark : tokens.color.textPrimaryLight;
  const textSecondary = isDark ? tokens.color.textSecondaryDark : tokens.color.textSecondaryLight;
  const textMuted = isDark ? tokens.color.textMutedDark : tokens.color.textMutedLight;

  const pesoNumOriginal = Number(peso ?? 0);
  const alturaNumOriginal = Number(altura ?? 0);

  // ✅ Datos internos canónicos:
  // - peso siempre en KG
  // - altura siempre en CM
  const pesoKg = pesoNumOriginal;
  const alturaM = alturaNumOriginal > 0 ? alturaNumOriginal / 100 : 0;

  const hasData = pesoKg > 0 && alturaM > 0;

  const minIdealKg = hasData ? 18.5 * alturaM * alturaM : 0;
  const maxIdealKg = hasData ? 24.9 * alturaM * alturaM : 0;

  const rangeMinKg = hasData ? Math.max(0, minIdealKg * 0.85) : 0;
  const rangeMaxKg = hasData ? maxIdealKg * 1.15 : 1;
  const rangeSpanKg = Math.max(1, rangeMaxKg - rangeMinKg);

  const { estado, isGradient } = useMemo(() => {
    if (!hasData) return { estado: "sin datos", isGradient: false };
    if (pesoKg < minIdealKg) return { estado: "por debajo", isGradient: false };
    if (pesoKg > maxIdealKg) return { estado: "por encima", isGradient: false };
    return { estado: "en rango ideal", isGradient: true };
  }, [hasData, pesoKg, minIdealKg, maxIdealKg]);

  const pStart = hasData ? Math.max(0, Math.min(1, (minIdealKg - rangeMinKg) / rangeSpanKg)) : 0;
  const pEnd = hasData ? Math.max(0, Math.min(1, (maxIdealKg - rangeMinKg) / rangeSpanKg)) : 0;
  const pCurr = hasData ? Math.max(0, Math.min(1, (pesoKg - rangeMinKg) / rangeSpanKg)) : 0;

  const arcLen = C * (pEnd - pStart);
  const arcOffset = C * (1 - pEnd);

  const angleDeg = pCurr * 360 - 90;
  const angleRad = (angleDeg * Math.PI) / 180;

  // ✅ Solo conversión de visualización
  const unidadPesoLabel = medidaPeso === "LB" ? "lb" : "kg";
  const pesoDisplay = medidaPeso === "LB" ? pesoKg * KG_TO_LB : pesoKg;
  const minIdealDisplay = medidaPeso === "LB" ? minIdealKg * KG_TO_LB : minIdealKg;
  const maxIdealDisplay = medidaPeso === "LB" ? maxIdealKg * KG_TO_LB : maxIdealKg;

  const ringBase = isDark ? tokens.color.ringBaseDark : tokens.color.ringBaseLight;
  const fineStroke = isDark ? tokens.color.fineStrokeDark : tokens.color.fineStrokeLight;
  const fineOpacity = isDark ? tokens.color.fineOpacityDark : tokens.color.fineOpacityLight;

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
            <Text style={[styles.title, { color: textPrimary }]}>Peso ideal</Text>

            <View
              style={[
                styles.statusChip,
                {
                  backgroundColor: isDark ? tokens.color.chipBgDark : tokens.color.chipBgLight,
                  borderColor: isDark ? tokens.color.chipBorderDark : tokens.color.chipBorderLight,
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: hasData ? (isGradient ? textPrimary : textSecondary) : textSecondary },
                ]}
              >
                {hasData ? estado : "Datos insuficientes"}
              </Text>
            </View>
          </View>

          {!hasData ? (
            <Text style={[styles.emptyText, { color: textSecondary }]}>
              Necesito tu{" "}
              <Text style={[styles.emptyTextStrong, { color: textPrimary }]}>peso y altura</Text>{" "}
              para estimar tu rango de peso ideal.
            </Text>
          ) : (
            <>
              {!soloGrafica && (
                <View style={styles.chipsRow}>
                  <Chip label="Peso" value={`${round1(pesoDisplay)} ${unidadPesoLabel}`} isDark={isDark} />
                  <Chip
                    label="Ideal min"
                    value={`${round1(minIdealDisplay)} ${unidadPesoLabel}`}
                    isDark={isDark}
                  />
                  <Chip
                    label="Ideal max"
                    value={`${round1(maxIdealDisplay)} ${unidadPesoLabel}`}
                    isDark={isDark}
                  />
                </View>
              )}

              <View style={styles.ringWrap}>
                <View style={styles.ringBox}>
                  <Svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 180 180"
                    style={styles.ringSvg}
                    accessibilityLabel="Anillo de rango de peso ideal"
                    role="img"
                  >
                    <Circle cx={CX} cy={CY} r={R} stroke={ringBase} strokeWidth={12} fill="transparent" />

                    <Defs>
                      <SvgLinearGradient id="idealGrad" x1="0" y1="0" x2="1" y2="1">
                        <Stop offset="0%" stopColor={tokens.color.gradientStart} />
                        <Stop offset="50%" stopColor={tokens.color.gradientMid} />
                        <Stop offset="100%" stopColor={tokens.color.gradientEnd} />
                      </SvgLinearGradient>
                    </Defs>

                    <Circle
                      cx={CX}
                      cy={CY}
                      r={R}
                      stroke="url(#idealGrad)"
                      strokeWidth={12}
                      fill="transparent"
                      strokeDasharray={`${arcLen} ${C}`}
                      strokeDashoffset={arcOffset}
                      strokeLinecap="round"
                    />

                    <Circle
                      cx={CX}
                      cy={CY}
                      r={R}
                      stroke={fineStroke}
                      strokeOpacity={fineOpacity}
                      strokeWidth={2}
                      fill="transparent"
                      strokeDasharray={`${2} ${C}`}
                    />

                    <Circle
                      cx={CX + (R + 6) * Math.cos(angleRad)}
                      cy={CY + (R + 6) * Math.sin(angleRad)}
                      r={5.5}
                      fill="#FFFFFF"
                      stroke={isDark ? tokens.color.markerStrokeDark : tokens.color.markerStrokeLight}
                      strokeWidth={1}
                    />
                  </Svg>

                  <View style={styles.ringCenter} pointerEvents="none">
                    <Text style={[styles.ringKicker, { color: textMuted }]}>Rango ideal</Text>
                    <Text style={[styles.ringValue, { color: textPrimary }]}>
                      {round1(minIdealDisplay)}–{round1(maxIdealDisplay)} {unidadPesoLabel}
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={[styles.footnote, { color: textSecondary }]}>
                Basado en IMC saludable (18.5–24.9) para tu altura. Úsalo como referencia general,
                no como diagnóstico.
              </Text>
            </>
          )}
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
    textTransform: "capitalize",
  },

  emptyText: {
    marginTop: tokens.spacing.md,
    fontSize: 13,
    lineHeight: 20,
  },

  emptyTextStrong: {
    fontWeight: "800",
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
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
    letterSpacing: -0.2,
    textAlign: "center",
  },

  footnote: {
    marginTop: tokens.spacing.lg,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },
});