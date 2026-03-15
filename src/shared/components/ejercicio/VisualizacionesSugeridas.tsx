import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";

import {
  computeMetrics,
  generateSuggestions,
  groupByCategory,
  buildNextSessionPlan,
  type Sug,
  type Serie,
} from "@/shared/lib/sugerencias";

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

    groupBgDark: "rgba(255,255,255,0.05)",
    groupBgLight: "#F8FAFC",
    groupBorderDark: "rgba(255,255,255,0.10)",
    groupBorderLight: "#E2E8F0",

    dotDark: "#94A3B8",
    dotLight: "#94A3B8",

    textPrimaryDark: "#F1F5F9",
    textPrimaryLight: "#0F172A",
    textSecondaryDark: "#94A3B8",
    textSecondaryLight: "#6B7280",
    textBodyDark: "#E2E8F0",
    textBodyLight: "#404040",

    planLabelDark: "#64748B",
    planLabelLight: "#6B7280",
  },
  radius: { lg: 16, md: 12, sm: 8, full: 999 },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20 },
} as const;

const GRADIENT = [
  tokens.color.gradientStart,
  tokens.color.gradientMid,
  tokens.color.gradientEnd,
] as const;

// Paleta badges de categoría — sin cambios
const CAT_COLORS: Record<Sug["cat"], [string, string]> = {
  Carga: ["#e2e8f0", "#cbd5e1"],
  Volumen: ["#bfdbfe", "#93c5fd"],
  Técnica: ["#a7f3d0", "#6ee7b7"],
  Recuperación: ["#e9d5ff", "#d8b4fe"],
  Progresión: ["#fde68a", "#fcd34d"],
};

// ── Tipos ─────────────────────────────────────────────────────────────────────
type Props = {
  detallesSeries: Serie[];
  esCardio?: boolean;
};

// ── CatBadge ──────────────────────────────────────────────────────────────────
function CatBadge({ cat, isDark }: { cat: Sug["cat"]; isDark: boolean }) {
  const [c1, c2] = CAT_COLORS[cat];
  return (
    <LinearGradient
      colors={[c1, c2]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.badge}
    >
      <Text style={[styles.badgeText, { color: isDark ? "#171717" : "#0F172A" }]}>
        {cat}
      </Text>
    </LinearGradient>
  );
}

