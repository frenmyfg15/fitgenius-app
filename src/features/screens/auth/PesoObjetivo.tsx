// app/features/registro/PesoScreen.tsx
import React, { useState, useCallback } from "react";
import { View, Text, ScrollView } from "react-native";
import { useColorScheme } from "nativewind";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import BtnAprobe from "@/shared/components/ui/BtnAprobe";
import { useRegistroStore } from "@/features/store/useRegistroStore";
import WigthInput from "@/shared/components/ui/WigthInput"; // ✅ input controlado

// Ajusta a tu stack real
type RegistroStackParamList = {
  Peso: undefined;
  PesoObjetivo: undefined;
};

type UnidadPeso = "KG" | "LB";

export default function PesoObjetivo() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const navigation =
    useNavigation<NativeStackNavigationProp<RegistroStackParamList>>();

  // Store registro
  const usuario = useRegistroStore((s) => s.usuario);
  const setField = useRegistroStore((s) => s.setField);

  // Unidad a mostrar (fallback a "KG" por si viene vacío)
  const unit: UnidadPeso = (usuario?.medidaPeso as UnidadPeso) || "KG";

  // El input emite siempre KG base
  const handleChangePeso = useCallback(
    (kgBase: number) => {
      setField("pesoObjetivo", kgBase);
    },
    [setField]
  );

  // Valor controlado a mostrar:
  // 1) si ya hay objetivo, úsalo
  // 2) si no, usa el peso actual como punto de partida
  // 3) fallback a 50
  const valueKg =
    typeof usuario?.pesoObjetivo === "number"
      ? usuario.pesoObjetivo
      : typeof usuario?.peso === "number"
      ? usuario.peso
      : 50;

  // Validez del objetivo (en KG base)
  const pesoObjetivoValido = (usuario?.pesoObjetivo ?? 0) >= 30;

  return (
    <>
      {/* Botón fijo abajo-izquierda cuando hay un valor válido */}
      {pesoObjetivoValido && <BtnAprobe step="Edad" placement="left" />}

      <ScrollView
        className={isDark ? "bg-[#0b1220]" : "bg-[#f6f7fb]"}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center">
          <Text
            className={`text-center text-lg font-semibold p-3 ${
              isDark ? "text-white" : "text-neutral-900"
            }`}
          >
            ¿Cuál es tu peso objetivo?
          </Text>

          <Text
            className={`text-center p-2 pb-4 text-sm ${
              isDark ? "text-neutral-300" : "text-neutral-600"
            }`}
          >
            Consigamos ese peso ideal para ti y subamos esa autoestima
          </Text>
        </View>

        {/* Input de peso objetivo (controlado, siempre emite KG base) */}
        <View className="px-2 items-center">
          <WigthInput
            unit={unit}                 // "KG" | "LB"
            valueKg={valueKg}           // ✅ valor controlado en KG base
            onChange={handleChangePeso} // devuelve KG base
            minKg={30}
            maxKg={200}
            label="Indica tu peso objetivo"
          />
        </View>
      </ScrollView>
    </>
  );
}

