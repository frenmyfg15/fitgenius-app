// File: src/shared/components/ejercicio/NotaIA.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  Vibration,
  View,
} from "react-native";
import { Lightbulb, RefreshCw } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";
import { kgToLb } from "@/shared/utils/kgToLb";
import type { ObjetivoSesion } from "@/features/api/coach.api";
import { actualizarPrescripcion } from "@/features/api/rutinas.api";

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

    accentGreen: "#22C55E",
    accentGreenBg: "rgba(34,197,94,0.12)",
    accentGreenBorder: "rgba(34,197,94,0.35)",

    updateBg: "rgba(34,197,94,0.08)",
    updateBorder: "rgba(34,197,94,0.25)",
    oldValueColor: "#F97316",
    oldValueBg: "rgba(249,115,22,0.10)",
  },
  radius: { lg: 16, full: 999 },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16 },
} as const;

// ── Tipos ─────────────────────────────────────────────────────────────────────
type Props = {
  notaIA?: string | null;
  series?: number | null;
  repeticiones?: number | null;
  peso?: number | null; // en kg
  esCardio?: boolean;
  // Datos para ejercicios compuestos
  esCompuesto?: boolean;
  nombreCompuesto?: string | null;
  tipoCompuesto?: string | null;
  cantidadEjercicios?: number | null;
  descansoSeg?: number | null;
  // Nueva prescripción del coach
  coachObjetivo?: ObjetivoSesion | null;
  asignadoId?: number | null;
  onActualizar?: (updated: {
    seriesSugeridas?: number | null;
    repeticionesSugeridas?: number | null;
    pesoSugerido?: number | null;
  }) => void;
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const PESO_DIFF_THRESHOLD = 0.05; // 5%

function hasDiff(
  series: number,
  reps: number,
  pesoKg: number,
  objetivo: ObjetivoSesion
): boolean {
  if (objetivo.series && objetivo.series !== series) return true;
  if (objetivo.repeticiones && objetivo.repeticiones !== reps) return true;
  if (
    objetivo.pesoKg != null &&
    pesoKg > 0 &&
    Math.abs(objetivo.pesoKg - pesoKg) / Math.max(pesoKg, 0.001) > PESO_DIFF_THRESHOLD
  )
    return true;
  return false;
}

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
  coachObjetivo,
  asignadoId,
  onActualizar,
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

  // ── Lógica de actualización ────────────────────────────────────────────────
  const needsUpdate = useMemo(() => {
    if (esCompuesto || !coachObjetivo || !asignadoId) return false;
    return hasDiff(safeSeries, safeReps, safePesoKg, coachObjetivo);
  }, [esCompuesto, coachObjetivo, asignadoId, safeSeries, safeReps, safePesoKg]);

  const [updated, setUpdated] = useState(false);
  const [saving, setSaving] = useState(false);

  // Reset "updated" state if the underlying data changes
  useEffect(() => {
    setUpdated(false);
  }, [safeSeries, safeReps, safePesoKg]);

  // ── Animación de pulso ─────────────────────────────────────────────────────
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (!needsUpdate || updated) {
      loopRef.current?.stop();
      pulseAnim.setValue(1);
      glowAnim.setValue(0);
      return;
    }

    loopRef.current = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1.04,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    loopRef.current.start();

    return () => {
      loopRef.current?.stop();
    };
  }, [needsUpdate, updated]);

  const handleActualizar = useCallback(async () => {
    if (!coachObjetivo || !asignadoId || saving) return;

    Vibration.vibrate([0, 40, 60, 40]);

    loopRef.current?.stop();
    pulseAnim.setValue(1);

    setSaving(true);
    try {
      await actualizarPrescripcion(asignadoId, {
        seriesSugeridas: coachObjetivo.series ?? undefined,
        repeticionesSugeridas: coachObjetivo.repeticiones ?? undefined,
        pesoSugerido: coachObjetivo.pesoKg ?? undefined,
      });
      setUpdated(true);
      onActualizar?.({
        seriesSugeridas: coachObjetivo.series,
        repeticionesSugeridas: coachObjetivo.repeticiones,
        pesoSugerido: coachObjetivo.pesoKg,
      });
    } catch {
      // silently fail — user can retry
    } finally {
      setSaving(false);
    }
  }, [coachObjetivo, asignadoId, saving, onActualizar]);

  if (!shouldRender) return null;

  const textPrimary = isDark ? tokens.color.textPrimaryDark : tokens.color.textPrimaryLight;
  const textSecondary = isDark ? tokens.color.textSecondaryDark : tokens.color.textSecondaryLight;
  const showUpdate = needsUpdate && !updated && coachObjetivo != null;

  // Format coach suggestion values for display
  const nuevoSeriesDisplay = coachObjetivo?.series ?? safeSeries;
  const nuevoRepsDisplay = coachObjetivo?.repeticiones ?? safeReps;
  const nuevoPesoKg = coachObjetivo?.pesoKg ?? safePesoKg;
  const nuevoPesoDisplay =
    nuevoPesoKg > 0
      ? medidaPeso === "LB"
        ? kgToLb(nuevoPesoKg)
        : `${nuevoPesoKg} kg`
      : null;

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
            backgroundColor: isDark ? tokens.color.cardBgDark : tokens.color.cardBgLight,
            borderColor: isDark ? tokens.color.cardBorderDark : tokens.color.cardBorderLight,
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
                <MetaItem label="Ejercicios" value={String(safeCantidad)} isDark={isDark} />
              )}
              {safeDescansoSeg > 0 && (
                <MetaItem label="Descanso" value={`${safeDescansoSeg} s`} isDark={isDark} />
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
                <MetaItem label="Peso" value={pesoDisplay} isDark={isDark} />
              )}
            </>
          )}
        </View>

        {/* ── Bloque de actualización de prescripción ─────────────────────── */}
        {showUpdate && (
          <View
            style={[
              styles.updateBlock,
              {
                backgroundColor: isDark
                  ? tokens.color.updateBg
                  : "rgba(34,197,94,0.05)",
                borderColor: tokens.color.updateBorder,
              },
            ]}
          >
            <Text style={[styles.updateLabel, { color: tokens.color.accentGreen }]}>
              NUEVA PRESCRIPCIÓN DEL COACH
            </Text>

            <View style={styles.compareRow}>
              {/* Valores anteriores */}
              <View style={styles.compareCol}>
                <Text style={[styles.compareColLabel, { color: textSecondary }]}>
                  ACTUAL
                </Text>
                <View style={styles.compareValues}>
                  <ValuePill
                    label="Series"
                    value={String(safeSeries)}
                    color={tokens.color.oldValueColor}
                    bg={tokens.color.oldValueBg}
                  />
                  {!isCardio ? (
                    <ValuePill
                      label="Reps"
                      value={String(safeReps)}
                      color={tokens.color.oldValueColor}
                      bg={tokens.color.oldValueBg}
                    />
                  ) : null}
                  {pesoDisplay ? (
                    <ValuePill
                      label="Peso"
                      value={pesoDisplay}
                      color={tokens.color.oldValueColor}
                      bg={tokens.color.oldValueBg}
                    />
                  ) : null}
                </View>
              </View>

              <Text style={[styles.compareArrow, { color: tokens.color.accentGreen }]}>
                →
              </Text>

              {/* Nuevos valores */}
              <View style={styles.compareCol}>
                <Text style={[styles.compareColLabel, { color: textSecondary }]}>
                  NUEVO
                </Text>
                <View style={styles.compareValues}>
                  <ValuePill
                    label="Series"
                    value={String(nuevoSeriesDisplay)}
                    color={tokens.color.accentGreen}
                    bg={tokens.color.accentGreenBg}
                  />
                  {!isCardio ? (
                    <ValuePill
                      label="Reps"
                      value={String(nuevoRepsDisplay)}
                      color={tokens.color.accentGreen}
                      bg={tokens.color.accentGreenBg}
                    />
                  ) : null}
                  {nuevoPesoDisplay ? (
                    <ValuePill
                      label="Peso"
                      value={nuevoPesoDisplay}
                      color={tokens.color.accentGreen}
                      bg={tokens.color.accentGreenBg}
                    />
                  ) : null}
                </View>
              </View>
            </View>

            {/* Botón animado */}
            <Animated.View
              style={[
                styles.btnWrapper,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              <Animated.View
                style={[
                  styles.btnGlow,
                  {
                    opacity: glowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 0.45],
                    }),
                    backgroundColor: tokens.color.accentGreen,
                  },
                ]}
              />
              <Pressable
                onPress={handleActualizar}
                disabled={saving}
                style={({ pressed }) => [
                  styles.updateBtn,
                  {
                    backgroundColor: tokens.color.accentGreen,
                    opacity: pressed || saving ? 0.8 : 1,
                  },
                ]}
              >
                <RefreshCw size={16} color="#fff" strokeWidth={2.5} />
                <Text style={styles.updateBtnText}>
                  {saving ? "Actualizando..." : "Actualizar prescripción"}
                </Text>
              </Pressable>
            </Animated.View>
          </View>
        )}

        {/* Confirmación tras actualizar */}
        {updated && (
          <View
            style={[
              styles.updatedBadge,
              {
                backgroundColor: tokens.color.accentGreenBg,
                borderColor: tokens.color.accentGreenBorder,
              },
            ]}
          >
            <Text style={[styles.updatedBadgeText, { color: tokens.color.accentGreen }]}>
              ✓ Prescripción actualizada por el coach
            </Text>
          </View>
        )}
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

