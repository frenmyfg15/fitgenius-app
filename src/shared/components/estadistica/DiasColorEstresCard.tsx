// src/shared/components/estadistica/DiasColorEstresCard.tsx
import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useColorScheme } from "nativewind";
import { LinearGradient } from "expo-linear-gradient";
import { ThermometerSun } from "lucide-react-native";

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

    // Icono
    iconBgDark: "rgba(251,191,36,0.10)",
    iconBgLight: "rgba(252,211,77,0.25)",
    iconAmberDark: "#FBBF24",
    iconAmberLight: "#D97706",

    // Track de barra
    trackDark: "rgba(15,23,42,0.9)",
    trackLight: "#E5E7EB",

    // Colores de estrés
    green: "#22C55E",
    amber: "#F59E0B",
    red: "#EF4444",

    // Calendario
    calendarNeutralDark: "rgba(15,23,42,0.9)",
    calendarNeutralLight: "#F4F4F5",
    calendarBorderDark: "rgba(148,163,184,0.35)",
    calendarBorderLight: "#E4E4E7",

    // Texto
    textPrimaryDark: "#F1F5F9",
    textPrimaryLight: "#0F172A",
    textSecondaryDark: "#64748B",
    textSecondaryLight: "#64748B",
    textMutedDark: "#94A3B8",
    textMutedLight: "#6B7280",

    // Empty state
    emptyIconBgDark: "rgba(255,255,255,0.10)",
    emptyIconBgLight: "#F1F5F9",
    emptyTitleDark: "#E5E7EB",
    emptyTitleLight: "#334155",
    emptySubtitleDark: "#94A3B8",
    emptySubtitleLight: "#64748B",

    // Nota
    noteBorderDark: "rgba(255,255,255,0.08)",
    noteBorderLight: "rgba(0,0,0,0.06)",
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
  const textPrimary = isDark ? tokens.color.textPrimaryDark : tokens.color.textPrimaryLight;
  const textSecondary = isDark ? tokens.color.textSecondaryDark : tokens.color.textSecondaryLight;
  const textMuted = isDark ? tokens.color.textMutedDark : tokens.color.textMutedLight;

  const verdePct = total > 0 ? (totalVerde / total) * 100 : 0;
  const ambarPct = total > 0 ? (totalAmbar / total) * 100 : 0;
  const rojoPct = total > 0 ? (totalRojo / total) * 100 : 0;

  return (
    <View style={styles.cardBody}>
      {/* Header — misma tipografía que IMCVisual */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.iconWrap,
              {
                backgroundColor: isDark
                  ? tokens.color.iconBgDark
                  : tokens.color.iconBgLight,
              },
            ]}
          >
            <ThermometerSun
              size={18}
              color={isDark ? tokens.color.iconAmberDark : tokens.color.iconAmberLight}
            />
          </View>

          <View>
            <Text style={[styles.headerTitle, { color: textPrimary }]}>
              Días por nivel de estrés
            </Text>
            <Text style={[styles.headerSubtitle, { color: textSecondary }]}>
              Mapa de cómo se han sentido tus entrenos
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <Text style={[styles.headerKpiLabel, { color: textMuted }]}>Días activos</Text>
          <Text style={[styles.headerKpiValue, { color: textPrimary }]}>
            {diasActivos || "–"}
          </Text>
        </View>
      </View>

      {/* Barra apilada + leyenda */}
      <View style={styles.summary}>
        <View
          style={[
            styles.stackedBar,
            {
              backgroundColor: isDark
                ? tokens.color.trackDark
                : tokens.color.trackLight,
            },
          ]}
        >
          <View style={{ width: `${verdePct}%`, backgroundColor: tokens.color.green }} />
          <View style={{ width: `${ambarPct}%`, backgroundColor: tokens.color.amber }} />
          <View style={{ width: `${rojoPct}%`, backgroundColor: tokens.color.red }} />
        </View>

        <View style={styles.legendRow}>
          <LegendItem isDark={isDark} color={tokens.color.green} label="Días suaves" value={totalVerde} pct={pct(totalVerde)} />
          <LegendItem isDark={isDark} color={tokens.color.amber} label="Días moderados" value={totalAmbar} pct={pct(totalAmbar)} />
          <LegendItem isDark={isDark} color={tokens.color.red} label="Días muy duros" value={totalRojo} pct={pct(totalRojo)} />
        </View>
      </View>

      {/* Calendario */}
      {detalles && detalles.length > 0 && (
        <View style={styles.calendarWrap}>
          <CalendarHeatmap isDark={isDark} detalles={detalles} />
        </View>
      )}

      {/* Nota */}
      <View
        style={[
          styles.note,
          {
            borderTopColor: isDark
              ? tokens.color.noteBorderDark
              : tokens.color.noteBorderLight,
          },
        ]}
      >
        <Text style={[styles.noteText, { color: textSecondary }]}>
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

