// src/features/premium/CaloriasQuemadasCard.tsx
import React, { useMemo, useState, useCallback } from "react";
import { View, Text, StyleSheet, LayoutChangeEvent } from "react-native";
import { useColorScheme } from "nativewind";
import { LinearGradient } from "expo-linear-gradient";
import { LineChart } from "react-native-chart-kit";

// ── Tokens (mismo sistema compartido que IMCVisual) ───────────────────────────
const tokens = {
  color: {
    // Frame gradient — 3 colores igual que IMCVisual
    gradientStart: "rgb(0,255,64)",
    gradientMid: "rgb(94,230,157)",
    gradientEnd: "rgb(178,0,255)",

    // Card interior
    cardBgDark: "rgba(15,24,41,1)",   // opaco, igual que IMCVisual
    cardBgLight: "#FFFFFF",
    cardBorderDark: "rgba(255,255,255,0.08)",
    cardBorderLight: "rgba(0,0,0,0.06)",

    // Empty state
    emptyIconBgDark: "rgba(255,255,255,0.08)",
    emptyIconBgLight: "#F1F5F9",
    emptyBorderDark: "rgba(255,255,255,0.10)",
    emptyBorderLight: "rgba(0,0,0,0.06)",

    // KPI cards
    kpiBgDark: "rgba(255,255,255,0.05)",
    kpiBgLight: "rgba(255,255,255,0.80)",
    kpiBorderDark: "rgba(255,255,255,0.09)",
    kpiBorderLight: "#E2E8F0",

    // Texto
    textPrimaryDark: "#F1F5F9",
    textPrimaryLight: "#0F172A",
    textSecondaryDark: "#64748B",
    textSecondaryLight: "#64748B",
    textMutedDark: "#94A3B8",
    textMutedLight: "#475569",

    // Chart
    chartLineDark: "rgba(34,197,94,1)",
    chartLineLight: "rgba(22,163,74,1)",
    chartFillDark: "#22C55E",
    chartFillLight: "#16A34A",
    chartBgDark: "#0F1829",
    chartBgLight: "#FFFFFF",
    chartGridDark: "#1F2937",
    chartGridLight: "#E5E7EB",
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
type Props = {
  total: number;
  promedio: number;
  detalle: { fecha: string; calorias: number }[];
};

// ── Componente ────────────────────────────────────────────────────────────────
export default function CaloriasQuemadasCard({ total, promedio, detalle }: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [cardWidth, setCardWidth] = useState(0);
  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setCardWidth(e.nativeEvent.layout.width);
  }, []);
  const chartWidth = Math.max(0, cardWidth - 24);

  const hasData = Array.isArray(detalle) && detalle.length > 0 && total > 0;

  const { labels, values } = useMemo(() => {
    const L: string[] = [];
    const V: number[] = [];
    for (const d of detalle ?? []) {
      const [fy, fm, fd] = d.fecha.slice(0, 10).split("-").map(Number);
      const dt = new Date(fy, fm - 1, fd);
      const nombre = dt
        .toLocaleDateString("es-ES", { weekday: "short" })
        .replace(/\.$/, "");
      L.push((nombre.charAt(0).toUpperCase() + nombre.slice(1)).substring(0, 3));
      V.push(Math.max(0, d.calorias ?? 0));
    }
    return { labels: L, values: V };
  }, [detalle]);

  const chartConfig = {
    backgroundColor: isDark ? tokens.color.chartBgDark : tokens.color.chartBgLight,
    backgroundGradientFrom: isDark ? tokens.color.chartBgDark : tokens.color.chartBgLight,
    backgroundGradientTo: isDark ? tokens.color.chartBgDark : tokens.color.chartBgLight,
    decimalPlaces: 0,
    color: (opacity = 1) =>
      isDark ? `rgba(34,197,94,${opacity})` : `rgba(22,163,74,${opacity})`,
    labelColor: (opacity = 1) => `rgba(100,116,139,${opacity})`,
    propsForDots: { r: "4" },
    propsForBackgroundLines: {
      stroke: isDark ? tokens.color.chartGridDark : tokens.color.chartGridLight,
      strokeDasharray: "",
    },
    fillShadowGradient: isDark ? tokens.color.chartFillDark : tokens.color.chartFillLight,
    fillShadowGradientOpacity: isDark ? 0.25 : 0.15,
  } as const;

  return (
    <View style={styles.root} onLayout={onLayout}>
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
          <CardBody
            isDark={isDark}
            labels={labels}
            values={values}
            total={total}
            promedio={promedio}
            chartWidth={chartWidth}
            chartConfig={chartConfig}
            hasData={hasData}
          />
        </View>
      </LinearGradient>
    </View>
  );
}

