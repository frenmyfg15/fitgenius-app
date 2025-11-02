// app/features/registro/EquipamientoScreen.tsx
import React, { useMemo, useCallback } from "react";
import { View, Text, ScrollView } from "react-native";
import { useColorScheme } from "nativewind";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import BtnAprobe from "@/shared/components/ui/BtnAprobe";
import CardMultipleSelection from "@/shared/components/ui/CardMultipleSelection";
import { equipamiento } from "@/shared/constants/register/equipamiento";
import { useRegistroStore } from "@/features/store/useRegistroStore";

// Ajusta a tu stack real
type RegistroStackParamList = {
  Equipamiento: undefined;
  Altura: undefined;
};

export default function Equipamiento() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const navigation =
    useNavigation<NativeStackNavigationProp<RegistroStackParamList>>();

  // Store registro
  const usuario = useRegistroStore((s) => s.usuario);
  const setField = useRegistroStore((s) => s.setField);

  const opciones = useMemo(() => equipamiento, []);

  const handleSelect = useCallback(
    (select: string) => {
      const current = Array.isArray(usuario?.equipamiento)
        ? [...usuario!.equipamiento]
        : [];

      let next: string[] = current;

      if (select === "NINGUNO") {
        next = ["NINGUNO"];
      } else {
        // Si ya estaba, lo quitamos
        if (current.includes(select)) {
          next = current.filter((i) => i !== select);
        } else {
          // Añadir, asegurando quitar "NINGUNO" si estaba
          next = [...current.filter((i) => i !== "NINGUNO"), select];
        }
      }

      setField("equipamiento", next);
    },
    [setField, usuario?.equipamiento]
  );

  const tieneAlgoSeleccionado =
    Array.isArray(usuario?.equipamiento) && usuario!.equipamiento.length > 0;

  return (
    <>
      {/* Botón fijo: aparece cuando hay selección */}
      {tieneAlgoSeleccionado && <BtnAprobe step="Altura" placement="left" />}

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
            ¿Con cuáles equipos cuentas?
          </Text>

          <Text
            className={`text-center p-1 pb-4 text-sm ${
              isDark ? "text-neutral-300" : "text-neutral-600"
            }`}
          >
            No necesitas mucho, solo las ganas de superarte cada día
          </Text>
        </View>

        <View className="pt-6 items-center pb-20">
          <CardMultipleSelection
            Usuario={opciones}
            onClic={handleSelect}
            select={usuario?.equipamiento ?? []}
            // multiple por defecto es true en tu componente RN
          />
        </View>
      </ScrollView>
    </>
  );
}
