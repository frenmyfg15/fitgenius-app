// src/shared/components/estadistica/AdherenciaConsistenciaCard.tsx
import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useColorScheme } from "nativewind";
import { LinearGradient } from "expo-linear-gradient";

// ── Tokens (mismo sistema compartido) ────────────────────────────────────────
const tokens = {
  color: {
    frameGradient: ["#00E85A", "#A855F7"] as string[],

    cardBgDark: "rgba(15,24,41,0.75)",
    cardBgLight: "#FFFFFF",
    cardBorderDark: "rgba(255,255,255,0.08)",
    cardBorderLight: "rgba(0,0,0,0.06)",

    kpiBgDark: "rgba(255,255,255,0.05)",
    kpiBgLight: "rgba(255,255,255,0.80)",
    kpiBorderDark: "rgba(255,255,255,0.09)",
    kpiBorderLight: "#E2E8F0",

    rowBgDark: "rgba(15,23,42,0.85)",
    rowBgLight: "rgba(248,250,252,0.9)",
    rowBorderDark: "rgba(148,163,184,0.25)",
    rowBorderLight: "#E2E8F0",

    barTrackDark: "rgba(15,23,42,0.9)",
    barTrackLight: "#E5E7EB",

    emptyBorderDark: "rgba(255,255,255,0.10)",
    emptyBorderLight: "rgba(0,0,0,0.06)",

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

type Props = {
  planificadas: number;
  completadas: number;
  adherencia: number;
  consistencia: number;
};

const clampPct = (v: number) =>
  Math.max(0, Math.min(100, Number.isFinite(v) ? v : 0));

const getLabel = (value: number) => {
  if (value >= 90) return "Excelente";
  if (value >= 75) return "Muy bien";
  if (value >= 50) return "En progreso";
  return "Por mejorar";
};

export default function AdherenciaConsistenciaCard({
  planificadas,
  completadas,
  adherencia,
  consistencia,
}: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const adhe = clampPct(adherencia);
  const cons = clampPct(consistencia);

  const kpis = useMemo(
    () => [
      { label: "Sesiones planificadas", value: planificadas, accent: "green" as const },
      { label: "Sesiones completadas", value: completadas, accent: "purple" as const },
    ],
    [planificadas, completadas]
  );

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
          <CardBody isDark={isDark} kpis={kpis} adhe={adhe} cons={cons} />
        </View>
      </LinearGradient>
    </View>
  );
}

function CardBody({
  isDark,
  kpis,
  adhe,
  cons,
}: {
  isDark: boolean;
  kpis: { label: string; value: number; accent: "green" | "purple" }[];
  adhe: number;
  cons: number;
}) {
  const textPrimary = isDark ? tokens.color.textPrimaryDark : tokens.color.textPrimaryLight;
  const textSecondary = isDark ? tokens.color.textSecondaryDark : tokens.color.textSecondaryLight;
  const dotColor = isDark ? "#22C55E" : "#16A34A";

  return (
    <View style={styles.cardBody}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: textPrimary }]}>Progreso general</Text>
          <Text style={[styles.headerSubtitle, { color: textSecondary }]}>
            Resumen de adherencia y consistencia
          </Text>
        </View>

        <View style={styles.headerRight}>
          <View style={styles.headerRightRow}>
            <View style={[styles.headerDot, { backgroundColor: dotColor }]} />
            <Text style={[styles.headerRightText, { color: textSecondary }]}>Últimos días</Text>
          </View>
        </View>
      </View>

      <View style={styles.kpiRow}>
        {kpis.map((k) => (
          <View key={k.label} style={styles.kpiCol}>
            <Metric label={k.label} value={k.value} accent={k.accent} isDark={isDark} />
          </View>
        ))}
      </View>

      <View style={styles.progressStack}>
        <ProgressRow
          isDark={isDark}
          label="Adherencia"
          value={adhe}
          description="Porcentaje de sesiones completadas sobre las planificadas."
          fromColor={isDark ? "#22C55E" : "#16A34A"}
          toColor={isDark ? "#A3E635" : "#4ADE80"}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          labelRight={getLabel(adhe)}
        />

        <ProgressRow
          isDark={isDark}
          label="Consistencia"
          value={cons}
          description="Qué tan estable ha sido tu rutina semana a semana."
          fromColor={isDark ? "#A855F7" : "#8B5CF6"}
          toColor={isDark ? "#EC4899" : "#F97316"}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          labelRight={getLabel(cons)}
        />
      </View>

      <View
        style={[
          styles.note,
          { borderTopColor: isDark ? tokens.color.emptyBorderDark : tokens.color.emptyBorderLight },
        ]}
      >
        <Text style={[styles.noteText, { color: textSecondary }]}>
          Intenta mantener una adherencia alta con una consistencia estable: es la combinación ideal
          para progresar y evitar altibajos extremos.
        </Text>
      </View>
    </View>
  );
}

