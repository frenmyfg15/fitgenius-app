import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import DraggableFlatList, {
  RenderItemParams,
} from "react-native-draggable-flatlist";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";
import { kgToLb } from "@/shared/utils/kgToLb";

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

/** Key estable (NO usar orden) */
function getStableKey(item: Item): string {
  const anyItem = item as any;

  if (anyItem?.id != null) return `id:${String(anyItem.id)}`;

  const esCompuesto = "compuesto" in anyItem && !!anyItem.compuesto;
  if (esCompuesto) {
    const ejercicios = (anyItem as CompuestoItem).ejerciciosCompuestos ?? [];
    const ids = ejercicios
      .map((e: any) => e?.ejercicioId ?? e?.ejercicioInfo?.id ?? "x")
      .join("|");
    return `cmp:${ids}`;
  }

  const ejId = anyItem?.ejercicioId ?? anyItem?.ejercicioInfo?.id ?? "x";
  return `ej:${String(ejId)}`;
}

function buildSignature(items: Item[]): string {
  const parts: string[] = [];

  for (const it of items ?? []) {
    const k = getStableKey(it);
    const anyIt = it as any;
    const esCompuesto = "compuesto" in anyIt && !!anyIt.compuesto;

    if (esCompuesto) {
      const cmp = it as CompuestoItem;
      parts.push(
        [
          k,
          `o:${cmp.orden}`,
          `n:${cmp.nombreCompuesto ?? ""}`,
          `t:${cmp.tipoCompuesto ?? ""}`,
          `d:${cmp.descansoCompuesto ?? 0}`,
          (cmp.ejerciciosCompuestos ?? [])
            .map((e: any) =>
              [
                e?.ejercicioId ?? "",
                e?.orden ?? "",
                e?.seriesSugeridas ?? "",
                e?.repeticionesSugeridas ?? "",
                e?.pesoSugerido ?? "",
                e?.descansoSeg ?? "",
                e?.notaIA ?? "",
              ].join(":")
            )
            .join("|"),
        ].join(";")
      );
    } else {
      const ej = it as EjercicioItem;
      parts.push(
        [
          k,
          `o:${ej.orden}`,
          `s:${ej.seriesSugeridas ?? ""}`,
          `r:${ej.repeticionesSugeridas ?? ""}`,
          `p:${ej.pesoSugerido ?? ""}`,
          `d:${ej.descansoSeg ?? ""}`,
          `n:${ej.notaIA ?? ""}`,
        ].join(";")
      );
    }
  }

  return parts.join("||");
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
  const weightUnit = (usuario?.medidaPeso ?? "KG").toUpperCase();

  const formatWeight = useCallback(
    (weightKg?: number | null) => {
      if (weightKg == null) return "-";
      return weightUnit === "LB" ? kgToLb(Number(weightKg)) : `${weightKg} kg`;
    },
    [weightUnit]
  );

  const sorted = useMemo(
    () => [...(ejercicios ?? [])].sort((a, b) => a.orden - b.orden),
    [ejercicios]
  );

  const sortedSignature = useMemo(() => buildSignature(sorted), [sorted]);

  const [data, setData] = useState<Item[]>(sorted);
  const [dataSignature, setDataSignature] = useState<string>(() =>
    buildSignature(sorted)
  );
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (isDragging) return;

    if (dataSignature !== sortedSignature) {
      setData(sorted);
      setDataSignature(sortedSignature);
    }
  }, [sorted, sortedSignature, dataSignature, isDragging]);

  const [activeKey, setActiveKey] = useState<string | null>(null);

  useEffect(() => {
    if (typeof selectedOrden === "undefined") return;

    if (selectedOrden == null) {
      setActiveKey(null);
      return;
    }

    const it = data.find((x) => x.orden === selectedOrden) ?? null;
    setActiveKey(it ? getStableKey(it) : null);
  }, [selectedOrden, data]);

  useEffect(() => {
    if (!activeKey) return;
    const exists = data.some((it) => getStableKey(it) === activeKey);
    if (!exists) setActiveKey(null);
  }, [data, activeKey]);

  const selectItem = (itemOrNull: Item | null) => {
    const key = itemOrNull ? getStableKey(itemOrNull) : null;
    setActiveKey(key);
    onSelectionChange?.(itemOrNull ? itemOrNull.orden : null, itemOrNull);
  };

  const toggleSelectByItem = (item: Item) => {
    const key = getStableKey(item);
    selectItem(activeKey === key ? null : item);
  };

  const frameGradient = ["rgb(0,255,64)", "rgb(94,230,157)", "rgb(178,0,255)"];
  const cardBg = isDark ? "#020617" : "#ffffff";
  const cardBorder = isDark ? "rgba(255,255,255,0.15)" : "rgba(15,23,42,0.12)";
  const textPrimary = isDark ? "#e5e7eb" : "#0f172a";

  const onDragEnd = useCallback(
    ({ data: newData }: { data: Item[] }) => {
      setIsDragging(false);

      const reordered = newData.map((it, idx) => ({
        ...it,
        orden: idx + 1,
      }));

      setData(reordered);
      setDataSignature(buildSignature(reordered));

      dispatch({
        type: "REORDER_EJERCICIOS",
        payload: { diaSemana: dia, ejercicios: reordered },
      });
    },
    [dispatch, dia]
  );

  const renderItem = useCallback(
    ({ item, drag }: RenderItemParams<Item>) => {
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
        <View
          style={{
            width: "95%",
            borderRadius: 16,
            padding: 1,
            alignSelf: "center",
            flex: 1,
          }}
        >
          {isSelected && (
            <LinearGradient
              colors={frameGradient as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[StyleSheet.absoluteFillObject, { borderRadius: 16 }]}
            />
          )}

          <View style={{ borderRadius: 16, overflow: "hidden" }}>
            <Pressable
              onPress={() => toggleSelectByItem(item)}
              onLongPress={drag}
              delayLongPress={250}
              style={{
                borderRadius: 16,
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                backgroundColor: cardBg,
                borderWidth: 1,
                borderColor: isSelected ? "transparent" : cardBorder,
              }}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
            >
              <View
                style={{
                  minWidth: 120,
                  flexDirection: esCompuesto ? "row" : "column",
                  gap: esCompuesto ? 8 : 0,
                }}
              >
                {ejerciciosDelItem.map((ej) => (
                  <View
                    key={`${key}-${ej.ejercicioId}`}
                    style={{
                      width: imageSize,
                      height: imageSize,
                      borderRadius: 12,
                      overflow: "hidden",
                      borderWidth: 1,
                      borderColor: cardBorder,
                      backgroundColor: isDark ? "#020617" : "#ffffff",
                    }}
                  >
                    <Image
                      source={{
                        uri: `https://res.cloudinary.com/dcn4vq1n4/image/upload/v1752248579/ejercicios/${ej.ejercicioInfo?.idGif ?? ""
                          }.gif`,
                      }}
                      style={{ width: "100%", height: "100%" }}
                      resizeMode="contain"
                    />
                  </View>
                ))}
              </View>

              <View style={{ flex: 1, minWidth: 0 as any }}>
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: textPrimary,
                  }}
                >
                  {esCompuesto
                    ? `Compuesto (${ejerciciosDelItem.length})`
                    : principal.ejercicioInfo?.nombre}
                </Text>

                <View
                  style={{
                    marginTop: 6,
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  <Chip isDark={isDark}>
                    Series: {principal.seriesSugeridas ?? "-"}
                  </Chip>
                  <Chip isDark={isDark}>
                    Reps: {principal.repeticionesSugeridas ?? "-"}
                  </Chip>
                  <Chip isDark={isDark}>
                    Peso: {formatWeight(principal.pesoSugerido)}
                  </Chip>
                </View>
              </View>
            </Pressable>
          </View>
        </View>
      );
    },
    [activeKey, cardBg, cardBorder, frameGradient, formatWeight, isDark, textPrimary]
  );

  if (data.length === 0) {
    return (
      <View style={{ paddingBottom: 80, flex: 1 }}>
        <Explicacion />
      </View>
    );
  }

  return (
    <View style={{ width: "100%", marginTop: 16, flex: 1, minHeight: 0 }}>
      <DraggableFlatList
        data={data}
        keyExtractor={getStableKey}
        renderItem={renderItem}
        onDragBegin={() => setIsDragging(true)}
        onDragEnd={onDragEnd}
        activationDistance={8}
        scrollEnabled
        nestedScrollEnabled
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListFooterComponent={() => <View style={{ height: 130 }} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

function Chip({
  children,
  isDark,
}: {
  children: React.ReactNode;
  isDark: boolean;
}) {
  return (
    <View
      style={{
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: isDark ? "rgba(255,255,255,0.18)" : "rgba(15,23,42,0.12)",
        backgroundColor: isDark ? "#020617" : "#ffffff",
      }}
    >
      <Text
        style={{
          fontSize: 12,
          color: isDark ? "#cbd5e1" : "#475569",
          fontWeight: "600",
        }}
      >
        {children as any}
      </Text>
    </View>
  );
}

function Explicacion() {
  return (
    <View style={{ alignItems: "center", gap: 6 }}>
      <Text style={{ color: "#64748b" }}>Aún no hay ejercicios en este día.</Text>
      <Text style={{ color: "#94a3b8", fontSize: 12 }}>
        Añade ejercicios o compuestos para empezar.
      </Text>
    </View>
  );
}