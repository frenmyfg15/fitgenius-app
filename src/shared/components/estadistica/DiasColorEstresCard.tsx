// src/shared/components/estadistica/DiasColorEstresCard.tsx
import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useColorScheme } from "nativewind";
import { ThermometerSun } from "lucide-react-native";
import { Colors, scheme } from "@/shared/constants/colors";
import { Font } from "@/shared/constants/typography";

const STRESS_COLORS = {
  green: "#22C55E",
  amber: "#F59E0B",
  red: "#EF4444",
} as const;

const ICON_AMBER = {
  bgDark: "rgba(251,191,36,0.10)",
  bgLight: "rgba(252,211,77,0.25)",
  dark: "#FBBF24",
  light: "#D97706",
} as const;

// ── Tipos ─────────────────────────────────────────────────────────────────────
type ResumenEstres = { verde?: number; ambar?: number; rojo?: number };
type DetalleDia = { fecha?: string; nivelEstres?: number; color?: "verde" | "ambar" | "rojo" };

type Props = {
  diasActivos?: number;
  resumen?: ResumenEstres;
  detalles?: DetalleDia[];
};

// ── Componente ────────────────────────────────────────────────────────────────
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
    <View style={[styles.card, { backgroundColor: isDark ? Colors.dark.surface : Colors.secondary }]}>
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
  );
};

export default DiasColorEstresCard;

// ── CardBody ──────────────────────────────────────────────────────────────────
function CardBody({
  isDark, diasActivos, totalVerde, totalAmbar, totalRojo, total, pct, detalles,
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
  const t = scheme(isDark);

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
              { backgroundColor: isDark ? ICON_AMBER.bgDark : ICON_AMBER.bgLight },
            ]}
          >
            <ThermometerSun
              size={18}
              color={isDark ? ICON_AMBER.dark : ICON_AMBER.light}
            />
          </View>

          <View>
            <Text style={[styles.headerTitle, { color: t.textPrimary }]}>
              Días por nivel de estrés
            </Text>
            <Text style={[styles.headerSubtitle, { color: t.textSecondary }]}>
              Mapa de cómo se han sentido tus entrenos
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <Text style={[styles.headerKpiLabel, { color: t.textTertiary }]}>Días activos</Text>
          <Text style={[styles.headerKpiValue, { color: t.textPrimary }]}>
            {diasActivos || "–"}
          </Text>
        </View>
      </View>

      <View style={styles.summary}>
        <View
          style={[
            styles.stackedBar,
            { backgroundColor: isDark ? Colors.dark.surfaceAlt : t.surface },
          ]}
        >
          <View style={{ width: `${verdePct}%`, backgroundColor: STRESS_COLORS.green }} />
          <View style={{ width: `${ambarPct}%`, backgroundColor: STRESS_COLORS.amber }} />
          <View style={{ width: `${rojoPct}%`, backgroundColor: STRESS_COLORS.red }} />
        </View>

        <View style={styles.legendRow}>
          <LegendItem isDark={isDark} color={STRESS_COLORS.green} label="Días suaves" value={totalVerde} pct={pct(totalVerde)} />
          <LegendItem isDark={isDark} color={STRESS_COLORS.amber} label="Días moderados" value={totalAmbar} pct={pct(totalAmbar)} />
          <LegendItem isDark={isDark} color={STRESS_COLORS.red} label="Días muy duros" value={totalRojo} pct={pct(totalRojo)} />
        </View>
      </View>

      {detalles && detalles.length > 0 && (
        <View style={styles.calendarWrap}>
          <CalendarHeatmap isDark={isDark} detalles={detalles} />
        </View>
      )}

      <View style={[styles.note, { borderTopColor: t.border }]}>
        <Text style={[styles.noteText, { color: t.textSecondary }]}>
          Busca muchos días en verde, algunos ámbar y pocos rojos: así construyes progreso sin
          pasarte de carga.
        </Text>
      </View>
    </View>
  );
}

// ── LegendItem ────────────────────────────────────────────────────────────────
function LegendItem({
  isDark, color, label, value, pct,
}: {
  isDark: boolean;
  color: string;
  label: string;
  value: number;
  pct: number;
}) {
  const t = scheme(isDark);

  return (
    <View style={styles.legendItem}>
      <View style={styles.legendTop}>
        <View style={[styles.legendDot, { backgroundColor: color }]} />
        <Text numberOfLines={1} style={[styles.legendLabel, { color: t.textSecondary }]}>
          {label}
        </Text>
      </View>
      <Text style={[styles.legendValue, { color: t.textPrimary }]}>
        {value} ({pct}%)
      </Text>
    </View>
  );
}

