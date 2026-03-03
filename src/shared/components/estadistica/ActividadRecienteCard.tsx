// File: src/features/fit/components/ActividadRecienteCard.tsx
import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useColorScheme } from "nativewind";
import { LinearGradient } from "expo-linear-gradient";
import { LineChart } from "react-native-chart-kit";

// ── Tokens (mismo sistema compartido) ────────────────────────────────────────
const tokens = {
  color: {
    // Frame gradient (FIX: 2 colores en vez de 3)
    frameGradient: ["#00E85A", "#A855F7"] as string[],

    // Card interior (FIX: eliminado el gradiente de 3 colores en dark)
    cardBgDark: "rgba(15,24,41,0.75)",
    cardBgLight: "#FFFFFF",
    cardBorderDark: "rgba(255,255,255,0.08)",
    cardBorderLight: "rgba(0,0,0,0.06)",

    // Empty state icon
    emptyIconBgDark: "rgba(255,255,255,0.08)",
    emptyIconBgLight: "#F1F5F9",

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
  radius: { lg: 16, md: 12, sm: 8 },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20 },
} as const;

// ── Tipos — API pública sin cambios ───────────────────────────────────────────
type SesionDia = { fecha: string; sesiones: number };
type Props = {
  diasActivos?: number;
  totalSesiones?: number;
  detallePorDia?: SesionDia[];
};

// ── Componente ────────────────────────────────────────────────────────────────
export default function ActividadRecienteCard({
  diasActivos = 0,
  totalSesiones = 0,
  detallePorDia = [],
}: Props) {
  // ── Lógica original — sin cambios ─────────────────────────────────────────
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [cardWidth, setCardWidth] = useState(0);
  const chartWidth = Math.max(0, cardWidth - 24);

  const normalized = useMemo(() => {
    const map = new Map<string, number>();
    for (const d of detallePorDia ?? []) {
      const k = new Date(d.fecha).toISOString().slice(0, 10);
      map.set(k, (d.sesiones ?? 0) + (map.get(k) ?? 0));
    }
    const days: { nombreDia: string; sesiones: number }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const dt = new Date(now);
      dt.setDate(now.getDate() - i);
      const iso = dt.toISOString().slice(0, 10);
      const nombre = dt.toLocaleDateString("es-ES", { weekday: "short" }).replace(/\.$/, "");
      days.push({
        nombreDia: nombre.charAt(0).toUpperCase() + nombre.slice(1),
        sesiones: map.get(iso) ?? 0,
      });
    }
    return days;
  }, [detallePorDia]);

  const labels = useMemo(() => normalized.map((d) => d.nombreDia.substring(0, 3)), [normalized]);
  const values = useMemo(() => normalized.map((d) => d.sesiones || 0), [normalized]);
  const noData = values.every((v) => v === 0);
  // ── Fin lógica original ───────────────────────────────────────────────────

  const chartConfig = {
    backgroundColor: isDark ? tokens.color.chartBgDark : tokens.color.chartBgLight,
    backgroundGradientFrom: isDark ? tokens.color.chartBgDark : tokens.color.chartBgLight,
    backgroundGradientTo: isDark ? tokens.color.chartBgDark : tokens.color.chartBgLight,
    decimalPlaces: 0,
    color: (opacity = 1) => isDark
      ? `rgba(34,197,94,${opacity})`
      : `rgba(22,163,74,${opacity})`,
    labelColor: (opacity = 1) => isDark
      ? `rgba(100,116,139,${opacity})`
      : `rgba(100,116,139,${opacity})`,
    propsForDots: { r: "4" },
    propsForBackgroundLines: {
      stroke: isDark ? tokens.color.chartGridDark : tokens.color.chartGridLight,
      strokeDasharray: "",
    },
    fillShadowGradient: isDark ? tokens.color.chartFillDark : tokens.color.chartFillLight,
    fillShadowGradientOpacity: isDark ? 0.25 : 0.15,
  } as const;

  return (
    <View
      style={styles.root}
      onLayout={(e) => setCardWidth(e.nativeEvent.layout.width)}
    >
      <LinearGradient
        colors={tokens.color.frameGradient as any}
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
          {noData ? (
            <EmptyState isDark={isDark} />
          ) : (
            <CardBody
              isDark={isDark}
              labels={labels}
              values={values}
              chartWidth={chartWidth}
              diasActivos={diasActivos}
              totalSesiones={totalSesiones}
              chartConfig={chartConfig}
            />
          )}
        </View>
      </LinearGradient>
    </View>
  );
}

