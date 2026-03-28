// File: src/shared/components/ejercicio/NotaIA.tsx
import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Lightbulb } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";
import { kgToLb } from "@/shared/utils/kgToLb";

// ── Tokens (mismo sistema compartido) ────────────────────────────────────────
const tokens = {
  color: {
    cardBgDark: "#080D17",
    cardBgLight: "#FFFFFF",
    cardBorderDark: "rgba(148,163,184,0.22)",
    cardBorderLight: "rgba(0,0,0,0.07)",

    dividerDark: "rgba(30,41,59,1)",
    dividerLight: "rgba(226,232,240,1)",

    iconBgDark: "rgba(34,197,94,0.10)",
    iconBgLight: "rgba(22,163,74,0.07)",
    iconColor: "#22C55E",

    textPrimaryDark: "#F1F5F9",
    textPrimaryLight: "#0F172A",
    textSecondaryDark: "#64748B",
    textSecondaryLight: "#6B7280",

    notaDark: "#CBD5E1",
    notaLight: "#1E293B",
  },
  radius: { lg: 16, full: 999 },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16 },
} as const;

// ── Tipos — API pública sin cambios ───────────────────────────────────────────
type Props = {
  notaIA?: string | null;
  series?: number | null;
  repeticiones?: number | null;
  peso?: number | null; // ✅ se recibe en kg
  esCardio?: boolean;
  // Datos para ejercicios compuestos
  esCompuesto?: boolean;
  nombreCompuesto?: string | null;
  tipoCompuesto?: string | null;
  cantidadEjercicios?: number | null;
  descansoSeg?: number | null;
};

