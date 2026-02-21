// src/shared/components/estadistica/ProgresoSubjetivoEjerciciosCard.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useColorScheme } from "nativewind";
import { LinearGradient } from "expo-linear-gradient";
import { TrendingUp } from "lucide-react-native";

// ── Tokens (mismo sistema compartido) ────────────────────────────────────────
const tokens = {
  color: {
    frameGradient: ["#00E85A", "#A855F7"] as string[],

    cardBgDark: "rgba(15,24,41,0.75)",
    cardBgLight: "#FFFFFF",
    cardBorderDark: "rgba(255,255,255,0.08)",
    cardBorderLight: "rgba(0,0,0,0.06)",

    iconBgDark: "rgba(56,189,248,0.12)",
    iconBgLight: "rgba(59,130,246,0.08)",
    iconBlueDark: "#38BDF8",
    iconBlueLight: "#0284C7",

    trackDark: "rgba(15,23,42,0.9)",
    trackLight: "#E5E7EB",

    textPrimaryDark: "#F1F5F9",
    textPrimaryLight: "#0F172A",
    textSecondaryDark: "#64748B",
    textSecondaryLight: "#64748B",
    textMutedDark: "#94A3B8",
    textMutedLight: "#6B7280",

    trendUpTextDark: "#FB7185",
    trendUpTextLight: "#B91C1C",
    trendDownTextDark: "#4ADE80",
    trendDownTextLight: "#15803D",

    trendUpBgDark: "rgba(248,113,113,0.14)",
    trendUpBgLight: "rgba(254,202,202,0.7)",
    trendDownBgDark: "rgba(74,222,128,0.12)",
    trendDownBgLight: "rgba(187,247,208,0.7)",
    trendStableBgDark: "rgba(148,163,184,0.14)",
    trendStableBgLight: "rgba(226,232,240,0.7)",

    trendUpBorderDark: "rgba(248,113,113,0.35)",
    trendUpBorderLight: "rgba(248,113,113,0.8)",
    trendDownBorderDark: "rgba(74,222,128,0.35)",
    trendDownBorderLight: "rgba(34,197,94,0.8)",
    trendStableBorderDark: "rgba(148,163,184,0.4)",
    trendStableBorderLight: "rgba(148,163,184,0.6)",

    barLow: "#38BDF8",
    barMid: "#0EA5E9",
    barHigh: "#0369A1",

    noteBorderDark: "rgba(255,255,255,0.08)",
    noteBorderLight: "rgba(0,0,0,0.06)",

    emptyIconBgDark: "rgba(56,189,248,0.12)",
    emptyIconBgLight: "#E0F2FE",
    emptyTitleDark: "#E5E7EB",
    emptyTitleLight: "#334155",
    emptySubtitleDark: "#94A3B8",
    emptySubtitleLight: "#64748B",
  },
  radius: { lg: 16, md: 12, sm: 8 },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20 },
} as const;

type EjercicioSubjetivo = {
  nombre?: string;
  sesiones?: number;
  estresMedio?: number;
  tendencia?: "sube" | "baja" | "estable";
};

type Props = {
  diasAnalizados?: number;
  ejercicios?: EjercicioSubjetivo[];
};

const ProgresoSubjetivoEjerciciosCard: React.FC<Props> = ({ diasAnalizados, ejercicios }) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const hasData = !!ejercicios && Array.isArray(ejercicios) && ejercicios.length > 0;
  const topEjercicios = hasData ? ejercicios!.slice(0, 5) : [];

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
          {hasData ? (
            <CardBody isDark={isDark} diasAnalizados={diasAnalizados} ejercicios={topEjercicios} />
          ) : (
            <EmptyState isDark={isDark} />
          )}
        </View>
      </LinearGradient>
    </View>
  );
};

export default ProgresoSubjetivoEjerciciosCard;

