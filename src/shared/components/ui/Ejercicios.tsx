import React, { useMemo, useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, Modal, Pressable } from "react-native";
import { useColorScheme } from "nativewind";
import {
  Rutina,
  EjercicioAsignado,
  EjercicioAsignadoSimple,
  EjercicioAsignadoCompuesto,
  ComponenteEjercicioCompuesto,
} from "@/features/type/rutinas";
import { Layers, Shuffle, Infinity as Circuit, X } from "lucide-react-native";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";
import CandadoPremium from "@/shared/components/ui/CandadoPremium";
import { formatDescripcion } from "@/shared/utils/formatDescripcion";

type Props = { dias: Rutina["dias"]; day: string };

const cloudinaryGif = (idGif?: string | null) =>
  idGif
    ? `https://res.cloudinary.com/dcn4vq1n4/image/upload/v1752248579/ejercicios/${idGif}.gif`
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

    timelineLineDark: "rgba(148,163,184,0.35)",
    timelineLineLight: "#E5E7EB",
    timelineDotBorderDark: "rgba(148,163,184,0.7)",
    timelineDotBorderLight: "#E5E7EB",
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

function CompuestoBranchItem({
  index,
  total,
  nombre,
  idGif,
  detalle,
  isDark,
  onPress,
}: {
  index: number;
  total: number;
  nombre: string;
  idGif?: string | null;
  detalle?: string;
  isDark: boolean;
  onPress: () => void;
}) {
  const isLast = index === total - 1;
  const lineColor = isDark ? tokens.color.timelineLineDark : tokens.color.timelineLineLight;
  const dotBorder = isDark ? tokens.color.timelineDotBorderDark : tokens.color.timelineDotBorderLight;

  return (
    <View style={styles.branchWrap}>
      <View
        style={[
          styles.branchLine,
          { backgroundColor: lineColor, bottom: isLast ? "75%" : 0 },
        ]}
        pointerEvents="none"
      />
      <View
        style={[
          styles.branchDot,
          {
            backgroundColor: isDark ? "#020617" : "#FFFFFF",
            borderColor: dotBorder,
          },
        ]}
        pointerEvents="none"
      />

      <Pressable
        onPress={onPress}
        style={[
          styles.branchCard,
          {
            backgroundColor: isDark ? tokens.color.surfaceDark : tokens.color.cardBgLight,
            borderColor: isDark ? tokens.color.cardBorderDark : tokens.color.cardBorderLight,
          },
        ]}
      >
        <View
          style={[
            styles.branchThumb,
            {
              backgroundColor: isDark ? tokens.color.surfaceDark : tokens.color.surfaceLight,
              borderColor: isDark ? tokens.color.surfaceBorderDark : tokens.color.surfaceBorderLight,
            },
          ]}
        >
          <Image source={{ uri: cloudinaryGif(idGif) }} style={styles.branchThumbImg} resizeMode="contain" />
        </View>

        <View style={styles.branchInfo}>
          <Text
            numberOfLines={1}
            style={[
              styles.branchName,
              { color: isDark ? tokens.color.textPrimaryDark : tokens.color.textPrimaryLight },
            ]}
          >
            {nombre}
          </Text>
          {detalle ? (
            <Text style={[styles.branchDetail, { color: isDark ? tokens.color.textSecondaryDark : tokens.color.textSecondaryLight }]}>
              {detalle}
            </Text>
          ) : null}
        </View>
      </Pressable>
    </View>
  );
}

