// src/shared/components/misRutinas/Ejercicios.tsx
import React, { useMemo } from "react";
import { View, Text, ScrollView, Image, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import {
  Rutina,
  EjercicioAsignado,
  EjercicioAsignadoSimple,
  EjercicioAsignadoCompuesto,
  ComponenteEjercicioCompuesto,
} from "@/features/type/rutinas";
import { Layers, Shuffle, Infinity as Circuit } from "lucide-react-native";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";
import CandadoPremium from "@/shared/components/ui/CandadoPremium";

type Props = { dias: Rutina["dias"]; day: string };

const cloudinaryGif = (idGif?: string | null) =>
  idGif
    ? `https://res.cloudinary.com/dcn4vq1n4/image/upload/v1752248579/ejercicios/${idGif}.gif`
    : "https://dummyimage.com/256x256/e5e7eb/9ca3af.png&text=GIF";

/* --------- type guards tolerantes --------- */
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

/* --------- Chip minimal --------- */
function Chip({ children, isDark }: { children: React.ReactNode; isDark: boolean }) {
  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "#f5f5f5",
          borderColor: isDark ? "rgba(255,255,255,0.18)" : "#e5e7eb",
        },
      ]}
    >
      <Text style={{ fontSize: 11, color: isDark ? "#E5E7EB" : "#334155" }}>{children}</Text>
    </View>
  );
}

