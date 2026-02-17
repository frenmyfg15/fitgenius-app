// src/features/fit/components/GastoCalorico.tsx
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

const FACTORES: Record<string, number> = {
  sedentario: 1.2,
  ligero: 1.375,
  moderado: 1.55,
  "muy activo": 1.725,
};

const R = 64;
const C = 2 * Math.PI * R;

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

    ringTrackDark: "rgba(148,163,184,0.22)",
    ringTrackLight: "#E5E7EB",

    barTrackDark: "rgba(148,163,184,0.18)",
    barTrackLight: "#E5E7EB",
    barBorderDark: "rgba(255,255,255,0.06)",
    barBorderLight: "#E5E7EB",

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

type GastoCaloricoProps = {
  peso?: number | string | null;
  altura?: number | string | null;
  edad?: number | string | null;
  sexo?: string | null;
  actividadInicial?: string | null;
};

function mapActividad(
  actividadInicial?: string | null
): { key: keyof typeof FACTORES; label: string } | null {
  if (!actividadInicial) return null;

  const raw = actividadInicial.trim();
  const upper = raw.toUpperCase();

  switch (upper) {
    case "SEDENTARIO":
      return { key: "sedentario", label: "Sedentario" };
    case "LIGERAMENTE_ACTIVO":
      return { key: "ligero", label: "Ligeramente activo" };
    case "MODERADAMENTE_ACTIVO":
      return { key: "moderado", label: "Moderadamente activo" };
    case "MUY_ACTIVO":
      return { key: "muy activo", label: "Muy activo" };
  }

  const lower = raw.toLowerCase() as keyof typeof FACTORES;
  const factor = FACTORES[lower];
  if (factor == null) return null;

  const label = lower
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return { key: lower, label };
}

function stripTrailingZeros(n: number) {
  return Number.isInteger(n) ? n.toString() : n.toFixed(3).replace(/\.?0+$/, "");
}