// ── CalendarHeatmap ───────────────────────────────────────────────────────────
function CalendarHeatmap({ isDark, detalles }: { isDark: boolean; detalles: DetalleDia[] }) {
  const t = scheme(isDark);

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
      map.set(d.fecha.slice(0, 10), c);
    }
    return map;
  }, [detalles]);

  const refDate = useMemo(() => {
    if (!detalles.length) return new Date();
    const valid = detalles
      .map((d) => {
        if (!d.fecha) return null;
        const [fy, fm, fd] = d.fecha.slice(0, 10).split("-").map(Number);
        return new Date(Date.UTC(fy, fm - 1, fd));
      })
      .filter((d): d is Date => !!d && !Number.isNaN(d.getTime()));
    return valid.length ? valid.reduce((a, b) => (b > a ? b : a)) : new Date();
  }, [detalles]);

  const year = refDate.getUTCFullYear();
  const month = refDate.getUTCMonth();
  const firstOfMonth = new Date(Date.UTC(year, month, 1));
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const startOffset = (firstOfMonth.getUTCDay() - 1 + 7) % 7;

  const cells: { key: string; dayNumber: number | null; color: "verde" | "ambar" | "rojo" | null }[] = [];
  for (let i = 0; i < startOffset; i++) cells.push({ key: `empty-${i}`, dayNumber: null, color: null });
  for (let day = 1; day <= daysInMonth; day++) {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    cells.push({ key, dayNumber: day, color: dayMap.get(key) ?? null });
  }

  const bgNeutral = isDark ? Colors.dark.surfaceAlt : t.surface;
  const getBg = (c: "verde" | "ambar" | "rojo" | null) =>
    c === "verde" ? STRESS_COLORS.green : c === "ambar" ? STRESS_COLORS.amber : c === "rojo" ? STRESS_COLORS.red : bgNeutral;
  const getTColor = (c: "verde" | "ambar" | "rojo" | null) =>
    c ? "#F9FAFB" : isDark ? "#CBD5F5" : "#4B5563";

  const monthName = new Date(Date.UTC(year, month, 1)).toLocaleDateString("es-ES", { month: "long", year: "numeric", timeZone: "UTC" });
  const weekdayLabels = ["L", "M", "X", "J", "V", "S", "D"];
  const cellSize = 32;

  return (
    <View>
      <View style={styles.calHeader}>
        <Text style={[styles.calTitle, { color: t.textPrimary }]}>Calendario de estrés</Text>
        <Text style={[styles.calMonth, { color: t.textSecondary }]}>
          {monthName.charAt(0).toUpperCase() + monthName.slice(1)}
        </Text>
      </View>

      <View style={styles.weekdays}>
        {weekdayLabels.map((d) => (
          <View key={d} style={styles.weekdayCell}>
            <Text style={[styles.weekdayText, { color: t.textTertiary }]}>{d}</Text>
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((cell) => {
          if (cell.dayNumber == null) {
            return (
              <View
                key={cell.key}
                style={{ width: `${100 / 7}%`, height: cellSize, marginBottom: 4 }}
              />
            );
          }
          const bg = getBg(cell.color);
          const tColor = getTColor(cell.color);
          const borderWidth = cell.color ? 0 : 1;
          const borderColor = t.border;

          return (
            <View key={cell.key} style={styles.gridCellWrap}>
              <View
                style={[
                  styles.gridCell,
                  { width: cellSize, height: cellSize, backgroundColor: bg, borderWidth, borderColor },
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

// ── EmptyState ────────────────────────────────────────────────────────────────
function EmptyState({ isDark }: { isDark: boolean }) {
  const t = scheme(isDark);

  return (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIcon, { backgroundColor: isDark ? t.border : t.surface }]}>
        <Text style={{ color: t.textPrimary }}>🌡️</Text>
      </View>
      <Text style={[styles.emptyTitle, { color: t.textPrimary }]}>
        Aún no hay días con nivel de estrés
      </Text>
      <Text style={[styles.emptySubtitle, { color: t.textSecondary }]}>
        Marca cómo te sientes al guardar tus sesiones y aquí verás el patrón de días suaves,
        moderados y muy duros.
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
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexShrink: 1,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: "700",
    fontFamily: Font.body.bold,
    letterSpacing: 0.2,
  },
  headerSubtitle: { fontSize: 11, fontFamily: Font.body.regular, marginTop: 2 },
  headerRight: { alignItems: "flex-end" },
  headerKpiLabel: {
    fontSize: 10,
    fontWeight: "600",
    fontFamily: Font.body.semiBold,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  headerKpiValue: { fontSize: 20, fontWeight: "800", fontFamily: Font.title.bold, lineHeight: 24 },

  summary: {
    paddingHorizontal: 16,
    marginTop: 4,
    marginBottom: 12,
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
    marginTop: 8,
    gap: 8,
  },
  legendItem: { flex: 1 },
  legendTop: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 999 },
  legendLabel: { fontSize: 11, fontFamily: Font.body.regular },
  legendValue: { fontSize: 13, fontWeight: "700", fontFamily: Font.body.bold, marginTop: 2 },

  calendarWrap: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  calHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  calTitle: { fontSize: 12, fontWeight: "600", fontFamily: Font.body.semiBold },
  calMonth: { fontSize: 11, fontFamily: Font.body.regular },
  weekdays: { flexDirection: "row", marginBottom: 4 },
  weekdayCell: { flex: 1, alignItems: "center", paddingVertical: 2 },
  weekdayText: { fontSize: 11, fontFamily: Font.body.semiBold },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  gridCellWrap: { width: `${100 / 7}%`, alignItems: "center", marginBottom: 4 },
  gridCell: { borderRadius: 10, justifyContent: "center", alignItems: "center" },
  gridDay: { fontSize: 12, fontWeight: "700", fontFamily: Font.body.bold },

  note: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  noteText: { fontSize: 11, fontFamily: Font.body.regular },

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
  emptyTitle: { fontSize: 14, fontWeight: "600", fontFamily: Font.body.semiBold, textAlign: "center" },
  emptySubtitle: { fontSize: 12, fontFamily: Font.body.regular, marginTop: 4, textAlign: "center" },
});
