import React from "react";
import { View, Text } from "react-native";
import { Lightbulb } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";

type Props = {
  notaIA: string;
  series: number;
  repeticiones: number;
  peso: number;
};

export default function NotaIA({ notaIA, series, repeticiones, peso }: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const medidaPeso = useUsuarioStore((s) => s.usuario?.medidaPeso);

  return (
    <View
      className={
        "w-full max-w-md mx-auto p-4 rounded-xl shadow-md my-5 " +
        (isDark ? "bg-[#0b1220] border border-white/10" : "bg-white border")
      }
      style={!isDark ? { borderColor: "#d9f99d" } : undefined} // light: borde lima (sin fondo verde)
      accessibilityRole="summary"
      accessibilityLabel="Nota de la IA con sugerencias"
    >
      {/* Header */}
      <View className="flex-row items-center gap-3">
        <Lightbulb size={20} color={isDark ? "#22c55e" : "#22c55e"} />
        <Text className={isDark ? "text-white font-bold text-lg" : "text-neutral-800 font-bold text-lg"}>
          Nota de la IA
        </Text>
      </View>

      {/* Nota */}
      <Text
        className={
          (isDark ? "text-[#e5e7eb]" : "text-neutral-800") +
          " text-sm leading-relaxed italic pt-3 mt-1 border-t"
        }
        style={{ borderTopColor: isDark ? "rgba(255,255,255,0.25)" : "rgba(163,163,163,1)" }}
      >
        {notaIA}
      </Text>

      {/* Detalles */}
      <View
        className="flex-row flex-wrap items-center justify-between pt-3 border-t"
        style={{ borderTopColor: isDark ? "rgba(255,255,255,0.25)" : "rgba(163,163,163,1)" }}
      >
        <Text className={isDark ? "text-white font-semibold text-sm" : "text-neutral-800 font-semibold text-sm"}>
          Series: {series}
        </Text>
        <Text className={isDark ? "text-white font-semibold text-sm" : "text-neutral-800 font-semibold text-sm"}>
          Repeticiones: {repeticiones}
        </Text>
        <Text className={isDark ? "text-white font-semibold text-sm" : "text-neutral-800 font-semibold text-sm"}>
          Peso: {peso} {medidaPeso}
        </Text>
      </View>
    </View>
  );
}
