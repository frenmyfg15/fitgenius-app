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
import { Colors, scheme } from "@/shared/constants/colors";
import { Font } from "@/shared/constants/typography";

const FACTORES: Record<string, number> = {
  sedentario: 1.2,
  ligero: 1.375,
  moderado: 1.55,
  "muy activo": 1.725,
};

const R = 64;
const C = 2 * Math.PI * R;

const VIZ_GRADIENT = ["rgb(0,255,64)", "rgb(94,230,157)", "rgb(178,0,255)"] as const;

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

export default function GastoCalorico({
  peso,
  altura,
  edad,
  sexo,
  actividadInicial,
}: GastoCaloricoProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const t = scheme(isDark);

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

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.card,
          { backgroundColor: isDark ? Colors.dark.surface : Colors.secondary },
        ]}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: t.textPrimary }]}>Gasto calórico diario</Text>

          <View
            style={[
              styles.chip,
              {
                backgroundColor: isDark ? t.border : t.surface,
                borderColor: t.border,
              },
            ]}
          >
            {hasData ? (
              <Text style={[styles.chipText, { color: t.textSecondary }]}>
                Actividad:{" "}
                <Text style={[styles.chipTextStrong, { color: t.textPrimary }]}>
                  {actividad!.label}
                </Text>
              </Text>
            ) : (
              <Text style={[styles.chipText, { color: t.textSecondary }]}>Datos insuficientes</Text>
            )}
          </View>
        </View>

        {!hasData ? (
          <Text style={[styles.emptyText, { color: t.textSecondary }]}>
            Completa tu{" "}
            <Text style={[styles.emptyTextStrong, { color: t.textPrimary }]}>
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
                    stroke={isDark ? t.border : t.surface}
                    strokeWidth={12}
                    fill="transparent"
                  />
                  <Defs>
                    <SvgLinearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                      <Stop offset="0%" stopColor={VIZ_GRADIENT[0]} />
                      <Stop offset="50%" stopColor={VIZ_GRADIENT[1]} />
                      <Stop offset="100%" stopColor={VIZ_GRADIENT[2]} />
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
                  <Text style={[styles.ringKicker, { color: t.textTertiary }]}>Estimado</Text>
                  <Text style={[styles.ringValue, { color: t.textPrimary }]}>{gasto}</Text>
                  <Text style={[styles.ringUnit, { color: t.textTertiary }]}>kcal / día</Text>
                </View>
              </View>

              <View style={styles.content}>
                <Text style={[styles.body, { color: t.textSecondary }]}>
                  Energía total que tu cuerpo{" "}
                  <Text style={[styles.bodyStrong, { color: t.textPrimary }]}>gasta a diario</Text>{" "}
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
                          backgroundColor: isDark ? t.border : t.surface,
                          borderColor: t.border,
                        },
                      ]}
                    >
                      <Text style={[styles.refChipText, { color: t.textSecondary }]}>
                        {r.label}: {r.val} kcal
                      </Text>
                    </View>
                  ))}
                </View>

                <View
                  style={[
                    styles.barTrack,
                    {
                      backgroundColor: isDark ? t.border : t.surface,
                      borderColor: t.border,
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

            <Text style={[styles.footnote, { color: t.textTertiary }]}>
              Basado en la fórmula de Mifflin–St Jeor. Este valor es una estimación y puede variar
              según múltiples factores.
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
  chip: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    maxWidth: 220,
  },
  chipText: {
    fontSize: 11,
    fontFamily: Font.body.regular,
    lineHeight: 14,
  },
  chipTextStrong: {
    fontWeight: "700",
    fontFamily: Font.body.bold,
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
  metricsRow: {
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
  mainRow: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
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
    fontFamily: Font.body.semiBold,
  },
  ringValue: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: "900",
    fontFamily: Font.title.bold,
    letterSpacing: -0.4,
    marginTop: 2,
  },
  ringUnit: {
    fontSize: 11,
    lineHeight: 12,
    fontWeight: "600",
    fontFamily: Font.body.semiBold,
    marginTop: 0,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  body: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: Font.body.regular,
  },
  bodyStrong: {
    fontWeight: "800",
    fontFamily: Font.body.bold,
  },
  refsRow: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  refChip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  refChipText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "600",
    fontFamily: Font.body.semiBold,
  },
  barTrack: {
    marginTop: 12,
    height: 10,
    borderRadius: 999,
    overflow: "hidden",
    borderWidth: 1,
  },
  barFill: {
    height: "100%",
  },
  footnote: {
    marginTop: 16,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "600",
    fontFamily: Font.body.semiBold,
  },
});