// ── Componente ────────────────────────────────────────────────────────────────
export default function NotaIA({
  notaIA,
  series,
  repeticiones,
  peso,
  esCardio,
  esCompuesto,
  nombreCompuesto,
  tipoCompuesto,
  cantidadEjercicios,
  descansoSeg,
}: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const medidaPeso = (useUsuarioStore((s) => s.usuario?.medidaPeso) || "KG").toUpperCase();

  const safeNota = (notaIA ?? "").trim();
  const safeSeries =
    typeof series === "number" && Number.isFinite(series) ? series : 0;
  const safeReps =
    typeof repeticiones === "number" && Number.isFinite(repeticiones)
      ? repeticiones
      : 0;
  const safePesoKg =
    typeof peso === "number" && Number.isFinite(peso) ? peso : 0;
  const isCardio = Boolean(esCardio);

  const pesoDisplay = useMemo(() => {
    if (safePesoKg <= 0) return null;
    return medidaPeso === "LB" ? kgToLb(safePesoKg) : `${safePesoKg} kg`;
  }, [safePesoKg, medidaPeso]);

  const safeNombreCompuesto = (nombreCompuesto ?? "").trim();
  const safeTipoCompuesto = (tipoCompuesto ?? "").trim();
  const safeCantidad =
    typeof cantidadEjercicios === "number" && Number.isFinite(cantidadEjercicios)
      ? cantidadEjercicios
      : 0;
  const safeDescansoSeg =
    typeof descansoSeg === "number" && Number.isFinite(descansoSeg)
      ? descansoSeg
      : 0;

  const shouldRender = useMemo(
    () =>
      safeNota.length > 0 ||
      safeSeries > 0 ||
      safeReps > 0 ||
      safePesoKg > 0 ||
      Boolean(esCompuesto && (safeNombreCompuesto || safeTipoCompuesto || safeCantidad > 0)),
    [safeNota, safeSeries, safeReps, safePesoKg, esCompuesto, safeNombreCompuesto, safeTipoCompuesto, safeCantidad]
  );

  if (!shouldRender) return null;

  const textPrimary = isDark
    ? tokens.color.textPrimaryDark
    : tokens.color.textPrimaryLight;
  const textSecondary = isDark
    ? tokens.color.textSecondaryDark
    : tokens.color.textSecondaryLight;

  return (
    <View
      style={styles.root}
      accessibilityRole="none"
      accessibilityLabel="Nota de entrenamiento con sugerencias"
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: isDark
              ? tokens.color.cardBgDark
              : tokens.color.cardBgLight,
            borderColor: isDark
              ? tokens.color.cardBorderDark
              : tokens.color.cardBorderLight,
          },
        ]}
      >
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
              <Lightbulb size={16} color={tokens.color.iconColor} strokeWidth={2} />
            </View>

            <Text style={[styles.title, { color: textPrimary }]}>
              Nota de entrenamiento
            </Text>
          </View>
        </View>

        {esCompuesto && (safeNombreCompuesto || safeTipoCompuesto) && (
          <View style={styles.compuestoHeader}>
            {safeNombreCompuesto ? (
              <Text style={[styles.compuestoNombre, { color: textPrimary }]}>
                {safeNombreCompuesto}
              </Text>
            ) : null}
            {safeTipoCompuesto ? (
              <View
                style={[
                  styles.tipoPill,
                  {
                    backgroundColor: isDark
                      ? tokens.color.iconBgDark
                      : tokens.color.iconBgLight,
                    borderColor: isDark
                      ? "rgba(34,197,94,0.25)"
                      : "rgba(22,163,74,0.2)",
                  },
                ]}
              >
                <Text style={[styles.tipoPillText, { color: tokens.color.iconColor }]}>
                  {safeTipoCompuesto}
                </Text>
              </View>
            ) : null}
          </View>
        )}

        {(!esCompuesto || safeNota.length > 0) && (
          <Text
            style={[
              styles.nota,
              {
                color:
                  safeNota.length > 0
                    ? isDark
                      ? tokens.color.notaDark
                      : tokens.color.notaLight
                    : textSecondary,
                fontStyle: safeNota.length > 0 ? "italic" : "normal",
              },
            ]}
          >
            {safeNota.length > 0 ? safeNota : "Sin nota por ahora."}
          </Text>
        )}

        <View
          style={[
            styles.metricsRow,
            {
              borderTopColor: isDark
                ? tokens.color.dividerDark
                : tokens.color.dividerLight,
            },
          ]}
        >
          {esCompuesto ? (
            <>
              {safeCantidad > 0 && (
                <MetaItem
                  label="Ejercicios"
                  value={String(safeCantidad)}
                  isDark={isDark}
                />
              )}
              {safeDescansoSeg > 0 && (
                <MetaItem
                  label="Descanso"
                  value={`${safeDescansoSeg} s`}
                  isDark={isDark}
                />
              )}
            </>
          ) : (
            <>
              <MetaItem label="Series" value={String(safeSeries)} isDark={isDark} />

              {isCardio ? (
                <MetaItem
                  label="Tiempo/serie"
                  value={safeReps > 0 ? `${safeReps} s` : "—"}
                  isDark={isDark}
                />
              ) : (
                <MetaItem label="Reps" value={String(safeReps)} isDark={isDark} />
              )}

              {pesoDisplay && (
                <MetaItem
                  label="Peso"
                  value={pesoDisplay}
                  isDark={isDark}
                />
              )}
            </>
          )}
        </View>
      </View>
    </View>
  );
}

// ── MetaItem ──────────────────────────────────────────────────────────────────
function MetaItem({
  label,
  value,
  isDark,
}: {
  label: string;
  value: string;
  isDark: boolean;
}) {
  return (
    <View style={styles.metaItem}>
      <Text
        style={[
          styles.metaLabel,
          {
            color: isDark
              ? tokens.color.textSecondaryDark
              : tokens.color.textSecondaryLight,
          },
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          styles.metaValue,
          {
            color: isDark
              ? tokens.color.textPrimaryDark
              : tokens.color.textPrimaryLight,
          },
        ]}
      >
        {value ?? "—"}
      </Text>
    </View>
  );
}

// ── Estilos estáticos ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    width: "100%",
    maxWidth: 520,
    marginVertical: tokens.spacing.md,
  },

  card: {
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: tokens.spacing.sm,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.sm,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: tokens.radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.1,
  },

  pill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: tokens.radius.full,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.2,
  },

  compuestoHeader: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: tokens.spacing.sm,
    marginBottom: tokens.spacing.sm,
  },
  compuestoNombre: {
    fontSize: 13,
    fontWeight: "700",
  },
  tipoPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: tokens.radius.full,
    borderWidth: 1,
  },
  tipoPillText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  nota: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: tokens.spacing.sm,
  },

  metricsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: tokens.spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: tokens.spacing.sm,
    marginTop: tokens.spacing.xs,
  },

  metaItem: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: "500",
  },
  metaValue: {
    fontSize: 12,
    fontWeight: "700",
  },
});