// src/shared/components/estadistica/ActividadRecienteCard.tsx
import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
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
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [cardWidth, setCardWidth] = useState(0);
  const chartWidth = Math.max(0, cardWidth - 24);

  const normalized = useMemo(() => {
    const map = new Map<string, number>();
    for (const d of detallePorDia ?? []) {
      const k = d.fecha.slice(0, 10);
      map.set(k, (d.sesiones ?? 0) + (map.get(k) ?? 0));
    }
    const days: { nombreDia: string; sesiones: number }[] = [];
    const now = new Date();
    const nowY = now.getUTCFullYear();
    const nowM = now.getUTCMonth();
    const nowD = now.getUTCDate();
    for (let i = 6; i >= 0; i--) {
      const dt = new Date(Date.UTC(nowY, nowM, nowD - i, 12, 0, 0));
      const iso = dt.toISOString().slice(0, 10);
      const nombre = dt
        .toLocaleDateString("es-ES", { weekday: "short", timeZone: "UTC" })
        .replace(/\.$/, "");
      days.push({
        nombreDia: (nombre.charAt(0).toUpperCase() + nombre.slice(1)).substring(0, 3),
        sesiones: map.get(iso) ?? 0,
      });
    }
    return days;
  }, [detallePorDia]);

  const labels = useMemo(() => normalized.map((d) => d.nombreDia.substring(0, 3)), [normalized]);
  const values = useMemo(() => normalized.map((d) => d.sesiones || 0), [normalized]);
  const noData = values.every((v) => v === 0);

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
      onLayout={(e) => setCardWidth(e.nativeEvent.layout.width)}
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
  const t = scheme(isDark);

  return (
    <View style={styles.cardBody}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: t.textPrimary }]}>
            Actividad reciente
          </Text>
          <Text style={[styles.headerSubtitle, { color: t.textSecondary }]}>
            Últimos 7 días
          </Text>
        </View>
      </View>

      <View style={styles.chartWrapper}>
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
      </View>

      <View style={styles.footer}>
        <Kpi label="Días activos" value={diasActivos} isDark={isDark} />
        <Kpi label="Total sesiones" value={totalSesiones} isDark={isDark} />
      </View>
    </View>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────────
function EmptyState({ isDark }: { isDark: boolean }) {
  const t = scheme(isDark);

  return (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIcon, { backgroundColor: isDark ? t.border : t.surface }]}>
        <Text style={styles.emptyIconText}>📊</Text>
      </View>
      <Text style={[styles.emptyTitle, { color: t.textPrimary }]}>Faltan datos</Text>
      <Text style={[styles.emptySubtitle, { color: t.textSecondary }]}>
        Cuando registres sesiones, verás tu progreso aquí.
      </Text>
    </View>
  );
}

// ── Kpi ───────────────────────────────────────────────────────────────────────
function Kpi({ label, value, isDark }: { label: string; value: number; isDark: boolean }) {
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
      <Text style={[styles.kpiValue, { color: t.textPrimary }]}>{value}</Text>
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
  emptyTitle: { fontSize: 14, fontWeight: "600", fontFamily: Font.body.semiBold },
  emptySubtitle: { fontSize: 12, fontFamily: Font.body.regular, marginTop: 4, textAlign: "center" },
});
