// src/shared/components/estadistica/DiasColorEstresCard.tsx
import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useColorScheme } from "nativewind";
import { LinearGradient } from "expo-linear-gradient";
import { ThermometerSun } from "lucide-react-native";

// ── Tokens (mismo sistema compartido) ────────────────────────────────────────
const tokens = {
  color: {
    frameGradient: ["#00E85A", "#A855F7"] as string[],

    cardBgDark: "rgba(15,24,41,0.75)",
    cardBgLight: "#FFFFFF",
    cardBorderDark: "rgba(255,255,255,0.08)",
    cardBorderLight: "rgba(0,0,0,0.06)",

    iconBgDark: "rgba(251,191,36,0.10)",
    iconBgLight: "rgba(252,211,77,0.25)",
    iconAmberDark: "#FBBF24",
    iconAmberLight: "#D97706",

    trackDark: "rgba(15,23,42,0.9)",
    trackLight: "#E5E7EB",

    green: "#22C55E",
    amber: "#F59E0B",
    red: "#EF4444",

    calendarNeutralDark: "rgba(15,23,42,0.9)",
    calendarNeutralLight: "#F4F4F5",
    calendarBorderDark: "rgba(148,163,184,0.35)",
    calendarBorderLight: "#E4E4E7",

    textPrimaryDark: "#F1F5F9",
    textPrimaryLight: "#0F172A",
    textSecondaryDark: "#64748B",
    textSecondaryLight: "#64748B",
    textMutedDark: "#94A3B8",
    textMutedLight: "#6B7280",

    emptyIconBgDark: "rgba(255,255,255,0.10)",
    emptyIconBgLight: "#F1F5F9",
    emptyTitleDark: "#E5E7EB",
    emptyTitleLight: "#334155",
    emptySubtitleDark: "#94A3B8",
    emptySubtitleLight: "#64748B",
  },
  radius: { lg: 16, md: 12, sm: 8 },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20 },
} as const;

type ResumenEstres = {
  verde?: number;
  ambar?: number;
  rojo?: number;
};

type DetalleDia = {
  fecha?: string;
  nivelEstres?: number;
  color?: "verde" | "ambar" | "rojo";
};

type Props = {
  diasActivos?: number;
  resumen?: ResumenEstres;
  detalles?: DetalleDia[];
};

const DiasColorEstresCard: React.FC<Props> = ({ diasActivos, resumen, detalles }) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const totalVerde = resumen?.verde ?? 0;
  const totalAmbar = resumen?.ambar ?? 0;
  const totalRojo = resumen?.rojo ?? 0;

  const total = totalVerde + totalAmbar + totalRojo;
  const safeDiasActivos = diasActivos ?? total;

  const pct = (count: number) => (total > 0 ? Math.round((count / total) * 100) : 0);
  const hasData = total > 0;

  return (
    <View style={styles.root}>
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
          {hasData ? (
            <CardBody
              isDark={isDark}
              diasActivos={safeDiasActivos}
              totalVerde={totalVerde}
              totalAmbar={totalAmbar}
              totalRojo={totalRojo}
              total={total}
              pct={pct}
              detalles={detalles}
            />
          ) : (
            <EmptyState isDark={isDark} />
          )}
        </View>
      </LinearGradient>
    </View>
  );
};

export default DiasColorEstresCard;

