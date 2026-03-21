import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
} from "react-native";
import { useColorScheme } from "nativewind";
import {
  Rutina,
  EjercicioAsignado,
  EjercicioAsignadoSimple,
  EjercicioAsignadoCompuesto,
  ComponenteEjercicioCompuesto,
} from "@/features/type/rutinas";
import { Layers, Shuffle, Infinity as Circuit, X, ChevronRight, Dumbbell, Timer, RotateCcw } from "lucide-react-native";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";
import { formatDescripcion } from "@/shared/utils/formatDescripcion";
import { kgToLb } from "@/shared/utils/kgToLb";

type Props = { dias: Rutina["dias"]; day: string };

const cloudinaryGif = (idGif?: string | null) =>
  idGif
    ? `https://res.cloudinary.com/dcn4vq1n4/image/upload/f_auto,q_auto/ejercicios/${idGif}.gif`
    : "https://dummyimage.com/256x256/e5e7eb/9ca3af.png&text=GIF";

function isSimple(e: EjercicioAsignado | any): e is EjercicioAsignadoSimple {
  if (!e) return false;
  if ("tipo" in e) return e.tipo === "simple" && !!e.ejercicio;
  return !!(e as any)?.ejercicio;
}
function isCompuesto(e: EjercicioAsignado | any): e is EjercicioAsignadoCompuesto {
  if (!e) return false;
  if ("tipo" in e) return e.tipo === "compuesto" && !!e.ejercicioCompuesto;
  return !!(e as any)?.ejercicioCompuesto;
}

// Colores según tipo de compuesto
const TIPO_COLORS = {
  SUPERSET: { bg: "rgba(168,85,247,0.12)", border: "rgba(168,85,247,0.3)", accent: "#a855f7", label: "Superserie" },
  CIRCUITO: { bg: "rgba(20,184,166,0.12)", border: "rgba(20,184,166,0.3)", accent: "#14b8a6", label: "Circuito" },
  DEFAULT: { bg: "rgba(99,102,241,0.10)", border: "rgba(99,102,241,0.25)", accent: "#6366f1", label: "Compuesto" },
};

const getTipoColors = (tipo?: string) =>
  TIPO_COLORS[(tipo as keyof typeof TIPO_COLORS)] ?? TIPO_COLORS.DEFAULT;

const tokens = {
  color: {
    cardBgDark: "rgba(15,24,41,1)",
    cardBgLight: "#FFFFFF",
    cardBorderDark: "rgba(255,255,255,0.08)",
    cardBorderLight: "rgba(0,0,0,0.06)",
    surfaceDark: "rgba(148,163,184,0.10)",
    surfaceLight: "#F8FAFC",
    surfaceBorderDark: "rgba(255,255,255,0.06)",
    surfaceBorderLight: "rgba(0,0,0,0.06)",
    textPrimaryDark: "#F1F5F9",
    textPrimaryLight: "#0F172A",
    textSecondaryDark: "#94A3B8",
    textSecondaryLight: "#64748B",
    chipBgDark: "rgba(148,163,184,0.12)",
    chipBgLight: "#F1F5F9",
    chipBorderDark: "rgba(255,255,255,0.06)",
    chipBorderLight: "rgba(0,0,0,0.06)",
    chipTextDark: "#E2E8F0",
    chipTextLight: "#334155",
  },
  radius: { lg: 16, md: 12, sm: 10, full: 999 },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16 },
} as const;

function Chip({ children, isDark }: { children: React.ReactNode; isDark: boolean }) {
  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: isDark ? tokens.color.chipBgDark : tokens.color.chipBgLight,
          borderColor: isDark ? tokens.color.chipBorderDark : tokens.color.chipBorderLight,
        },
      ]}
    >
      <Text style={[styles.chipText, { color: isDark ? tokens.color.chipTextDark : tokens.color.chipTextLight }]}>
        {children}
      </Text>
    </View>
  );
}

