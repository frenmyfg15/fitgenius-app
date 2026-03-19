import React from "react";
import { View, Text, TextInput } from "react-native";
import { useColorScheme } from "nativewind";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";
import { kgToLb } from "@/shared/utils/kgToLb";
import { lbToKg } from "@/shared/utils/lbToKg";

type Serie = {
  reps: number;
  peso: number; // ✅ siempre guardado en kg
};

type Props = {
  series: Serie[];
  onChange: (index: number, field: keyof Serie, value: number) => void;
  esCardio?: boolean;
};

export default function SeriesInput({ series, onChange, esCardio }: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const { usuario } = useUsuarioStore();
  const weightUnit = (usuario?.medidaPeso ?? "KG").toUpperCase(); // "KG" | "LB"

  const isCardio = Boolean(esCardio);
  const isLbUnit = weightUnit === "LB";

  const formatPesoDisplay = (pesoKg: number) => {
    if (!pesoKg) return "";
    if (!isLbUnit) return String(pesoKg);

    return kgToLb(pesoKg).replace(/\s*lb$/i, "");
  };

  const parsePesoInput = (text: string) => {
    const normalized = text.replace(",", ".");
    const value = parseFloat(normalized || "0") || 0;

    return isLbUnit ? lbToKg(value) : value;
  };

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
                    value={formatPesoDisplay(serie.peso)}
                    onChangeText={(t) => {
                      const sanitized = t.replace(/[^\d.,]/g, "");
                      onChange(index, "peso", parsePesoInput(sanitized));
                    }}
                    placeholder="0"
                    placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                    keyboardType="decimal-pad"
                    inputMode="decimal"
                    className={(isDark ? "text-white" : "text-neutral-800") + " flex-1 text-sm"}
                    accessibilityLabel={`Peso serie ${index + 1} (${weightUnit.toLowerCase()})`}
                  />
                  <Text
                    className={
                      isDark ? "text-[#94a3b8] text-xs font-semibold" : "text-neutral-500 text-xs font-semibold"
                    }
                  >
                    {weightUnit.toLowerCase()}
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