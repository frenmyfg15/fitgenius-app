// app/features/registro/PesoScreen.tsx
import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useColorScheme } from "nativewind";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import BtnAprobe from "@/shared/components/ui/BtnAprobe";
import { useRegistroStore } from "@/features/store/useRegistroStore";
import WigthInput from "@/shared/components/ui/WigthInput"; // ✅ usa tu input

// Ajusta a tu stack real
type RegistroStackParamList = {
  Peso: undefined;
  PesoObjetivo: undefined;
};

type UnidadPeso = "KG" | "LB";

export default function Peso() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const navigation =
    useNavigation<NativeStackNavigationProp<RegistroStackParamList>>();

  // Store registro
  const usuario = useRegistroStore((s) => s.usuario);
  const setField = useRegistroStore((s) => s.setField);

  // Unidad local (persistida en store)
  const [medida, setMedida] = useState<UnidadPeso>(
    (usuario?.medidaPeso as UnidadPeso) || "KG"
  );

  // Cambiar unidad y reflejarla en store
  const onPressUnidad = useCallback(
    (u: UnidadPeso) => {
      setMedida(u);
      setField("medidaPeso", u);
    },
    [setField]
  );

  // El input emite siempre KG base
  const handleChangePeso = useCallback(
    (kgBase: number) => {
      setField("peso", kgBase);
      setField("medidaPeso", medida);
    },
    [setField, medida]
  );

  const pesoValido = (usuario?.peso ?? 0) > 30; // en KG base

  const valueKg = typeof usuario?.peso === "number" ? usuario.peso : 50;

  return (
    <>
      {/* Botón fijo abajo-izquierda cuando hay un valor válido */}
      {pesoValido && <BtnAprobe step="PesoObjetivo" placement="left" />}

      <ScrollView
        className={isDark ? "bg-[#0b1220]" : "bg-[#f6f7fb]"}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center">
          <Text
            className={`text-center text-lg font-semibold p-3 ${isDark ? "text-white" : "text-neutral-900"
              }`}
          >
            ¿Cuánto pesas?
          </Text>

          <Text
            className={`text-center p-2 pb-4 text-sm ${isDark ? "text-neutral-300" : "text-neutral-600"
              }`}
          >
            Tu peso es solo un número, no tu límite. Lo que importa es lo que haces con él
          </Text>
        </View>

        {/* Selector de unidad */}
        <View className="flex-row justify-center pb-3">
          <Pressable
            onPress={() => onPressUnidad("KG")}
            className={`px-5 py-1 rounded-tl-2xl rounded-bl-2xl ${medida === "KG" ? "bg-neon-400 shadow" : "bg-neutral-100"
              }`}
          >
            <Text className={medida === "KG" ? "text-white font-semibold" : "text-black font-semibold"}>
              KG
            </Text>
          </Pressable>

          <Pressable
            onPress={() => onPressUnidad("LB")}
            className={`px-5 py-1 rounded-tr-2xl rounded-br-2xl ${medida === "LB" ? "bg-neon-400 shadow" : "bg-neutral-100"
              }`}
          >
            <Text className={medida === "LB" ? "text-white font-semibold" : "text-black font-semibold"}>
              LB
            </Text>
          </Pressable>
        </View>

        {/* Input de peso (2 campos, siempre emite KG base) */}
        <View className="px-2 items-center">
          <WigthInput
            unit={medida}               // "KG" | "LB"
            valueKg={valueKg}           // ✅ valor controlado
            onChange={handleChangePeso} // devuelve KG base
            minKg={30}
            maxKg={200}
            label="Indica tu peso"
          />
        </View>
      </ScrollView>
    </>
  );
}