function CardBody({
  isDark,
  diasAnalizados,
  ejercicios,
}: {
  isDark: boolean;
  diasAnalizados?: number;
  ejercicios: EjercicioSubjetivo[];
}) {
  const textPrimary = isDark ? tokens.color.textPrimaryDark : tokens.color.textPrimaryLight;
  const textSecondary = isDark ? tokens.color.textSecondaryDark : tokens.color.textSecondaryLight;
  const textMuted = isDark ? tokens.color.textMutedDark : tokens.color.textMutedLight;

  const tendenciaText = (t?: "sube" | "baja" | "estable") => {
    if (t === "sube") return "Se siente más exigente";
    if (t === "baja") return "Se siente más llevadero";
    return "Sensación estable";
  };

  const tendenciaColor = (t?: "sube" | "baja" | "estable") => {
    if (t === "sube") return isDark ? tokens.color.trendUpTextDark : tokens.color.trendUpTextLight;
    if (t === "baja") return isDark ? tokens.color.trendDownTextDark : tokens.color.trendDownTextLight;
    return textMuted;
  };

  const tendenciaBadgeBg = (t?: "sube" | "baja" | "estable") => {
    if (t === "sube") return isDark ? tokens.color.trendUpBgDark : tokens.color.trendUpBgLight;
    if (t === "baja") return isDark ? tokens.color.trendDownBgDark : tokens.color.trendDownBgLight;
    return isDark ? tokens.color.trendStableBgDark : tokens.color.trendStableBgLight;
  };

  const tendenciaBadgeBorder = (t?: "sube" | "baja" | "estable") => {
    if (t === "sube") return isDark ? tokens.color.trendUpBorderDark : tokens.color.trendUpBorderLight;
    if (t === "baja") return isDark ? tokens.color.trendDownBorderDark : tokens.color.trendDownBorderLight;
    return isDark ? tokens.color.trendStableBorderDark : tokens.color.trendStableBorderLight;
  };

  const getBarColor = (carga: number) => {
    if (carga <= 4) return tokens.color.barLow;
    if (carga <= 7) return tokens.color.barMid;
    return tokens.color.barHigh;
  };

  return (
    <View style={styles.cardBody}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.iconWrap,
              { backgroundColor: isDark ? tokens.color.iconBgDark : tokens.color.iconBgLight },
            ]}
          >
            <TrendingUp
              size={18}
              color={isDark ? tokens.color.iconBlueDark : tokens.color.iconBlueLight}
            />
          </View>

          <View>
            <Text style={[styles.headerTitle, { color: textPrimary }]}>
              Progreso subjetivo por ejercicio
            </Text>
            <Text style={[styles.headerSubtitle, { color: textSecondary }]}>
              Qué ejercicios notas más duros o más llevaderos
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <Text style={[styles.headerKpiLabel, { color: textMuted }]}>Días analizados</Text>
          <Text style={[styles.headerKpiValue, { color: textPrimary }]}>
            {diasAnalizados ?? "–"}
          </Text>
        </View>
      </View>

      <View style={styles.list}>
        {ejercicios.map((ej, idx) => {
          const carga = ej.estresMedio ?? 0;
          const pct = Math.max(6, Math.min(100, (carga / 10) * 100));
          const barColor = getBarColor(carga);

          return (
            <View key={`${ej.nombre ?? idx}`} style={styles.item}>
              <View style={styles.itemTop}>
                <View style={styles.itemLeft}>
                  <Text numberOfLines={1} style={[styles.itemTitle, { color: textPrimary }]}>
                    {ej.nombre ?? "Ejercicio"}
                  </Text>
                  <Text style={[styles.itemSub, { color: textMuted }]}>
                    {ej.sesiones ?? 0} sesión{ej.sesiones === 1 ? "" : "es"}
                  </Text>
                </View>

                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: tendenciaBadgeBg(ej.tendencia),
                      borderColor: tendenciaBadgeBorder(ej.tendencia),
                    },
                  ]}
                >
                  <Text style={[styles.badgeText, { color: tendenciaColor(ej.tendencia) }]}>
                    {tendenciaText(ej.tendencia)}
                  </Text>
                </View>
              </View>

              <View style={styles.barRow}>
                <View style={styles.barCol}>
                  <View
                    style={[
                      styles.track,
                      { backgroundColor: isDark ? tokens.color.trackDark : tokens.color.trackLight },
                    ]}
                  >
                    <View style={[styles.fill, { width: `${pct}%`, backgroundColor: barColor }]} />
                  </View>
                </View>

                <View style={styles.valueCol}>
                  <Text style={[styles.valueText, { color: textPrimary }]}>
                    {carga ? carga.toFixed(1) : "–"}
                    <Text style={[styles.valueUnit, { color: textSecondary }]}>/10</Text>
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      <View
        style={[
          styles.note,
          { borderTopColor: isDark ? tokens.color.noteBorderDark : tokens.color.noteBorderLight },
        ]}
      >
        <Text style={[styles.noteText, { color: textSecondary }]}>
          Usa estas sensaciones para ajustar técnica, descansos y peso: si un ejercicio se vuelve
          cada vez más llevadero, es buena señal de progreso.
        </Text>
      </View>
    </View>
  );
}

function EmptyState({ isDark }: { isDark: boolean }) {
  return (
    <View style={styles.emptyState}>
      <View
        style={[
          styles.emptyIcon,
          { backgroundColor: isDark ? tokens.color.emptyIconBgDark : tokens.color.emptyIconBgLight },
        ]}
      >
        <Text style={{ color: isDark ? tokens.color.emptyTitleDark : "#0EA5E9" }}>📈</Text>
      </View>
      <Text
        style={[
          styles.emptyTitle,
          { color: isDark ? tokens.color.emptyTitleDark : tokens.color.emptyTitleLight },
        ]}
      >
        Aún no hay progreso subjetivo
      </Text>
      <Text
        style={[
          styles.emptySubtitle,
          { color: isDark ? tokens.color.emptySubtitleDark : tokens.color.emptySubtitleLight },
        ]}
      >
        Cuando registres varias sesiones marcando el nivel de esfuerzo, te mostraremos qué
        ejercicios se sienten más duros o más ligeros con el tiempo.
      </Text>
    </View>
  );
}

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
    borderRadius: tokens.radius.lg - 1,
  },

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
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.1,
  },
  headerSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  headerKpiLabel: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  headerKpiValue: {
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 24,
  },

  list: {
    paddingHorizontal: tokens.spacing.lg,
    paddingBottom: tokens.spacing.lg,
    gap: tokens.spacing.md,
  },
  item: {},
  itemTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  itemLeft: {
    flex: 1,
    paddingRight: tokens.spacing.sm,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: "600",
  },
  itemSub: {
    fontSize: 11,
    marginTop: 1,
  },

  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },

  barRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.sm,
  },
  barCol: { flex: 1 },
  valueCol: { width: 56, alignItems: "flex-end" },
  track: {
    height: 10,
    borderRadius: 999,
    overflow: "hidden",
  },
  fill: { height: "100%" },
  valueText: { fontSize: 12, fontWeight: "700" },
  valueUnit: { fontSize: 10 },

  note: {
    borderTopWidth: 1,
    paddingHorizontal: tokens.spacing.lg,
    paddingTop: tokens.spacing.md,
    paddingBottom: tokens.spacing.lg,
  },
  noteText: { fontSize: 11 },

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
  emptyTitle: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 12,
    marginTop: tokens.spacing.xs,
    textAlign: "center",
  },
});
