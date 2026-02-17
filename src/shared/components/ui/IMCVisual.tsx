// File: src/features/fit/components/IMCVisual.tsx
import React, { useMemo, useState, useCallback } from "react";
import { View, Text, LayoutChangeEvent, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";

// ── Constantes — sin cambios ──────────────────────────────────────────────────
const MIN_IMC = 15;
const MAX_IMC = 35;
const CUTS = [18.5, 25, 30] as const;

const COLORS = {
  azulClaro: "#60A5FA",
  verde: "#22C55E",
  amarillo: "#F59E0B",
  rojo: "#EF4444",
} as const;

// ── Tokens (mismo sistema compartido) ────────────────────────────────────────
const tokens = {
  color: {
    // Frame gradient
    gradientStart: "rgb(0,255,64)",
    gradientMid: "rgb(94,230,157)",
    gradientEnd: "rgb(178,0,255)",

    // Card interior
    cardBgDark: "rgba(15,24,41,1)",
    cardBgLight: "#FFFFFF",
    cardBorderDark: "rgba(255,255,255,0.08)",
    cardBorderLight: "rgba(0,0,0,0.06)",

    // Badge categoría
    badgeBgDark: "rgba(148,163,184,0.12)",
    badgeBgLight: "#F1F5F9",
    badgeBorderDark: "rgba(255,255,255,0.06)",
    badgeBorderLight: "rgba(0,0,0,0.06)",

    // Barra de progreso
    trackBgDark: "rgba(148,163,184,0.14)",
    trackBgLight: "#E2E8F0",
    trackBorderDark: "rgba(255,255,255,0.09)",
    trackBorderLight: "#D1D5DB",

    // Línea vertical indicadora
    lineLight: "rgba(255,255,255,0.90)",

    // Ticks
    tickDark: "rgba(148,163,184,0.45)",
    tickLight: "#CBD5E1",

    // Texto
    textPrimaryDark: "#F1F5F9",
    textPrimaryLight: "#0F172A",
    textSecondaryDark: "#64748B",
    textSecondaryLight: "#52525B",

    // Sin datos
    noDataDark: "#64748B",
    noDataLight: "#6B7280",
  },
  radius: { lg: 16, md: 10, full: 999 },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20 },
} as const;

const GRADIENT = [
  tokens.color.gradientStart,
  tokens.color.gradientMid,
  tokens.color.gradientEnd,
] as const;

// ── Tipos — API pública sin cambios ───────────────────────────────────────────
type IMCVisualProps = {
  peso?: number | string | null;
  altura?: number | string | null;
};

