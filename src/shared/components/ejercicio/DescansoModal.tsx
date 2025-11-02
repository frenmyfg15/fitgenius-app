import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useColorScheme } from "nativewind";

type Props = {
  visible: boolean;
  tiempo: number;
  onFinalizar: () => void;
};

export default function DescansoModal({ visible, tiempo, onFinalizar }: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  if (!visible) return null;

  return (
    <View
      // Overlay
      style={{
        position: "absolute",
        top: 0, right: 0, bottom: 0, left: 0,
        backgroundColor: "rgba(0,0,0,0.25)",
      }}
      className="z-50 items-center justify-center px-6"
      accessibilityViewIsModal
      accessibilityLabel="Modal de descanso activo"
    >
      <View
        className={
          "w-full max-w-sm items-center justify-center rounded-2xl px-6 py-8 " +
          (isDark ? "bg-[#0b1220]/90 border border-white/10" : "bg-white/95 border border-neutral-200")
        }
        style={{
          shadowColor: "#000",
          shadowOpacity: 0.25,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 },
        }}
      >
        <Text
          className={isDark ? "text-white font-semibold uppercase tracking-wide" : "text-neutral-900 font-semibold uppercase tracking-wide"}
          style={{ fontSize: 16 }}
        >
          Descanso activo
        </Text>

        <Text
          className={isDark ? "text-white font-extrabold" : "text-neutral-900 font-extrabold"}
          style={{
            fontSize: 160, // ~ 10rem–12rem equivalente
            lineHeight: 160,
            textAlign: "center",
            marginTop: 8,
            textShadowColor: "rgba(0,0,0,0.25)",
            textShadowOffset: { width: 0, height: 2 },
            textShadowRadius: 6,
          }}
          accessibilityRole="text"
        >
          {tiempo}
        </Text>

        <TouchableOpacity
          onPress={onFinalizar}
          activeOpacity={0.9}
          accessibilityRole="button"
          accessibilityLabel="Finalizar descanso"
          className="mt-3 rounded-full px-6 py-2"
          style={{
            backgroundColor: "#7c3aed", // neon-purple-500 aprox
            shadowColor: "#000",
            shadowOpacity: 0.2,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
          }}
        >
          <Text className="text-white font-semibold">Finalizar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
