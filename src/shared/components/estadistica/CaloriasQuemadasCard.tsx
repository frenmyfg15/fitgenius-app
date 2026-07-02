// src/shared/components/estadistica/CaloriasQuemadasCard.tsx
import React, { useMemo, useState, useCallback } from "react";
import { View, Text, StyleSheet, LayoutChangeEvent } from "react-native";
import { useColorScheme } from "nativewind";
import { LineChart } from "react-native-chart-kit";
import { Colors, scheme } from "@/shared/constants/colors";
import { Font } from "@/shared/constants/typography";

// chart-specific colors kept as literals (data visualization)
const CHART = {
  bgDark: "#0F1829",
  bgLight: "#FFFFFF",
  gridDark: "#1F2937",
  gridLight: "#E5E7EB",
  fillDark: "#22C55E",
  fillLight: "#16A34A",
} as const;

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
      const dt = new Date(Date.UTC(fy, fm - 1, fd, 12, 0, 0));
      const nombre = dt
        .toLocaleDateString("es-ES", { weekday: "short", timeZone: "UTC" })
        .replace(/\.$/, "");
      L.push((nombre.charAt(0).toUpperCase() + nombre.slice(1)).substring(0, 3));
      V.push(Math.max(0, d.calorias ?? 0));
    }
    return { labels: L, values: V };
  }, [detalle]);

  const chartConfig = {
    backgroundColor: isDark ? CHART.bgDark : CHART.bgLight,
    backgroundGradientFrom: isDark ? CHART.bgDark : CHART.bgLight,
    backgroundGradientTo: isDark ? CHART.bgDark : CHART.bgLight,
    decimalPlaces: 0,
    color: (opacity = 1) =>
      isDark ? `rgba(34,197,94,${opacity})` : `rgba(22,163,74,${opacity})`,
    labelColor: (opacity = 1) => `rgba(100,116,139,${opacity})`,
    propsForDots: { r: "4" },
    propsForBackgroundLines: {
      stroke: isDark ? CHART.gridDark : CHART.gridLight,
      strokeDasharray: "",
    },
    fillShadowGradient: isDark ? CHART.fillDark : CHART.fillLight,
    fillShadowGradientOpacity: isDark ? 0.25 : 0.15,
  } as const;

  return (
    <View
      style={[styles.card, { backgroundColor: isDark ? Colors.dark.surface : Colors.secondary }]}
      onLayout={onLayout}
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
  const t = scheme(isDark);

  return (
    <View style={styles.cardBody}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: t.textPrimary }]}>
            Calorías quemadas
          </Text>
          <Text style={[styles.headerSubtitle, { color: t.textSecondary }]}>
            Resumen reciente
          </Text>
        </View>
      </View>

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
  const t = scheme(isDark);

  return (
    <View
      style={[
        styles.kpi,
        {
          backgroundColor: isDark ? t.border : t.surface,
          borderColor: t.border,
        },
      ]}
    >
      <Text style={[styles.kpiLabel, { color: t.textTertiary }]}>{label}</Text>
      <Text style={[styles.kpiValue, { color: t.textPrimary }]}>
        {value}
        {suffix ? <Text style={{ color: t.textTertiary }}> {suffix}</Text> : null}
      </Text>
    </View>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────────
function EmptyState({ isDark }: { isDark: boolean }) {
  const t = scheme(isDark);

  return (
    <View style={[styles.emptyState, { borderTopColor: t.border }]}>
      <View style={[styles.emptyIcon, { backgroundColor: isDark ? t.border : t.surface }]}>
        <Text style={styles.emptyIconText}>📊</Text>
      </View>
      <Text style={[styles.emptyTitle, { color: t.textPrimary }]}>
        No hay datos de calorías para mostrar.
      </Text>
      <Text style={[styles.emptySubtitle, { color: t.textSecondary }]}>
        Registra tus sesiones para ver tu progreso aquí.
      </Text>
    </View>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    width: "100%",
    maxWidth: 520,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.accentBorder,
    overflow: "hidden",
  },

  cardBody: { borderRadius: 16 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: "700",
    fontFamily: Font.body.bold,
    letterSpacing: 0.2,
  },
  headerSubtitle: { fontSize: 11, fontFamily: Font.body.regular, marginTop: 2 },

  chartWrapper: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  kpi: {
    flex: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: "600",
    fontFamily: Font.body.semiBold,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    textAlign: "center",
  },
  kpiValue: {
    fontSize: 17,
    fontWeight: "700",
    fontFamily: Font.title.bold,
    textAlign: "center",
    marginTop: 2,
  },

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 36,
    paddingHorizontal: 20,
    borderTopWidth: 1,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyIconText: { fontSize: 28 },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: Font.body.semiBold,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 12,
    fontFamily: Font.body.regular,
    marginTop: 4,
    textAlign: "center",
  },
});