/* --------- Rama del compuesto (timeline) --------- */
function CompuestoBranchItem({
  index,
  total,
  nombre,
  idGif,
  detalle,
  isDark,
}: {
  index: number;
  total: number;
  nombre: string;
  idGif?: string | null;
  detalle?: string;
  isDark: boolean;
}) {
  const isLast = index === total - 1;
  const lineColor = isDark ? "rgba(255,255,255,0.12)" : "#e5e7eb";
  const dotBorder = isDark ? "rgba(255,255,255,0.22)" : "#e5e7eb";

  return (
    <View style={{ paddingLeft: 24 }}>
      {/* línea vertical */}
      <View
        style={{
          position: "absolute",
          left: 10,
          top: 0,
          bottom: isLast ? "75%" : 0,
          width: 1,
          backgroundColor: lineColor,
        }}
        pointerEvents="none"
      />
      {/* dot */}
      <View
        style={{
          position: "absolute",
          left: 9,
          top: 6,
          width: 8,
          height: 8,
          borderRadius: 999,
          backgroundColor: isDark ? "#0b1220" : "#ffffff",
          borderWidth: 1,
          borderColor: dotBorder,
        }}
        pointerEvents="none"
      />

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          borderRadius: 12,
          padding: 8,
          backgroundColor: isDark ? "rgba(20,28,44,0.55)" : "#ffffff",
          borderWidth: 1,
          borderColor: isDark ? "rgba(255,255,255,0.1)" : "#e5e7eb",
        }}
      >
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 10,
            overflow: "hidden",
            backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc",
            borderWidth: 1,
            borderColor: isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb",
          }}
        >
          <Image
            source={{ uri: cloudinaryGif(idGif) }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="contain"
          />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            numberOfLines={1}
            style={{ fontSize: 14, fontWeight: "600", color: isDark ? "#E5E7EB" : "#0f172a" }}
          >
            {nombre}
          </Text>
          {detalle ? (
            <Text style={{ fontSize: 11, color: isDark ? "#94a3b8" : "#64748b" }}>{detalle}</Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

export default function Ejercicios({ dias, day }: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { usuario } = useUsuarioStore();
  const isFreePlan = usuario?.planActual === "GRATUITO";

  const dia = useMemo(() => (dias ?? []).find((d) => d.diaSemana === day), [dias, day]);
  if (!dia) return null;

  const total = dia.ejercicios.length;
  const allowed = isFreePlan ? Math.ceil(total / 2) : total;

  const frameGradient = isDark
    ? ["#111a2b", "#0b1220", "#111a2b"]
    : ["#39ff14", "#14ff80", "#22c55e"];

  const cardBg = isDark ? "#0b1220" : "rgba(255,255,255,0.96)";
  const cardBorder = isDark ? "rgba(255,255,255,0.10)" : "#e5e7eb";

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 16,
        gap: 16,
        alignItems: "center",
      }}
      style={{ width: "100%" }}
    >
      {dia.ejercicios.map((asignado, idx) => {
        const locked = idx >= allowed;

        const CardWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
          <LinearGradient
            colors={frameGradient as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 16, padding: 1, width: "100%", maxWidth: 680 }}
          >
            <View
              style={{
                position: "relative",
                borderRadius: 16,
                backgroundColor: cardBg,
                borderWidth: 1,
                borderColor: cardBorder,
                padding: 16,
                overflow: "hidden",
              }}
            >
              {/* contenido (si locked, lo atenuamos un poco) */}
              <View style={{ opacity: locked ? 0.55 : 1 }}>{children}</View>

              {/* overlay de bloqueo */}
              {locked && (
                <View
                  pointerEvents="auto"
                  style={StyleSheet.absoluteFillObject}
                >
                  <CandadoPremium size={48} isDark={isDark} />
                </View>
              )}
            </View>
          </LinearGradient>
        );

        /* --------- SIMPLE --------- */
        if (isSimple(asignado)) {
          const ej = asignado.ejercicio!;
          const meta =
            asignado.seriesSugeridas ||
            asignado.repeticionesSugeridas ||
            asignado.pesoSugerido
              ? [
                  asignado.seriesSugeridas ? `${asignado.seriesSugeridas} series` : null,
                  asignado.repeticionesSugeridas ? `${asignado.repeticionesSugeridas} reps` : null,
                  asignado.pesoSugerido ? `${asignado.pesoSugerido} kg` : null,
                ]
                  .filter(Boolean)
                  .join(" · ")
              : null;

          return (
            <CardWrapper key={`s-${(asignado as any).id ?? idx}`}>
              <View
                style={{
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <View
                  style={{
                    alignSelf: "center",
                    width: 112,
                    height: 112,
                    borderRadius: 14,
                    overflow: "hidden",
                    backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc",
                    borderWidth: 1,
                    borderColor: isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb",
                  }}
                >
                  <Image
                    source={{ uri: cloudinaryGif(ej.idGif) }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="contain"
                  />
                </View>

                <View style={{ gap: 6, alignItems: "center" }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: isDark ? "#E5E7EB" : "#0f172a",
                      textAlign: "center",
                    }}
                    numberOfLines={2}
                  >
                    {ej.nombre}
                  </Text>

                  {ej.descripcion ? (
                    <Text
                      style={{
                        fontSize: 12,
                        color: isDark ? "#94a3b8" : "#64748b",
                        textAlign: "center",
                      }}
                      numberOfLines={2}
                    >
                      {ej.descripcion}
                    </Text>
                  ) : null}

                  <View
                    style={{
                      marginTop: 4,
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: 8,
                      justifyContent: "center",
                    }}
                  >
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

        /* --------- COMPUESTO --------- */
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
              <View style={{ gap: 12 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <View
                    style={{
                      height: 40,
                      width: 40,
                      borderRadius: 12,
                      backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "#ffffff",
                      borderWidth: 1,
                      borderColor: isDark ? "rgba(255,255,255,0.12)" : "#e5e7eb",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icono size={18} color={isDark ? "#e5e7eb" : "#334155"} />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      numberOfLines={1}
                      style={{ fontSize: 14, fontWeight: "700", color: isDark ? "#E5E7EB" : "#0f172a" }}
                    >
                      {comp.nombre}
                    </Text>
                    <Text style={{ fontSize: 11, color: isDark ? "#94a3b8" : "#64748b" }}>
                      {comp.tipoCompuesto}
                      {asignado.descansoSeg ? ` · Descanso entre bloques: ${asignado.descansoSeg}s` : ""}
                    </Text>
                    {asignado.notaIA ? (
                      <Text
                        style={{
                          marginTop: 8,
                          fontSize: 12,
                          color: isDark ? "#CBD5E1" : "#334155",
                          backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc",
                          borderWidth: 1,
                          borderColor: isDark ? "rgba(255,255,255,0.10)" : "#e5e7eb",
                          borderRadius: 12,
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                        }}
                      >
                        {asignado.notaIA}
                      </Text>
                    ) : null}
                  </View>
                </View>

                <View style={{ marginTop: 4, gap: 12 }}>
                  {componentes.map((c, i) => {
                    const detalle = [
                      c.series ? `${c.series} series` : null,
                      c.repeticiones ? `${c.repeticiones} reps` : null,
                      c.pesoSugerido ? `${c.pesoSugerido} kg` : null,
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
});