function Metric({
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

export default function GastoCalorico({
  peso,
  altura,
  edad,
  sexo,
  actividadInicial,
}: GastoCaloricoProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const actividad = useMemo(() => mapActividad(actividadInicial), [actividadInicial]);

  const tmb = useMemo(() => {
    if (!peso || !altura || !edad || !sexo) return null;
    const base = 10 * Number(peso) + 6.25 * Number(altura) - 5 * Number(edad);
    return Math.round(sexo?.toLowerCase() === "masculino" ? base + 5 : base - 161);
  }, [peso, altura, edad, sexo]);

  const factor = useMemo(() => {
    if (!actividad) return null;
    return FACTORES[actividad.key] ?? 1.2;
  }, [actividad]);

  const gasto = useMemo(() => {
    if (!tmb || !factor) return null;
    return Math.round(tmb * factor);
  }, [tmb, factor]);

  const hasData = Boolean(tmb && actividad && factor);

  const maxRef = 4200;
  const pct = gasto ? Math.min(gasto / maxRef, 1) : 0;
  const dash = C * (1 - pct);

  const textPrimary = isDark ? tokens.color.textPrimaryDark : tokens.color.textPrimaryLight;
  const textSecondary = isDark ? tokens.color.textSecondaryDark : tokens.color.textSecondaryLight;
  const textMuted = isDark ? tokens.color.textMutedDark : tokens.color.textMutedLight;

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
            <Text style={[styles.title, { color: textPrimary }]}>Gasto calórico diario</Text>

            <View
              style={[
                styles.chip,
                {
                  backgroundColor: isDark ? tokens.color.chipBgDark : tokens.color.chipBgLight,
                  borderColor: isDark ? tokens.color.chipBorderDark : tokens.color.chipBorderLight,
                },
              ]}
            >
              {hasData ? (
                <Text style={[styles.chipText, { color: textSecondary }]}>
                  Actividad:{" "}
                  <Text style={[styles.chipTextStrong, { color: textPrimary }]}>
                    {actividad!.label}
                  </Text>
                </Text>
              ) : (
                <Text style={[styles.chipText, { color: textSecondary }]}>Datos insuficientes</Text>
              )}
            </View>
          </View>

          {!hasData ? (
            <Text style={[styles.emptyText, { color: textSecondary }]}>
              Completa tu{" "}
              <Text style={[styles.emptyTextStrong, { color: textPrimary }]}>
                peso, altura, edad, sexo y nivel de actividad
              </Text>{" "}
              para estimar tu gasto calórico diario.
            </Text>
          ) : (
            <>
              <View style={styles.metricsRow}>
                <Metric label="Tasa basal (TMB)" value={`${tmb} kcal`} isDark={isDark} />
                <Metric
                  label="Factor actividad"
                  value={`× ${stripTrailingZeros(factor!)}`}
                  isDark={isDark}
                />
              </View>

              <View style={styles.mainRow}>
                <View style={styles.ringBox} accessibilityLabel="Progreso de gasto calórico">
                  <Svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 180 180"
                    style={styles.ringSvg}
                    accessibilityLabel="Anillo de progreso"
                  >
                    <Circle
                      cx="90"
                      cy="90"
                      r={R}
                      stroke={isDark ? tokens.color.ringTrackDark : tokens.color.ringTrackLight}
                      strokeWidth={12}
                      fill="transparent"
                    />
                    <Defs>
                      <SvgLinearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                        <Stop offset="0%" stopColor={tokens.color.gradientStart} />
                        <Stop offset="50%" stopColor={tokens.color.gradientMid} />
                        <Stop offset="100%" stopColor={tokens.color.gradientEnd} />
                      </SvgLinearGradient>
                    </Defs>
                    <Circle
                      cx="90"
                      cy="90"
                      r={R}
                      stroke="url(#ringGrad)"
                      strokeWidth={12}
                      fill="transparent"
                      strokeDasharray={C}
                      strokeDashoffset={dash}
                      strokeLinecap="round"
                    />
                  </Svg>

                  <View style={styles.ringCenter} pointerEvents="none">
                    <Text style={[styles.ringKicker, { color: textMuted }]}>Estimado</Text>
                    <Text style={[styles.ringValue, { color: textPrimary }]}>{gasto}</Text>
                    <Text style={[styles.ringUnit, { color: textMuted }]}>kcal / día</Text>
                  </View>
                </View>

                <View style={styles.content}>
                  <Text style={[styles.body, { color: textSecondary }]}>
                    Energía total que tu cuerpo{" "}
                    <Text style={[styles.bodyStrong, { color: textPrimary }]}>gasta a diario</Text>{" "}
                    según tu nivel actual de actividad.
                  </Text>

                  <View style={styles.refsRow}>
                    {[
                      { label: "Ligero", val: 2200 },
                      { label: "Promedio", val: 2600 },
                      { label: "Alto", val: 3000 },
                    ].map((r) => (
                      <View
                        key={r.label}
                        style={[
                          styles.refChip,
                          {
                            backgroundColor: isDark ? tokens.color.chipBgDark : tokens.color.chipBgLight,
                            borderColor: isDark ? tokens.color.chipBorderDark : tokens.color.chipBorderLight,
                          },
                        ]}
                      >
                        <Text style={[styles.refChipText, { color: textSecondary }]}>
                          {r.label}: {r.val} kcal
                        </Text>
                      </View>
                    ))}
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
                    accessibilityLabel="Barra de referencia"
                    accessibilityValue={{ min: 0, max: maxRef, now: gasto ?? 0 }}
                  >
                    <LinearGradient
                      colors={["#8bff62", "#39ff14", "#a855f7"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.barFill, { width: `${pct * 100}%` }]}
                    />
                  </View>
                </View>
              </View>

              <Text style={[styles.footnote, { color: textMuted }]}>
                Basado en la fórmula de Mifflin–St Jeor. Este valor es una estimación y puede variar
                según múltiples factores.
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

  chip: {
    borderRadius: tokens.radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    maxWidth: 220,
  },

  chipText: {
    fontSize: 11,
    lineHeight: 14,
  },

  chipTextStrong: {
    fontWeight: "700",
  },

  emptyText: {
    marginTop: tokens.spacing.md,
    fontSize: 13,
    lineHeight: 20,
  },

  emptyTextStrong: {
    fontWeight: "800",
  },

  metricsRow: {
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

  mainRow: {
    marginTop: tokens.spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.lg,
  },

  ringBox: {
    width: 160,
    height: 160,
    position: "relative",
    flexShrink: 0,
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
  },

  ringKicker: {
    fontSize: 11,
    lineHeight: 12,
    fontWeight: "600",
  },

  ringValue: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: "900",
    letterSpacing: -0.4,
    marginTop: 2,
  },

  ringUnit: {
    fontSize: 11,
    lineHeight: 12,
    fontWeight: "600",
    marginTop: 0,
  },

  content: {
    flex: 1,
    minWidth: 0,
  },

  body: {
    fontSize: 13,
    lineHeight: 20,
  },

  bodyStrong: {
    fontWeight: "800",
  },

  refsRow: {
    marginTop: tokens.spacing.md,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: tokens.spacing.sm,
  },

  refChip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: tokens.radius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },

  refChipText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "600",
  },

  barTrack: {
    marginTop: tokens.spacing.md,
    height: 10,
    borderRadius: tokens.radius.full,
    overflow: "hidden",
    borderWidth: 1,
  },

  barFill: {
    height: "100%",
  },

  footnote: {
    marginTop: tokens.spacing.lg,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "600",
  },
});
