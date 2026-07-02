// src/shared/components/ejercicio/compuestos/SeriesCompuestasInput.tsx
import React from "react";
import { View, Text, TextInput } from "react-native";
import { useColorScheme } from "nativewind";
import { scheme } from "@/shared/constants/colors";
import { Font, TextStyle } from "@/shared/constants/typography";

type TipoComponente = "peso_reps" | "tiempo";

export type ComponenteCompuesto = {
  ejercicioId: number;
  nombre: string;
  tipo: TipoComponente;
};

export type RegistroPayload = {
  ejercicioId: number;
  pesoKg?: number;
  repeticiones?: number;
  duracionSegundos?: number;
};

type Props = {
  componentes: ComponenteCompuesto[];
  series: RegistroPayload[][];
  onChange: (serieIndex: number, compIndex: number, patch: Partial<RegistroPayload>) => void;
};

export default function SeriesCompuestasInput({
  componentes,
  series,
  onChange,
}: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const t = scheme(isDark);

  const inputContainerStyle = {
    backgroundColor: isDark ? t.border : t.surface,
    borderColor: t.border,
  };

  return (
    <View className="w-full max-w-[900px]">
      {series.map((serie, sIdx) => (
        <View key={`s-${sIdx}`} className="w-full mt-4">
          <Text style={{ ...TextStyle.body, fontFamily: Font.body.semiBold, color: t.textPrimary, marginBottom: 8 }}>
            {sIdx + 1}º serie
          </Text>

          <View className="flex-row gap-4 flex-wrap">
            {componentes.map((comp, cIdx) => {
              const reg = serie[cIdx] || { ejercicioId: comp.ejercicioId };

              if (comp.tipo === "tiempo") {
                return (
                  <View key={`${sIdx}-${comp.ejercicioId}`} className="flex-1 min-w-[160px] max-w-[260px]">
                    <Text
                      numberOfLines={2}
                      style={{ ...TextStyle.bodySm, fontFamily: Font.body.medium, color: t.textSecondary, marginBottom: 4 }}
                    >
                      {comp.nombre}
                    </Text>
                    <Text style={{ ...TextStyle.caption, fontFamily: Font.body.regular, color: t.textSecondary, marginBottom: 4 }}>
                      Duración (seg)
                    </Text>
                    <View
                      className="rounded-lg px-3 py-2 flex-row items-center border"
                      style={inputContainerStyle}
                    >
                      <TextInput
                        value={reg.duracionSegundos && reg.duracionSegundos > 0 ? String(reg.duracionSegundos) : ""}
                        onChangeText={(v) =>
                          onChange(sIdx, cIdx, {
                            ejercicioId: comp.ejercicioId,
                            duracionSegundos: parseInt(v || "0", 10) || 0,
                            pesoKg: undefined,
                            repeticiones: undefined,
                          })
                        }
                        placeholder="0"
                        placeholderTextColor={t.textTertiary}
                        keyboardType="numeric"
                        inputMode="numeric"
                        style={{ ...TextStyle.body, fontFamily: Font.body.regular, color: t.textPrimary, flex: 1 }}
                        accessibilityLabel={`Duración (seg) serie ${sIdx + 1} - ${comp.nombre}`}
                      />
                      <Text style={{ ...TextStyle.caption, fontFamily: Font.body.semiBold, color: t.textSecondary }}>
                        seg
                      </Text>
                    </View>
                  </View>
                );
              }

              return (
                <View key={`${sIdx}-${comp.ejercicioId}`} className="flex-1 min-w-[220px] max-w-[360px]">
                  <Text
                    numberOfLines={2}
                    style={{ ...TextStyle.bodySm, fontFamily: Font.body.medium, color: t.textSecondary, marginBottom: 4 }}
                  >
                    {comp.nombre}
                  </Text>

                  <View style={{ marginBottom: 8 }}>
                    <Text style={{ ...TextStyle.caption, fontFamily: Font.body.regular, color: t.textSecondary, marginBottom: 4 }}>
                      Repeticiones
                    </Text>
                    <View
                      className="rounded-lg px-3 py-2 flex-row items-center border"
                      style={inputContainerStyle}
                    >
                      <TextInput
                        value={reg.repeticiones && reg.repeticiones > 0 ? String(reg.repeticiones) : ""}
                        onChangeText={(v) =>
                          onChange(sIdx, cIdx, {
                            ejercicioId: comp.ejercicioId,
                            repeticiones: parseInt(v || "0", 10) || 0,
                          })
                        }
                        placeholder="0"
                        placeholderTextColor={t.textTertiary}
                        keyboardType="numeric"
                        inputMode="numeric"
                        style={{ ...TextStyle.body, fontFamily: Font.body.regular, color: t.textPrimary, flex: 1 }}
                        accessibilityLabel={`Repeticiones serie ${sIdx + 1} - ${comp.nombre}`}
                      />
                      <Text style={{ ...TextStyle.caption, fontFamily: Font.body.semiBold, color: t.textSecondary }}>
                        reps
                      </Text>
                    </View>
                  </View>

                  <View>
                    <Text style={{ ...TextStyle.caption, fontFamily: Font.body.regular, color: t.textSecondary, marginBottom: 4 }}>
                      Peso (kg)
                    </Text>
                    <View
                      className="rounded-lg px-3 py-2 flex-row items-center border"
                      style={inputContainerStyle}
                    >
                      <TextInput
                        value={reg.pesoKg && reg.pesoKg > 0 ? String(reg.pesoKg) : ""}
                        onChangeText={(v) =>
                          onChange(sIdx, cIdx, {
                            ejercicioId: comp.ejercicioId,
                            pesoKg: parseFloat(v || "0") || 0,
                          })
                        }
                        placeholder="0"
                        placeholderTextColor={t.textTertiary}
                        keyboardType="numeric"
                        inputMode="numeric"
                        style={{ ...TextStyle.body, fontFamily: Font.body.regular, color: t.textPrimary, flex: 1 }}
                        accessibilityLabel={`Peso (kg) serie ${sIdx + 1} - ${comp.nombre}`}
                      />
                      <Text style={{ ...TextStyle.caption, fontFamily: Font.body.semiBold, color: t.textSecondary }}>
                        kg
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}
