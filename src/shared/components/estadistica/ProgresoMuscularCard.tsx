// File: src/shared/components/estadistica/ProgresoMuscularCard.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useColorScheme } from "nativewind";
import { TrendingUp, TrendingDown, Minus } from "lucide-react-native";
import { Colors, scheme } from "@/shared/constants/colors";
import { Font } from "@/shared/constants/typography";

const TENDENCIA_COLORS: Record<string, string> = {
  SUBIENDO: "#22C55E",
  BAJANDO: "#EF4444",
  ESTABLE: "#94A3B8",
};

// ── Tipos ─────────────────────────────────────────────────────────────────────
type ProgresoGrupo = {
  grupoMuscular: string;
  volumenSemana1: number;
  volumenSemana2: number;
  cambio: number;
  tendencia: "SUBIENDO" | "BAJANDO" | "ESTABLE" | "SIN_DATOS";
};

type Props = {
  grupos?: ProgresoGrupo[];
  grupoMasProgresado?: string | null;
  grupoMasEstancado?: string | null;
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const NOMBRES: Record<string, string> = {
  PECHOS: "Pecho",
  ESPALDA: "Espalda",
  HOMBROS: "Hombros",
  BRAZOS: "Brazos",
  PIERNAS: "Piernas",
  CORE: "Core",
  CARDIO: "Cardio",
  OTROS: "Otros",
};

function nombreGrupo(g: string): string {
  return NOMBRES[g] ?? g.charAt(0) + g.slice(1).toLowerCase();
}

function colorTendencia(tend: ProgresoGrupo["tendencia"]): string {
  return TENDENCIA_COLORS[tend] ?? "#94A3B8";
}

function barWidth(cambio: number): number {
  return Math.min(Math.abs(cambio), 100);
}

// ── Componente ────────────────────────────────────────────────────────────────
export default function ProgresoMuscularCard({
  grupos = [],
  grupoMasProgresado,
  grupoMasEstancado,
}: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const conDatos = grupos.filter((g) => g.tendencia !== "SIN_DATOS");
  const noData = conDatos.length === 0;

  return (
    <View style={[styles.card, { backgroundColor: isDark ? Colors.dark.surface : Colors.secondary }]}>
      {noData ? (
        <EmptyState isDark={isDark} />
      ) : (
        <CardBody
          isDark={isDark}
          grupos={conDatos}
          grupoMasProgresado={grupoMasProgresado}
          grupoMasEstancado={grupoMasEstancado}
        />
      )}
    </View>
  );
}

// ── CardBody ──────────────────────────────────────────────────────────────────
function CardBody({
  isDark,
  grupos,
  grupoMasProgresado,
  grupoMasEstancado,
}: {
  isDark: boolean;
  grupos: ProgresoGrupo[];
  grupoMasProgresado?: string | null;
  grupoMasEstancado?: string | null;
}) {
  const t = scheme(isDark);

  return (
    <View style={styles.cardBody}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: t.textPrimary }]}>
            Progreso muscular
          </Text>
          <Text style={[styles.headerSubtitle, { color: t.textSecondary }]}>
            Esta semana vs semana anterior
          </Text>
        </View>
      </View>

      <View style={styles.lista}>
        {grupos.map((g, i) => (
          <GrupoFila
            key={g.grupoMuscular}
            grupo={g}
            isDark={isDark}
            isLast={i === grupos.length - 1}
          />
        ))}
      </View>

      {(grupoMasProgresado || grupoMasEstancado) && (
        <View style={styles.footer}>
          {grupoMasProgresado && (
            <Kpi
              label="Más progresado"
              value={nombreGrupo(grupoMasProgresado)}
              color={TENDENCIA_COLORS.SUBIENDO}
              isDark={isDark}
            />
          )}
          {grupoMasEstancado && grupoMasEstancado !== grupoMasProgresado && (
            <Kpi
              label="Más estancado"
              value={nombreGrupo(grupoMasEstancado)}
              color={TENDENCIA_COLORS.BAJANDO}
              isDark={isDark}
            />
          )}
        </View>
      )}
    </View>
  );
}

