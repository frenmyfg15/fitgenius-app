// app/features/registro/AlturaScreen.local.tsx
import React, { useCallback } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useColorScheme } from "nativewind";
import HeightInput, { UnidadAltura } from "@/shared/components/ui/HeightInput";
import BtnAprobe from "@/shared/components/ui/BtnAprobe";
import { useRegistroStore } from "@/features/store/useRegistroStore";

export default function AlturaLocalScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  // Store registro
  const usuario = useRegistroStore((s) => s.usuario);
  const setField = useRegistroStore((s) => s.setField);

  // Unidad controlada (fallback "CM")
  const unidad: UnidadAltura = (usuario?.medidaAltura as UnidadAltura) || "CM";

  // Valor controlado (cm): usa el guardado o 170 por defecto
  const valueCm =
    typeof usuario?.altura === "number" ? usuario.altura : 170;

  // Cambiar unidad (guarda en store)
  const onPressUnidad = useCallback(
    (u: UnidadAltura) => {
      setField("medidaAltura", u);
    },
    [setField]
  );

  // Recibe cm y guarda en store
  const handleChangeAltura = useCallback(
    (cm: number) => {
      setField("altura", cm);          // siempre cm base
      setField("medidaAltura", unidad);
    },
    [setField, unidad]
  );

  // Validez de altura (en cm)
  const alturaValida = (usuario?.altura ?? 0) >= 100;

  const bg = { backgroundColor: isDark ? "#0b1220" : "#f6f7fb" };
  const textMain = { color: isDark ? "#ffffff" : "#111827" };
  const textSub = { color: isDark ? "#d1d5db" : "#4b5563" };

  const selectedBg = "#22c55e";
  const unselectedBg = isDark ? "#1f2937" : "#e5e7eb";
  const selectedText = "#ffffff";
  const unselectedText = isDark ? "#ffffff" : "#000000";

  return (
    <>
      {/* Botón fijo abajo-izquierda cuando hay un valor válido */}
      {alturaValida && <BtnAprobe step="Peso" placement="left" />}

      <ScrollView
        style={bg}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Título */}
        <View style={{ alignItems: "center" }}>
          <Text style={[styles.h1, textMain]}>¿Cuánto mides?</Text>
          <Text style={[styles.sub, textSub]}>
            Indica tu altura en centímetros o en pies/pulgadas.
          </Text>
        </View>

        {/* Selector CM / FT (reactivo, como en Peso) */}
        <View style={{ flexDirection: "row", justifyContent: "center", paddingBottom: 12 }}>
          <Pressable onPress={() => onPressUnidad("CM")}>
            <View
              style={[
                styles.toggleBtnLeft,
                { backgroundColor: unidad === "CM" ? selectedBg : unselectedBg },
              ]}
            >
              <Text
                style={{
                  color: unidad === "CM" ? selectedText : unselectedText,
                  fontWeight: "600",
                }}
              >
                CM
              </Text>
            </View>
          </Pressable>

          <Pressable onPress={() => onPressUnidad("FT")}>
            <View
              style={[
                styles.toggleBtnRight,
                { backgroundColor: unidad === "FT" ? selectedBg : unselectedBg },
              ]}
            >
              <Text
                style={{
                  color: unidad === "FT" ? selectedText : unselectedText,
                  fontWeight: "600",
                }}
              >
                FT
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Input de altura (CONTROLADO, siempre emite cm) */}
        <View style={{ paddingHorizontal: 8, paddingTop: 16, alignItems: "center" }}>
          <HeightInput
            unit={unidad}
            valueCm={valueCm}
            minCm={100}
            maxCm={220}
            label="Indica tu altura"
            onChange={handleChangeAltura}
          />
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  h1: { textAlign: "center", fontSize: 18, fontWeight: "700", padding: 12 },
  sub: { textAlign: "center", fontSize: 13, paddingHorizontal: 8, paddingBottom: 16 },
  toggleBtnLeft: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    backgroundColor: "#e5e7eb",
  },
  toggleBtnRight: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    backgroundColor: "#e5e7eb",
  },
});
