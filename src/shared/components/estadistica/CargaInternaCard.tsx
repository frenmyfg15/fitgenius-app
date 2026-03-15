// src/shared/components/estadistica/CargaInternaCard.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useColorScheme } from "nativewind";
import { LinearGradient } from "expo-linear-gradient";
import { Activity } from "lucide-react-native";

// ── Tokens (mismo sistema compartido que IMCVisual) ───────────────────────────
const tokens = {
  color: {
    // Frame gradient — 3 colores igual que IMCVisual
    gradientStart: "rgb(0,255,64)",
    gradientMid: "rgb(94,230,157)",
    gradientEnd: "rgb(178,0,255)",

    // Card interior
    cardBgDark: "rgba(15,24,41,1)",   // opaco, igual que IMCVisual
    cardBgLight: "#FFFFFF",
    cardBorderDark: "rgba(255,255,255,0.08)",
    cardBorderLight: "rgba(0,0,0,0.06)",

    // Icono
    iconBgDark: "rgba(34,197,94,0.12)",
    iconBgLight: "rgba(22,163,74,0.06)",
    iconGreenDark: "#22C55E",
    iconGreenLight: "#16A34A",

    // Track de barra
    rowTrackDark: "rgba(15,23,42,0.9)",
    rowTrackLight: "#E5E7EB",

    // Texto
    textPrimaryDark: "#F1F5F9",
    textPrimaryLight: "#0F172A",
    textSecondaryDark: "#64748B",
    textSecondaryLight: "#64748B",
    textMutedDark: "#94A3B8",
    textMutedLight: "#6B7280",

    // Empty state
    emptyIconBgDark: "rgba(255,255,255,0.10)",
    emptyIconBgLight: "#F1F5F9",
    emptyTitleDark: "#E5E7EB",
    emptyTitleLight: "#334155",
    emptySubtitleDark: "#94A3B8",
    emptySubtitleLight: "#64748B",

    // Nota
    noteBorderDark: "rgba(255,255,255,0.08)",
    noteBorderLight: "rgba(0,0,0,0.06)",

    amber: "#F59E0B",
    red: "#EF4444",
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
type DetalleSemana = {
  semanaLabel?: string;
  cargaMedia?: number;
  sesiones?: number;
};

type Props = {
  semanas?: number;
  totalSesiones?: number;
  detalleSemanas?: DetalleSemana[];
};

// ── Componente ────────────────────────────────────────────────────────────────
const CargaInternaCard: React.FC<Props> = ({ semanas, totalSesiones, detalleSemanas }) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const hasData =
    !!detalleSemanas && Array.isArray(detalleSemanas) && detalleSemanas.length > 0;

  const safeSemanas = semanas ?? (hasData ? detalleSemanas!.length : 0);
  const safeTotalSesiones = totalSesiones ?? 0;

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
          {hasData ? (
            <CardBody
              isDark={isDark}
              detalleSemanas={detalleSemanas!}
              semanas={safeSemanas}
              totalSesiones={safeTotalSesiones}
            />
          ) : (
            <EmptyState isDark={isDark} />
          )}
        </View>
      </LinearGradient>
    </View>
  );
};

export default CargaInternaCard;