// ── GrupoFila ─────────────────────────────────────────────────────────────────
function GrupoFila({
  grupo,
  isDark,
  isLast,
}: {
  grupo: ProgresoGrupo;
  isDark: boolean;
  isLast: boolean;
}) {
  const t = scheme(isDark);
  const color = colorTendencia(grupo.tendencia);
  const bw = barWidth(grupo.cambio);

  return (
    <View
      style={[
        styles.fila,
        !isLast && { borderBottomWidth: 1, borderBottomColor: t.border },
      ]}
    >
      <View style={styles.filaIzq}>
        <Text style={[styles.filaGrupo, { color: t.textPrimary }]}>
          {nombreGrupo(grupo.grupoMuscular)}
        </Text>
        <View style={[styles.barBg, { backgroundColor: isDark ? t.border : t.surface }]}>
          <View
            style={[
              styles.barFill,
              {
                width: `${bw}%`,
                backgroundColor: color,
                opacity: 0.75,
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.filaDer}>
        <TendenciaIcon tendencia={grupo.tendencia} color={color} />
        <Text style={[styles.filaCambio, { color }]}>
          {grupo.cambio > 0 ? "+" : ""}
          {grupo.cambio}%
        </Text>
      </View>
    </View>
  );
}

// ── TendenciaIcon ─────────────────────────────────────────────────────────────
function TendenciaIcon({
  tendencia,
  color,
}: {
  tendencia: ProgresoGrupo["tendencia"];
  color: string;
}) {
  if (tendencia === "SUBIENDO") return <TrendingUp size={13} color={color} strokeWidth={2.2} />;
  if (tendencia === "BAJANDO") return <TrendingDown size={13} color={color} strokeWidth={2.2} />;
  return <Minus size={13} color={color} strokeWidth={2.2} />;
}

// ── Kpi ───────────────────────────────────────────────────────────────────────
function Kpi({
  label,
  value,
  color,
  isDark,
}: {
  label: string;
  value: string;
  color: string;
  isDark: boolean;
}) {
  const t = scheme(isDark);

  return (
    <View
      style={[
        styles.kpi,
        {
          backgroundColor: isDark ? t.border : t.surface,
          borderColor: t.border,
        },
      ]}
    >
      <Text style={[styles.kpiLabel, { color: t.textTertiary }]}>{label}</Text>
      <Text style={[styles.kpiValue, { color }]}>{value}</Text>
    </View>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────────
function EmptyState({ isDark }: { isDark: boolean }) {
  const t = scheme(isDark);

  return (
    <View style={styles.emptyState}>
      <View
        style={[
          styles.emptyIcon,
          { backgroundColor: isDark ? t.border : t.surface },
        ]}
      >
        <Text style={styles.emptyIconText}>💪</Text>
      </View>
      <Text style={[styles.emptyTitle, { color: t.textPrimary }]}>
        Sin datos suficientes
      </Text>
      <Text style={[styles.emptySubtitle, { color: t.textSecondary }]}>
        Registra sesiones dos semanas seguidas para ver tu evolución por grupo muscular.
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

  lista: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },

  fila: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    gap: 12,
  },

  filaIzq: {
    flex: 1,
    gap: 4,
  },

  filaGrupo: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: Font.body.semiBold,
  },

  barBg: {
    height: 4,
    borderRadius: 999,
    overflow: "hidden",
  },

  barFill: {
    height: 4,
    borderRadius: 999,
  },

  filaDer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minWidth: 52,
    justifyContent: "flex-end",
  },

  filaCambio: {
    fontSize: 13,
    fontWeight: "700",
    fontFamily: Font.body.bold,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 8,
    gap: 12,
  },

  kpi: {
    flex: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: "600",
    fontFamily: Font.body.semiBold,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    textAlign: "center",
  },
  kpiValue: {
    fontSize: 14,
    fontWeight: "700",
    fontFamily: Font.body.bold,
    textAlign: "center",
    marginTop: 2,
  },

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
  emptyIconText: { fontSize: 28 },
  emptyTitle: { fontSize: 14, fontWeight: "600", fontFamily: Font.body.semiBold },
  emptySubtitle: {
    fontSize: 12,
    fontFamily: Font.body.regular,
    marginTop: 4,
    textAlign: "center",
    lineHeight: 18,
  },
});
