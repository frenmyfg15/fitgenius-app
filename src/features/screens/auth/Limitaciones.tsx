// app/features/registro/LimitacionesScreen.tsx
import React, { useCallback } from "react";
import { View, Text, ScrollView } from "react-native";
import { useColorScheme } from "nativewind";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useRegistroStore } from "@/features/store/useRegistroStore";
import { limitaciones } from "@/shared/constants/register/limitaciones";
import BtnAprobe from "@/shared/components/ui/BtnAprobe";
import CardMultipleSelection from "@/shared/components/ui/CardMultipleSelection";

// Ajusta a tu stack real si lo necesitas
type RegistroStackParamList = {
  Limitaciones: undefined;
  registrar: undefined;
};

export default function Limitaciones() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  useNavigation<NativeStackNavigationProp<RegistroStackParamList>>(); // tipado consistente

  // Store
  const usuario = useRegistroStore((s) => s.usuario);
  const setField = useRegistroStore((s) => s.setField);

  // Misma fuente de datos (no normalizamos)
  const info = limitaciones;

  // Misma lógica de selección múltiple
  const handled = useCallback(
    (select: any) => {
      const actuales = Array.isArray(usuario?.limitaciones) ? [...usuario!.limitaciones] : [];
      if (actuales.includes(select as never)) {
        const next = actuales.filter((i) => i !== select);
        setField("limitaciones", next);
      } else {
        actuales.push(select as never);
        setField("limitaciones", actuales);
      }
    },
    [usuario?.limitaciones, setField]
  );

  return (
    <>
      {/* Como en web: siempre visible */}
      <BtnAprobe step="Registrar" placement="left" />

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
            ¿Tienes alguna dificultad física?
          </Text>
          <Text
            className={`text-center p-1 pb-4 text-sm ${
              isDark ? "text-neutral-300" : "text-neutral-600"
            }`}
          >
            Cada cuerpo enfrenta desafíos únicos, y reconocerlos es el primer paso para superarlos con inteligencia y determinación
          </Text>

          <View className="items-center pt-6 pb-10">
            <CardMultipleSelection
              Usuario={info}
              onClic={handled}
              select={usuario?.limitaciones ?? []}
              image={false}
            />
          </View>
        </View>
      </ScrollView>
    </>
  );
}
