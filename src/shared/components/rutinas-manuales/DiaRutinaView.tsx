// src/shared/components/rutina/DiaRutinaView.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";

import type {
  CompuestoItem,
  DiaSemana,
  EjercicioAsignadoInput,
  EjercicioItem,
  Item,
} from "@/features/type/crearRutina";

type Props = {
  dia: DiaSemana;
  ejercicios: Item[];
  onEdit?: (ejercicio: EjercicioAsignadoInput) => void;
  dispatch: React.Dispatch<any>;
  onSelectionChange?: (orden: number | null, item: Item | null) => void;
  selectedOrden?: number | null;
};

function getStableKey(item: Item): string {
  const anyItem = item as any;
  if (anyItem?.id != null) return `id:${String(anyItem.id)}`;
  const esCompuesto = "compuesto" in anyItem && !!anyItem.compuesto;
  if (esCompuesto) {
    const ejercicios = (anyItem as CompuestoItem).ejerciciosCompuestos ?? [];
    const ids = ejercicios.map((e: any) => e?.ejercicioId ?? e?.ejercicioInfo?.id ?? "x").join("|");
    return `cmp:${ids}`;
  }
  const ejId = anyItem?.ejercicioId ?? anyItem?.ejercicioInfo?.id ?? "x";
  return `ej:${String(ejId)}`;
}

export default function DiaRutinaView({
  dia,
  ejercicios,
  onEdit,
  dispatch,
  onSelectionChange,
  selectedOrden,
}: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { usuario } = useUsuarioStore();
  const weightUnit = (usuario?.medidaPeso ?? "KG").toLowerCase();

  const sorted = useMemo(
    () => [...(ejercicios ?? [])].sort((a, b) => a.orden - b.orden),
    [ejercicios]
  );

  const [activeKey, setActiveKey] = useState<string | null>(null);

  // Sincronizar selección externa
  useEffect(() => {
    if (selectedOrden === undefined) return;
    if (selectedOrden == null) {
      setActiveKey(null);
      return;
    }
    const it = sorted.find((x) => x.orden === selectedOrden) ?? null;
    setActiveKey(it ? getStableKey(it) : null);
  }, [selectedOrden, sorted]);

  const toggleSelectByItem = (item: Item) => {
    const key = getStableKey(item);
    const isNewSelection = activeKey !== key;
    setActiveKey(isNewSelection ? key : null);
    onSelectionChange?.(isNewSelection ? item.orden : null, isNewSelection ? item : null);
  };

  const cardBg = isDark ? "#020617" : "#ffffff";
  const cardBorder = isDark ? "rgba(255,255,255,0.15)" : "rgba(15,23,42,0.12)";
  const textPrimary = isDark ? "#e5e7eb" : "#0f172a";
  const frameGradient = ["rgb(0,255,64)", "rgb(94,230,157)", "rgb(178,0,255)"];

  if (sorted.length === 0) {
    return (
      <View style={{ paddingVertical: 40 }}>
        <Explicacion />
      </View>
    );
  }

  return (
    <View style={styles.listContainer}>
      {sorted.map((item) => {
        const key = getStableKey(item);
        const isSelected = activeKey === key;
        const anyItem = item as any;
        const esCompuesto = "compuesto" in anyItem && !!anyItem.compuesto;
        const ejerciciosDelItem = (esCompuesto
          ? (item as CompuestoItem).ejerciciosCompuestos
          : [item as EjercicioItem]) as EjercicioAsignadoInput[];

        const principal = ejerciciosDelItem[0];
        const imageSize = esCompuesto ? 60 : 110;

        return (
          <View key={key} style={styles.itemWrapper}>
            {isSelected && (
              <LinearGradient
                colors={frameGradient as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.selectionGradient}
              />
            )}

            <View style={styles.cardContainer}>
              <Pressable
                onPress={() => toggleSelectByItem(item)}
                // Nota: El reordenamiento ahora se gestiona desde los botones Subir/Bajar 
                // del componente padre (RutinaControls) para evitar conflictos de gestos.
                style={[
                  styles.pressableCard,
                  {
                    backgroundColor: cardBg,
                    borderColor: isSelected ? "transparent" : cardBorder,
                  },
                ]}
              >
                <View
                  style={[
                    styles.imageSection,
                    { flexDirection: esCompuesto ? "row" : "column", gap: esCompuesto ? 8 : 0 },
                  ]}
                >
                  {ejerciciosDelItem.map((ej, idx) => (
                    <View
                      key={`${key}-${ej.ejercicioId}-${idx}`}
                      style={[
                        styles.imageFrame,
                        {
                          width: imageSize,
                          height: imageSize,
                          borderColor: cardBorder,
                          backgroundColor: isDark ? "#020617" : "#ffffff",
                        },
                      ]}
                    >
                      <Image
                        source={{
                          uri: `https://res.cloudinary.com/dcn4vq1n4/image/upload/v1752248579/ejercicios/${ej.ejercicioInfo?.idGif ?? ""
                            }.gif`,
                        }}
                        style={styles.gif}
                        resizeMode="contain"
                      />
                    </View>
                  ))}
                </View>

                <View style={styles.infoSection}>
                  <Text numberOfLines={1} style={[styles.title, { color: textPrimary }]}>
                    {esCompuesto
                      ? `${anyItem.nombreCompuesto || "Compuesto"} (${ejerciciosDelItem.length})`
                      : principal.ejercicioInfo?.nombre}
                  </Text>

                  <View style={styles.chipsContainer}>
                    <Chip isDark={isDark}>S: {principal.seriesSugeridas ?? "-"}</Chip>
                    <Chip isDark={isDark}>R: {principal.repeticionesSugeridas ?? "-"}</Chip>
                    <Chip isDark={isDark}>
                      {principal.pesoSugerido ?? "-"} {weightUnit}
                    </Chip>
                  </View>
                </View>
              </Pressable>
            </View>
          </View>
        );
      })}
    </View>
  );
}

// --- Subcomponentes y Estilos ---

function Chip({ children, isDark }: { children: React.ReactNode; isDark: boolean }) {
  return (
    <View
      style={[
        styles.chip,
        {
          borderColor: isDark ? "rgba(255,255,255,0.18)" : "rgba(15,23,42,0.12)",
          backgroundColor: isDark ? "#0f172a" : "#f8fafc",
        },
      ]}
    >
      <Text style={[styles.chipText, { color: isDark ? "#cbd5e1" : "#475569" }]}>
        {children}
      </Text>
    </View>
  );
}

function Explicacion() {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTextMain}>Aún no hay ejercicios en este día.</Text>
      <Text style={styles.emptyTextSub}>Añade ejercicios o compuestos para empezar.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    width: "100%",
    marginTop: 16,
    gap: 12, // Espaciado entre elementos (reemplaza ItemSeparatorComponent)
  },
  itemWrapper: {
    width: "95%",
    borderRadius: 16,
    padding: 1,
    alignSelf: "center",
  },
  selectionGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
  },
  cardContainer: {
    borderRadius: 16,
    overflow: "hidden",
  },
  pressableCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
  },
  imageSection: {
    minWidth: 110,
    alignItems: "center",
    justifyContent: "center",
  },
  imageFrame: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
  },
  gif: {
    width: "100%",
    height: "100%",
  },
  infoSection: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 8,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 11,
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    gap: 6,
  },
  emptyTextMain: {
    color: "#64748b",
    fontWeight: "600",
  },
  emptyTextSub: {
    color: "#94a3b8",
    fontSize: 12,
  },
});