// src/shared/components/rutina/DiaSelector.tsx
import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import type { DiaSemana } from "@/features/type/crearRutina";

type Props = {
  diaSelect: DiaSemana;
  setDiaSelect: (dia: DiaSemana) => void;
};

const DIAS: DiaSemana[] = [
  "LUNES",
  "MARTES",
  "MIERCOLES",
  "JUEVES",
  "VIERNES",
  "SABADO",
  "DOMINGO",
];

const labelDia = (d: DiaSemana) =>
  ({
    LUNES: "Lunes",
    MARTES: "Martes",
    MIERCOLES: "Miércoles",
    JUEVES: "Jueves",
    VIERNES: "Viernes",
    SABADO: "Sábado",
    DOMINGO: "Domingo",
  }[d]);

export default function DiaSelector({ diaSelect, setDiaSelect }: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const frameGradient = ["rgb(0,255,64)", "rgb(94,230,157)", "rgb(178,0,255)"];
  const trayBg = isDark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.70)";
  const trayBorder = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.10)";
  const pillBg = isDark ? "rgba(255,255,255,0.05)" : "#f3f4f6";
  const pillBorder = isDark ? "rgba(255,255,255,0.15)" : "#e5e7eb";
  const textActive = isDark ? "#0f172a" : "#0f172a";
  const textInactive = isDark ? "#cbd5e1" : "#475569";

  return (
    <View style={{ width: "100%", alignItems: "center" }}>
      <View
        accessible
        accessibilityRole="tablist"
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 12,
          padding: 12,
          borderRadius: 16,
          backgroundColor: trayBg,
          borderWidth: 1,
          borderColor: trayBorder,
        }}
      >
        {DIAS.map((dia) => {
          const active = dia === diaSelect;

          const Inner = (
            <Pressable
              key={dia}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              onPress={() => setDiaSelect(dia)}
              style={{
                width: 100,
                paddingVertical: 6,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: pillBorder,
                backgroundColor: active ? "#ffffff" : pillBg,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  color: active ? textActive : textInactive,
                }}
              >
                {labelDia(dia)}
              </Text>
            </Pressable>
          );

          // Borde degradado cuando está activo
          return active ? (
            <LinearGradient
              key={dia}
              colors={frameGradient as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 13, padding: 1 }}
            >
              {Inner}
            </LinearGradient>
          ) : (
            <View key={dia} style={{ borderRadius: 13 }}>{Inner}</View>
          );
        })}
      </View>
    </View>
  );
}