function Metric({
  label,
  value,
  accent,
  isDark,
}: {
  label: string;
  value: number;
  accent: "green" | "purple";
  isDark: boolean;
}) {
  const colorNum =
    accent === "green" ? (isDark ? "#4ADE80" : "#16A34A") : isDark ? "#A855F7" : "#7C3AED";

  const textMuted = isDark ? tokens.color.textMutedDark : tokens.color.textSecondaryLight;

  return (
    <View
      style={[
        styles.metric,
        {
          backgroundColor: isDark ? tokens.color.kpiBgDark : tokens.color.kpiBgLight,
          borderColor: isDark ? tokens.color.kpiBorderDark : tokens.color.kpiBorderLight,
        },
      ]}
    >
      <Text style={[styles.metricLabel, { color: textMuted }]}>{label}</Text>
      <Text style={[styles.metricValue, { color: colorNum }]}>{value}</Text>
    </View>
  );
}

function ProgressRow({
  isDark,
  label,
  value,
  description,
  fromColor,
  toColor,
  textPrimary,
  textSecondary,
  labelRight,
}: {
  isDark: boolean;
  label: string;
  value: number;
  description: string;
  fromColor: string;
  toColor: string;
  textPrimary: string;
  textSecondary: string;
  labelRight: string;
}) {
  const pct = Math.max(4, Math.min(100, value));

  return (
    <View
      style={[
        styles.progressRow,
        {
          backgroundColor: isDark ? tokens.color.rowBgDark : tokens.color.rowBgLight,
          borderColor: isDark ? tokens.color.rowBorderDark : tokens.color.rowBorderLight,
        },
      ]}
    >
      <View style={styles.progressHeader}>
        <Text style={[styles.progressTitle, { color: textPrimary }]}>{label}</Text>

        <View style={styles.progressRight}>
          <Text style={[styles.progressValue, { color: textPrimary }]}>{value.toFixed(0)}%</Text>
          <Text style={[styles.progressHint, { color: textSecondary }]}>{labelRight}</Text>
        </View>
      </View>

      <View style={styles.progressBarBlock}>
        <View
          style={[
            styles.progressTrack,
            { backgroundColor: isDark ? tokens.color.barTrackDark : tokens.color.barTrackLight },
          ]}
        >
          <LinearGradient
            colors={[fromColor, toColor]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${pct}%` }]}
          />
        </View>

        <View style={styles.progressTicks}>
          <Text style={[styles.progressTick, { color: textSecondary }]}>0%</Text>
          <Text style={[styles.progressTick, { color: textSecondary }]}>50%</Text>
          <Text style={[styles.progressTick, { color: textSecondary }]}>100%</Text>
        </View>
      </View>

      <Text style={[styles.progressDesc, { color: textSecondary }]}>{description}</Text>
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: tokens.spacing.xl,
    paddingBottom: tokens.spacing.md,
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
  headerRightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  headerRightText: {
    fontSize: 11,
  },

  kpiRow: {
    flexDirection: "row",
    gap: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: tokens.spacing.md,
  },
  kpiCol: { flex: 1 },

  metric: {
    borderRadius: tokens.radius.md,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    borderWidth: 1,
  },
  metricLabel: {
    fontSize: 12,
  },
  metricValue: {
    marginTop: tokens.spacing.xs,
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 32,
  },

  progressStack: {
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: tokens.spacing.lg,
    gap: tokens.spacing.md,
  },

  progressRow: {
    borderRadius: tokens.radius.md,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    borderWidth: 1,
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: tokens.spacing.sm,
  },
  progressTitle: {
    fontSize: 13,
    fontWeight: "600",
  },
  progressRight: {
    alignItems: "flex-end",
  },
  progressValue: {
    fontSize: 13,
    fontWeight: "700",
  },
  progressHint: {
    fontSize: 11,
    marginTop: 1,
  },

  progressBarBlock: {
    marginTop: tokens.spacing.xs,
    marginBottom: tokens.spacing.sm,
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  progressTicks: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: tokens.spacing.xs,
  },
  progressTick: {
    fontSize: 10,
  },
  progressDesc: {
    fontSize: 11,
  },

  note: {
    borderTopWidth: 1,
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: tokens.spacing.md,
    paddingBottom: tokens.spacing.lg,
  },
  noteText: {
    fontSize: 11,
  },
});
