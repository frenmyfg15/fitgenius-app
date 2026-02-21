// File: src/features/premium/DistribucionMuscularCard.tsx
import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useColorScheme } from "nativewind";
import { LinearGradient } from "expo-linear-gradient";
import Svg, {
  G,
  Line,
  Circle as SvgCircle,
  Polygon,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
} from "react-native-svg";

// ── Tokens (mismo sistema compartido) ────────────────────────────────────────
const tokens = {
  color: {
    // Frame gradient (FIX: 2 colores)
    frameGradient: ["#00E85A", "#A855F7"] as string[],

    // Card interior
    cardBgDark: "rgba(15,24,41,0.75)",
    cardBgLight: "#FFFFFF",
    cardBorderDark: "rgba(255,255,255,0.08)",
    cardBorderLight: "rgba(0,0,0,0.06)",

    // Radar chart
    radarGridDark: "rgba(148,163,184,0.12)",
    radarGridLight: "rgba(15,23,42,0.07)",
    radarAxisDark: "rgba(148,163,184,0.20)",
    radarAxisLight: "rgba(15,23,42,0.10)",
    radarFillDark: ["rgba(34,197,94,0.28)", "rgba(168,85,247,0.24)"] as string[],
    radarFillLight: ["rgba(34,197,94,0.18)", "rgba(168,85,247,0.16)"] as string[],
    radarStroke: ["#00FF40", "#B200FF"] as string[],
    dotStrokeDark: "#080D17",
    dotStrokeLight: "#FFFFFF",

    // Empty state
    emptyIconBgDark: "rgba(255,255,255,0.08)",
    emptyIconBgLight: "#E2E8F0",
    emptyBorderDark: "rgba(255,255,255,0.08)",
    emptyBorderLight: "rgba(0,0,0,0.06)",

    // Texto
    textPrimaryDark: "#F1F5F9",
    textPrimaryLight: "#0F172A",
    textSecondaryDark: "#64748B",
    textSecondaryLight: "#64748B",
    textMutedDark: "#94A3B8",
    textMutedLight: "#475569",
  },
  radius: { lg: 16, md: 12, sm: 8 },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20 },
} as const;

// ── Paleta pastel para grupos musculares ──────────────────────────────────────
const PASTEL_COLORS = [
  "#A5B4FC", "#F9A8D4", "#6EE7B7", "#FDE68A", "#BFDBFE",
  "#FCA5A5", "#FED7AA", "#7DD3FC", "#C4B5FD", "#BBF7D0",
] as const;

function getColorForGroup(grupoMuscular: string, index: number): string {
  const base = grupoMuscular || "";
  let hash = 0;
  for (let i = 0; i < base.length; i++) {
    hash = (hash + base.charCodeAt(i) * 17) | 0;
  }
  const idx = Math.abs(hash) % PASTEL_COLORS.length;
  const finalIdx = (idx + index) % PASTEL_COLORS.length;
  return PASTEL_COLORS[finalIdx];
}

// ── Tipos — API pública sin cambios ───────────────────────────────────────────
type DistribucionItem = {
  grupoMuscular: string;
  porcentaje: number;
};

type Props = {
  distribucion: DistribucionItem[];
};

// ── Utils — sin cambios ───────────────────────────────────────────────────────
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

  const arr = Array.from(map, ([grupoMuscular, p]) => ({
    grupoMuscular,
    porcentaje: Math.min(100, p),
  }));

  return arr.sort((a, b) => b.porcentaje - a.porcentaje).slice(0, 10);
}

// ── Componente ────────────────────────────────────────────────────────────────
export default function DistribucionMuscularCard({ distribucion }: Props) {
  // ── Lógica original — sin cambios ─────────────────────────────────────────
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const data = useMemo(() => normalizeDistribucion(distribucion), [distribucion]);
  const hasData = data.length > 0;
  const top = hasData ? data[0] : null;
  // ── Fin lógica original ───────────────────────────────────────────────────

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
          <CardBody isDark={isDark} data={data} top={top} />
        </View>
      </LinearGradient>
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
  const textPrimary = isDark ? tokens.color.textPrimaryDark : tokens.color.textPrimaryLight;
  const textSecondary = isDark ? tokens.color.textSecondaryDark : tokens.color.textSecondaryLight;
  const textMuted = isDark ? tokens.color.textMutedDark : tokens.color.textMutedLight;

  const coloredData = useMemo(
    () =>
      data.map((item, index) => ({
        ...item,
        color: getColorForGroup(item.grupoMuscular, index),
      })),
    [data]
  );

  return (
    <View style={styles.cardBody}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: textPrimary }]}>
            Distribución muscular
          </Text>
          <Text style={[styles.headerSubtitle, { color: textSecondary }]}>
            Reparto porcentual por grupo
          </Text>
        </View>

        {top && (
          <Text numberOfLines={1} style={[styles.headerTop, { color: textMuted }]}>
            Principal:{" "}
            <Text style={{ color: textPrimary, fontWeight: "600" }}>
              {top.grupoMuscular}
            </Text>
          </Text>
        )}
      </View>

      {/* Contenido */}
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
type RadarDataItem = {
  grupoMuscular: string;
  porcentaje: number;
  color: string;
};

