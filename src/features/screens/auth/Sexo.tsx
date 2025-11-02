// app/features/registro/SexoScreen.tsx
import React, { useMemo, useCallback } from "react";
import { View, Text, ScrollView } from "react-native";
import { useColorScheme } from "nativewind";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { sexo } from "@/shared/constants/register/sexo";
import CardMultipleSelection from "@/shared/components/ui/CardMultipleSelection";
import { useRegistroStore } from "@/features/store/useRegistroStore"; // ← store de registro

// Ajusta esto a tu stack real
type RegistroStackParamList = {
  Sexo: undefined;
  Enfoque: undefined; // siguiente pantalla
};

export default function Sexo() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const navigation =
    useNavigation<NativeStackNavigationProp<RegistroStackParamList>>();

  // Del store de registro
  const usuario = useRegistroStore((s) => s.usuario);
  const setField = useRegistroStore((s) => s.setField);

  const opciones = useMemo(() => sexo, []);

  const handleSelect = useCallback(
    (select: any) => {
      // Actualiza solo el campo 'sexo' en el store
      setField("sexo", select);

      // Pequeño delay para feedback visual
      setTimeout(() => navigation.navigate("Enfoque"), 300);
    },
    [navigation, setField]
  );

  return (
    <ScrollView
      className={isDark ? "bg-[#0b1220]" : "bg-[#f6f7fb]"}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 32,
      }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="items-center">
        <Text
          className={`text-center text-lg font-semibold p-3 ${
            isDark ? "text-white" : "text-neutral-900"
          }`}
        >
          ¿Cuál es tu sexo?
        </Text>

        <Text
          className={`text-center px-3 pb-4 text-sm ${
            isDark ? "text-neutral-300" : "text-neutral-600"
          }`}
        >
          Tu sexo solo nos ayuda en tus estadísticas, no es un obstáculo
        </Text>
      </View>

      <View className="pt-6 items-center">
        <CardMultipleSelection
          Usuario={opciones}
          onClic={handleSelect}
          select={usuario?.sexo}
          multiple={false}
        />
      </View>
    </ScrollView>
  );
}
