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
export default function EstadisticasRendimientoCompuestos({ registros }: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const unit = (useUsuarioStore((s) => s.usuario?.medidaPeso) ?? "KG").toLowerCase();

  const stats = useMemo(() => {
    const regs = registros ?? [];
    const setsUnicos = new Set<number>();
    const ejerciciosUnicos = new Set<number>();

    let totalReps = 0;
    let volumenTotal = 0;
    let maxPeso = 0;
    let maxReps = 0;

    for (const r of regs) {
      setsUnicos.add(r.serieNumero);
      ejerciciosUnicos.add(r.ejercicioId);

      const peso = typeof r.pesoKg === "number" ? r.pesoKg : 0;
      const reps = typeof r.repeticiones === "number" ? r.repeticiones : 0;

      totalReps += reps;
      volumenTotal += peso * reps;
      if (peso > maxPeso) maxPeso = peso;
      if (reps > maxReps) maxReps = reps;
    }

    const totalSeries = setsUnicos.size;
    const pesoPromedioPorRep = totalReps ? volumenTotal / totalReps : 0;
    const repsPromedioPorSet = totalSeries ? totalReps / totalSeries : 0;

    return {
      totalSeries,
      totalReps,
      volumenTotal,
      pesoPromedioPorRep,
      repsPromedioPorSet,
      maxPeso,
      maxReps,
      ejerciciosSesion: ejerciciosUnicos.size,
    };
  }, [registros]);

  const items = [
    { label: "Sets", value: stats.totalSeries, suffix: "" },
    { label: "Reps totales", value: stats.totalReps, suffix: "" },
    { label: "Volumen total", value: Math.round(stats.volumenTotal), suffix: ` ${unit}·reps` },
    { label: "Peso promedio / rep", value: stats.pesoPromedioPorRep.toFixed(1), suffix: ` ${unit}` },
    { label: "Reps promedio / set", value: stats.repsPromedioPorSet.toFixed(1), suffix: "" },
    { label: "Peso máximo", value: stats.maxPeso.toFixed(1), suffix: ` ${unit}` },
    { label: "Reps máximas", value: stats.maxReps, suffix: "" },
    { label: "Ejercicios en sesión", value: stats.ejerciciosSesion, suffix: "" },
  ];

  const hasData = stats.totalSeries > 0 && (stats.totalReps > 0 || stats.volumenTotal > 0);

  const textPrimary = isDark ? tokens.color.textPrimaryDark : tokens.color.textPrimaryLight;
  const textSecondary = isDark ? tokens.color.textSecondaryDark : tokens.color.textSecondaryLight;

  return (
    <View
      accessibilityLabel="Estadísticas de rendimiento (compuestos)"
      style={styles.root}
    >
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
              Resumen del rendimiento (compuestos)
            </Text>
            <Text style={[styles.headerSubtitle, { color: textSecondary }]}>
              Unidad:{" "}
              <Text style={[styles.headerSubtitleBold, { color: textPrimary }]}>
                {unit}
              </Text>
            </Text>
          </View>

          {/* Contenido */}
          <View style={styles.body}>
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
                    accessibilityLabel={`${it.label}: ${it.value}${it.suffix}`}
                  >
                    <Text style={[styles.kpiLabel, { color: textSecondary }]}>
                      {it.label}
                    </Text>
                    <Text style={[styles.kpiValue, { color: textPrimary }]}>
                      {it.value}
                      <Text style={[styles.kpiSuffix, { color: textSecondary }]}>
                        {it.suffix}
                      </Text>
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.empty}>
                <Text style={[styles.emptyText, { color: textSecondary }]}>
                  Aún no hay datos suficientes para calcular estadísticas.
                </Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

// ── Estilos estáticos ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { width: "100%" },

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
  headerSubtitleBold: { fontWeight: "600" },

  // Body
  body: {
    paddingHorizontal: tokens.spacing.lg,
    paddingBottom: tokens.spacing.xl,
  },

  // Grid de KPIs
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: tokens.spacing.md,
  },
  kpi: {
    width: "48%",
    borderRadius: tokens.radius.md,
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
    borderWidth: 1,
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: "800",
    marginTop: tokens.spacing.xs,
  },
  kpiSuffix: {
    fontSize: 12,
    fontWeight: "600",
  },

  // Empty
  empty: {
    height: 96,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: { fontSize: 14 },
});