function RadarChart({ data, isDark }: { data: RadarDataItem[]; isDark: boolean }) {
  const size = 260;
  const cx = size / 2;
  const cy = size / 2;
  const padding = 20;
  const R = (size - padding * 2) / 2;

  const n = Math.max(3, data.length);
  const rings = 5;

  const gridStroke = isDark ? tokens.color.radarGridDark : tokens.color.radarGridLight;
  const axisStroke = isDark ? tokens.color.radarAxisDark : tokens.color.radarAxisLight;
  const dotStroke = isDark ? tokens.color.dotStrokeDark : tokens.color.dotStrokeLight;
  const radarFill = isDark ? tokens.color.radarFillDark : tokens.color.radarFillLight;

  const angleAt = (i: number) => (2 * Math.PI * i) / n - Math.PI / 2;
  const point = (rNorm: number, i: number) => {
    const a = angleAt(i);
    const r = rNorm * R;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  };

  const ringPolygons: string[] = [];
  for (let k = 1; k <= rings; k++) {
    const norm = k / rings;
    const pts: string[] = [];
    for (let i = 0; i < n; i++) {
      const p = point(norm, i);
      pts.push(`${p.x},${p.y}`);
    }
    ringPolygons.push(pts.join(" "));
  }

  const axes: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let i = 0; i < n; i++) {
    const p = point(1, i);
    axes.push({ x1: cx, y1: cy, x2: p.x, y2: p.y });
  }

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
            <Stop offset="0%" stopColor={tokens.color.radarStroke[0]} />
            <Stop offset="100%" stopColor={tokens.color.radarStroke[1]} />
          </SvgLinearGradient>
        </Defs>

        <G>
          {/* Anillos */}
          {ringPolygons.map((pts, idx) => (
            <Polygon
              key={`ring-${idx}`}
              points={pts}
              fill="none"
              stroke={gridStroke}
              strokeWidth={1}
            />
          ))}

          {/* Ejes */}
          {axes.map((a, idx) => (
            <Line
              key={`axis-${idx}`}
              x1={a.x1}
              y1={a.y1}
              x2={a.x2}
              y2={a.y2}
              stroke={axisStroke}
              strokeWidth={1}
            />
          ))}

          {/* Polígono de datos */}
          <Polygon
            points={dataPolygon}
            fill="url(#radarFill)"
            stroke="url(#radarStroke)"
            strokeWidth={2.5}
          />

          {/* Puntos por grupo */}
          {dataPoints.map((p, idx) => (
            <SvgCircle
              key={`dp-${idx}`}
              cx={p.x}
              cy={p.y}
              r={4}
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
  const textPrimary = isDark ? tokens.color.textPrimaryDark : tokens.color.textPrimaryLight;
  const textMuted = isDark ? tokens.color.textMutedLight : tokens.color.textMutedLight;

  return (
    <View style={styles.legend}>
      <View style={styles.legendGrid}>
        {data.map((item) => (
          <View key={item.grupoMuscular} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <Text numberOfLines={1} style={[styles.legendLabel, { color: textMuted }]}>
              {item.grupoMuscular}
            </Text>
            <Text style={[styles.legendValue, { color: textPrimary }]}>
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
  const textPrimary = isDark ? tokens.color.textPrimaryDark : tokens.color.textMutedLight;
  const textMuted = isDark ? tokens.color.textMutedDark : tokens.color.textSecondaryLight;

  return (
    <View
      style={[
        styles.emptyState,
        { borderTopColor: isDark ? tokens.color.emptyBorderDark : tokens.color.emptyBorderLight },
      ]}
    >
      <View
        style={[
          styles.emptyIcon,
          { backgroundColor: isDark ? tokens.color.emptyIconBgDark : tokens.color.emptyIconBgLight },
        ]}
      >
        <Text style={styles.emptyIconText}>⭐️</Text>
      </View>
      <Text style={[styles.emptyTitle, { color: textPrimary }]}>
        No hay datos de distribución para mostrar.
      </Text>
      <Text style={[styles.emptySubtitle, { color: textMuted }]}>
        Completa tus rutinas para ver qué músculos trabajas más.
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

  cardBody: {
    position: "relative",
    borderRadius: tokens.radius.lg - 1,
  },

  // Header
  header: {
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: tokens.spacing.xl,
    paddingBottom: tokens.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  headerTop: {
    fontSize: 11,
  },

  // Content
  content: {
    paddingHorizontal: tokens.spacing.lg,
    paddingBottom: tokens.spacing.xl,
  },

  // Radar
  radarWrapper: {
    alignItems: "center",
  },

  // Legend
  legend: {
    marginTop: tokens.spacing.md,
  },
  legendGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
    marginBottom: tokens.spacing.sm,
  },
  legendDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginRight: tokens.spacing.sm,
  },
  legendLabel: {
    flex: 1,
    fontSize: 12,
  },
  legendValue: {
    fontSize: 12,
    fontWeight: "700",
    marginLeft: tokens.spacing.sm,
  },

  // Empty state
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: tokens.spacing.xl + tokens.spacing.md,
    borderTopWidth: 1,
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: tokens.radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: tokens.spacing.md,
  },
  emptyIconText: {
    fontSize: 24,
  },
  emptyTitle: {
    fontSize: 13,
  },
  emptySubtitle: {
    fontSize: 11,
    marginTop: tokens.spacing.xs,
    textAlign: "center",
  },
});