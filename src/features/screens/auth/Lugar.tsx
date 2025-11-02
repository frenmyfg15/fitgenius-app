// app/features/registro/LugarScreen.tsx
import React, { useMemo, useCallback } from "react";
import { View, Text, ScrollView } from "react-native";
import { useColorScheme } from "nativewind";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { lugar } from "@/shared/constants/register/lugar";
import CardMultipleSelection from "@/shared/components/ui/CardMultipleSelection";
import { useRegistroStore } from "@/features/store/useRegistroStore";

// Ajusta a tu stack real
type RegistroStackParamList = {
  Lugar: undefined;
  Equipamiento: undefined;
  Altura: undefined;
};

export default function Lugar() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const navigation =
    useNavigation<NativeStackNavigationProp<RegistroStackParamList>>();

  // Store de registro
  const usuario = useRegistroStore((s) => s.usuario);
  const setField = useRegistroStore((s) => s.setField);

  const opciones = useMemo(() => lugar, []);

  const handleSelect = useCallback(
    (select: string) => {
      setField("lugar", select);

      // Navegación condicional según el lugar seleccionado
      setTimeout(() => {
        if (select === "CASA") {
          navigation.navigate("Equipamiento");
        } else {
          navigation.navigate("Altura");
        }
      }, 300);
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
          ¿Dónde entrenarás?
        </Text>

        <Text
          className={`text-center p-1 pb-4 text-sm ${
            isDark ? "text-neutral-300" : "text-neutral-600"
          }`}
        >
          Desde casa o en el gym, lo que importa es tu compromiso
        </Text>
      </View>

      <View className="pt-6 items-center">
        <CardMultipleSelection
          Usuario={opciones}
          onClic={handleSelect}
          select={usuario?.lugar}
          multiple={false}
        />
      </View>
    </ScrollView>
  );
}
