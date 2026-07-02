// src/shared/components/estadistica/DistribucionMuscularCard.tsx
import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useColorScheme } from "nativewind";
import Svg, {
  G,
  Line,
  Circle as SvgCircle,
  Polygon,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
} from "react-native-svg";
import { Colors, scheme } from "@/shared/constants/colors";
import { Font } from "@/shared/constants/typography";

// radar chart colors — data visualization, kept as literals
const RADAR = {
  gridDark: "rgba(148,163,184,0.12)",
  gridLight: "rgba(15,23,42,0.07)",
  axisDark: "rgba(148,163,184,0.20)",
  axisLight: "rgba(15,23,42,0.10)",
  fillDark: ["rgba(57,255,20,0.28)", "rgba(168,85,247,0.24)"] as string[],
  fillLight: ["rgba(57,255,20,0.18)", "rgba(168,85,247,0.16)"] as string[],
} as const;

// ── Paleta pastel (chart legend) ──────────────────────────────────────────────
const PASTEL_COLORS = [
  "#A5B4FC", "#F9A8D4", "#6EE7B7", "#FDE68A", "#BFDBFE",
  "#FCA5A5", "#FED7AA", "#7DD3FC", "#C4B5FD", "#BBF7D0",
] as const;

function getColorForGroup(grupoMuscular: string, index: number): string {
  const base = grupoMuscular || "";
  let hash = 0;
  for (let i = 0; i < base.length; i++) hash = (hash + base.charCodeAt(i) * 17) | 0;
  const idx = Math.abs(hash) % PASTEL_COLORS.length;
  const finalIdx = (idx + index) % PASTEL_COLORS.length;
  return PASTEL_COLORS[finalIdx];
}

// ── Tipos ─────────────────────────────────────────────────────────────────────
type DistribucionItem = { grupoMuscular: string; porcentaje: number };
type Props = { distribucion: DistribucionItem[] };

// ── Utils ─────────────────────────────────────────────────────────────────────
function normalizeDistribucion(src: DistribucionItem[]) {
  const clean = (src ?? [])
    .filter((d) => d && typeof d.grupoMuscular === "string")
    .map((d) => ({
      grupoMuscular: d.grupoMuscular,
      porcentaje: Math.max(0, Math.min(100, Number(d.porcentaje) || 0)),
    }))
    .filter((d) => d.porcentaje > 0);

  const map = new Map<string, number>();
  for (const d of clean)
    map.set(d.grupoMuscular, (map.get(d.grupoMuscular) ?? 0) + d.porcentaje);

  return Array.from(map, ([grupoMuscular, p]) => ({
    grupoMuscular,
    porcentaje: Math.min(100, p),
  }))
    .sort((a, b) => b.porcentaje - a.porcentaje)
    .slice(0, 10);
}

// ── Componente ────────────────────────────────────────────────────────────────
export default function DistribucionMuscularCard({ distribucion }: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const data = useMemo(() => normalizeDistribucion(distribucion), [distribucion]);
  const hasData = data.length > 0;
  const top = hasData ? data[0] : null;

  return (
    <View style={[styles.card, { backgroundColor: isDark ? Colors.dark.surface : Colors.secondary }]}>
      <CardBody isDark={isDark} data={data} top={top} />
    </View>
  );
}

// ── CardBody ──────────────────────────────────────────────────────────────────
function CardBody({
  isDark, data, top,
}: {
  isDark: boolean;
  data: { grupoMuscular: string; porcentaje: number }[];
  top: { grupoMuscular: string; porcentaje: number } | null;
}) {
  const hasData = data.length > 0;
  const t = scheme(isDark);

  const coloredData = useMemo(
    () => data.map((item, index) => ({ ...item, color: getColorForGroup(item.grupoMuscular, index) })),
    [data]
  );

  return (
    <View style={styles.cardBody}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: t.textPrimary }]}>
            Distribución muscular
          </Text>
          <Text style={[styles.headerSubtitle, { color: t.textSecondary }]}>
            Reparto porcentual por grupo
          </Text>
        </View>

        {top && (
          <Text numberOfLines={1} style={[styles.headerTop, { color: t.textTertiary }]}>
            Principal:{" "}
            <Text style={{ color: t.textPrimary, fontFamily: Font.body.semiBold }}>
              {top.grupoMuscular}
            </Text>
          </Text>
        )}
      </View>

      <View style={styles.content}>
        {hasData ? (
          <>
            <RadarChart data={coloredData} isDark={isDark} />
            <Legend data={coloredData} isDark={isDark} />
          </>
        ) : (
          <EmptyState isDark={isDark} />
        )}
      </View>
    </View>
  );
}

// ── RadarChart ────────────────────────────────────────────────────────────────
type RadarDataItem = { grupoMuscular: string; porcentaje: number; color: string };