function CardBody({
  isDark,
  diasActivos,
  totalVerde,
  totalAmbar,
  totalRojo,
  total,
  pct,
  detalles,
}: {
  isDark: boolean;
  diasActivos: number;
  totalVerde: number;
  totalAmbar: number;
  totalRojo: number;
  total: number;
  pct: (count: number) => number;
  detalles?: DetalleDia[];
}) {
  const textPrimary = isDark ? tokens.color.textPrimaryDark : tokens.color.textPrimaryLight;
  const textSecondary = isDark ? tokens.color.textSecondaryDark : tokens.color.textSecondaryLight;
  const textMuted = isDark ? tokens.color.textMutedDark : tokens.color.textMutedLight;

  const verdePct = total > 0 ? (totalVerde / total) * 100 : 0;
  const ambarPct = total > 0 ? (totalAmbar / total) * 100 : 0;
  const rojoPct = total > 0 ? (totalRojo / total) * 100 : 0;

  return (
    <View style={styles.cardBody}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.iconWrap,
              { backgroundColor: isDark ? tokens.color.iconBgDark : tokens.color.iconBgLight },
            ]}
          >
            <ThermometerSun
              size={18}
              color={isDark ? tokens.color.iconAmberDark : tokens.color.iconAmberLight}
            />
          </View>

          <View>
            <Text style={[styles.headerTitle, { color: textPrimary }]}>Días por nivel de estrés</Text>
            <Text style={[styles.headerSubtitle, { color: textSecondary }]}>
              Mapa de cómo se han sentido tus entrenos
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <Text style={[styles.headerKpiLabel, { color: textMuted }]}>Días activos</Text>
          <Text style={[styles.headerKpiValue, { color: textPrimary }]}>{diasActivos || "–"}</Text>
        </View>
      </View>

      <View style={styles.summary}>
        <View
          style={[
            styles.stackedBar,
            { backgroundColor: isDark ? tokens.color.trackDark : tokens.color.trackLight },
          ]}
        >
          <View style={{ width: `${verdePct}%`, backgroundColor: tokens.color.green }} />
          <View style={{ width: `${ambarPct}%`, backgroundColor: tokens.color.amber }} />
          <View style={{ width: `${rojoPct}%`, backgroundColor: tokens.color.red }} />
        </View>

        <View style={styles.legendRow}>
          <LegendItem
            isDark={isDark}
            color={tokens.color.green}
            label="Días suaves"
            value={totalVerde}
            pct={pct(totalVerde)}
          />
          <LegendItem
            isDark={isDark}
            color={tokens.color.amber}
            label="Días moderados"
            value={totalAmbar}
            pct={pct(totalAmbar)}
          />
          <LegendItem
            isDark={isDark}
            color={tokens.color.red}
            label="Días muy duros"
            value={totalRojo}
            pct={pct(totalRojo)}
          />
        </View>
      </View>

      {detalles && detalles.length > 0 && (
        <View style={styles.calendarWrap}>
          <CalendarHeatmap isDark={isDark} detalles={detalles} />
        </View>
      )}

      <View style={styles.note}>
        <Text style={[styles.noteText, { color: textSecondary }]}>
          Busca muchos días en verde, algunos ámbar y pocos rojos: así construyes progreso sin
          pasarte de carga.
        </Text>
      </View>
    </View>
  );
}

function LegendItem({
  isDark,
  color,
  label,
  value,
  pct,
}: {
  isDark: boolean;
  color: string;
  label: string;
  value: number;
  pct: number;
}) {
  const textPrimary = isDark ? tokens.color.textPrimaryDark : "#4B5563";
  const valueColor = isDark ? tokens.color.textPrimaryDark : tokens.color.textPrimaryLight;

  return (
    <View style={styles.legendItem}>
      <View style={styles.legendTop}>
        <View style={[styles.legendDot, { backgroundColor: color }]} />
        <Text numberOfLines={1} style={[styles.legendLabel, { color: textPrimary }]}>
          {label}
        </Text>
      </View>
      <Text style={[styles.legendValue, { color: valueColor }]}>
        {value} ({pct}%)
      </Text>
    </View>
  );
}

