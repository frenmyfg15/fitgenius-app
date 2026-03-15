import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";

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
    kpiBgLight: "#F8FAFC",
    kpiBorderDark: "rgba(255,255,255,0.08)",
    kpiBorderLight: "rgba(203,213,225,0.5)",

    textPrimaryDark: "#F1F5F9",
    textPrimaryLight: "#0F172A",
    textSecondaryDark: "#64748B",
    textSecondaryLight: "#64748B",
    textMutedDark: "#64748B",
    textMutedLight: "#94A3B8",
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
type SerieDetalle = {
  pesoKg: number | null;
  repeticiones: number | null;
};

type Props = {
  detallesSeries: SerieDetalle[];
  esCardio?: boolean;
};

// ── Componente ────────────────────────────────────────────────────────────────
export default function EstadisticasRendimiento({ detallesSeries, esCardio }: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const unit = (useUsuarioStore((s) => s.usuario?.medidaPeso) ?? "kg").toLowerCase();
  const isCardio = Boolean(esCardio);

  const stats = useMemo(() => {
    const sets = detallesSeries ?? [];
    const totalSeries = sets.length;

    let totalReps = 0;
    let totalPeso = 0;
    let maxPeso = 0;
    let maxReps = 0;

    for (const s of sets) {
      const reps = Number(s.repeticiones ?? 0);
      const peso = Number(s.pesoKg ?? 0);
      totalReps += reps;
      totalPeso += peso * reps;
      if (peso > maxPeso) maxPeso = peso;
      if (reps > maxReps) maxReps = reps;
    }

    const pesoPromedio = totalReps ? totalPeso / totalReps : 0;
    const repsPromedio = totalSeries ? totalReps / totalSeries : 0;

    return {
      totalSeries,
      totalReps,
      totalPeso,
      pesoPromedio,
      repsPromedio,
      maxPeso,
      maxReps,
      tiempoTotal: totalReps,
      tiempoMedioSerie: repsPromedio,
      tiempoMaxSerie: maxReps,
    };
  }, [detallesSeries]);

  const items = isCardio
    ? [
      { label: "Series", value: stats.totalSeries, suffix: "" },
      { label: "Tiempo total", value: stats.tiempoTotal.toFixed(0), suffix: " s" },
      { label: "Tiempo / serie", value: stats.tiempoMedioSerie.toFixed(1), suffix: " s" },
      { label: "Tiempo máx. serie", value: stats.tiempoMaxSerie.toFixed(0), suffix: " s" },
      ...(stats.maxPeso > 0
        ? [{ label: "Máximo peso", value: stats.maxPeso.toFixed(1), suffix: ` ${unit}` }]
        : []),
    ]
    : [
      { label: "Series", value: stats.totalSeries, suffix: "" },
      { label: "Reps totales", value: stats.totalReps, suffix: "" },
      { label: "Volumen", value: stats.totalPeso.toFixed(1), suffix: ` ${unit}` },
      { label: "Peso / rep", value: stats.pesoPromedio.toFixed(1), suffix: ` ${unit}` },
      { label: "Reps / serie", value: stats.repsPromedio.toFixed(1), suffix: "" },
      { label: "Máximo peso", value: stats.maxPeso.toFixed(1), suffix: ` ${unit}` },
      { label: "Máximas reps", value: stats.maxReps, suffix: "" },
    ];

  const hasData = isCardio
    ? stats.totalSeries > 0 && stats.tiempoTotal > 0
    : stats.totalSeries > 0 && (stats.totalReps > 0 || stats.totalPeso > 0);

  const textPrimary = isDark ? tokens.color.textPrimaryDark : tokens.color.textPrimaryLight;
  const textSecondary = isDark ? tokens.color.textSecondaryDark : tokens.color.textSecondaryLight;
  const textMuted = isDark ? tokens.color.textMutedDark : tokens.color.textMutedLight;

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
          <Text style={[styles.headerTitle, { color: textPrimary }]}>
            Rendimiento general
          </Text>

          {/* Contenido */}
          {hasData ? (
            <View style={styles.grid}>
              {items.map((it) => (
                <View
                  key={it.label}
                  style={[
                    styles.kpi,
                    {
                      backgroundColor: isDark ? tokens.color.kpiBgDark : tokens.color.kpiBgLight,
                      borderColor: isDark ? tokens.color.kpiBorderDark : tokens.color.kpiBorderLight,
                    },
                  ]}
                >
                  <Text style={[styles.kpiLabel, { color: textSecondary }]}>
                    {it.label}
                  </Text>
                  <Text style={[styles.kpiValue, { color: textPrimary }]}>
                    {it.value}
                    <Text style={[styles.kpiSuffix, { color: textMuted }]}>
                      {it.suffix}
                    </Text>
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.empty}>
              <Text style={[styles.emptyText, { color: textSecondary }]}>
                No hay datos suficientes aún.
              </Text>
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
    paddingHorizontal: tokens.spacing.xl,
    paddingVertical: tokens.spacing.xl,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  // Header — fontSize 13 + letterSpacing 0.2, igual que IMCVisual
  headerTitle: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.2,
    marginBottom: tokens.spacing.lg,
  },

  // Grid de KPIs
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: tokens.spacing.md,
  },
  kpi: {
    width: "47%",
    borderRadius: tokens.radius.md,
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
    borderWidth: 1,
  },
  kpiLabel: {
    fontSize: 12,
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 2,
  },
  kpiSuffix: {
    fontSize: 11,
  },

  // Empty
  empty: {
    paddingVertical: tokens.spacing.xl + tokens.spacing.lg,
    alignItems: "center",
  },
  emptyText: { fontSize: 14 },
});