// ── ValuePill ─────────────────────────────────────────────────────────────────
function ValuePill({
  label,
  value,
  color,
  bg,
}: {
  label: string;
  value: string;
  color: string;
  bg: string;
}) {
  return (
    <View style={[styles.valuePill, { backgroundColor: bg }]}>
      <Text style={[styles.valuePillNum, { color }]}>{value}</Text>
      <Text style={[styles.valuePillLabel, { color }]}>{label}</Text>
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

  // ── Update block ────────────────────────────────────────────────────────────
  updateBlock: {
    marginTop: tokens.spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    padding: tokens.spacing.md,
    gap: 12,
  },
  updateLabel: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  compareRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  compareCol: {
    flex: 1,
    gap: 6,
  },
  compareColLabel: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  },
  compareValues: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  compareArrow: {
    fontSize: 20,
    fontWeight: "900",
    paddingHorizontal: 2,
  },

  valuePill: {
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    minWidth: 54,
  },
  valuePillNum: {
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  valuePillLabel: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.3,
    marginTop: 1,
    opacity: 0.75,
  },

  btnWrapper: {
    position: "relative",
    alignSelf: "stretch",
  },
  btnGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 999,
    transform: [{ scaleX: 1.1 }, { scaleY: 1.5 }],
  },
  updateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 48,
    borderRadius: 999,
    paddingHorizontal: tokens.spacing.lg,
  },
  updateBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0.2,
  },

  updatedBadge: {
    marginTop: tokens.spacing.sm,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
  },
  updatedBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
});
