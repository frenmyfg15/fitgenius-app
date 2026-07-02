// src/features/fit/components/PesoIdeal.tsx
import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
} from "react-native-svg";
import { useColorScheme } from "nativewind";
import { Colors, scheme } from "@/shared/constants/colors";
import { Font } from "@/shared/constants/typography";

const R = 64;
const C = 2 * Math.PI * R;
const CX = 90;
const CY = 90;

const VIZ_GRADIENT = ["rgb(0,255,64)", "rgb(94,230,157)", "rgb(178,0,255)"] as const;

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
  const t = scheme(isDark);
  return (
    <View
      style={[
        styles.metric,
        {
          backgroundColor: isDark ? Colors.dark.surfaceAlt : Colors.secondary,
          borderColor: t.border,
        },
      ]}
    >
      <Text style={[styles.metricLabel, { color: t.textTertiary }]}>{label}</Text>
      <Text style={[styles.metricValue, { color: t.textPrimary }]}>{value}</Text>
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

  const t = scheme(isDark);

  const pesoNumOriginal = Number(peso ?? 0);
  const alturaNumOriginal = Number(altura ?? 0);

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

  const unidadPesoLabel = medidaPeso === "LB" ? "lb" : "kg";
  const pesoDisplay = medidaPeso === "LB" ? pesoKg * KG_TO_LB : pesoKg;
  const minIdealDisplay = medidaPeso === "LB" ? minIdealKg * KG_TO_LB : minIdealKg;
  const maxIdealDisplay = medidaPeso === "LB" ? maxIdealKg * KG_TO_LB : maxIdealKg;

  const ringBase = isDark ? t.border : t.surface;
  const fineStroke = Colors.primary;
  const fineOpacity = isDark ? 0.25 : 0.15;

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.card,
          { backgroundColor: isDark ? Colors.dark.surface : Colors.secondary },
        ]}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: t.textPrimary }]}>Peso ideal</Text>

          <View
            style={[
              styles.statusChip,
              {
                backgroundColor: isDark ? t.border : t.surface,
                borderColor: t.border,
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: hasData ? (isGradient ? t.textPrimary : t.textSecondary) : t.textSecondary },
              ]}
            >
              {hasData ? estado : "Datos insuficientes"}
            </Text>
          </View>
        </View>

        {!hasData ? (
          <Text style={[styles.emptyText, { color: t.textSecondary }]}>
            Necesito tu{" "}
            <Text style={[styles.emptyTextStrong, { color: t.textPrimary }]}>peso y altura</Text>{" "}
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
                      <Stop offset="0%" stopColor={VIZ_GRADIENT[0]} />
                      <Stop offset="50%" stopColor={VIZ_GRADIENT[1]} />
                      <Stop offset="100%" stopColor={VIZ_GRADIENT[2]} />
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
                    stroke={isDark ? "rgba(0,0,0,0.35)" : "#111827"}
                    strokeWidth={1}
                  />
                </Svg>

                <View style={styles.ringCenter} pointerEvents="none">
                  <Text style={[styles.ringKicker, { color: t.textTertiary }]}>Rango ideal</Text>
                  <Text style={[styles.ringValue, { color: t.textPrimary }]}>
                    {round1(minIdealDisplay)}–{round1(maxIdealDisplay)} {unidadPesoLabel}
                  </Text>
                </View>
              </View>
            </View>

            <Text style={[styles.footnote, { color: t.textSecondary }]}>
              Basado en IMC saludable (18.5–24.9) para tu altura. Úsalo como referencia general,
              no como diagnóstico.
            </Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: "100%",
    maxWidth: 520,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.accentBorder,
    padding: 20,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    fontSize: 13,
    fontWeight: "800",
    fontFamily: Font.body.bold,
    letterSpacing: 0.2,
  },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    maxWidth: 220,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    fontFamily: Font.body.bold,
    lineHeight: 14,
    textTransform: "capitalize",
  },
  emptyText: {
    marginTop: 12,
    fontSize: 13,
    fontFamily: Font.body.regular,
    lineHeight: 20,
  },
  emptyTextStrong: {
    fontWeight: "800",
    fontFamily: Font.body.bold,
  },
  chipsRow: {
    marginTop: 12,
    flexDirection: "row",
    gap: 12,
  },
  metric: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  metricLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "600",
    fontFamily: Font.body.semiBold,
  },
  metricValue: {
    marginTop: 2,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "800",
    fontFamily: Font.body.bold,
    letterSpacing: 0.1,
  },
  ringWrap: {
    marginTop: 16,
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
    paddingHorizontal: 12,
  },
  ringKicker: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "700",
    fontFamily: Font.body.bold,
  },
  ringValue: {
    marginTop: 2,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
    fontFamily: Font.title.bold,
    letterSpacing: -0.2,
    textAlign: "center",
  },
  footnote: {
    marginTop: 16,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
    fontFamily: Font.body.semiBold,
  },
});