// ── CalendarHeatmap ───────────────────────────────────────────────────────────
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
        return new Date(fy, fm - 1, fd);
      })
      .filter((d): d is Date => !!d && !Number.isNaN(d.getTime()));
    return valid.length ? valid.reduce((a, b) => (b > a ? b : a)) : new Date();
  }, [detalles]);

  const year = refDate.getFullYear();
  const month = refDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (firstOfMonth.getDay() - 1 + 7) % 7;

  const cells: { key: string; dayNumber: number | null; color: "verde" | "ambar" | "rojo" | null }[] = [];
  for (let i = 0; i < startOffset; i++) cells.push({ key: `empty-${i}`, dayNumber: null, color: null });
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    const key = d.toISOString().slice(0, 10);
    cells.push({ key, dayNumber: day, color: dayMap.get(key) ?? null });
  }

  const bgNeutral = isDark ? tokens.color.calendarNeutralDark : tokens.color.calendarNeutralLight;
  const getBg = (c: "verde" | "ambar" | "rojo" | null) =>
    c === "verde" ? tokens.color.green : c === "ambar" ? tokens.color.amber : c === "rojo" ? tokens.color.red : bgNeutral;
  const getTColor = (c: "verde" | "ambar" | "rojo" | null) =>
    c ? "#F9FAFB" : isDark ? "#CBD5F5" : "#4B5563";

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
          const borderColor = isDark
            ? tokens.color.calendarBorderDark
            : tokens.color.calendarBorderLight;

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
  return (
    <View style={styles.emptyState}>
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
        <Text style={{ color: isDark ? tokens.color.emptyTitleDark : tokens.color.emptySubtitleLight }}>
          🌡️
        </Text>
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

  cardBody: { borderRadius: tokens.radius.lg - 1 },

  // Header — fontSize 13 + letterSpacing 0.2, igual que IMCVisual
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
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  headerSubtitle: { fontSize: 11, marginTop: 2 },
  headerRight: { alignItems: "flex-end" },
  headerKpiLabel: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  headerKpiValue: { fontSize: 20, fontWeight: "800", lineHeight: 24 },

  // Barra apilada
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
  legendItem: { flex: 1 },
  legendTop: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 999 },
  legendLabel: { fontSize: 11 },
  legendValue: { fontSize: 13, fontWeight: "700", marginTop: 2 },

  // Calendario
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
  calTitle: { fontSize: 12, fontWeight: "600" },
  calMonth: { fontSize: 11 },
  weekdays: { flexDirection: "row", marginBottom: tokens.spacing.xs },
  weekdayCell: { flex: 1, alignItems: "center", paddingVertical: 2 },
  weekdayText: { fontSize: 11 },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  gridCellWrap: { width: `${100 / 7}%`, alignItems: "center", marginBottom: 4 },
  gridCell: { borderRadius: 10, justifyContent: "center", alignItems: "center" },
  gridDay: { fontSize: 12, fontWeight: "700" },

  // Nota inferior
  note: {
    borderTopWidth: 1,
    paddingHorizontal: tokens.spacing.lg,
    paddingTop: tokens.spacing.md,
    paddingBottom: tokens.spacing.lg,
  },
  noteText: { fontSize: 11 },

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
  emptyTitle: { fontSize: 14, fontWeight: "600", textAlign: "center" },
  emptySubtitle: { fontSize: 12, marginTop: tokens.spacing.xs, textAlign: "center" },
});