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
import { Colors, scheme } from "@/shared/constants/colors";
import { Font, TextStyle } from "@/shared/constants/typography";

// ── Tipos ─────────────────────────────────────────────────────────────────────
type Props = {
  notaIA?: string | null;
  series?: number | null;
  repeticiones?: number | null;
  peso?: number | null;
  esCardio?: boolean;
  esCompuesto?: boolean;
  nombreCompuesto?: string | null;
  tipoCompuesto?: string | null;
  cantidadEjercicios?: number | null;
  descansoSeg?: number | null;
  coachObjetivo?: ObjetivoSesion | null;
  asignadoId?: number | null;
  onActualizar?: (updated: {
    seriesSugeridas?: number | null;
    repeticionesSugeridas?: number | null;
    pesoSugerido?: number | null;
  }) => void;
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const PESO_DIFF_THRESHOLD = 0.05;

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
  const t = scheme(isDark);
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

  const needsUpdate = useMemo(() => {
    if (esCompuesto || !coachObjetivo || !asignadoId) return false;
    return hasDiff(safeSeries, safeReps, safePesoKg, coachObjetivo);
  }, [esCompuesto, coachObjetivo, asignadoId, safeSeries, safeReps, safePesoKg]);

  const [updated, setUpdated] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setUpdated(false);
  }, [safeSeries, safeReps, safePesoKg]);

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
          Animated.timing(pulseAnim, { toValue: 1.04, duration: 600, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]),
      ])
    );
    loopRef.current.start();

    return () => { loopRef.current?.stop(); };
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
      // silently fail
    } finally {
      setSaving(false);
    }
  }, [coachObjetivo, asignadoId, saving, onActualizar]);

  if (!shouldRender) return null;

  const showUpdate = needsUpdate && !updated && coachObjetivo != null;

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
            backgroundColor: isDark ? Colors.primary : Colors.secondary,
            borderColor: t.border,
          },
        ]}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconWrap, { backgroundColor: Colors.accentSubtle }]}>
              <Lightbulb size={16} color={Colors.accent} strokeWidth={2} />
            </View>
            <Text style={[styles.title, { color: t.textPrimary }]}>
              Nota de entrenamiento
            </Text>
          </View>
        </View>

        {esCompuesto && (safeNombreCompuesto || safeTipoCompuesto) && (
          <View style={styles.compuestoHeader}>
            {safeNombreCompuesto ? (
              <Text style={[styles.compuestoNombre, { color: t.textPrimary }]}>
                {safeNombreCompuesto}
              </Text>
            ) : null}
            {safeTipoCompuesto ? (
              <View
                style={[
                  styles.tipoPill,
                  {
                    backgroundColor: Colors.accentSubtle,
                    borderColor: Colors.accentBorder,
                  },
                ]}
              >
                <Text style={[styles.tipoPillText, { color: Colors.accent }]}>
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
                color: safeNota.length > 0 ? t.textPrimary : t.textSecondary,
                fontStyle: safeNota.length > 0 ? "italic" : "normal",
              },
            ]}
          >
            {safeNota.length > 0 ? safeNota : "Sin nota por ahora."}
          </Text>
        )}

        <View style={[styles.metricsRow, { borderTopColor: t.border }]}>
          {esCompuesto ? (
            <>
              {safeCantidad > 0 && (
                <MetaItem label="Ejercicios" value={String(safeCantidad)} t={t} />
              )}
              {safeDescansoSeg > 0 && (
                <MetaItem label="Descanso" value={`${safeDescansoSeg} s`} t={t} />
              )}
            </>
          ) : (
            <>
              <MetaItem label="Series" value={String(safeSeries)} t={t} />
              {isCardio ? (
                <MetaItem
                  label="Tiempo/serie"
                  value={safeReps > 0 ? `${safeReps} s` : "—"}
                  t={t}
                />
              ) : (
                <MetaItem label="Reps" value={String(safeReps)} t={t} />
              )}
              {pesoDisplay && (
                <MetaItem label="Peso" value={pesoDisplay} t={t} />
              )}
            </>
          )}
        </View>

        {showUpdate && (
          <View
            style={[
              styles.updateBlock,
              {
                backgroundColor: Colors.accentSubtle,
                borderColor: Colors.accentBorder,
              },
            ]}
          >
            <Text style={[styles.updateLabel, { color: Colors.accent }]}>
              NUEVA PRESCRIPCIÓN DEL COACH
            </Text>

            <View style={styles.compareRow}>
              <View style={styles.compareCol}>
                <Text style={[styles.compareColLabel, { color: t.textSecondary }]}>
                  ACTUAL
                </Text>
                <View style={styles.compareValues}>
                  <ValuePill label="Series" value={String(safeSeries)} color="#F97316" bg="rgba(249,115,22,0.10)" />
                  {!isCardio ? (
                    <ValuePill label="Reps" value={String(safeReps)} color="#F97316" bg="rgba(249,115,22,0.10)" />
                  ) : null}
                  {pesoDisplay ? (
                    <ValuePill label="Peso" value={pesoDisplay} color="#F97316" bg="rgba(249,115,22,0.10)" />
                  ) : null}
                </View>
              </View>

              <Text style={[styles.compareArrow, { color: Colors.accent }]}>→</Text>

              <View style={styles.compareCol}>
                <Text style={[styles.compareColLabel, { color: t.textSecondary }]}>
                  NUEVO
                </Text>
                <View style={styles.compareValues}>
                  <ValuePill label="Series" value={String(nuevoSeriesDisplay)} color={Colors.accent} bg={Colors.accentSubtle} />
                  {!isCardio ? (
                    <ValuePill label="Reps" value={String(nuevoRepsDisplay)} color={Colors.accent} bg={Colors.accentSubtle} />
                  ) : null}
                  {nuevoPesoDisplay ? (
                    <ValuePill label="Peso" value={nuevoPesoDisplay} color={Colors.accent} bg={Colors.accentSubtle} />
                  ) : null}
                </View>
              </View>
            </View>

            <Animated.View style={[styles.btnWrapper, { transform: [{ scale: pulseAnim }] }]}>
              <Animated.View
                style={[
                  styles.btnGlow,
                  {
                    opacity: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.45] }),
                    backgroundColor: Colors.accent,
                  },
                ]}
              />
              <Pressable
                onPress={handleActualizar}
                disabled={saving}
                style={({ pressed }) => [
                  styles.updateBtn,
                  { backgroundColor: Colors.accent, opacity: pressed || saving ? 0.8 : 1 },
                ]}
              >
                <RefreshCw size={16} color={Colors.secondary} strokeWidth={2.5} />
                <Text style={styles.updateBtnText}>
                  {saving ? "Actualizando..." : "Actualizar prescripción"}
                </Text>
              </Pressable>
            </Animated.View>
          </View>
        )}

        {updated && (
          <View
            style={[
              styles.updatedBadge,
              { backgroundColor: Colors.accentSubtle, borderColor: Colors.accentBorder },
            ]}
          >
            <Text style={[styles.updatedBadgeText, { color: Colors.accent }]}>
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
  t,
}: {
  label: string;
  value: string;
  t: ReturnType<typeof scheme>;
}) {
  return (
    <View style={styles.metaItem}>
      <Text style={[styles.metaLabel, { color: t.textSecondary }]}>{label}</Text>
      <Text style={[styles.metaValue, { color: t.textPrimary }]}>{value ?? "—"}</Text>
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
    marginVertical: 12,
  },

  card: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    ...TextStyle.label,
    fontFamily: Font.body.bold,
    letterSpacing: 0.1,
  },

  pill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillText: {
    ...TextStyle.caption,
    fontFamily: Font.body.semiBold,
    letterSpacing: 0.2,
  },

  compuestoHeader: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  compuestoNombre: {
    ...TextStyle.label,
    fontFamily: Font.body.bold,
  },
  tipoPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
  },
  tipoPillText: {
    ...TextStyle.caption,
    fontFamily: Font.body.bold,
    letterSpacing: 0.3,
  },

  nota: {
    ...TextStyle.label,
    fontFamily: Font.body.regular,
    marginBottom: 8,
  },

  metricsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
    marginTop: 4,
  },

  metaItem: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  metaLabel: {
    ...TextStyle.caption,
    fontFamily: Font.body.medium,
  },
  metaValue: {
    ...TextStyle.bodySm,
    fontFamily: Font.body.bold,
  },

  updateBlock: {
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 12,
  },
  updateLabel: {
    fontSize: 10,
    fontFamily: Font.body.bold,
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
    fontFamily: Font.body.bold,
    letterSpacing: 1,
  },
  compareValues: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  compareArrow: {
    fontSize: 20,
    fontFamily: Font.body.bold,
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
    fontFamily: Font.title.bold,
    letterSpacing: -0.3,
  },
  valuePillLabel: {
    fontSize: 9,
    fontFamily: Font.body.bold,
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
    paddingHorizontal: 16,
  },
  updateBtnText: {
    ...TextStyle.body,
    fontFamily: Font.body.bold,
    color: Colors.secondary,
    letterSpacing: 0.2,
  },

  updatedBadge: {
    marginTop: 8,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
  },
  updatedBadgeText: {
    ...TextStyle.bodySm,
    fontFamily: Font.body.bold,
  },
});
