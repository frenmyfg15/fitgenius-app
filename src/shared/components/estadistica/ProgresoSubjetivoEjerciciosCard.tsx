// src/shared/components/estadistica/ProgresoSubjetivoEjerciciosCard.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useColorScheme } from "nativewind";
import { TrendingUp } from "lucide-react-native";
import { Colors, scheme } from "@/shared/constants/colors";
import { Font } from "@/shared/constants/typography";

const ICON_BLUE = {
  bgDark: "rgba(56,189,248,0.12)",
  bgLight: "rgba(59,130,246,0.08)",
  dark: "#38BDF8",
  light: "#0284C7",
} as const;

const TREND = {
  sube: {
    textDark: "#FB7185", textLight: "#B91C1C",
    bgDark: "rgba(248,113,113,0.14)", bgLight: "rgba(254,202,202,0.7)",
    borderDark: "rgba(248,113,113,0.35)", borderLight: "rgba(248,113,113,0.8)",
  },
  baja: {
    textDark: "#4ADE80", textLight: "#15803D",
    bgDark: "rgba(74,222,128,0.12)", bgLight: "rgba(187,247,208,0.7)",
    borderDark: "rgba(74,222,128,0.35)", borderLight: "rgba(34,197,94,0.8)",
  },
  estable: {
    textDark: "#94A3B8", textLight: "#94A3B8",
    bgDark: "rgba(148,163,184,0.14)", bgLight: "rgba(226,232,240,0.7)",
    borderDark: "rgba(148,163,184,0.4)", borderLight: "rgba(148,163,184,0.6)",
  },
} as const;

const BAR_COLORS = {
  low: "#38BDF8",
  mid: "#0EA5E9",
  high: "#0369A1",
} as const;

// ── Tipos ─────────────────────────────────────────────────────────────────────
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

// ── Componente ────────────────────────────────────────────────────────────────
const ProgresoSubjetivoEjerciciosCard: React.FC<Props> = ({ diasAnalizados, ejercicios }) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const hasData = !!ejercicios && Array.isArray(ejercicios) && ejercicios.length > 0;
  const topEjercicios = hasData ? ejercicios!.slice(0, 5) : [];

  return (
    <View style={[styles.card, { backgroundColor: isDark ? Colors.dark.surface : Colors.secondary }]}>
      {hasData ? (
        <CardBody isDark={isDark} diasAnalizados={diasAnalizados} ejercicios={topEjercicios} />
      ) : (
        <EmptyState isDark={isDark} />
      )}
    </View>
  );
};

export default ProgresoSubjetivoEjerciciosCard;

