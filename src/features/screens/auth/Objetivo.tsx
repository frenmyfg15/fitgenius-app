// app/features/registro/ObjetivoScreen.tsx
import React, { useMemo, useCallback, useEffect } from "react";
import { View, Text, ScrollView } from "react-native";
import { useColorScheme } from "nativewind";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { objetivos } from "@/shared/constants/register/objetivo";
import CardMultipleSelection from "@/shared/components/ui/CardMultipleSelection";
import { useRegistroStore } from "@/features/store/useRegistroStore"; // ← store de registro

// Ajusta esto a tu stack real
type RegistroStackParamList = {
  Objetivo: undefined;
  Sexo: undefined; // siguiente pantalla
};

export default function ObjetivoScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const navigation = useNavigation<NativeStackNavigationProp<RegistroStackParamList>>();

    const setShowWizard = useRegistroStore((s) => s.setShowWizard);

  useEffect(() => {
    setShowWizard(true);        // ⬅️ mostrar en pantallas de registro
  }, [setShowWizard]);

  // Del store de registro
  const usuario = useRegistroStore((s) => s.usuario);
  const setField = useRegistroStore((s) => s.setField);

  const opciones = useMemo(() => objetivos, []);

  const handleSelect = useCallback(
    (select: any) => {
      // Actualiza solo el campo 'objetivo' en el store (inmutable dentro del store)
      setField("objetivo", select);

      // Pequeño delay opcional para feedback visual
      setTimeout(() => navigation.navigate("Sexo"), 300);
    },
    [navigation, setField]
  );

  return (
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
          ¿Cuál es tu objetivo?
        </Text>

        <Text
          className={`text-center px-3 pb-4 text-sm ${
            isDark ? "text-neutral-300" : "text-neutral-600"
          }`}
        >
          Elige tu meta y nosotros te guiamos paso a paso hacia ella
        </Text>
      </View>

      <View className="pt-6 items-center">
        <CardMultipleSelection
          Usuario={opciones}            // lista de opciones (prop del componente existente)
          onClic={handleSelect}         // callback al seleccionar
          select={usuario?.objetivo}    // valor actual desde el store
          multiple={false}
          // Si tu componente acepta estilos extra, puedes pasar tema:
          // className={isDark ? "bg-[#101a33]" : "bg-white"}
          // textClassName={isDark ? "text-white" : "text-neutral-900"}
        />
      </View>
    </ScrollView>
  );
}