// ── CardBody ──────────────────────────────────────────────────────────────────
function CardBody({
  isDark, detalleSemanas, semanas, totalSesiones,
}: {
  isDark: boolean;
  detalleSemanas: DetalleSemana[];
  semanas: number;
  totalSesiones: number;
}) {
  const textPrimary = isDark ? tokens.color.textPrimaryDark : tokens.color.textPrimaryLight;
  const textSecondary = isDark ? tokens.color.textSecondaryDark : tokens.color.textSecondaryLight;
  const textMuted = isDark ? tokens.color.textMutedDark : tokens.color.textMutedLight;

  const ultimaSemana = detalleSemanas[detalleSemanas.length - 1];
  const cargaUltima = ultimaSemana?.cargaMedia ?? null;

  const getBarColor = (carga: number) => {
    if (carga <= 4) return isDark ? tokens.color.iconGreenDark : tokens.color.iconGreenLight;
    if (carga <= 7) return tokens.color.amber;
    return tokens.color.red;
  };

  return (
    <View style={styles.cardBody}>
      {/* Header — misma tipografía que IMCVisual */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.iconWrap,
              {
                backgroundColor: isDark
                  ? tokens.color.iconBgDark
                  : tokens.color.iconBgLight,
              },
            ]}
          >
            <Activity
              size={18}
              color={isDark ? tokens.color.iconGreenDark : tokens.color.iconGreenLight}
            />
          </View>

          <View>
            <Text style={[styles.headerTitle, { color: textPrimary }]}>
              Carga interna semanal
            </Text>
            <Text style={[styles.headerSubtitle, { color: textSecondary }]}>
              Esfuerzo percibido a lo largo de tus semanas
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <Text style={[styles.headerKpiLabel, { color: textMuted }]}>Semanas</Text>
          <Text style={[styles.headerKpiValue, { color: textPrimary }]}>
            {semanas || "–"}
          </Text>
        </View>
      </View>

      {/* KPIs superiores */}
      <View style={styles.topKpis}>
        <View style={styles.topKpiCol}>
          <Text style={[styles.topKpiLabel, { color: textMuted }]}>Sesiones analizadas</Text>
          <Text style={[styles.topKpiValue, { color: textPrimary }]}>{totalSesiones}</Text>
        </View>

        <View style={[styles.topKpiCol, styles.topKpiRight]}>
          <Text style={[styles.topKpiLabel, { color: textMuted }]}>Última semana</Text>
          <Text style={[styles.topKpiSub, { color: textMuted }]}>
            {ultimaSemana?.semanaLabel ?? "Más reciente"}
          </Text>
          <Text
            style={[
              styles.topKpiValue,
              { color: cargaUltima != null ? getBarColor(cargaUltima) : textPrimary },
            ]}
          >
            {cargaUltima != null ? `${cargaUltima.toFixed(1)}/10` : "–"}
          </Text>
        </View>
      </View>

      {/* Filas por semana */}
      <View style={styles.rows}>
        {detalleSemanas.map((sem, idx) => {
          const carga = sem.cargaMedia ?? 0;
          const sesiones = sem.sesiones ?? 0;
          const pct = Math.max(6, Math.min(100, (carga / 10) * 100));
          const barColor = getBarColor(carga);

          return (
            <View key={idx} style={styles.row}>
              <View style={styles.rowLeft}>
                <Text
                  numberOfLines={1}
                  style={[styles.rowLabel, { color: isDark ? textPrimary : "#334155" }]}
                >
                  {sem.semanaLabel || `Semana ${idx + 1}`}
                </Text>
                {sesiones > 0 && (
                  <Text style={[styles.rowSub, { color: isDark ? textSecondary : "#94A3B8" }]}>
                    {sesiones} sesión{sesiones === 1 ? "" : "es"}
                  </Text>
                )}
              </View>

              <View style={styles.rowMid}>
                <View
                  style={[
                    styles.track,
                    {
                      backgroundColor: isDark
                        ? tokens.color.rowTrackDark
                        : tokens.color.rowTrackLight,
                    },
                  ]}
                >
                  <View style={[styles.fill, { width: `${pct}%`, backgroundColor: barColor }]} />
                </View>
              </View>

              <View style={styles.rowRight}>
                <Text style={[styles.rowValue, { color: textPrimary }]}>
                  {carga ? carga.toFixed(1) : "–"}
                </Text>
                <Text style={[styles.rowUnit, { color: textSecondary }]}>/10</Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Nota */}
      <View
        style={[
          styles.note,
          {
            borderTopColor: isDark
              ? tokens.color.noteBorderDark
              : tokens.color.noteBorderLight,
          },
        ]}
      >
        <Text style={[styles.noteText, { color: textSecondary }]}>
          La carga interna se calcula a partir del esfuerzo percibido de cada sesión. Picos muy
          altos seguidos pueden indicar riesgo de sobrecarga.
        </Text>
      </View>
    </View>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────────
function EmptyState({ isDark }: { isDark: boolean }) {
  return (
    <View style={styles.emptyState}>
      <View
        style={[
          styles.emptyIcon,
          {
            backgroundColor: isDark
              ? tokens.color.emptyIconBgDark
              : tokens.color.emptyIconBgLight,
          },
        ]}
      >
        <Text style={{ color: isDark ? tokens.color.emptyTitleDark : tokens.color.emptySubtitleLight }}>
          🧠
        </Text>
      </View>
      <Text
        style={[
          styles.emptyTitle,
          { color: isDark ? tokens.color.emptyTitleDark : tokens.color.emptyTitleLight },
        ]}
      >
        Aún no hay carga interna
      </Text>
      <Text
        style={[
          styles.emptySubtitle,
          { color: isDark ? tokens.color.emptySubtitleDark : tokens.color.emptySubtitleLight },
        ]}
      >
        Cuando registres sesiones indicando tu nivel de esfuerzo, aquí verás cómo evoluciona tu
        carga semana a semana.
      </Text>
    </View>
  );
}

// ── Estilos estáticos ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { width: "100%", maxWidth: 520 },

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

  cardBody: {
    borderRadius: tokens.radius.lg - 1,
  },

  // Header — fontSize 13 + letterSpacing 0.2, igual que IMCVisual
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
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  headerRight: { alignItems: "flex-end" },
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

  // KPIs superiores
  topKpis: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: tokens.spacing.lg,
    paddingBottom: tokens.spacing.md,
    gap: tokens.spacing.md,
  },
  topKpiCol: { flex: 1 },
  topKpiRight: { alignItems: "flex-end" },
  topKpiLabel: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  topKpiSub: { fontSize: 11, marginTop: tokens.spacing.xs },
  topKpiValue: { fontSize: 17, fontWeight: "700", marginTop: tokens.spacing.xs },

  // Filas por semana
  rows: {
    paddingHorizontal: tokens.spacing.lg,
    paddingBottom: tokens.spacing.lg,
    gap: tokens.spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowLeft: { flex: 1.2 },
  rowMid: { flex: 2, marginHorizontal: tokens.spacing.sm },
  rowRight: { flex: 0.6, alignItems: "flex-end" },
  rowLabel: { fontSize: 12 },
  rowSub: { fontSize: 10, marginTop: 2 },
  track: { height: 10, borderRadius: 999, overflow: "hidden" },
  fill: { height: "100%" },
  rowValue: { fontSize: 12, fontWeight: "700" },
  rowUnit: { fontSize: 10, marginTop: 1 },

  // Nota inferior
  note: {
    borderTopWidth: 1,
    paddingHorizontal: tokens.spacing.lg,
    paddingTop: tokens.spacing.md,
    paddingBottom: tokens.spacing.lg,
  },
  noteText: { fontSize: 11 },

  // Empty state
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
  emptyTitle: { fontSize: 14, fontWeight: "600", textAlign: "center" },
  emptySubtitle: { fontSize: 12, marginTop: tokens.spacing.xs, textAlign: "center" },
});