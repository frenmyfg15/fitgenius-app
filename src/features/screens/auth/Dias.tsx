// app/features/registro/DiasScreen.tsx
import React, { useCallback } from "react";
import { View, Text, ScrollView } from "react-native";
import { useColorScheme } from "nativewind";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useRegistroStore } from "@/features/store/useRegistroStore";
import { dias } from "@/shared/constants/register/dias";
import BtnAprobe from "@/shared/components/ui/BtnAprobe";
import CardMultipleSelection from "@/shared/components/ui/CardMultipleSelection";

// Ajusta a tu stack real
type RegistroStackParamList = {
  Dias: undefined;
  Duracion: undefined; // siguiente paso según tu flujo original
};

export default function Dias() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  useNavigation<NativeStackNavigationProp<RegistroStackParamList>>(); // tipado como en Peso

  // Store
  const usuario = useRegistroStore((s) => s.usuario);
  const setField = useRegistroStore((s) => s.setField);

  // Misma fuente de datos que antes (no normalizamos)
  const info = dias;

  // Misma lógica de selección (toggle en array)
  const handled = useCallback(
    (select: any) => {
      const actuales = Array.isArray(usuario?.dias) ? [...usuario!.dias] : [];
      if (actuales.includes(select as never)) {
        const next = actuales.filter((i) => i !== select);
        setField("dias", next);
      } else {
        actuales.push(select as never);
        setField("dias", actuales);
      }
    },
    [usuario?.dias, setField]
  );

  const hasSelection = (usuario?.dias?.length ?? 0) > 0;

  return (
    <>
      {hasSelection && <BtnAprobe step="Duracion" placement="left" />}

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
            ¿Cuáles días quieres entrenar?
          </Text>
          <Text
            className={`text-center p-1 pb-4 text-sm ${
              isDark ? "text-neutral-300" : "text-neutral-600"
            }`}
          >
            La constancia vence al talento. Elige tus días y conviértelos en tu rutina de poder
          </Text>

          <View className="items-center pt-10 pb-20">
            <CardMultipleSelection
              Usuario={info}
              onClic={handled}
              select={usuario?.dias ?? []}
              image={false}
            />
          </View>
        </View>
      </ScrollView>
    </>
  );
}