export default function Ejercicios({ dias, day }: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const usuario = useUsuarioStore((s) => s.usuario);
  const isFreePlan = usuario?.planActual === "GRATUITO";
  const [zoomGif, setZoomGif] = useState<string | null>(null);

  const weightUnit = (usuario?.medidaPeso ?? "KG").toLowerCase();

  const dia = useMemo(() => (dias ?? []).find((d) => d.diaSemana === day), [dias, day]);
  if (!dia) return null;

  const total = dia.ejercicios.length;
  const allowed = isFreePlan ? Math.ceil(total / 2) : total;

  const cardBg = isDark ? tokens.color.cardBgDark : tokens.color.cardBgLight;
  const cardBorder = isDark ? tokens.color.cardBorderDark : tokens.color.cardBorderLight;

  return (
    <View style={styles.listRoot}>
      {dia.ejercicios.map((asignado, idx) => {
        const locked = idx >= allowed;

        const CardWrapper = ({ children }: { children: React.ReactNode }) => (
          <View
            style={[
              styles.card,
              {
                backgroundColor: cardBg,
                borderColor: cardBorder,
              },
              !isDark ? styles.cardShadow : null,
            ]}
          >
            <View style={{ opacity: locked ? 0.55 : 1 }}>{children}</View>

            {locked && (
              <View pointerEvents="auto" style={StyleSheet.absoluteFillObject}>
                <CandadoPremium size={48} isDark={isDark} />
              </View>
            )}
          </View>
        );

        if (isSimple(asignado)) {
          const ej = asignado.ejercicio!;

          const meta =
            asignado.seriesSugeridas || asignado.repeticionesSugeridas || asignado.pesoSugerido
              ? [
                asignado.seriesSugeridas ? `${asignado.seriesSugeridas} series` : null,
                asignado.repeticionesSugeridas ? `${asignado.repeticionesSugeridas} reps` : null,
                asignado.pesoSugerido ? `${asignado.pesoSugerido} ${weightUnit}` : null,
              ]
                .filter(Boolean)
                .join(" · ")
              : null;

          return (
            <CardWrapper key={`s-${(asignado as any).id ?? idx}`}>
              <View style={styles.simpleWrap}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  disabled={locked}
                  onPress={() => setZoomGif(cloudinaryGif(ej.idGif))}
                  style={[
                    styles.hero,
                    {
                      backgroundColor: isDark ? tokens.color.surfaceDark : tokens.color.surfaceLight,
                      borderColor: isDark ? tokens.color.surfaceBorderDark : tokens.color.surfaceBorderLight,
                    },
                  ]}
                >
                  <Image
                    source={{ uri: cloudinaryGif(ej.idGif) }}
                    style={styles.heroImg}
                    resizeMode="contain"
                  />
                </TouchableOpacity>

                <View style={styles.simpleInfo}>
                  <Text
                    style={[
                      styles.simpleName,
                      { color: isDark ? tokens.color.textPrimaryDark : tokens.color.textPrimaryLight },
                    ]}
                    numberOfLines={2}
                  >
                    {ej.nombre}
                  </Text>

                  {ej.descripcion ? (
                    <Text
                      style={[
                        styles.simpleDesc,
                        { color: isDark ? tokens.color.textSecondaryDark : tokens.color.textSecondaryLight },
                      ]}
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
            </CardWrapper>
          );
        }

        if (isCompuesto(asignado)) {
          const comp = asignado.ejercicioCompuesto!;
          const Icono =
            comp.tipoCompuesto === "SUPERSET"
              ? Shuffle
              : comp.tipoCompuesto === "CIRCUITO"
                ? Circuit
                : Layers;

          const componentes: ComponenteEjercicioCompuesto[] = [
            ...(comp.ejerciciosComponentes ?? []),
          ].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));

          return (
            <CardWrapper key={`c-${(asignado as any).id ?? idx}`}>
              <View style={styles.compWrap}>
                <View style={styles.compHeader}>
                  <View
                    style={[
                      styles.compIcon,
                      {
                        backgroundColor: isDark ? tokens.color.surfaceDark : tokens.color.surfaceLight,
                        borderColor: isDark ? tokens.color.surfaceBorderDark : tokens.color.surfaceBorderLight,
                      },
                    ]}
                  >
                    <Icono size={18} color={isDark ? "#E2E8F0" : "#334155"} />
                  </View>

                  <View style={styles.compHeaderInfo}>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.compTitle,
                        { color: isDark ? tokens.color.textPrimaryDark : tokens.color.textPrimaryLight },
                      ]}
                    >
                      {comp.nombre}
                    </Text>
                    <Text style={[styles.compSub, { color: isDark ? tokens.color.textSecondaryDark : tokens.color.textSecondaryLight }]}>
                      {comp.tipoCompuesto}
                      {asignado.descansoSeg ? ` · Descanso entre bloques: ${asignado.descansoSeg}s` : ""}
                    </Text>
                  </View>
                </View>

                {asignado.notaIA ? (
                  <Text
                    style={[
                      styles.note,
                      {
                        color: isDark ? "#CBD5E1" : "#334155",
                        backgroundColor: isDark ? tokens.color.surfaceDark : tokens.color.surfaceLight,
                        borderColor: isDark ? tokens.color.surfaceBorderDark : tokens.color.surfaceBorderLight,
                      },
                    ]}
                  >
                    {asignado.notaIA}
                  </Text>
                ) : null}

                <View style={styles.compList}>
                  {componentes.map((c, i) => {
                    const detalle = [
                      c.series ? `${c.series} series` : null,
                      c.repeticiones ? `${c.repeticiones} reps` : null,
                      c.pesoSugerido ? `${c.pesoSugerido} ${weightUnit}` : null,
                      c.descansoSugeridoSeg ? `${c.descansoSugeridoSeg}s descanso` : null,
                    ]
                      .filter(Boolean)
                      .join(" · ");

                    return (
                      <CompuestoBranchItem
                        key={c.id ?? `${idx}-${i}`}
                        index={i}
                        total={componentes.length}
                        nombre={c.ejercicio?.nombre ?? `Paso ${c.orden ?? i + 1}`}
                        idGif={c.ejercicio?.idGif ?? undefined}
                        detalle={detalle || undefined}
                        isDark={isDark}
                        onPress={() => !locked && setZoomGif(cloudinaryGif(c.ejercicio?.idGif))}
                      />
                    );
                  })}
                </View>
              </View>
            </CardWrapper>
          );
        }

        return null;
      })}

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

  compWrap: {
    gap: 12,
  },
  compHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  compIcon: {
    height: 40,
    width: 40,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  compHeaderInfo: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  compTitle: {
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0.1,
  },
  compSub: {
    fontSize: 11,
    fontWeight: "700",
  },

  note: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
    borderRadius: tokens.radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },

  compList: {
    marginTop: 4,
    gap: 12,
  },

  branchWrap: {
    paddingLeft: 24,
  },
  branchLine: {
    position: "absolute",
    left: 10,
    top: 0,
    width: 1,
  },
  branchDot: {
    position: "absolute",
    left: 9,
    top: 6,
    width: 8,
    height: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  branchCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: tokens.radius.md,
    padding: 8,
    borderWidth: 1,
  },
  branchThumb: {
    width: 48,
    height: 48,
    borderRadius: tokens.radius.sm,
    overflow: "hidden",
    borderWidth: 1,
    flexShrink: 0,
  },
  branchThumbImg: {
    width: "100%",
    height: "100%",
  },
  branchInfo: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  branchName: {
    fontSize: 14,
    fontWeight: "800",
  },
  branchDetail: {
    fontSize: 11,
    fontWeight: "700",
  },
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