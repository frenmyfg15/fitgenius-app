import React from "react";
import { View, Text, TextInput } from "react-native";
import { useColorScheme } from "nativewind";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";
import { kgToLb } from "@/shared/utils/kgToLb";
import { lbToKg } from "@/shared/utils/lbToKg";
import { scheme } from "@/shared/constants/colors";
import { Font, TextStyle } from "@/shared/constants/typography";

type Serie = {
  reps: number;
  peso: number;
};

type Props = {
  series: Serie[];
  onChange: (index: number, field: keyof Serie, value: number) => void;
  esCardio?: boolean;
};

export default function SeriesInput({ series, onChange, esCardio }: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const t = scheme(isDark);

  const { usuario } = useUsuarioStore();
  const weightUnit = (usuario?.medidaPeso ?? "KG").toUpperCase();

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
          <Text style={{ ...TextStyle.body, fontFamily: Font.body.semiBold, color: t.textPrimary }}>
            {index + 1}º
          </Text>

          <View className="flex-1">
            <View className="flex-row gap-4">
              <View className="flex-1">
                <View
                  className="rounded-lg px-3 py-2 flex-row items-center border"
                  style={{ backgroundColor: isDark ? t.border : t.surface, borderColor: t.border }}
                >
                  <TextInput
                    value={serie.reps === 0 ? "" : String(serie.reps)}
                    onChangeText={(v) => onChange(index, "reps", parseInt(v || "0", 10) || 0)}
                    placeholder="0"
                    placeholderTextColor={t.textTertiary}
                    keyboardType="numeric"
                    inputMode="numeric"
                    style={{ ...TextStyle.body, fontFamily: Font.body.regular, color: t.textPrimary, flex: 1 }}
                    accessibilityLabel={
                      isCardio
                        ? `Tiempo serie ${index + 1} en segundos`
                        : `Repeticiones serie ${index + 1}`
                    }
                  />
                  <Text style={{ ...TextStyle.caption, fontFamily: Font.body.semiBold, color: t.textSecondary }}>
                    {isCardio ? "seg" : "reps"}
                  </Text>
                </View>
              </View>

              <View className="flex-1">
                <View
                  className="rounded-lg px-3 py-2 flex-row items-center border"
                  style={{ backgroundColor: isDark ? t.border : t.surface, borderColor: t.border }}
                >
                  <TextInput
                    value={formatPesoDisplay(serie.peso)}
                    onChangeText={(v) => {
                      const sanitized = v.replace(/[^\d.,]/g, "");
                      onChange(index, "peso", parsePesoInput(sanitized));
                    }}
                    placeholder="0"
                    placeholderTextColor={t.textTertiary}
                    keyboardType="decimal-pad"
                    inputMode="decimal"
                    style={{ ...TextStyle.body, fontFamily: Font.body.regular, color: t.textPrimary, flex: 1 }}
                    accessibilityLabel={`Peso serie ${index + 1} (${weightUnit.toLowerCase()})`}
                  />
                  <Text style={{ ...TextStyle.caption, fontFamily: Font.body.semiBold, color: t.textSecondary }}>
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
