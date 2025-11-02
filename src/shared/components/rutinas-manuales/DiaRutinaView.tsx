// src/shared/components/rutina/DiaRutinaView.tsx
import React, { useMemo, useRef, useState } from "react";
import { View, Text, Image, Pressable, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
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
};

const LONG_PRESS_DELAY = 500;

export default function DiaRutinaView({
  dia,
  ejercicios,
  onEdit,
  dispatch,
  onSelectionChange,
}: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const sorted = useMemo(() => [...(ejercicios ?? [])].sort((a, b) => a.orden - b.orden), [ejercicios]);
  const [activeItemOrden, setActiveItemOrden] = useState<number | null>(null);

  const pressTimer = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef(false);

  const selectOrden = (orden: number | null) => {
    setActiveItemOrden(orden);
    if (onSelectionChange) {
      const item = orden == null ? null : sorted.find((i) => i.orden === orden) ?? null;
      onSelectionChange(orden, item);
    }
  };

  const handlePressIn = (orden: number) => {
    isLongPress.current = false;
    pressTimer.current && clearTimeout(pressTimer.current);
    pressTimer.current = setTimeout(() => {
      selectOrden(orden);
      isLongPress.current = true;
    }, LONG_PRESS_DELAY);
  };

  const handlePressOut = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const handlePress = (orden: number) => {
    if (isLongPress.current) {
      isLongPress.current = false;
      return;
    }
    selectOrden(activeItemOrden === orden ? null : orden);
  };

  if (sorted.length === 0) {
    return (
      <View style={{ paddingBottom: 80 }}>
        <Explicacion />
      </View>
    );
  }

  const frameGradient = ["rgb(0,255,64)", "rgb(94,230,157)", "rgb(178,0,255)"];
  const cardBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.80)";
  const cardBorder = isDark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.60)";
  const textPrimary = isDark ? "#e5e7eb" : "#0f172a";
  const textSecondary = isDark ? "#94a3b8" : "#475569";

  return (
    <ScrollView
      style={{ width: "100%", marginTop: 16 }}
      contentContainerStyle={{
        alignItems: "center",
        gap: 12,
        paddingBottom: 120,
      }}
    >
      {sorted.map((item) => {
        const isActive = item.orden === activeItemOrden;
        const esCompuesto = "compuesto" in item && (item as any).compuesto;
        const ejerciciosDelItem = (esCompuesto
          ? (item as CompuestoItem).ejerciciosCompuestos
          : [item as EjercicioItem]) as EjercicioAsignadoInput[];

        const principal = ejerciciosDelItem[0];
        const imageSize = esCompuesto ? 60 : 110;

        const CardInner = (
          <Pressable
            onPressIn={() => handlePressIn(item.orden)}
            onPressOut={handlePressOut}
            onPress={() => handlePress(item.orden)}
            style={{
              borderRadius: 16,
              borderWidth: 1,
              borderColor: cardBorder,
              backgroundColor: cardBg,
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
            }}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
          >
            {/* Imagen / stack compuesto */}
            <View
              style={{
                minWidth: 120,
                flexDirection: esCompuesto ? "row" : "column",
                gap: esCompuesto ? 8 : 0,
              }}
            >
              {ejerciciosDelItem.map((ej) => (
                <View
                  key={`${item.orden}-${ej.ejercicioId}`}
                  style={{
                    width: imageSize,
                    height: imageSize,
                    borderRadius: 12,
                    overflow: "hidden",
                    borderWidth: 1,
                    borderColor: cardBorder,
                    backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "#ffffff",
                  }}
                >
                  <Image
                    source={{
                      uri: `https://res.cloudinary.com/dcn4vq1n4/image/upload/v1752248579/ejercicios/${ej.ejercicioInfo?.idGif ?? ""}.gif`,
                    }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="contain"
                  />
                </View>
              ))}
            </View>

            {/* Información */}
            <View style={{ flex: 1, minWidth: 0 as any }}>
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: textPrimary,
                  textAlign: "left",
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
                <Chip>Series: {principal.seriesSugeridas ?? "-"}</Chip>
                <Chip>Reps: {principal.repeticionesSugeridas ?? "-"}</Chip>
                <Chip>Peso: {principal.pesoSugerido ?? "-"} kg</Chip>
              </View>
            </View>
          </Pressable>
        );

        return (
          <View key={`item-${item.orden}`} style={{ width: "95%" }}>
            {isActive ? (
              <LinearGradient
                colors={frameGradient as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 16, padding: 1 }}
              >
                {CardInner}
              </LinearGradient>
            ) : (
              CardInner
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

/* ---------- Subcomponentes ---------- */

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.60)",
        backgroundColor: "rgba(255,255,255,0.70)",
      }}
    >
      <Text style={{ fontSize: 12, color: "#475569", fontWeight: "600" }}>{children as any}</Text>
    </View>
  );
}

/** Placeholder mínimo del Explicacion original (puedes reemplazar por el tuyo real) */
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
