// File: src/features/fit/components/IMCVisual.tsx
import React, { useMemo, useState, useCallback } from "react";
import { View, Text, LayoutChangeEvent, StyleSheet } from "react-native";
import { useColorScheme } from "nativewind";
import { Colors, scheme } from "@/shared/constants/colors";
import { Font } from "@/shared/constants/typography";

const MIN_IMC = 15;
const MAX_IMC = 35;
const CUTS = [18.5, 25, 30] as const;

const COLORS = {
  azulClaro: "#60A5FA",
  verde: "#22C55E",
  amarillo: "#F59E0B",
  rojo: "#EF4444",
} as const;

type IMCVisualProps = {
  peso?: number | string | null;
  altura?: number | string | null;
};

export default function IMCVisual({ peso, altura }: IMCVisualProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const t = scheme(isDark);

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

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.card,
          { backgroundColor: isDark ? Colors.dark.surface : Colors.secondary },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: t.textPrimary }]}>
            IMC actual
          </Text>

          <View
            style={[
              styles.badge,
              {
                backgroundColor: isDark ? t.border : t.surface,
                borderColor: t.border,
              },
            ]}
          >
            <Text style={[styles.badgeText, { color: t.textPrimary }]}>
              {categoria}
            </Text>
          </View>
        </View>

        {/* Contenido */}
        {!hasImc ? (
          <Text style={[styles.noData, { color: t.textTertiary }]}>
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
                  <View style={[styles.indicatorPill, { backgroundColor: color }]}>
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
                    backgroundColor: isDark ? t.border : t.surface,
                    borderColor: t.border,
                  },
                ]}
                accessibilityRole="progressbar"
                accessibilityLabel="Barra de IMC"
                accessibilityValue={{ min: MIN_IMC, max: MAX_IMC, now: imc }}
              >
                <View style={styles.trackSegments}>
                  <View style={[styles.segment, { width: `${widthsPct[0]}%`, backgroundColor: COLORS.azulClaro }]} />
                  <View style={[styles.segment, { width: `${widthsPct[1]}%`, backgroundColor: COLORS.verde }]} />
                  <View style={[styles.segment, { width: `${widthsPct[2]}%`, backgroundColor: COLORS.amarillo }]} />
                  <View style={[styles.segment, { width: `${widthsPct[3]}%`, backgroundColor: COLORS.rojo }]} />
                </View>

                <View
                  style={[
                    styles.trackLine,
                    {
                      backgroundColor: "rgba(255,255,255,0.90)",
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
                          backgroundColor: t.border,
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
              {["Bajo", "Normal", "Sobrepeso", "Obesidad"].map((label, i) => (
                <Text
                  key={i}
                  style={[
                    styles.legendText,
                    {
                      color: t.textSecondary,
                      textAlign: (i === 0 ? "left" : i === 3 ? "right" : "center") as any,
                    },
                  ]}
                >
                  {label}
                </Text>
              ))}
            </View>

            {/* Resumen */}
            <Text style={[styles.summary, { color: t.textSecondary }]}>
              Resultado IMC:{" "}
              <Text style={[styles.summaryBold, { color: t.textPrimary }]}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: "100%",
    maxWidth: 520,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.accentBorder,
    padding: 20,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: "700",
    fontFamily: Font.body.bold,
    letterSpacing: 0.2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    fontFamily: Font.body.bold,
  },
  noData: {
    fontSize: 13,
    fontFamily: Font.body.regular,
    lineHeight: 20,
  },
  indicatorWrapper: {
    position: "relative",
    marginBottom: 4,
  },
  indicator: {
    position: "absolute",
    top: -28,
  },
  indicatorContent: {
    alignItems: "center",
  },
  indicatorPill: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  indicatorText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
    fontFamily: Font.body.bold,
  },
  indicatorTail: {
    marginTop: 1,
    width: 7,
    height: 7,
    transform: [{ rotate: "45deg" }],
    marginBottom: -3,
  },
  track: {
    height: 11,
    width: "100%",
    borderRadius: 999,
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
  ticksRow: {
    position: "relative",
    marginTop: 8,
    height: 10,
  },
  tick: {
    position: "absolute",
    top: 0,
    height: 10,
    width: 1,
    transform: [{ translateX: -0.5 }],
  },
  legend: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  legendText: {
    fontSize: 10,
    fontWeight: "600",
    fontFamily: Font.body.semiBold,
  },
  summary: {
    marginTop: 12,
    fontSize: 12,
    fontFamily: Font.body.regular,
    lineHeight: 18,
  },
  summaryBold: {
    fontWeight: "800",
    fontFamily: Font.body.bold,
  },
  summaryCategory: {
    fontWeight: "700",
    fontFamily: Font.body.bold,
  },
});
