// src/shared/components/rutina/DiaSelector.tsx
import React from "react";
import { View, Text, Pressable } from "react-native";
import { useColorScheme } from "nativewind";
import type { DiaSemana } from "@/features/type/crearRutina";
import { Colors, scheme } from "@/shared/constants/colors";
import { Font } from "@/shared/constants/typography";

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
  const t = scheme(isDark);

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
          backgroundColor: isDark ? Colors.dark.surface : t.surface,
          borderWidth: 1,
          borderColor: t.border,
        }}
      >
        {DIAS.map((dia) => {
          const active = dia === diaSelect;

          return (
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
                borderColor: t.border,
                backgroundColor: active ? Colors.secondary : (isDark ? t.border : t.surface),
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  fontFamily: Font.body.bold,
                  color: active ? "#0f172a" : t.textSecondary,
                }}
              >
                {labelDia(dia)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