// ── Componente ────────────────────────────────────────────────────────────────
export default function VisualizacionesSugeridas({ detallesSeries, esCardio }: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const isCardio = Boolean(esCardio);

  const { usuario } = useUsuarioStore();
  const weightUnit = (usuario?.medidaPeso ?? "KG").toLowerCase();

  const metrics = useMemo(() => computeMetrics(detallesSeries), [detallesSeries]);
  const sugs = useMemo(() => generateSuggestions(metrics, { esCardio }), [metrics, esCardio]);
  const byCat = useMemo(() => groupByCategory(sugs), [sugs]);
  const plan = useMemo(() => buildNextSessionPlan(metrics.zone), [metrics.zone]);

  const hasData = metrics.n && (metrics.totalReps || metrics.totalVol);

  const textPrimary = isDark ? tokens.color.textPrimaryDark : tokens.color.textPrimaryLight;
  const textSecondary = isDark ? tokens.color.textSecondaryDark : tokens.color.textSecondaryLight;
  const textBody = isDark ? tokens.color.textBodyDark : tokens.color.textBodyLight;
  const planLabel = isDark ? tokens.color.planLabelDark : tokens.color.planLabelLight;

  // ── Sin datos ──────────────────────────────────────────────────────────────
  if (!hasData) {
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
                paddingHorizontal: tokens.spacing.xl,
                paddingVertical: tokens.spacing.xl + tokens.spacing.sm,
              },
            ]}
          >
            <Text style={[styles.emptyText, { color: textSecondary }]}>
              {isCardio
                ? "Aún no hay suficientes datos para generar sugerencias. Registra al menos 1 sesión con tiempo en segundos."
                : "Aún no hay suficientes datos para generar sugerencias. Registra al menos 1 sesión con peso y repeticiones."}
            </Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  // ── Subtítulo del header ───────────────────────────────────────────────────
  const renderHeaderSubtitle = () => {
    if (isCardio) {
      return (
        <Text style={[styles.headerSubtitle, { color: textSecondary }]}>
          Sets: <Text style={[styles.headerSubtitleBold, { color: textPrimary }]}>{metrics.n}</Text>
          {" · "}Tiempo total:{" "}
          <Text style={[styles.headerSubtitleBold, { color: textPrimary }]}>
            {metrics.totalReps.toFixed(0)} s
          </Text>
          {metrics.totalVol > 0 && (
            <>
              {" · "}Volumen:{" "}
              <Text style={[styles.headerSubtitleBold, { color: textPrimary }]}>
                {metrics.totalVol.toFixed(1)} {weightUnit}
              </Text>
            </>
          )}
        </Text>
      );
    }
    return (
      <Text style={[styles.headerSubtitle, { color: textSecondary }]}>
        Sets: <Text style={[styles.headerSubtitleBold, { color: textPrimary }]}>{metrics.n}</Text>
        {" · "}Volumen:{" "}
        <Text style={[styles.headerSubtitleBold, { color: textPrimary }]}>
          {metrics.totalVol.toFixed(1)} {weightUnit}
        </Text>
      </Text>
    );
  };

  return (
    <View accessibilityLabel="Sugerencias inteligentes" style={styles.root}>
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
              Sugerencias personalizadas
            </Text>
            {renderHeaderSubtitle()}
          </View>

          {/* Cuerpo */}
          <View style={styles.body}>
            {/* Grupos por categoría */}
            <View style={styles.groupStack}>
              {Object.entries(byCat).map(([cat, textos]) => (
                <View
                  key={cat}
                  style={[
                    styles.group,
                    {
                      backgroundColor: isDark ? tokens.color.groupBgDark : tokens.color.groupBgLight,
                      borderColor: isDark ? tokens.color.groupBorderDark : tokens.color.groupBorderLight,
                    },
                  ]}
                >
                  <View style={styles.groupBadgeWrap}>
                    <CatBadge cat={cat as Sug["cat"]} isDark={isDark} />
                  </View>
                  <View style={styles.bulletStack}>
                    {(textos as string[]).map((t, i) => (
                      <View key={`${cat}-${i}`} style={styles.bulletRow}>
                        <View
                          style={[
                            styles.dot,
                            {
                              backgroundColor: isDark
                                ? tokens.color.dotDark
                                : tokens.color.dotLight,
                            },
                          ]}
                        />
                        <Text style={[styles.bulletText, { color: textBody }]}>{t}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>

            {/* Plan próximo entrenamiento */}
            <View
              style={[
                styles.group,
                styles.planGroup,
                {
                  backgroundColor: isDark ? tokens.color.groupBgDark : tokens.color.groupBgLight,
                  borderColor: isDark ? tokens.color.groupBorderDark : tokens.color.groupBorderLight,
                },
              ]}
            >
              <Text style={[styles.planLabel, { color: planLabel }]}>
                PLAN SUGERIDO (PRÓXIMA SESIÓN)
              </Text>
              <View style={styles.planLines}>
                {[
                  `Calentamiento: ${plan.warmup}`,
                  `Sets de trabajo: ${plan.workRange}`,
                  `Progresión: ${plan.progression}`,
                  `Descanso: ${plan.rest} entre sets.`,
                  `Notas: ${plan.notes}`,
                ].map((line, i) => (
                  <Text key={i} style={[styles.planLine, { color: textBody }]}>
                    • {line}
                  </Text>
                ))}
              </View>
            </View>
          </View>
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
  headerSubtitleBold: { fontWeight: "600" },

  // Cuerpo
  body: {
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: tokens.spacing.xl,
  },

  // Grupos
  groupStack: { gap: tokens.spacing.lg },
  group: {
    borderRadius: tokens.radius.md,
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
    borderWidth: 1,
  },
  groupBadgeWrap: { marginBottom: tokens.spacing.sm },

  // Bullets
  bulletStack: { gap: tokens.spacing.sm },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: tokens.spacing.sm,
  },
  dot: {
    marginTop: 6,
    width: 6,
    height: 6,
    borderRadius: tokens.radius.full,
  },
  bulletText: { flex: 1, fontSize: 14 },

  // Plan
  planGroup: { marginTop: tokens.spacing.lg },
  planLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.8,
    marginBottom: tokens.spacing.sm,
  },
  planLines: { gap: 6 },
  planLine: { fontSize: 14 },

  // Empty
  emptyText: { fontSize: 14, textAlign: "center" },

  // Badge de categoría
  badge: {
    alignSelf: "flex-start",
    borderRadius: tokens.radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: { fontSize: 12, fontWeight: "600" },
});