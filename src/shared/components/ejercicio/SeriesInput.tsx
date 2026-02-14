import React from "react";
import { View, Text, TextInput } from "react-native";
import { useColorScheme } from "nativewind";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";

type Serie = {
  reps: number;
  peso: number;
};

type Props = {
  series: Serie[];
  onChange: (index: number, field: keyof Serie, value: number) => void;
  // 👇 NUEVO
  esCardio?: boolean;
};

export default function SeriesInput({ series, onChange, esCardio }: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const { usuario } = useUsuarioStore();
  const weightUnit = (usuario?.medidaPeso ?? "KG").toLowerCase(); // "kg" | "lb"

  const isCardio = Boolean(esCardio);

  return (
    <>
      {series.map((serie, index) => (
        <View
          key={index}
          className="flex-row items-center justify-between w-full max-w-md mt-4 gap-4"
        >
          <Text className={isDark ? "text-white font-semibold" : "text-neutral-700 font-semibold"}>
            {index + 1}º
          </Text>

          <View className="flex-1">
            <View className="flex-row gap-4">
              {/* Reps / Tiempo */}
              <View className="flex-1">
                <View
                  className={
                    "rounded-lg px-3 py-2 flex-row items-center " +
                    (isDark ? "bg-white/5 border border-white/15" : "bg-neutral-100 border border-neutral-300")
                  }
                >
                  <TextInput
                    value={serie.reps === 0 ? "" : String(serie.reps)}
                    onChangeText={(t) => onChange(index, "reps", parseInt(t || "0", 10) || 0)}
                    placeholder="0"
                    placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                    keyboardType="numeric"
                    inputMode="numeric"
                    className={(isDark ? "text-white" : "text-neutral-800") + " flex-1 text-sm"}
                    accessibilityLabel={
                      isCardio
                        ? `Tiempo serie ${index + 1} en segundos`
                        : `Repeticiones serie ${index + 1}`
                    }
                  />
                  <Text
                    className={
                      isDark ? "text-[#94a3b8] text-xs font-semibold" : "text-neutral-500 text-xs font-semibold"
                    }
                  >
                    {isCardio ? "seg" : "reps"}
                  </Text>
                </View>
              </View>

              {/* Peso */}
              <View className="flex-1">
                <View
                  className={
                    "rounded-lg px-3 py-2 flex-row items-center " +
                    (isDark ? "bg-white/5 border border-white/15" : "bg-neutral-100 border border-neutral-300")
                  }
                >
                  <TextInput
                    value={serie.peso === 0 ? "" : String(serie.peso)}
                    onChangeText={(t) => onChange(index, "peso", parseFloat(t || "0") || 0)}
                    placeholder="0"
                    placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                    keyboardType="numeric"
                    inputMode="numeric"
                    className={(isDark ? "text-white" : "text-neutral-800") + " flex-1 text-sm"}
                    accessibilityLabel={`Peso serie ${index + 1} (${weightUnit})`}
                  />
                  <Text
                    className={
                      isDark ? "text-[#94a3b8] text-xs font-semibold" : "text-neutral-500 text-xs font-semibold"
                    }
                  >
                    {weightUnit}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      ))}
    </>
  );
}