// ── Componente ────────────────────────────────────────────────────────────────
export default function IMCVisual({ peso, altura }: IMCVisualProps) {
  // ── Lógica original — sin cambios ─────────────────────────────────────────
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const imcRaw = useMemo(() => {
    if (!peso || !altura) return null;
    const kg = Number(peso);
    const m = Number(altura) / 100;
    if (!Number.isFinite(kg) || !Number.isFinite(m) || m <= 0) return null;
    return kg / (m * m);
  }, [peso, altura]);

  const imc = useMemo(
    () => (imcRaw != null ? Number(imcRaw.toFixed(1)) : null),
    [imcRaw]
  );

  const getCategoria = (val: number) => {
    if (val < CUTS[0]) return { categoria: "Bajo peso", color: COLORS.azulClaro };
    if (val < CUTS[1]) return { categoria: "Peso normal", color: COLORS.verde };
    if (val < CUTS[2]) return { categoria: "Sobrepeso", color: COLORS.amarillo };
    return { categoria: "Obesidad", color: COLORS.rojo };
  };

  const [trackW, setTrackW] = useState<number>(280);
  const onTrackLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const w = e.nativeEvent.layout.width;
      if (w && Math.abs(w - trackW) > 0.5) setTrackW(w);
    },
    [trackW]
  );

  const posPx = useMemo(() => {
    if (imc == null) return 0;
    const ratio = (imc - MIN_IMC) / (MAX_IMC - MIN_IMC);
    return Math.max(0, Math.min(ratio * trackW, trackW));
  }, [imc, trackW]);

  const seg = [MIN_IMC, CUTS[0], CUTS[1], CUTS[2], MAX_IMC];
  const spanTotal = MAX_IMC - MIN_IMC;
  const spans = [
    seg[1] - seg[0],
    seg[2] - seg[1],
    seg[3] - seg[2],
    seg[4] - seg[3],
  ].map((v) => Math.max(0, v));
  const widthsPct = spans.map((s) => (s / spanTotal) * 100);

  const hasImc = imc != null;
  const categoriaInfo = hasImc ? getCategoria(imc) : null;
  const categoria = categoriaInfo?.categoria ?? "Sin datos";
  const color = categoriaInfo?.color ?? (isDark ? "rgba(255,255,255,0.20)" : "#9CA3AF");
  // ── Fin lógica original ───────────────────────────────────────────────────

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
          {/* ── Header ──────────────────────────────────────────────────── */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: textPrimary }]}>
              IMC actual
            </Text>

            <View
              style={[
                styles.badge,
                {
                  backgroundColor: isDark ? tokens.color.badgeBgDark : tokens.color.badgeBgLight,
                  borderColor: isDark ? tokens.color.badgeBorderDark : tokens.color.badgeBorderLight,
                },
              ]}
            >
              <Text style={[styles.badgeText, { color: textPrimary }]}>
                {categoria}
              </Text>
            </View>
          </View>

          {/* ── Contenido ────────────────────────────────────────────────── */}
          {!hasImc ? (
            <Text style={[styles.noData, { color: isDark ? tokens.color.noDataDark : tokens.color.noDataLight }]}>
              No hay datos suficientes para calcular el IMC.
            </Text>
          ) : (
            <>
              {/* Indicador flotante */}
              <View style={styles.indicatorWrapper}>
                <View
                  style={[styles.indicator, { left: 0, transform: [{ translateX: posPx }] }]}
                  accessibilityElementsHidden
                  importantForAccessibility="no"
                >
                  <View style={styles.indicatorContent}>
                    <View
                      style={[styles.indicatorPill, { backgroundColor: color }]}
                    >
                      <Text style={styles.indicatorText}>{imc}</Text>
                    </View>
                    <View style={[styles.indicatorTail, { backgroundColor: color }]} />
                  </View>
                </View>

                {/* Barra de progreso */}
                <View
                  onLayout={onTrackLayout}
                  style={[
                    styles.track,
                    {
                      backgroundColor: isDark ? tokens.color.trackBgDark : tokens.color.trackBgLight,
                      borderColor: isDark ? tokens.color.trackBorderDark : tokens.color.trackBorderLight,
                    },
                  ]}
                  accessibilityRole="progressbar"
                  accessibilityLabel="Barra de IMC"
                  accessibilityValue={{ min: MIN_IMC, max: MAX_IMC, now: imc }}
                >
                  {/* Segmentos de color */}
                  <View style={styles.trackSegments}>
                    <View style={[styles.segment, { width: `${widthsPct[0]}%`, backgroundColor: COLORS.azulClaro }]} />
                    <View style={[styles.segment, { width: `${widthsPct[1]}%`, backgroundColor: COLORS.verde }]} />
                    <View style={[styles.segment, { width: `${widthsPct[2]}%`, backgroundColor: COLORS.amarillo }]} />
                    <View style={[styles.segment, { width: `${widthsPct[3]}%`, backgroundColor: COLORS.rojo }]} />
                  </View>

                  {/* Línea vertical indicadora */}
                  <View
                    style={[
                      styles.trackLine,
                      {
                        backgroundColor: tokens.color.lineLight,
                        left: trackW ? `${(posPx / trackW) * 100}%` : "0%",
                      },
                    ]}
                  />
                </View>

                {/* Ticks (marcadores OMS) */}
                <View style={styles.ticksRow}>
                  {CUTS.map((c, i) => {
                    const x = ((c - MIN_IMC) / (MAX_IMC - MIN_IMC)) * 100;
                    return (
                      <View
                        key={i}
                        style={[
                          styles.tick,
                          {
                            backgroundColor: isDark ? tokens.color.tickDark : tokens.color.tickLight,
                            left: `${x}%`,
                          },
                        ]}
                        accessibilityElementsHidden
                        importantForAccessibility="no"
                      />
                    );
                  })}
                </View>
              </View>

              {/* Leyenda */}
              <View style={styles.legend}>
                {["Bajo", "Normal", "Sobrepeso", "Obesidad"].map((t, i) => (
                  <Text
                    key={i}
                    style={[
                      styles.legendText,
                      {
                        color: textSecondary,
                        textAlign: (i === 0 ? "left" : i === 3 ? "right" : "center") as any,
                      },
                    ]}
                  >
                    {t}
                  </Text>
                ))}
              </View>

              {/* Resumen */}
              <Text style={[styles.summary, { color: textSecondary }]}>
                Resultado IMC:{" "}
                <Text style={[styles.summaryBold, { color: textPrimary }]}>
                  {imc}
                </Text>
                {" "}→ categoría{" "}
                <Text style={[styles.summaryCategory, { color }]}>
                  {categoria}
                </Text>
              </Text>
            </>
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
    maxWidth: 520,
  },

  // Frame gradiente
  frame: {
    borderRadius: tokens.radius.lg,
    padding: 1.5,
    overflow: "hidden",
  },

  // Card interior
  card: {
    borderRadius: tokens.radius.lg - 1,
    borderWidth: 1,
    padding: tokens.spacing.xl,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: tokens.spacing.md,
    marginBottom: tokens.spacing.lg,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  // Badge categoría
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },

  // Sin datos
  noData: {
    fontSize: 13,
    lineHeight: 20,
  },

  // Indicador flotante
  indicatorWrapper: {
    position: "relative",
    marginBottom: tokens.spacing.xs,
  },
  indicator: {
    position: "absolute",
    top: -28,
  },
  indicatorContent: {
    alignItems: "center",
  },
  indicatorPill: {
    borderRadius: tokens.radius.full,
    paddingHorizontal: 9,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  indicatorText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },
  indicatorTail: {
    marginTop: 1,
    width: 7,
    height: 7,
    transform: [{ rotate: "45deg" }],
    marginBottom: -3,
  },

  // Barra de progreso
  track: {
    height: 11,
    width: "100%",
    borderRadius: tokens.radius.full,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
  },
  trackSegments: {
    flexDirection: "row",
    height: "100%",
    width: "100%",
  },
  segment: {
    height: "100%",
  },
  trackLine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 2,
  },

  // Ticks (marcadores OMS)
  ticksRow: {
    position: "relative",
    marginTop: tokens.spacing.sm,
    height: 10,
  },
  tick: {
    position: "absolute",
    top: 0,
    height: 10,
    width: 1,
    transform: [{ translateX: -0.5 }],
  },

  // Leyenda
  legend: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: tokens.spacing.md,
  },
  legendText: {
    fontSize: 10,
    fontWeight: "600",
  },

  // Resumen
  summary: {
    marginTop: tokens.spacing.md,
    fontSize: 12,
    lineHeight: 18,
  },
  summaryBold: {
    fontWeight: "800",
  },
  summaryCategory: {
    fontWeight: "700",
  },
});