// ── CardBody ──────────────────────────────────────────────────────────────────
function CardBody({
  isDark, diasAnalizados, ejercicios,
}: {
  isDark: boolean;
  diasAnalizados?: number;
  ejercicios: EjercicioSubjetivo[];
}) {
  const t = scheme(isDark);

  const tendenciaText = (tend?: "sube" | "baja" | "estable") => {
    if (tend === "sube") return "Se siente más exigente";
    if (tend === "baja") return "Se siente más llevadero";
    return "Sensación estable";
  };

  const tendenciaColor = (tend?: "sube" | "baja" | "estable") => {
    if (tend === "sube") return isDark ? TREND.sube.textDark : TREND.sube.textLight;
    if (tend === "baja") return isDark ? TREND.baja.textDark : TREND.baja.textLight;
    return t.textTertiary;
  };

  const tendenciaBadgeBg = (tend?: "sube" | "baja" | "estable") => {
    if (tend === "sube") return isDark ? TREND.sube.bgDark : TREND.sube.bgLight;
    if (tend === "baja") return isDark ? TREND.baja.bgDark : TREND.baja.bgLight;
    return isDark ? TREND.estable.bgDark : TREND.estable.bgLight;
  };

  const tendenciaBadgeBorder = (tend?: "sube" | "baja" | "estable") => {
    if (tend === "sube") return isDark ? TREND.sube.borderDark : TREND.sube.borderLight;
    if (tend === "baja") return isDark ? TREND.baja.borderDark : TREND.baja.borderLight;
    return isDark ? TREND.estable.borderDark : TREND.estable.borderLight;
  };

  const getBarColor = (carga: number) => {
    if (carga <= 4) return BAR_COLORS.low;
    if (carga <= 7) return BAR_COLORS.mid;
    return BAR_COLORS.high;
  };

  return (
    <View style={styles.cardBody}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.iconWrap,
              { backgroundColor: isDark ? ICON_BLUE.bgDark : ICON_BLUE.bgLight },
            ]}
          >
            <TrendingUp size={18} color={isDark ? ICON_BLUE.dark : ICON_BLUE.light} />
          </View>

          <View>
            <Text style={[styles.headerTitle, { color: t.textPrimary }]}>
              Progreso subjetivo por ejercicio
            </Text>
            <Text style={[styles.headerSubtitle, { color: t.textSecondary }]}>
              Qué ejercicios notas más duros o más llevaderos
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <Text style={[styles.headerKpiLabel, { color: t.textTertiary }]}>Días analizados</Text>
          <Text style={[styles.headerKpiValue, { color: t.textPrimary }]}>
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
                  <Text numberOfLines={1} style={[styles.itemTitle, { color: t.textPrimary }]}>
                    {ej.nombre ?? "Ejercicio"}
                  </Text>
                  <Text style={[styles.itemSub, { color: t.textTertiary }]}>
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
                      { backgroundColor: isDark ? Colors.dark.surfaceAlt : t.surface },
                    ]}
                  >
                    <View style={[styles.fill, { width: `${pct}%`, backgroundColor: barColor }]} />
                  </View>
                </View>

                <View style={styles.valueCol}>
                  <Text style={[styles.valueText, { color: t.textPrimary }]}>
                    {carga ? carga.toFixed(1) : "–"}
                    <Text style={[styles.valueUnit, { color: t.textSecondary }]}>/10</Text>
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      <View style={[styles.note, { borderTopColor: t.border }]}>
        <Text style={[styles.noteText, { color: t.textSecondary }]}>
          Usa estas sensaciones para ajustar técnica, descansos y peso: si un ejercicio se vuelve
          cada vez más llevadero, es buena señal de progreso.
        </Text>
      </View>
    </View>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────────
function EmptyState({ isDark }: { isDark: boolean }) {
  const t = scheme(isDark);

  return (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIcon, { backgroundColor: isDark ? t.border : t.surface }]}>
        <Text style={{ color: t.textPrimary }}>📈</Text>
      </View>
      <Text style={[styles.emptyTitle, { color: t.textPrimary }]}>
        Aún no hay progreso subjetivo
      </Text>
      <Text style={[styles.emptySubtitle, { color: t.textSecondary }]}>
        Cuando registres varias sesiones marcando el nivel de esfuerzo, te mostraremos qué
        ejercicios se sienten más duros o más ligeros con el tiempo.
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexShrink: 1,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: "700",
    fontFamily: Font.body.bold,
    letterSpacing: 0.2,
  },
  headerSubtitle: { fontSize: 11, fontFamily: Font.body.regular, marginTop: 2 },
  headerRight: { alignItems: "flex-end" },
  headerKpiLabel: {
    fontSize: 10,
    fontWeight: "600",
    fontFamily: Font.body.semiBold,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  headerKpiValue: { fontSize: 20, fontWeight: "800", fontFamily: Font.title.bold, lineHeight: 24 },

  list: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  item: {},
  itemTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  itemLeft: { flex: 1, paddingRight: 8 },
  itemTitle: { fontSize: 13, fontWeight: "600", fontFamily: Font.body.semiBold },
  itemSub: { fontSize: 11, fontFamily: Font.body.regular, marginTop: 1 },

  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeText: { fontSize: 11, fontWeight: "600", fontFamily: Font.body.semiBold },

  barRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  barCol: { flex: 1 },
  valueCol: { width: 56, alignItems: "flex-end" },
  track: { height: 10, borderRadius: 999, overflow: "hidden" },
  fill: { height: "100%" },
  valueText: { fontSize: 12, fontWeight: "700", fontFamily: Font.body.bold },
  valueUnit: { fontSize: 10, fontFamily: Font.body.regular },

  note: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  noteText: { fontSize: 11, fontFamily: Font.body.regular },

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 36,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 14, fontWeight: "600", fontFamily: Font.body.semiBold, textAlign: "center" },
  emptySubtitle: { fontSize: 12, fontFamily: Font.body.regular, marginTop: 4, textAlign: "center" },
});
