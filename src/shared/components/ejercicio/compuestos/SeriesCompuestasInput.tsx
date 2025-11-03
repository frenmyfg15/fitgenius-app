// src/shared/components/ejercicio/compuestos/SeriesCompuestasInput.tsx
import React from "react";
import { View, Text, TextInput } from "react-native";
import { useColorScheme } from "nativewind";

type TipoComponente = "peso_reps" | "tiempo";

export type ComponenteCompuesto = {
  ejercicioId: number;
  nombre: string;
  tipo: TipoComponente; // "peso_reps" -> {peso,reps}; "tiempo" -> {duracionSegundos}
};

export type RegistroPayload = {
  ejercicioId: number;
  pesoKg?: number;
  repeticiones?: number;
  duracionSegundos?: number;
};

type Props = {
  componentes: ComponenteCompuesto[];
  series: RegistroPayload[][]; // series[serieIndex][compIndex]
  onChange: (serieIndex: number, compIndex: number, patch: Partial<RegistroPayload>) => void;
};

export default function SeriesCompuestasInput({
  componentes,
  series,
  onChange,
}: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const box =
    "rounded-lg px-3 py-2 flex-row items-center " +
    (isDark ? "bg-white/5 border border-white/15" : "bg-neutral-100 border border-neutral-300");

  const txtMuted = isDark ? "text-[#94a3b8]" : "text-neutral-500";
  const txt = isDark ? "text-white" : "text-neutral-800";
  const title = isDark ? "text-white" : "text-neutral-700";

  return (
    <View className="w-full max-w-[900px]">
      {/* Filas por serie */}
      {series.map((serie, sIdx) => (
        <View key={`s-${sIdx}`} className="w-full mt-4">
          {/* Nº de serie */}
          <Text className={`${title} font-semibold mb-2`}>{sIdx + 1}º serie</Text>

          {/* Inputs por componente: cada bloque con su label encima */}
          <View className="flex-row gap-4 flex-wrap">
            {componentes.map((comp, cIdx) => {
              const reg = serie[cIdx] || { ejercicioId: comp.ejercicioId };

              if (comp.tipo === "tiempo") {
                // Duración (segundos) con label arriba
                return (
                  <View key={`${sIdx}-${comp.ejercicioId}`} className="flex-1 min-w-[160px] max-w-[260px]">
                    {/* Label de componente */}
                    <Text numberOfLines={2} className={`${txtMuted} text-[12px] font-medium mb-1`}>
                      {comp.nombre}
                    </Text>

                    {/* Label del campo */}
                    <Text className={`${txtMuted} text-[11px] mb-1`}>Duración (seg)</Text>

                    {/* Input */}
                    <View className={box}>
                      <TextInput
                        value={
                          reg.duracionSegundos && reg.duracionSegundos > 0
                            ? String(reg.duracionSegundos)
                            : ""
                        }
                        onChangeText={(t) =>
                          onChange(sIdx, cIdx, {
                            ejercicioId: comp.ejercicioId,
                            duracionSegundos: parseInt(t || "0", 10) || 0,
                            pesoKg: undefined,
                            repeticiones: undefined,
                          })
                        }
                        placeholder="0"
                        placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                        keyboardType="numeric"
                        inputMode="numeric"
                        className={`${txt} flex-1 text-sm`}
                        accessibilityLabel={`Duración (seg) serie ${sIdx + 1} - ${comp.nombre}`}
                      />
                      <Text className={`${txtMuted} text-xs font-semibold`}>seg</Text>
                    </View>
                  </View>
                );
              }

              // peso_reps: mostrar 2 campos en columna, cada uno con su label arriba
              return (
                <View key={`${sIdx}-${comp.ejercicioId}`} className="flex-1 min-w-[220px] max-w-[360px]">
                  {/* Label de componente */}
                  <Text numberOfLines={2} className={`${txtMuted} text-[12px] font-medium mb-1`}>
                    {comp.nombre}
                  </Text>

                  {/* Repeticiones */}
                  <View className="mb-2">
                    <Text className={`${txtMuted} text-[11px] mb-1`}>Repeticiones</Text>
                    <View className={box}>
                      <TextInput
                        value={reg.repeticiones && reg.repeticiones > 0 ? String(reg.repeticiones) : ""}
                        onChangeText={(t) =>
                          onChange(sIdx, cIdx, {
                            ejercicioId: comp.ejercicioId,
                            repeticiones: parseInt(t || "0", 10) || 0,
                          })
                        }
                        placeholder="0"
                        placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                        keyboardType="numeric"
                        inputMode="numeric"
                        className={`${txt} flex-1 text-sm`}
                        accessibilityLabel={`Repeticiones serie ${sIdx + 1} - ${comp.nombre}`}
                      />
                      <Text className={`${txtMuted} text-xs font-semibold`}>reps</Text>
                    </View>
                  </View>

                  {/* Peso */}
                  <View>
                    <Text className={`${txtMuted} text-[11px] mb-1`}>Peso (kg)</Text>
                    <View className={box}>
                      <TextInput
                        value={reg.pesoKg && reg.pesoKg > 0 ? String(reg.pesoKg) : ""}
                        onChangeText={(t) =>
                          onChange(sIdx, cIdx, {
                            ejercicioId: comp.ejercicioId,
                            pesoKg: parseFloat(t || "0") || 0,
                          })
                        }
                        placeholder="0"
                        placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                        keyboardType="numeric"
                        inputMode="numeric"
                        className={`${txt} flex-1 text-sm`}
                        accessibilityLabel={`Peso (kg) serie ${sIdx + 1} - ${comp.nombre}`}
                      />
                      <Text className={`${txtMuted} text-xs font-semibold`}>kg</Text>
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
