import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { X } from "lucide-react-native";
import { useColorScheme } from "nativewind";

type Instruccion = {
  paso: number;
  texto: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  materiales: string[];
  instrucciones: Instruccion[];
  nombreEjercicio?: string; // 👈 nuevo
};

export default function PanelInfo({
  visible,
  onClose,
  materiales,
  instrucciones,
  nombreEjercicio,
}: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  if (!visible) return null;

  return (
    <View
      className="absolute inset-0 z-40 flex-col justify-end"
      style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
      accessibilityLabel="Panel de información del ejercicio"
      accessibilityViewIsModal
    >
      {/* Sheet anclado abajo */}
      <View
        className={
          "h-[95%] rounded-t-3xl p-6 " +
          (isDark
            ? "bg-[#0b1220]/95 border-t border-white/10"
            : "bg-white/95 border-t border-neutral-200")
        }
        style={{
          shadowColor: "#000",
          shadowOpacity: 0.2,
          shadowOffset: { width: 0, height: -4 },
          shadowRadius: 8,
        }}
      >
        {/* Header con botón cerrar */}
        <View className="flex-row justify-between items-center mb-2">
          <Text
            className={
              isDark
                ? "text-white font-extrabold text-lg"
                : "text-neutral-900 font-extrabold text-lg"
            }
          >
            Información del ejercicio
          </Text>
          <TouchableOpacity
            onPress={onClose}
            accessibilityLabel="Cerrar panel de información"
            activeOpacity={0.85}
            className={
              "p-2 rounded-full " +
              (isDark ? "bg-white/10" : "bg-neutral-200")
            }
          >
            <X size={20} color={isDark ? "#e5e7eb" : "#0f172a"} />
          </TouchableOpacity>
        </View>

        {/* 👇 Nombre del ejercicio (debajo del título) */}
        {nombreEjercicio ? (
          <Text
            numberOfLines={2}
            className="mb-4"
            style={{
              fontSize: 13,
              fontWeight: "400",
              color: isDark ? "#e5e7eb" : "#4b5563",
            }}
          >
            {nombreEjercicio}
          </Text>
        ) : null}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 60, paddingTop: 8 }}
        >
          {/* Materiales */}
          <Text
            className={
              isDark
                ? "font-black text-white text-lg mb-2"
                : "font-black text-neutral-900 text-lg mb-2"
            }
          >
            Materiales
          </Text>

          <View className="flex-row flex-wrap gap-2 mb-4">
            {materiales.length > 0 ? (
              materiales.map((item) => (
                <View
                  key={item}
                  className={
                    "px-3 py-1 rounded-md " +
                    (isDark
                      ? "bg-white/10 border border-white/15"
                      : "bg-neutral-100 border border-neutral-200")
                  }
                >
                  <Text
                    className={
                      isDark
                        ? "text-[#d1d5db] text-sm font-semibold"
                        : "text-neutral-700 text-sm font-semibold"
                    }
                  >
                    {item}
                  </Text>
                </View>
              ))
            ) : (
              <Text
                className={isDark ? "text-gray-400" : "text-gray-500"}
              >
                No se requiere material.
              </Text>
            )}
          </View>

          {/* Instrucciones */}
          <Text
            className={
              isDark
                ? "font-black text-white text-lg mb-2"
                : "font-black text-neutral-900 text-lg mb-2"
            }
          >
            Instrucciones
          </Text>

          <View className="flex-col gap-3">
            {instrucciones.length > 0 ? (
              instrucciones.map((i) => (
                <View
                  key={i.paso}
                  className={
                    "p-4 rounded-2xl shadow-sm " +
                    (isDark
                      ? "bg-white/5 border border-white/10"
                      : "bg-neutral-100 border border-neutral-200")
                  }
                >
                  <Text
                    className={
                      isDark
                        ? "text-white text-sm leading-relaxed"
                        : "text-neutral-800 text-sm leading-relaxed"
                    }
                  >
                    <Text className="font-bold">{i.paso}. </Text>
                    {i.texto}
                  </Text>
                </View>
              ))
            ) : (
              <Text
                className={isDark ? "text-gray-400" : "text-gray-500"}
              >
                No hay instrucciones disponibles.
              </Text>
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
