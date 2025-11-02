// app/features/registro/DuracionScreen.tsx
import React, { useCallback } from "react";
import { View, Text, ScrollView } from "react-native";
import { useColorScheme } from "nativewind";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useRegistroStore } from "@/features/store/useRegistroStore";
import { duracion } from "@/shared/constants/register/duracion";
import BtnAprobe from "@/shared/components/ui/BtnAprobe";
import CardMultipleSelection from "@/shared/components/ui/CardMultipleSelection";

// Ajusta a tu stack real
type RegistroStackParamList = {
  Duracion: undefined;
  Limitaciones: undefined;
};

export default function Duracion() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  useNavigation<NativeStackNavigationProp<RegistroStackParamList>>(); // tipado consistente con otros screens

  // Store
  const usuario = useRegistroStore((s) => s.usuario);
  const setField = useRegistroStore((s) => s.setField);

  // Misma fuente de datos (no normalizamos)
  const info = duracion;

  // Misma lógica: selección única
  const handled = useCallback(
    (select: any) => {
      setField("duracion", select);
    },
    [setField]
  );

  const hasSelection = (usuario?.duracion?.length ?? 0) > 0;

  return (
    <>
      {hasSelection && <BtnAprobe step="Limitaciones" placement="left" />}

      <ScrollView
        className={isDark ? "bg-[#0b1220]" : "bg-[#f6f7fb]"}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        <View>
          <Text
            className={`text-center text-lg font-semibold p-3 ${
              isDark ? "text-white" : "text-neutral-900"
            }`}
          >
            ¿Cuánto tiempo quieres entrenar al día?
          </Text>
          <Text
            className={`text-center p-1 pb-4 text-sm ${
              isDark ? "text-neutral-300" : "text-neutral-600"
            }`}
          >
            No necesitas mucho, solo ser constante y progresivo
          </Text>

          <View className="items-center pt-6 pb-10">
            <CardMultipleSelection
              Usuario={info}
              onClic={handled}
              select={usuario?.duracion ?? ""}
              image={false}
              multiple={false}
            />
          </View>
        </View>
      </ScrollView>
    </>
  );
}
