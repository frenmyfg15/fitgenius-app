// app/features/registro/ActividadScreen.tsx
import React, { useMemo, useCallback } from "react";
import { View, Text, ScrollView } from "react-native";
import { useColorScheme } from "nativewind";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { actividad } from "@/shared/constants/register/actividad";
import CardMultipleSelection from "@/shared/components/ui/CardMultipleSelection";
import { useRegistroStore } from "@/features/store/useRegistroStore";

// Ajusta a tu stack real
type RegistroStackParamList = {
  Actividad: undefined;
  Lugar: undefined; // siguiente pantalla
};

export default function Actividad() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const navigation =
    useNavigation<NativeStackNavigationProp<RegistroStackParamList>>();

  // Store de registro
  const usuario = useRegistroStore((s) => s.usuario);
  const setField = useRegistroStore((s) => s.setField);

  const opciones = useMemo(() => actividad, []);

  const handleSelect = useCallback(
    (select: any) => {
      setField("actividad", select);
      setTimeout(() => navigation.navigate("Lugar"), 300);
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
          ¿Cuál es tu nivel de actividad?
        </Text>

        <Text
          className={`text-center p-1 pb-4 text-sm ${
            isDark ? "text-neutral-300" : "text-neutral-600"
          }`}
        >
          Conocer tu nivel nos permite adaptar el plan ideal para ti
        </Text>
      </View>

      <View className="pt-6 items-center">
        <CardMultipleSelection
          Usuario={opciones}
          onClic={handleSelect}
          select={usuario?.actividad}
          multiple={false}
        />
      </View>
    </ScrollView>
  );
}
