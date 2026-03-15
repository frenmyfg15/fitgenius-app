import React, { useMemo } from "react";
import { View, Text, Dimensions, ScrollView, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";
import Svg, {
  Defs,
  LinearGradient as SvgGradient,
  Stop,
  Path,
  Rect,
  G,
  Circle,
  Text as SvgText,
} from "react-native-svg";

// ── Tokens (mismo sistema compartido que IMCVisual) ───────────────────────────
const tokens = {
  color: {
    gradientStart: "rgb(0,255,64)",
    gradientMid: "rgb(94,230,157)",
    gradientEnd: "rgb(178,0,255)",

    cardBgDark: "rgba(15,24,41,1)",
    cardBgLight: "#FFFFFF",
    cardBorderDark: "rgba(255,255,255,0.08)",
    cardBorderLight: "rgba(0,0,0,0.06)",

    kpiBgDark: "rgba(255,255,255,0.05)",
    kpiBgLight: "rgba(255,255,255,0.80)",
    kpiBorderDark: "rgba(255,255,255,0.10)",
    kpiBorderLight: "rgba(255,255,255,0.60)",

    textPrimaryDark: "#F1F5F9",
    textPrimaryLight: "#0F172A",
    textSecondaryDark: "#94A3B8",
    textSecondaryLight: "#6B7280",
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
type RegistroPlanoCompuesto = {
  serieNumero: number;
  ejercicioId: number;
  nombre: string;
  pesoKg: number | null;
  repeticiones: number | null;
  duracionSegundos: number | null;
  idGif?: string;
  grupoMuscular?: string;
  musculoPrincipal?: string;
};

type Props = { registros: RegistroPlanoCompuesto[] };

// ── Componente ────────────────────────────────────────────────────────────────
export default function GraficoVolumenPorSerieCompuestos({ registros }: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const unit = (useUsuarioStore((s) => s.usuario?.medidaPeso) ?? "KG").toLowerCase();

  const windowWidth = Dimensions.get("window").width;
  const baseWidth = windowWidth - 32;

  const { labels, data, maxY, ranking } = useMemo(() => {
    const seriesUnicas = Array.from(
      new Set(registros.map((r) => r.serieNumero))
    ).sort((a, b) => a - b);

    const data = seriesUnicas.map((serie) =>
      registros
        .filter((r) => r.serieNumero === serie)
        .reduce((acc, r) => {
          const peso = typeof r.pesoKg === "number" ? r.pesoKg : 0;
          const reps = typeof r.repeticiones === "number" ? r.repeticiones : 0;
          return acc + peso * reps;
        }, 0)
    );

    const maxY = Math.max(10, ...data);

    const mapVolumen: Record<number, { nombre: string; volumen: number; reps: number }> = {};
    for (const r of registros) {
      const peso = typeof r.pesoKg === "number" ? r.pesoKg : 0;
      const reps = typeof r.repeticiones === "number" ? r.repeticiones : 0;
      if (!mapVolumen[r.ejercicioId])
        mapVolumen[r.ejercicioId] = { nombre: r.nombre, volumen: 0, reps: 0 };
      mapVolumen[r.ejercicioId].volumen += peso * reps;
      mapVolumen[r.ejercicioId].reps += reps;
    }

    const ranking = Object.entries(mapVolumen)
      .map(([id, v]) => ({ ejercicioId: Number(id), ...v }))
      .sort((a, b) => b.volumen - a.volumen);

    return { labels: seriesUnicas.map((n) => `Set ${n}`), data, maxY, ranking };
  }, [registros]);

  const hasValues = data.some((v) => v > 0);

  // ── Area chart ─────────────────────────────────────────────────────────────
  const chartH = 220;
  const pad = { top: 22, right: 24, bottom: 40, left: 24 };
  const innerW = Math.max(baseWidth, labels.length * 84);

  const xAt = (i: number) => {
    if (data.length <= 1) return pad.left + (innerW - pad.left - pad.right) / 2;
    return pad.left + ((innerW - pad.left - pad.right) * i) / (data.length - 1);
  };
  const yAt = (v: number) => {
    const usable = chartH - pad.top - pad.bottom;
    return pad.top + (1 - v / (maxY || 1)) * usable;
  };

  const buildSmoothPath = (vals: number[]) => {
    if (!vals.length) return "";
    const pts = vals.map((v, i) => ({ x: xAt(i), y: yAt(v) }));
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y} L ${pts[0].x} ${pts[0].y}`;
    const d: string[] = [`M ${pts[0].x} ${pts[0].y}`];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = i === 0 ? pts[0] : pts[i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = i + 2 < pts.length ? pts[i + 2] : p2;
      const t = 0.2;
      d.push(
        `C ${p1.x + (p2.x - p0.x) * t} ${p1.y + (p2.y - p0.y) * t},` +
        ` ${p2.x - (p3.x - p1.x) * t} ${p2.y - (p3.y - p1.y) * t},` +
        ` ${p2.x} ${p2.y}`
      );
    }
    return d.join(" ");
  };

  const linePath = buildSmoothPath(data);
  const areaPath = `${linePath} L ${xAt(data.length - 1)} ${chartH - pad.bottom} L ${xAt(0)} ${chartH - pad.bottom} Z`;

  const strokeColor = isDark ? "#22c55e" : "#16a34a";
  const fillStart = isDark ? "#16a34a" : "#22c55e";
  const gridColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const subLabel = isDark ? tokens.color.textSecondaryDark : tokens.color.textSecondaryLight;

  const textPrimary = isDark ? tokens.color.textPrimaryDark : tokens.color.textPrimaryLight;
  const textSecondary = isDark ? tokens.color.textSecondaryDark : tokens.color.textSecondaryLight;

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
              Volumen por serie (compuestos)
            </Text>
            <Text style={[styles.headerSubtitle, { color: textSecondary }]}>
              Volumen = peso × reps ({unit})
            </Text>
          </View>

          {/* Area chart con scroll horizontal */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 8 }}
          >
            <Svg width={innerW} height={chartH}>
              <Defs>
                <SvgGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={fillStart} stopOpacity={0.35} />
                  <Stop offset="1" stopColor={fillStart} stopOpacity={0} />
                </SvgGradient>
              </Defs>

              <Rect x={0} y={0} width={innerW} height={chartH} fill="transparent" />

              {Array.from({ length: 4 }).map((_, i) => {
                const y = pad.top + ((chartH - pad.top - pad.bottom) * i) / 3;
                return (
                  <Path
                    key={i}
                    d={`M ${pad.left} ${y} H ${innerW - pad.right}`}
                    stroke={gridColor}
                    strokeWidth={1}
                  />
                );
              })}

              {hasValues && (
                <G>
                  <Path d={areaPath} fill="url(#fill)" />
                  <Path d={linePath} stroke={strokeColor} strokeWidth={3} fill="none" />
                  {data.map((v, i) => (
                    <Circle key={i} cx={xAt(i)} cy={yAt(v)} r={3.5} fill={strokeColor} />
                  ))}
                </G>
              )}

              {labels.map((lbl, i) => {
                const every = labels.length > 10 ? 2 : 1;
                if (i % every !== 0) return null;
                return (
                  <SvgText
                    key={lbl + i}
                    x={xAt(i)}
                    y={chartH - pad.bottom + 18}
                    fontSize={11}
                    fill={subLabel}
                    textAnchor="middle"
                  >
                    {lbl}
                  </SvgText>
                );
              })}
            </Svg>
          </ScrollView>

          {/* Ranking por ejercicio */}
          {ranking.length > 0 && (
            <View style={styles.rankingWrapper}>
              <Text style={[styles.rankingTitle, { color: textPrimary }]}>
                Volumen por ejercicio (sesión):
              </Text>

              <View style={styles.rankingGrid}>
                {ranking.map((item) => (
                  <View
                    key={item.ejercicioId}
                    style={[
                      styles.rankingCard,
                      {
                        backgroundColor: isDark ? tokens.color.kpiBgDark : tokens.color.kpiBgLight,
                        borderColor: isDark ? tokens.color.kpiBorderDark : tokens.color.kpiBorderLight,
                      },
                    ]}
                  >
                    <Text
                      numberOfLines={2}
                      ellipsizeMode="tail"
                      style={[styles.rankingName, { color: textPrimary }]}
                    >
                      {item.nombre}
                    </Text>

                    <Text style={[styles.rankingVolumen, { color: textPrimary }]}>
                      {Math.round(item.volumen)}
                      <Text style={[styles.rankingUnit, { color: textSecondary }]}>
                        {` ${unit}·reps`}
                      </Text>
                    </Text>

                    <Text style={[styles.rankingReps, { color: textSecondary }]}>
                      {item.reps} reps totales
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
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
  headerSubtitle: { fontSize: 11 },

  // Ranking
  rankingWrapper: {
    paddingHorizontal: tokens.spacing.lg,
    paddingBottom: tokens.spacing.xl,
  },
  rankingTitle: {
    fontSize: 12,
    marginBottom: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.xs,
  },
  rankingGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: tokens.spacing.md,
  },
  rankingCard: {
    width: "48%",
    borderRadius: tokens.radius.md,
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
    borderWidth: 1,
    marginBottom: tokens.spacing.xs,
  },
  rankingName: {
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
  rankingVolumen: {
    fontSize: 20,
    fontWeight: "800",
    marginTop: tokens.spacing.sm,
  },
  rankingUnit: {
    fontSize: 12,
    fontWeight: "600",
  },
  rankingReps: {
    fontSize: 12,
    marginTop: tokens.spacing.xs,
  },
});