// ── CardBody ──────────────────────────────────────────────────────────────────
function CardBody({
  isDark, labels, values, chartWidth, diasActivos, totalSesiones, chartConfig,
}: {
  isDark: boolean;
  labels: string[];
  values: number[];
  chartWidth: number;
  diasActivos: number;
  totalSesiones: number;
  chartConfig: any;
}) {
  const textPrimary = isDark ? tokens.color.textPrimaryDark : tokens.color.textPrimaryLight;
  const textSecondary = isDark ? tokens.color.textSecondaryDark : tokens.color.textSecondaryLight;

  return (
    <View style={styles.cardBody}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: textPrimary }]}>
            Actividad reciente
          </Text>
          <Text style={[styles.headerSubtitle, { color: textSecondary }]}>
            Últimos 7 días
          </Text>
        </View>
      </View>

      {/* Chart */}
      <View style={styles.chartWrapper}>
        <LineChart
          data={{
            labels,
            datasets: [{ data: values, strokeWidth: 3 }],
          }}
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
      </View>

      {/* Footer KPIs */}
      <View style={styles.footer}>
        <Kpi label="Días activos" value={diasActivos} isDark={isDark} />
        <Kpi label="Total sesiones" value={totalSesiones} isDark={isDark} />
      </View>
    </View>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────────
function EmptyState({ isDark }: { isDark: boolean }) {
  const textPrimary = isDark ? tokens.color.textPrimaryDark : tokens.color.textMutedLight;
  const textMuted = isDark ? tokens.color.textMutedDark : tokens.color.textSecondaryLight;

  return (
    <View style={styles.emptyState}>
      <View
        style={[
          styles.emptyIcon,
          { backgroundColor: isDark ? tokens.color.emptyIconBgDark : tokens.color.emptyIconBgLight },
        ]}
      >
        <Text style={styles.emptyIconText}>📊</Text>
      </View>
      <Text style={[styles.emptyTitle, { color: textPrimary }]}>
        Faltan datos
      </Text>
      <Text style={[styles.emptySubtitle, { color: textMuted }]}>
        Cuando registres sesiones, verás tu progreso aquí.
      </Text>
    </View>
  );
}

// ── KpiMini ───────────────────────────────────────────────────────────────────
function KpiMini({ label, value, isDark }: { label: string; value: number; isDark: boolean }) {
  const textMuted = isDark ? tokens.color.textMutedDark : tokens.color.textSecondaryLight;
  const textPrimary = isDark ? tokens.color.textPrimaryDark : tokens.color.textPrimaryLight;

  return (
    <View style={styles.kpiMini}>
      <Text style={[styles.kpiMiniLabel, { color: textMuted }]}>
        {label}
      </Text>
      <Text style={[styles.kpiMiniValue, { color: textPrimary }]}>
        {value}
      </Text>
    </View>
  );
}

// ── Kpi ───────────────────────────────────────────────────────────────────────
function Kpi({ label, value, isDark }: { label: string; value: number; isDark: boolean }) {
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
      <Text style={[styles.kpiLabel, { color: textMuted }]}>
        {label}
      </Text>
      <Text style={[styles.kpiValue, { color: textPrimary }]}>
        {value}
      </Text>
    </View>
  );
}

// ── Estilos estáticos ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { width: "100%", maxWidth: 520 },

  frame: {
    borderRadius: tokens.radius.lg,
    padding: 1.5,
    overflow: "hidden",
  },

  card: {
    borderRadius: tokens.radius.lg - 1,
    borderWidth: 1,
    overflow: "hidden",
  },

  // Card body
  cardBody: {
    borderRadius: tokens.radius.lg - 1,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: tokens.spacing.lg,
    paddingTop: tokens.spacing.xl,
    paddingBottom: tokens.spacing.md,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.1,
  },
  headerSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },

  // KPI mini (header)
  kpiMiniRow: {
    flexDirection: "row",
    gap: tokens.spacing.lg + tokens.spacing.xs,
  },
  kpiMini: {
    alignItems: "flex-end",
  },
  kpiMiniLabel: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  kpiMiniValue: {
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 24,
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
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: tokens.radius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: tokens.spacing.lg,
  },
  emptyIconText: {
    fontSize: 28,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  emptySubtitle: {
    fontSize: 12,
    marginTop: tokens.spacing.xs,
    textAlign: "center",
  },
});