// ── CardBody ──────────────────────────────────────────────────────────────────
function CardBody({
  isDark, labels, values, total, promedio, chartWidth, chartConfig, hasData,
}: {
  isDark: boolean;
  labels: string[];
  values: number[];
  total: number;
  promedio: number;
  chartWidth: number;
  chartConfig: any;
  hasData: boolean;
}) {
  const textPrimary = isDark ? tokens.color.textPrimaryDark : tokens.color.textPrimaryLight;
  const textSecondary = isDark ? tokens.color.textSecondaryDark : tokens.color.textSecondaryLight;

  return (
    <View style={styles.cardBody}>
      {/* Header — misma tipografía que IMCVisual */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: textPrimary }]}>
            Calorías quemadas
          </Text>
          <Text style={[styles.headerSubtitle, { color: textSecondary }]}>
            Resumen reciente
          </Text>
        </View>
      </View>

      {/* Chart / Empty */}
      <View style={styles.chartWrapper}>
        {hasData ? (
          <LineChart
            data={{ labels, datasets: [{ data: values, strokeWidth: 3 }] }}
            width={chartWidth}
            height={220}
            yAxisInterval={1}
            fromZero
            withInnerLines
            withOuterLines={false}
            withShadow
            withDots
            bezier
            chartConfig={chartConfig}
            formatYLabel={() => ""}
            segments={4}
          />
        ) : (
          <EmptyState isDark={isDark} />
        )}
      </View>

      {/* Footer KPIs */}
      <View style={styles.footer}>
        <Kpi label="Total" value={total} suffix="kcal" isDark={isDark} />
        <Kpi label="Promedio" value={promedio} suffix="kcal" isDark={isDark} />
      </View>
    </View>
  );
}

// ── Kpi ───────────────────────────────────────────────────────────────────────
function Kpi({
  label, value, suffix, isDark,
}: {
  label: string;
  value: number;
  suffix?: string;
  isDark: boolean;
}) {
  const textMuted = isDark ? tokens.color.textMutedDark : tokens.color.textSecondaryLight;
  const textPrimary = isDark ? tokens.color.textPrimaryDark : tokens.color.textPrimaryLight;

  return (
    <View
      style={[
        styles.kpi,
        {
          backgroundColor: isDark ? tokens.color.kpiBgDark : tokens.color.kpiBgLight,
          borderColor: isDark ? tokens.color.kpiBorderDark : tokens.color.kpiBorderLight,
        },
      ]}
    >
      <Text style={[styles.kpiLabel, { color: textMuted }]}>{label}</Text>
      <Text style={[styles.kpiValue, { color: textPrimary }]}>
        {value}
        {suffix ? <Text style={{ color: textMuted }}> {suffix}</Text> : null}
      </Text>
    </View>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────────
function EmptyState({ isDark }: { isDark: boolean }) {
  const textPrimary = isDark ? tokens.color.textPrimaryDark : tokens.color.textMutedLight;
  const textMuted = isDark ? tokens.color.textMutedDark : tokens.color.textSecondaryLight;

  return (
    <View
      style={[
        styles.emptyState,
        {
          borderTopColor: isDark
            ? tokens.color.emptyBorderDark
            : tokens.color.emptyBorderLight,
        },
      ]}
    >
      <View
        style={[
          styles.emptyIcon,
          {
            backgroundColor: isDark
              ? tokens.color.emptyIconBgDark
              : tokens.color.emptyIconBgLight,
          },
        ]}
      >
        <Text style={styles.emptyIconText}>📊</Text>
      </View>
      <Text style={[styles.emptyTitle, { color: textPrimary }]}>
        No hay datos de calorías para mostrar.
      </Text>
      <Text style={[styles.emptySubtitle, { color: textMuted }]}>
        Registra tus sesiones para ver tu progreso aquí.
      </Text>
    </View>
  );
}

// ── Estilos estáticos ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { width: "100%", maxWidth: 520 },

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

  cardBody: {
    borderRadius: tokens.radius.lg - 1,
  },

  // Header — fontSize 13 + letterSpacing 0.2, igual que IMCVisual
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: tokens.spacing.lg,
    paddingTop: tokens.spacing.xl,
    paddingBottom: tokens.spacing.md,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },

  // Chart
  chartWrapper: {
    paddingHorizontal: tokens.spacing.md,
    paddingBottom: tokens.spacing.lg + tokens.spacing.xs,
  },

  // Footer KPIs
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: tokens.spacing.lg,
    gap: tokens.spacing.md,
  },
  kpi: {
    flex: 1,
    borderRadius: tokens.radius.md,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    borderWidth: 1,
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    textAlign: "center",
  },
  kpiValue: {
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 2,
  },

  // Empty state
  emptyState: {
    borderRadius: tokens.radius.lg - 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: tokens.spacing.xl + tokens.spacing.lg,
    paddingHorizontal: tokens.spacing.xl,
    borderTopWidth: 1,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: tokens.radius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: tokens.spacing.lg,
  },
  emptyIconText: { fontSize: 28 },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 12,
    marginTop: tokens.spacing.xs,
    textAlign: "center",
  },
});