function RadarChart({ data, isDark }: { data: RadarDataItem[]; isDark: boolean }) {
  const size = 260;
  const cx = size / 2;
  const cy = size / 2;
  const padding = 20;
  const R = (size - padding * 2) / 2;
  const n = Math.max(3, data.length);
  const rings = 5;

  const gridStroke = isDark ? RADAR.gridDark : RADAR.gridLight;
  const axisStroke = isDark ? RADAR.axisDark : RADAR.axisLight;
  const dotStroke = isDark ? Colors.primary : Colors.secondary;
  const radarFill = isDark ? RADAR.fillDark : RADAR.fillLight;

  const angleAt = (i: number) => (2 * Math.PI * i) / n - Math.PI / 2;
  const point = (rNorm: number, i: number) => {
    const a = angleAt(i);
    const r = rNorm * R;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  };

  const ringPolygons = Array.from({ length: rings }, (_, k) => {
    const norm = (k + 1) / rings;
    return Array.from({ length: n }, (_, i) => point(norm, i))
      .map((p) => `${p.x},${p.y}`)
      .join(" ");
  });

  const axes = Array.from({ length: n }, (_, i) => {
    const p = point(1, i);
    return { x1: cx, y1: cy, x2: p.x, y2: p.y };
  });

  const dataPoints = data.map((d, i) =>
    point(Math.max(0, Math.min(1, d.porcentaje / 100)), i)
  );
  const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <View style={styles.radarWrapper}>
      <Svg
        width={size}
        height={size}
        accessibilityRole="image"
        accessible
        accessibilityLabel="Distribución muscular"
      >
        <Defs>
          <SvgLinearGradient id="radarFill" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={radarFill[0]} />
            <Stop offset="100%" stopColor={radarFill[1]} />
          </SvgLinearGradient>
          <SvgLinearGradient id="radarStroke" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={Colors.accent} />
            <Stop offset="100%" stopColor={Colors.accent} />
          </SvgLinearGradient>
        </Defs>

        <G>
          {ringPolygons.map((pts, idx) => (
            <Polygon key={`ring-${idx}`} points={pts} fill="none" stroke={gridStroke} strokeWidth={1} />
          ))}
          {axes.map((a, idx) => (
            <Line key={`axis-${idx}`} x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} stroke={axisStroke} strokeWidth={1} />
          ))}
          <Polygon points={dataPolygon} fill="url(#radarFill)" stroke="url(#radarStroke)" strokeWidth={2.5} />
          {dataPoints.map((p, idx) => (
            <SvgCircle
              key={`dp-${idx}`}
              cx={p.x} cy={p.y} r={4}
              fill={data[idx]?.color}
              stroke={dotStroke}
              strokeWidth={1.2}
            />
          ))}
        </G>
      </Svg>
    </View>
  );
}

// ── Legend ────────────────────────────────────────────────────────────────────
function Legend({ data, isDark }: { data: RadarDataItem[]; isDark: boolean }) {
  const t = scheme(isDark);

  return (
    <View style={styles.legend}>
      <View style={styles.legendGrid}>
        {data.map((item) => (
          <View key={item.grupoMuscular} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <Text numberOfLines={1} style={[styles.legendLabel, { color: t.textTertiary }]}>
              {item.grupoMuscular}
            </Text>
            <Text style={[styles.legendValue, { color: t.textPrimary }]}>
              {item.porcentaje.toFixed(1)}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────────
function EmptyState({ isDark }: { isDark: boolean }) {
  const t = scheme(isDark);

  return (
    <View style={[styles.emptyState, { borderTopColor: t.border }]}>
      <View style={[styles.emptyIcon, { backgroundColor: isDark ? t.border : t.surface }]}>
        <Text style={styles.emptyIconText}>⭐️</Text>
      </View>
      <Text style={[styles.emptyTitle, { color: t.textPrimary }]}>
        No hay datos de distribución para mostrar.
      </Text>
      <Text style={[styles.emptySubtitle, { color: t.textSecondary }]}>
        Completa tus rutinas para ver qué músculos trabajas más.
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

  cardBody: {
    position: "relative",
    borderRadius: 16,
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: "700",
    fontFamily: Font.body.bold,
    letterSpacing: 0.2,
  },
  headerSubtitle: { fontSize: 11, fontFamily: Font.body.regular, marginTop: 2 },
  headerTop: { fontSize: 11, fontFamily: Font.body.regular },

  content: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

  radarWrapper: { alignItems: "center" },

  legend: { marginTop: 12 },
  legendGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
    marginBottom: 8,
  },
  legendDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginRight: 8,
  },
  legendLabel: { flex: 1, fontSize: 12, fontFamily: Font.body.regular },
  legendValue: { fontSize: 12, fontWeight: "700", fontFamily: Font.body.bold, marginLeft: 8 },

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    borderTopWidth: 1,
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  emptyIconText: { fontSize: 24 },
  emptyTitle: { fontSize: 13, fontFamily: Font.body.semiBold },
  emptySubtitle: { fontSize: 11, fontFamily: Font.body.regular, marginTop: 4, textAlign: "center" },
});
