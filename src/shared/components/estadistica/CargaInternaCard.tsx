// src/shared/components/estadistica/CargaInternaCard.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useColorScheme } from "nativewind";
import { Activity } from "lucide-react-native";
import { Colors, scheme } from "@/shared/constants/colors";
import { Font } from "@/shared/constants/typography";

const LOAD_COLORS = {
  low: Colors.accent,
  mid: "#F59E0B",
  high: "#EF4444",
} as const;

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
    <View style={[styles.card, { backgroundColor: isDark ? Colors.dark.surface : Colors.secondary }]}>
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
  const t = scheme(isDark);

  const ultimaSemana = detalleSemanas[detalleSemanas.length - 1];
  const cargaUltima = ultimaSemana?.cargaMedia ?? null;

  const getBarColor = (carga: number) => {
    if (carga <= 4) return LOAD_COLORS.low;
    if (carga <= 7) return LOAD_COLORS.mid;
    return LOAD_COLORS.high;
  };

  return (
    <View style={styles.cardBody}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconWrap, { backgroundColor: Colors.accentSubtle }]}>
            <Activity size={18} color={Colors.accent} />
          </View>

          <View>
            <Text style={[styles.headerTitle, { color: t.textPrimary }]}>
              Carga interna semanal
            </Text>
            <Text style={[styles.headerSubtitle, { color: t.textSecondary }]}>
              Esfuerzo percibido a lo largo de tus semanas
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <Text style={[styles.headerKpiLabel, { color: t.textTertiary }]}>Semanas</Text>
          <Text style={[styles.headerKpiValue, { color: t.textPrimary }]}>
            {semanas || "–"}
          </Text>
        </View>
      </View>

      <View style={styles.topKpis}>
        <View style={styles.topKpiCol}>
          <Text style={[styles.topKpiLabel, { color: t.textTertiary }]}>Sesiones analizadas</Text>
          <Text style={[styles.topKpiValue, { color: t.textPrimary }]}>{totalSesiones}</Text>
        </View>

        <View style={[styles.topKpiCol, styles.topKpiRight]}>
          <Text style={[styles.topKpiLabel, { color: t.textTertiary }]}>Última semana</Text>
          <Text style={[styles.topKpiSub, { color: t.textTertiary }]}>
            {ultimaSemana?.semanaLabel ?? "Más reciente"}
          </Text>
          <Text
            style={[
              styles.topKpiValue,
              { color: cargaUltima != null ? getBarColor(cargaUltima) : t.textPrimary },
            ]}
          >
            {cargaUltima != null ? `${cargaUltima.toFixed(1)}/10` : "–"}
          </Text>
        </View>
      </View>

      <View style={styles.rows}>
        {detalleSemanas.map((sem, idx) => {
          const carga = sem.cargaMedia ?? 0;
          const sesiones = sem.sesiones ?? 0;
          const pct = Math.max(6, Math.min(100, (carga / 10) * 100));
          const barColor = getBarColor(carga);

          return (
            <View key={idx} style={styles.row}>
              <View style={styles.rowLeft}>
                <Text numberOfLines={1} style={[styles.rowLabel, { color: t.textPrimary }]}>
                  {sem.semanaLabel || `Semana ${idx + 1}`}
                </Text>
                {sesiones > 0 && (
                  <Text style={[styles.rowSub, { color: t.textSecondary }]}>
                    {sesiones} sesión{sesiones === 1 ? "" : "es"}
                  </Text>
                )}
              </View>

              <View style={styles.rowMid}>
                <View
                  style={[
                    styles.track,
                    { backgroundColor: isDark ? Colors.dark.surfaceAlt : t.surface },
                  ]}
                >
                  <View style={[styles.fill, { width: `${pct}%`, backgroundColor: barColor }]} />
                </View>
              </View>

              <View style={styles.rowRight}>
                <Text style={[styles.rowValue, { color: t.textPrimary }]}>
                  {carga ? carga.toFixed(1) : "–"}
                </Text>
                <Text style={[styles.rowUnit, { color: t.textSecondary }]}>/10</Text>
              </View>
            </View>
          );
        })}
      </View>

      <View style={[styles.note, { borderTopColor: t.border }]}>
        <Text style={[styles.noteText, { color: t.textSecondary }]}>
          La carga interna se calcula a partir del esfuerzo percibido de cada sesión. Picos muy
          altos seguidos pueden indicar riesgo de sobrecarga.
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
        <Text style={{ color: t.textPrimary }}>🧠</Text>
      </View>
      <Text style={[styles.emptyTitle, { color: t.textPrimary }]}>
        Aún no hay carga interna
      </Text>
      <Text style={[styles.emptySubtitle, { color: t.textSecondary }]}>
        Cuando registres sesiones indicando tu nivel de esfuerzo, aquí verás cómo evoluciona tu
        carga semana a semana.
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
  headerSubtitle: {
    fontSize: 11,
    fontFamily: Font.body.regular,
    marginTop: 2,
  },
  headerRight: { alignItems: "flex-end" },
  headerKpiLabel: {
    fontSize: 10,
    fontWeight: "600",
    fontFamily: Font.body.semiBold,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  headerKpiValue: {
    fontSize: 20,
    fontWeight: "800",
    fontFamily: Font.title.bold,
    lineHeight: 24,
  },

  topKpis: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  topKpiCol: { flex: 1 },
  topKpiRight: { alignItems: "flex-end" },
  topKpiLabel: {
    fontSize: 10,
    fontWeight: "600",
    fontFamily: Font.body.semiBold,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  topKpiSub: { fontSize: 11, fontFamily: Font.body.regular, marginTop: 4 },
  topKpiValue: { fontSize: 17, fontWeight: "700", fontFamily: Font.title.bold, marginTop: 4 },

  rows: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowLeft: { flex: 1.2 },
  rowMid: { flex: 2, marginHorizontal: 8 },
  rowRight: { flex: 0.6, alignItems: "flex-end" },
  rowLabel: { fontSize: 12, fontFamily: Font.body.regular },
  rowSub: { fontSize: 10, fontFamily: Font.body.regular, marginTop: 2 },
  track: { height: 10, borderRadius: 999, overflow: "hidden" },
  fill: { height: "100%" },
  rowValue: { fontSize: 12, fontWeight: "700", fontFamily: Font.body.bold },
  rowUnit: { fontSize: 10, fontFamily: Font.body.regular, marginTop: 1 },

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