// ── Badge tipo compuesto ────────────────────────────────────────────────────
function TipoBadge({ tipo, isDark }: { tipo?: string; isDark: boolean }) {
  const colors = getTipoColors(tipo);
  const Icono = tipo === "SUPERSET" ? Shuffle : tipo === "CIRCUITO" ? Circuit : Layers;

  return (
    <View style={[styles.tipoBadge, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      <Icono size={11} color={colors.accent} />
      <Text style={[styles.tipoBadgeText, { color: colors.accent }]}>
        {colors.label}
      </Text>
    </View>
  );
}

// ── Stat pill (series · reps · peso) ────────────────────────────────────────
function StatPill({ label, value, isDark }: { label: string; value: string; isDark: boolean }) {
  return (
    <View style={[styles.statPill, {
      backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
      borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
    }]}>
      <Text style={[styles.statPillLabel, { color: isDark ? "#64748b" : "#94a3b8" }]}>{label}</Text>
      <Text style={[styles.statPillValue, { color: isDark ? "#e2e8f0" : "#1e293b" }]}>{value}</Text>
    </View>
  );
}

// ── Componente dentro del compuesto ────────────────────────────────────────
function CompuestoEjercicioItem({
  componente,
  index,
  total,
  isDark,
  accentColor,
  onPressGif,
  formatWeight,
}: {
  componente: ComponenteEjercicioCompuesto;
  index: number;
  total: number;
  isDark: boolean;
  accentColor: string;
  onPressGif: (url: string) => void;
  formatWeight: (w?: number | null) => string | null;
}) {
  const isLast = index === total - 1;
  const nombre = componente.ejercicio?.nombre ?? `Ejercicio ${index + 1}`;
  const idGif = componente.ejercicio?.idGif;

  const stats: { label: string; value: string }[] = [];
  if (componente.series) stats.push({ label: "series", value: String(componente.series) });
  if (componente.repeticiones) stats.push({ label: "reps", value: String(componente.repeticiones) });
  if (componente.pesoSugerido) {
    const peso = formatWeight(Number(componente.pesoSugerido));
    if (peso) stats.push({ label: "peso", value: peso });
  }
  if (componente.descansoSugeridoSeg) {
    stats.push({ label: "desc.", value: `${componente.descansoSugeridoSeg}s` });
  }

  return (
    <View style={styles.compItem}>
      {/* Línea de timeline */}
      {!isLast && (
        <View style={[styles.timelineLine, { backgroundColor: accentColor + "30" }]} />
      )}

      {/* Número de orden */}
      <View style={[styles.timelineNumber, { backgroundColor: accentColor + "20", borderColor: accentColor + "50" }]}>
        <Text style={[styles.timelineNumberText, { color: accentColor }]}>{index + 1}</Text>
      </View>

      {/* Contenido */}
      <View style={styles.compItemContent}>
        {/* GIF thumb + nombre */}
        <View style={styles.compItemHeader}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onPressGif(cloudinaryGif(idGif))}
            style={[styles.compThumb, {
              backgroundColor: isDark ? tokens.color.surfaceDark : tokens.color.surfaceLight,
              borderColor: isDark ? tokens.color.surfaceBorderDark : tokens.color.surfaceBorderLight,
            }]}
          >
            <Image
              source={{ uri: cloudinaryGif(idGif) }}
              style={styles.compThumbImg}
              resizeMode="contain"
            />
            {/* Indicador de toque */}
            <View style={[styles.compThumbOverlay, { backgroundColor: "rgba(0,0,0,0.3)" }]}>
              <ChevronRight size={12} color="#fff" />
            </View>
          </TouchableOpacity>

          <View style={styles.compItemInfo}>
            <Text
              numberOfLines={2}
              style={[styles.compItemName, { color: isDark ? tokens.color.textPrimaryDark : tokens.color.textPrimaryLight }]}
            >
              {nombre}
            </Text>
            {componente.ejercicio?.grupoMuscular ? (
              <Text style={[styles.compItemMuscle, { color: isDark ? tokens.color.textSecondaryDark : tokens.color.textSecondaryLight }]}>
                {componente.ejercicio.grupoMuscular}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Stats en pills */}
        {stats.length > 0 && (
          <View style={styles.compItemStats}>
            {stats.map((s, i) => (
              <StatPill key={i} label={s.label} value={s.value} isDark={isDark} />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

export default function Ejercicios({ dias, day }: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const usuario = useUsuarioStore((s) => s.usuario);
  const [zoomGif, setZoomGif] = useState<string | null>(null);

  const weightUnit = (usuario?.medidaPeso ?? "KG").toUpperCase();

  const formatWeight = (weightKg?: number | null): string | null => {
    if (!weightKg) return null;
    return weightUnit === "LB" ? kgToLb(Number(weightKg)) : `${weightKg} kg`;
  };

  const dia = useMemo(() => (dias ?? []).find((d) => d.diaSemana === day), [dias, day]);
  if (!dia) return null;

  const cardBg = isDark ? tokens.color.cardBgDark : tokens.color.cardBgLight;
  const cardBorder = isDark ? tokens.color.cardBorderDark : tokens.color.cardBorderLight;

  return (
    <View style={styles.listRoot}>
      {dia.ejercicios.map((asignado, idx) => {
        // ── EJERCICIO SIMPLE ──────────────────────────────────────────────
        if (isSimple(asignado)) {
          const ej = asignado.ejercicio!;

          const meta =
            asignado.seriesSugeridas || asignado.repeticionesSugeridas || asignado.pesoSugerido
              ? [
                asignado.seriesSugeridas ? `${asignado.seriesSugeridas} series` : null,
                asignado.repeticionesSugeridas ? `${asignado.repeticionesSugeridas} reps` : null,
                asignado.pesoSugerido ? formatWeight(Number(asignado.pesoSugerido)) : null,
              ]
                .filter(Boolean)
                .join(" · ")
              : null;

          return (
            <View
              key={`s-${(asignado as any).id ?? idx}`}
              style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }, !isDark ? styles.cardShadow : null]}
            >
              <View style={styles.simpleWrap}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => setZoomGif(cloudinaryGif(ej.idGif))}
                  style={[styles.hero, {
                    backgroundColor: isDark ? tokens.color.surfaceDark : tokens.color.surfaceLight,
                    borderColor: isDark ? tokens.color.surfaceBorderDark : tokens.color.surfaceBorderLight,
                  }]}
                >
                  <Image source={{ uri: cloudinaryGif(ej.idGif) }} style={styles.heroImg} resizeMode="contain" />
                </TouchableOpacity>

                <View style={styles.simpleInfo}>
                  <Text
                    style={[styles.simpleName, { color: isDark ? tokens.color.textPrimaryDark : tokens.color.textPrimaryLight }]}
                    numberOfLines={2}
                  >
                    {ej.nombre}
                  </Text>

                  {ej.descripcion ? (
                    <Text
                      style={[styles.simpleDesc, { color: isDark ? tokens.color.textSecondaryDark : tokens.color.textSecondaryLight }]}
                      numberOfLines={2}
                    >
                      {formatDescripcion(ej.descripcion)}
                    </Text>
                  ) : null}

                  <View style={styles.chipsRow}>
                    <Chip isDark={isDark}>{ej.tipoEjercicio}</Chip>
                    <Chip isDark={isDark}>{ej.grupoMuscular}</Chip>
                    {ej.nivelDificultad ? <Chip isDark={isDark}>{ej.nivelDificultad}</Chip> : null}
                    {meta ? <Chip isDark={isDark}>{meta}</Chip> : null}
                  </View>
                </View>
              </View>
            </View>
          );
        }

        // ── EJERCICIO COMPUESTO ───────────────────────────────────────────
        if (isCompuesto(asignado)) {
          const comp = asignado.ejercicioCompuesto!;
          const tipoColors = getTipoColors(comp.tipoCompuesto);

          const componentes: ComponenteEjercicioCompuesto[] = [
            ...(comp.ejerciciosComponentes ?? []),
          ].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));

          const totalEjercicios = componentes.length;

          return (
            <View
              key={`c-${(asignado as any).id ?? idx}`}
              style={[
                styles.card,
                styles.compCard,
                {
                  backgroundColor: cardBg,
                  borderColor: tipoColors.border,
                  // Franja de color lateral izquierda
                },
                !isDark ? styles.cardShadow : null,
              ]}
            >
              {/* Acento lateral */}
              <View style={[styles.compAccentBar, { backgroundColor: tipoColors.accent }]} />

              <View style={styles.compWrap}>
                {/* ── Cabecera ── */}
                <View style={styles.compHeader}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={styles.compHeaderTop}>
                      <TipoBadge tipo={comp.tipoCompuesto} isDark={isDark} />
                      {totalEjercicios > 0 && (
                        <Text style={[styles.compCount, { color: isDark ? tokens.color.textSecondaryDark : tokens.color.textSecondaryLight }]}>
                          {totalEjercicios} ejercicios
                        </Text>
                      )}
                    </View>
                    <Text
                      numberOfLines={1}
                      style={[styles.compTitle, { color: isDark ? tokens.color.textPrimaryDark : tokens.color.textPrimaryLight }]}
                    >
                      {comp.nombre}
                    </Text>
                  </View>
                </View>

                {/* ── Descanso entre bloques ── */}
                {asignado.descansoSeg ? (
                  <View style={[styles.compRestRow, {
                    backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                    borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                  }]}>
                    <RotateCcw size={12} color={isDark ? tokens.color.textSecondaryDark : tokens.color.textSecondaryLight} />
                    <Text style={[styles.compRestText, { color: isDark ? tokens.color.textSecondaryDark : tokens.color.textSecondaryLight }]}>
                      Descanso entre bloques: <Text style={{ fontWeight: "800" }}>{asignado.descansoSeg}s</Text>
                    </Text>
                  </View>
                ) : null}

                {/* ── Nota ── */}
                {asignado.notaIA ? (
                  <Text
                    style={[styles.note, {
                      color: isDark ? "#CBD5E1" : "#334155",
                      backgroundColor: isDark ? tokens.color.surfaceDark : tokens.color.surfaceLight,
                      borderColor: isDark ? tokens.color.surfaceBorderDark : tokens.color.surfaceBorderLight,
                    }]}
                  >
                    {asignado.notaIA}
                  </Text>
                ) : null}

                {/* ── Divisor ── */}
                <View style={[styles.compDivider, { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)" }]} />

                {/* ── Lista de ejercicios del compuesto ── */}
                <View style={styles.compList}>
                  {componentes.map((c, i) => (
                    <CompuestoEjercicioItem
                      key={c.id ?? `${idx}-${i}`}
                      componente={c}
                      index={i}
                      total={componentes.length}
                      isDark={isDark}
                      accentColor={tipoColors.accent}
                      onPressGif={(url) => setZoomGif(url)}
                      formatWeight={formatWeight}
                    />
                  ))}
                </View>
              </View>
            </View>
          );
        }

        return null;
      })}

      {/* ── Modal zoom GIF ── */}
      <Modal visible={!!zoomGif} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setZoomGif(null)}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? "#0F172A" : "#FFF" }]}>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setZoomGif(null)}>
              <X color={isDark ? "#FFF" : "#000"} size={24} />
            </TouchableOpacity>
            <Image source={{ uri: zoomGif ?? "" }} style={styles.fullGif} resizeMode="contain" />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  listRoot: {
    width: "100%",
    gap: 16,
    alignItems: "center",
    paddingBottom: 16,
  },

  // ── Card base ──────────────────────────────────────────────────────────
  card: {
    position: "relative",
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    padding: tokens.spacing.lg,
    width: "100%",
    maxWidth: 680,
    overflow: "hidden",
  },
  cardShadow: {
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },

  // ── Compuesto card específico ──────────────────────────────────────────
  compCard: {
    paddingLeft: 22, // Espacio para el acento lateral
  },
  compAccentBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: tokens.radius.lg,
    borderBottomLeftRadius: tokens.radius.lg,
  },

  // ── Chip ──────────────────────────────────────────────────────────────
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: tokens.radius.full,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 11,
    fontWeight: "700",
  },

  // ── Simple ────────────────────────────────────────────────────────────
  simpleWrap: {
    gap: 12,
  },
  hero: {
    alignSelf: "center",
    width: 112,
    height: 112,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
  },
  heroImg: {
    width: "100%",
    height: "100%",
  },
  simpleInfo: {
    gap: 6,
    alignItems: "center",
  },
  simpleName: {
    fontSize: 14,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: 0.1,
  },
  simpleDesc: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    fontWeight: "600",
  },
  chipsRow: {
    marginTop: 4,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },

  // ── Compuesto header ──────────────────────────────────────────────────
  compWrap: {
    gap: 10,
  },
  compHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  compHeaderTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  compTitle: {
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0.1,
  },
  compCount: {
    fontSize: 11,
    fontWeight: "700",
  },

  // ── Badge tipo ────────────────────────────────────────────────────────
  tipoBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: tokens.radius.full,
    borderWidth: 1,
  },
  tipoBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  // ── Descanso row ──────────────────────────────────────────────────────
  compRestRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: tokens.radius.sm,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  compRestText: {
    fontSize: 12,
    fontWeight: "600",
  },

  // ── Nota ──────────────────────────────────────────────────────────────
  note: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
    borderRadius: tokens.radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },

  // ── Divisor ───────────────────────────────────────────────────────────
  compDivider: {
    height: 1,
    marginVertical: 2,
  },

  // ── Lista ejercicios del compuesto ────────────────────────────────────
  compList: {
    gap: 0,
  },

  // ── Item individual del compuesto ─────────────────────────────────────
  compItem: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 10,
    position: "relative",
  },
  timelineLine: {
    position: "absolute",
    left: 15,
    top: 36,
    bottom: 0,
    width: 1.5,
  },
  timelineNumber: {
    width: 30,
    height: 30,
    borderRadius: tokens.radius.full,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 2,
  },
  timelineNumberText: {
    fontSize: 12,
    fontWeight: "900",
  },
  compItemContent: {
    flex: 1,
    gap: 8,
  },
  compItemHeader: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  compThumb: {
    width: 56,
    height: 56,
    borderRadius: tokens.radius.md,
    overflow: "hidden",
    borderWidth: 1,
    flexShrink: 0,
    position: "relative",
  },
  compThumbImg: {
    width: "100%",
    height: "100%",
  },
  compThumbOverlay: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  compItemInfo: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  compItemName: {
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18,
  },
  compItemMuscle: {
    fontSize: 11,
    fontWeight: "600",
  },
  compItemStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },

  // ── Stat pill ─────────────────────────────────────────────────────────
  statPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: tokens.radius.sm,
    borderWidth: 1,
  },
  statPillLabel: {
    fontSize: 10,
    fontWeight: "600",
  },
  statPillValue: {
    fontSize: 12,
    fontWeight: "800",
  },

  // ── Modal GIF ─────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxWidth: 400,
    aspectRatio: 1,
    borderRadius: 20,
    overflow: "hidden",
  },
  closeBtn: {
    position: "absolute",
    top: 15,
    right: 15,
    zIndex: 2,
  },
  fullGif: {
    width: "100%",
    height: "100%",
  },
});