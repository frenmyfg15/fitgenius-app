import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";
import { kgToLb } from "@/shared/utils/kgToLb";

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
  pesoKg: number | null; // ✅ siempre en kg
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
  const unit = (useUsuarioStore((s) => s.usuario?.medidaPeso) ?? "KG").toUpperCase();
  const isCardio = Boolean(esCardio);

  const formatWeightValue = (kg: number) => {
    if (unit === "LB") {
      return kgToLb(kg).replace(/\s*lb$/i, "");
    }
    return kg.toFixed(1);
  };

  const unitLabel = unit.toLowerCase();

  const stats = useMemo(() => {
    const sets = detallesSeries ?? [];
    const totalSeries = sets.length;

    let totalReps = 0;
    let totalPesoKg = 0;
    let maxPesoKg = 0;
    let maxReps = 0;

    for (const s of sets) {
      const reps = Number(s.repeticiones ?? 0);
      const pesoKg = Number(s.pesoKg ?? 0);

      totalReps += reps;
      totalPesoKg += pesoKg * reps;
      if (pesoKg > maxPesoKg) maxPesoKg = pesoKg;
      if (reps > maxReps) maxReps = reps;
    }

    const pesoPromedioKg = totalReps ? totalPesoKg / totalReps : 0;
    const repsPromedio = totalSeries ? totalReps / totalSeries : 0;

    return {
      totalSeries,
      totalReps,
      totalPesoKg,
      pesoPromedioKg,
      repsPromedio,
      maxPesoKg,
      maxReps,
      tiempoTotal: totalReps,
      tiempoMedioSerie: repsPromedio,
      tiempoMaxSerie: maxReps,
    };
  }, [detallesSeries]);

  const items = isCardio
    ? [
      { label: "Series", value: String(stats.totalSeries), suffix: "" },
      { label: "Tiempo total", value: stats.tiempoTotal.toFixed(0), suffix: " s" },
      { label: "Tiempo / serie", value: stats.tiempoMedioSerie.toFixed(1), suffix: " s" },
      { label: "Tiempo máx. serie", value: stats.tiempoMaxSerie.toFixed(0), suffix: " s" },
      ...(stats.maxPesoKg > 0
        ? [{ label: "Máximo peso", value: formatWeightValue(stats.maxPesoKg), suffix: ` ${unitLabel}` }]
        : []),
    ]
    : [
      { label: "Series", value: String(stats.totalSeries), suffix: "" },
      { label: "Reps totales", value: String(stats.totalReps), suffix: "" },
      { label: "Volumen", value: formatWeightValue(stats.totalPesoKg), suffix: ` ${unitLabel}` },
      { label: "Peso / rep", value: formatWeightValue(stats.pesoPromedioKg), suffix: ` ${unitLabel}` },
      { label: "Reps / serie", value: stats.repsPromedio.toFixed(1), suffix: "" },
      { label: "Máximo peso", value: formatWeightValue(stats.maxPesoKg), suffix: ` ${unitLabel}` },
      { label: "Máximas reps", value: String(stats.maxReps), suffix: "" },
    ];

  const hasData = isCardio
    ? stats.totalSeries > 0 && stats.tiempoTotal > 0
    : stats.totalSeries > 0 && (stats.totalReps > 0 || stats.totalPesoKg > 0);

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
          <Text style={[styles.headerTitle, { color: textPrimary }]}>
            Rendimiento general
          </Text>

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

  frame: {
    borderRadius: tokens.radius.lg,
    padding: 1.5,
    overflow: "hidden",
  },

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

  headerTitle: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.2,
    marginBottom: tokens.spacing.lg,
  },

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

  empty: {
    paddingVertical: tokens.spacing.xl + tokens.spacing.lg,
    alignItems: "center",
  },
  emptyText: { fontSize: 14 },
});