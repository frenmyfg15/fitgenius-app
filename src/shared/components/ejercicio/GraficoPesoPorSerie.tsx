// src/shared/components/ejercicio/GraficoPesoPorSerie.tsx
import React, { useMemo, useState, useCallback } from "react";
import { View, Text, StyleSheet, LayoutChangeEvent } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";

// ── Tokens (mismo sistema compartido que IMCVisual) ───────────────────────────
const tokens = {
  color: {
    // Frame gradient — 3 colores igual que IMCVisual
    gradientStart: "rgb(0,255,64)",
    gradientMid: "rgb(94,230,157)",
    gradientEnd: "rgb(178,0,255)",

    // Card interior
    cardBgDark: "rgba(15,24,41,1)",
    cardBgLight: "#FFFFFF",
    cardBorderDark: "rgba(255,255,255,0.08)",
    cardBorderLight: "rgba(0,0,0,0.06)",

    // Chart
    chartBgDark: "#020617",
    chartBgLight: "#FFFFFF",

    // Texto
    textPrimaryDark: "#F1F5F9",
    textPrimaryLight: "#0F172A",
    textSecondaryDark: "#94A3B8",
    textSecondaryLight: "#6B7280",
    textMutedDark: "#64748B",
    textMutedLight: "#71717A",
  },
  radius: { lg: 16, md: 12, sm: 8, full: 999 },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20 },
} as const;

const GRADIENT = [
  tokens.color.gradientStart,
  tokens.color.gradientMid,
  tokens.color.gradientEnd,
] as const;

// ── Tipos ─────────────────────────────────────────────────────────────────────
type SerieStats = {
  serieNumero: number;
  pesoKg: number | null;
  repeticiones?: number | null;
};

type Props = {
  series: SerieStats[];
  esCardio?: boolean;
};

// ── Componente ────────────────────────────────────────────────────────────────
export default function GraficoPesoPorSerie({ series, esCardio }: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const weightUnit = (useUsuarioStore((s) => s.usuario?.medidaPeso) ?? "kg").toLowerCase();
  const isCardioMode = Boolean(esCardio);
  const unit = isCardioMode ? "seg" : weightUnit;

  const [chartWidth, setChartWidth] = useState<number | null>(null);

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    const w = Math.round(e.nativeEvent.layout.width);
    if (!w) return;
    setChartWidth((prev) => (prev === w ? prev : w));
  }, []);

  const data = useMemo(() => {
    const puntos = (series ?? []).map((s) =>
      Number(isCardioMode ? s.repeticiones ?? 0 : s.pesoKg ?? 0)
    );
    const labels = (series ?? []).map((s) => `Set ${s.serieNumero}`);
    return { labels, datasets: [{ data: puntos }] };
  }, [series, isCardioMode]);

  const hasValues = useMemo(
    () => data.datasets[0].data.some((v) => v > 0),
    [data]
  );

  const titulo = isCardioMode
    ? "Evolución de tiempo por serie"
    : "Evolución de peso por serie";

  const chart = useMemo(() => {
    if (!chartWidth || chartWidth < 40) return null;
    return (
      <LineChart
        key={chartWidth}
        data={data}
        width={chartWidth}
        height={220}
        fromZero
        bezier
        chartConfig={{
          backgroundGradientFrom: isDark ? tokens.color.chartBgDark : tokens.color.chartBgLight,
          backgroundGradientTo: isDark ? tokens.color.chartBgDark : tokens.color.chartBgLight,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(34,197,94,${opacity})`,
          labelColor: (opacity = 1) =>
            isDark
              ? `rgba(226,232,240,${opacity})`
              : `rgba(15,23,42,${opacity})`,
          propsForDots: {
            r: "4",
            strokeWidth: "2",
            stroke: isDark ? tokens.color.chartBgDark : tokens.color.chartBgLight,
          },
        }}
        style={{ borderRadius: tokens.radius.lg }}
      />
    );
  }, [chartWidth, data, isDark]);

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
          {/* Header — misma tipografía que IMCVisual */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: textPrimary }]}>
              {titulo}
            </Text>
            <Text style={[styles.headerUnit, { color: textSecondary }]}>
              Unidad:{" "}
              <Text style={[styles.headerUnitValue, { color: textPrimary }]}>
                {unit}
              </Text>
            </Text>
          </View>

          {/* Chart */}
          <View style={styles.chartWrapper}>
            {hasValues ? (
              <View onLayout={handleLayout} style={styles.chartInner}>
                {chart}
              </View>
            ) : (
              <View style={styles.empty}>
                <Text style={[styles.emptyText, { color: textMuted }]}>
                  Sin datos suficientes para el gráfico.
                </Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

// ── Estilos estáticos ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    width: "100%",
    marginTop: tokens.spacing.xl + tokens.spacing.sm,
  },

  // Frame — valores exactos de IMCVisual
  frame: {
    borderRadius: tokens.radius.lg,
    padding: 1.5,
    overflow: "hidden",
  },

  // Card interior — sombra añadida igual que IMCVisual
  card: {
    borderRadius: tokens.radius.lg - 1,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  // Header — fontSize 13 + letterSpacing 0.2, igual que IMCVisual
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: tokens.spacing.lg,
    paddingBottom: tokens.spacing.sm,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  headerUnit: { fontSize: 11 },
  headerUnitValue: { fontWeight: "600" },

  // Chart
  chartWrapper: {
    paddingHorizontal: tokens.spacing.lg,
    paddingBottom: tokens.spacing.lg,
  },
  chartInner: {
    borderRadius: tokens.radius.lg,
    overflow: "hidden",
  },

  // Empty
  empty: {
    height: 224,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: { fontSize: 14 },
});