function CalendarHeatmap({ isDark, detalles }: { isDark: boolean; detalles: DetalleDia[] }) {
  const textPrimary = isDark ? tokens.color.textPrimaryDark : tokens.color.textPrimaryLight;
  const textSecondary = isDark ? tokens.color.textSecondaryDark : tokens.color.textMutedLight;
  const textMuted = isDark ? tokens.color.textSecondaryDark : tokens.color.textMutedLight;

  const dayMap = useMemo(() => {
    const map = new Map<string, "verde" | "ambar" | "rojo">();
    for (const d of detalles) {
      if (!d.fecha) continue;

      let c: "verde" | "ambar" | "rojo";
      if (d.color) {
        c = d.color;
      } else if (typeof d.nivelEstres === "number") {
        c = d.nivelEstres <= 4 ? "verde" : d.nivelEstres <= 7 ? "ambar" : "rojo";
      } else {
        c = "verde";
      }

      const key = new Date(d.fecha).toISOString().slice(0, 10);
      map.set(key, c);
    }
    return map;
  }, [detalles]);

  const refDate = useMemo(() => {
    if (!detalles.length) return new Date();
    const validDates = detalles
      .map((d) => (d.fecha ? new Date(d.fecha) : null))
      .filter((d): d is Date => !!d && !Number.isNaN(d.getTime()));
    if (!validDates.length) return new Date();
    return validDates.reduce((a, b) => (b > a ? b : a));
  }, [detalles]);

  const year = refDate.getFullYear();
  const month = refDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);
  const firstWeekday = firstOfMonth.getDay();
  const daysInMonth = lastOfMonth.getDate();

  const startOffset = (firstWeekday - 1 + 7) % 7;

  const cells: { key: string; dayNumber: number | null; color: "verde" | "ambar" | "rojo" | null }[] =
    [];

  for (let i = 0; i < startOffset; i++) {
    cells.push({ key: `empty-${i}`, dayNumber: null, color: null });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    const key = d.toISOString().slice(0, 10);
    const c = dayMap.get(key) ?? null;
    cells.push({ key, dayNumber: day, color: c });
  }

  const bgNeutral = isDark ? tokens.color.calendarNeutralDark : tokens.color.calendarNeutralLight;

  const getBg = (c: "verde" | "ambar" | "rojo" | null) => {
    if (c === "verde") return tokens.color.green;
    if (c === "ambar") return tokens.color.amber;
    if (c === "rojo") return tokens.color.red;
    return bgNeutral;
  };

  const getTextColor = (c: "verde" | "ambar" | "rojo" | null) => {
    if (!c) return isDark ? "#CBD5F5" : "#4B5563";
    return "#F9FAFB";
  };

  const monthName = refDate.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
  const weekdayLabels = ["L", "M", "X", "J", "V", "S", "D"];
  const cellSize = 32;

  return (
    <View>
      <View style={styles.calHeader}>
        <Text style={[styles.calTitle, { color: textPrimary }]}>Calendario de estrés</Text>
        <Text style={[styles.calMonth, { color: textSecondary }]}>
          {monthName.charAt(0).toUpperCase() + monthName.slice(1)}
        </Text>
      </View>

      <View style={styles.weekdays}>
        {weekdayLabels.map((d) => (
          <View key={d} style={styles.weekdayCell}>
            <Text style={[styles.weekdayText, { color: textMuted }]}>{d}</Text>
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((cell) => {
          if (cell.dayNumber == null) {
            return <View key={cell.key} style={{ width: `${100 / 7}%`, height: cellSize, marginBottom: 4 }} />;
          }

          const bg = getBg(cell.color);
          const tColor = getTextColor(cell.color);
          const borderWidth = cell.color ? 0 : 1;
          const borderColor = isDark ? tokens.color.calendarBorderDark : tokens.color.calendarBorderLight;

          return (
            <View key={cell.key} style={styles.gridCellWrap}>
              <View
                style={[
                  styles.gridCell,
                  {
                    width: cellSize,
                    height: cellSize,
                    backgroundColor: bg,
                    borderWidth,
                    borderColor,
                  },
                ]}
              >
                <Text style={[styles.gridDay, { color: tColor }]}>{cell.dayNumber}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function EmptyState({ isDark }: { isDark: boolean }) {
  return (
    <View style={styles.emptyState}>
      <View
        style={[
          styles.emptyIcon,
          { backgroundColor: isDark ? tokens.color.emptyIconBgDark : tokens.color.emptyIconBgLight },
        ]}
      >
        <Text style={{ color: isDark ? tokens.color.emptyTitleDark : tokens.color.emptySubtitleLight }}>🌡️</Text>
      </View>
      <Text
        style={[
          styles.emptyTitle,
          { color: isDark ? tokens.color.emptyTitleDark : tokens.color.emptyTitleLight },
        ]}
      >
        Aún no hay días con nivel de estrés
      </Text>
      <Text
        style={[
          styles.emptySubtitle,
          { color: isDark ? tokens.color.emptySubtitleDark : tokens.color.emptySubtitleLight },
        ]}
      >
        Marca cómo te sientes al guardar tus sesiones y aquí verás el patrón de días suaves,
        moderados y muy duros.
      </Text>
    </View>
  );
}

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

  cardBody: {
    borderRadius: tokens.radius.lg - 1,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: tokens.spacing.lg,
    paddingTop: tokens.spacing.xl,
    paddingBottom: tokens.spacing.md,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.md,
    flexShrink: 1,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: tokens.radius.lg,
    alignItems: "center",
    justifyContent: "center",
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
  headerRight: {
    alignItems: "flex-end",
  },
  headerKpiLabel: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  headerKpiValue: {
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 24,
  },

  summary: {
    paddingHorizontal: tokens.spacing.lg,
    marginTop: tokens.spacing.xs,
    marginBottom: tokens.spacing.md,
  },
  stackedBar: {
    height: 12,
    borderRadius: 999,
    overflow: "hidden",
    flexDirection: "row",
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: tokens.spacing.sm,
    gap: tokens.spacing.sm,
  },
  legendItem: {
    flex: 1,
  },
  legendTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  legendLabel: {
    fontSize: 11,
  },
  legendValue: {
    fontSize: 13,
    fontWeight: "700",
    marginTop: 2,
  },

  calendarWrap: {
    paddingHorizontal: tokens.spacing.lg,
    paddingBottom: tokens.spacing.lg,
  },
  calHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: tokens.spacing.sm,
  },
  calTitle: {
    fontSize: 12,
    fontWeight: "600",
  },
  calMonth: {
    fontSize: 11,
  },
  weekdays: {
    flexDirection: "row",
    marginBottom: tokens.spacing.xs,
  },
  weekdayCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 2,
  },
  weekdayText: {
    fontSize: 11,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  gridCellWrap: {
    width: `${100 / 7}%`,
    alignItems: "center",
    marginBottom: 4,
  },
  gridCell: {
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  gridDay: {
    fontSize: 12,
    fontWeight: "700",
  },

  note: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: tokens.spacing.lg,
    paddingTop: tokens.spacing.md,
    paddingBottom: tokens.spacing.lg,
  },
  noteText: { fontSize: 11 },

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
