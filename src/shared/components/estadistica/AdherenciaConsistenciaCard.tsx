// src/shared/components/estadistica/AdherenciaConsistenciaCard.tsx
import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useColorScheme } from "nativewind";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, scheme } from "@/shared/constants/colors";
import { Font } from "@/shared/constants/typography";

// ── Tipos ─────────────────────────────────────────────────────────────────────
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

// ── Componente ────────────────────────────────────────────────────────────────
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
    <View style={[styles.card, { backgroundColor: isDark ? Colors.dark.surface : Colors.secondary }]}>
      <CardBody isDark={isDark} kpis={kpis} adhe={adhe} cons={cons} />
    </View>
  );
}

// ── CardBody ──────────────────────────────────────────────────────────────────
function CardBody({
  isDark, kpis, adhe, cons,
}: {
  isDark: boolean;
  kpis: { label: string; value: number; accent: "green" | "purple" }[];
  adhe: number;
  cons: number;
}) {
  const t = scheme(isDark);

  return (
    <View style={styles.cardBody}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: t.textPrimary }]}>
            Progreso general
          </Text>
          <Text style={[styles.headerSubtitle, { color: t.textSecondary }]}>
            Resumen de adherencia y consistencia
          </Text>
        </View>

        <View style={styles.headerRight}>
          <View style={styles.headerRightRow}>
            <View style={[styles.headerDot, { backgroundColor: Colors.accent }]} />
            <Text style={[styles.headerRightText, { color: t.textSecondary }]}>
              Últimos días
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.kpiRow}>
        {kpis.map((k) => (
          <View key={k.label} style={styles.kpiCol}>
            <Metric
              label={k.label}
              value={k.value}
              accent={k.accent}
              isDark={isDark}
            />
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
          textPrimary={t.textPrimary}
          textSecondary={t.textSecondary}
          labelRight={getLabel(adhe)}
        />
        <ProgressRow
          isDark={isDark}
          label="Consistencia"
          value={cons}
          description="Qué tan estable ha sido tu rutina semana a semana."
          fromColor={isDark ? "#A855F7" : "#8B5CF6"}
          toColor={isDark ? "#EC4899" : "#F97316"}
          textPrimary={t.textPrimary}
          textSecondary={t.textSecondary}
          labelRight={getLabel(cons)}
        />
      </View>

      <View style={[styles.note, { borderTopColor: t.border }]}>
        <Text style={[styles.noteText, { color: t.textSecondary }]}>
          Intenta mantener una adherencia alta con una consistencia estable: es la
          combinación ideal para progresar y evitar altibajos extremos.
        </Text>
      </View>
    </View>
  );
}

// ── Metric ────────────────────────────────────────────────────────────────────
function Metric({
  label, value, accent, isDark,
}: {
  label: string;
  value: number;
  accent: "green" | "purple";
  isDark: boolean;
}) {
  const colorNum =
    accent === "green"
      ? isDark ? "#4ADE80" : "#16A34A"
      : isDark ? "#A855F7" : "#7C3AED";

  const t = scheme(isDark);

  return (
    <View
      style={[
        styles.metric,
        {
          backgroundColor: isDark ? t.border : t.surface,
          borderColor: t.border,
        },
      ]}
    >
      <Text style={[styles.metricLabel, { color: t.textTertiary }]}>{label}</Text>
      <Text style={[styles.metricValue, { color: colorNum }]}>{value}</Text>
    </View>
  );
}

// ── ProgressRow ───────────────────────────────────────────────────────────────
function ProgressRow({
  isDark, label, value, description,
  fromColor, toColor, textPrimary, textSecondary, labelRight,
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
  const t = scheme(isDark);
  const pct = Math.max(4, Math.min(100, value));

  return (
    <View
      style={[
        styles.progressRow,
        {
          backgroundColor: isDark ? Colors.dark.surface : t.surface,
          borderColor: t.border,
        },
      ]}
    >
      <View style={styles.progressHeader}>
        <Text style={[styles.progressTitle, { color: textPrimary }]}>{label}</Text>
        <View style={styles.progressRight}>
          <Text style={[styles.progressValue, { color: textPrimary }]}>
            {value.toFixed(0)}%
          </Text>
          <Text style={[styles.progressHint, { color: textSecondary }]}>
            {labelRight}
          </Text>
        </View>
      </View>

      <View style={styles.progressBarBlock}>
        <View
          style={[
            styles.progressTrack,
            { backgroundColor: isDark ? Colors.dark.surfaceAlt : t.surface },
          ]}
        >
          {/* LinearGradient kept — legitimate progress bar fill, not a border trick */}
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

      <Text style={[styles.progressDesc, { color: textSecondary }]}>
        {description}
      </Text>
    </View>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    width: "100%",
    maxWidth: 520,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.accentBorder,
    overflow: "hidden",
  },

  cardBody: { borderRadius: 16 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: "700",
    fontFamily: Font.body.bold,
    letterSpacing: 0.2,
  },
  headerSubtitle: { fontSize: 11, fontFamily: Font.body.regular, marginTop: 2 },
  headerRight: { alignItems: "flex-end" },
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
  headerRightText: { fontSize: 11, fontFamily: Font.body.regular },

  kpiRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  kpiCol: { flex: 1 },

  metric: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  metricLabel: { fontSize: 12, fontFamily: Font.body.regular },
  metricValue: {
    marginTop: 4,
    fontSize: 28,
    fontWeight: "800",
    fontFamily: Font.title.bold,
    lineHeight: 32,
  },

  progressStack: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },

  progressRow: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: Font.body.semiBold,
  },
  progressRight: { alignItems: "flex-end" },
  progressValue: { fontSize: 13, fontWeight: "700", fontFamily: Font.body.bold },
  progressHint: { fontSize: 11, fontFamily: Font.body.regular, marginTop: 1 },

  progressBarBlock: {
    marginTop: 4,
    marginBottom: 8,
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
    marginTop: 4,
  },
  progressTick: { fontSize: 10, fontFamily: Font.body.regular },
  progressDesc: { fontSize: 11, fontFamily: Font.body.regular },

  note: {
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  noteText: { fontSize: 11, fontFamily: Font.body.regular },
});
