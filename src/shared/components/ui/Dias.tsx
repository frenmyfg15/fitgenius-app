// src/shared/components/misRutinas/Dias.tsx
import React, { useCallback, useMemo } from "react";
import { View, Text, Pressable, ScrollView, Platform, AccessibilityState } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import { Rutina } from "@/features/type/rutinas";

type Props = {
  dias: Rutina["dias"];
  day: string;
  setDay: (dia: string) => void;
};

export default function Dias({ dias, day, setDay }: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const lista = useMemo(
    () => (dias ?? []).map((d) => ({ id: d.id, nombre: d.diaSemana })),
    [dias]
  );

  const onKey = useCallback(
    (key: string, idx: number) => {
      const max = lista.length - 1;
      if (!lista.length) return;

      if (key === "ArrowRight") {
        const next = idx === max ? 0 : idx + 1;
        setDay(lista[next].nombre);
      } else if (key === "ArrowLeft") {
        const prev = idx === 0 ? max : idx - 1;
        setDay(lista[prev].nombre);
      } else if (key === "Home") {
        setDay(lista[0].nombre);
      } else if (key === "End") {
        setDay(lista[max].nombre);
      }
    },
    [lista, setDay]
  );

  // Degradado para el subrayado activo
  const underlineGradient = isDark
    ? ["#00FF40", "#5EE69D", "#B200FF"]
    : ["#39ff14", "#14ff80", "#a855f7"];

  const baseBorder = isDark ? "rgba(255,255,255,0.10)" : "rgba(15,23,42,0.08)";
  const activeBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.92)";
  const inactiveBg = isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.9)";

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 12,
        paddingVertical: 10,
        alignItems: "center",
      }}
      accessibilityLabel="Seleccionar día"
    >
      {lista.map((d, i) => {
        const activo = day === d.nombre;
        const a11yState: AccessibilityState = { selected: activo };

        return (
          <View key={d.id} style={{ marginRight: 12 }}>
            <Pressable
              accessibilityRole="tab"
              accessibilityState={a11yState}
              accessibilityLabel={`Día ${d.nombre}`}
              onPress={() => setDay(d.nombre)}
              {...(Platform.OS === "web"
                ? {
                    onKeyDown: (e: any) => {
                      const key = e?.nativeEvent?.key as string | undefined;
                      if (key) {
                        e.preventDefault?.();
                        onKey(key, i);
                      }
                    },
                  }
                : {})}
              {...(Platform.OS === "android"
                ? { android_ripple: { color: activo ? "rgba(20,255,120,0.12)" : "rgba(0,0,0,0.06)" } }
                : {})}
              style={({ pressed }) => [
                {
                  borderRadius: 14,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderWidth: 1,
                  alignItems: "center",
                  flexDirection: "row",
                  backgroundColor: activo ? activeBg : inactiveBg,
                  borderColor: baseBorder,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                  shadowColor: "#000",
                  shadowOpacity: activo ? 0.22 : 0.12,
                  shadowRadius: activo ? 9 : 6,
                  shadowOffset: { width: 0, height: activo ? 7 : 4 },
                  elevation: activo ? 3 : 1,
                },
              ]}
            >
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  letterSpacing: 0.2,
                  textTransform: "uppercase",
                  color: activo ? (isDark ? "#F8FAFC" : "#0F172A") : (isDark ? "#E5E7EB" : "#334155"),
                }}
              >
                {d.nombre}
              </Text>
            </Pressable>

            {/* Subrayado degradado sólo cuando está activo */}
            {activo ? (
              <LinearGradient
                colors={underlineGradient as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  height: 3.5,
                  marginTop: 6,
                  borderRadius: 999,
                }}
              />
            ) : (
              // Espaciador para mantener layout consistente
              <View style={{ height: 3.5, marginTop: 6 }} />
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}
