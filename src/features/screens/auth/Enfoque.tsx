// app/features/registro/EnfoqueScreen.tsx
import React, { useMemo, useCallback } from "react";
import { View, Text, ScrollView, Image, Pressable } from "react-native";
import { useColorScheme } from "nativewind";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { enfoque as ENFOQUES } from "@/shared/constants/register/enfoque";
import { useRegistroStore } from "@/features/store/useRegistroStore";
import BtnAprobe from "@/shared/components/ui/BtnAprobe";

type RegistroStackParamList = {
  Enfoque: undefined;
  Nivel: undefined;
};

type Enfoque =
  | "ESPALDA"
  | "HOMBROS"
  | "PECHOS"
  | "BRAZOS"
  | "ABS"
  | "GLUTEOS"
  | "PIERNAS"
  | "COMPLETO";

const TODOS_SIN_COMPLETO: Enfoque[] = [
  "ESPALDA",
  "HOMBROS",
  "PECHOS",
  "BRAZOS",
  "ABS",
  "GLUTEOS",
  "PIERNAS",
];

export default function EnfoqueScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const navigation =
    useNavigation<NativeStackNavigationProp<RegistroStackParamList>>();

  const usuario = useRegistroStore((s) => s.usuario);
  const setField = useRegistroStore((s) => s.setField);

  const opciones = useMemo(() => ENFOQUES, []);

  const handleSelect = useCallback(
    (select: Enfoque) => {
      let next = Array.isArray(usuario?.enfoque) ? [...usuario.enfoque] : [];
      const tieneCompleto = next.includes("COMPLETO" as Enfoque);
      const estaSeleccionado = next.includes(select);

      if (select === "COMPLETO") {
        next = tieneCompleto ? [] : ["COMPLETO"];
      } else {
        if (tieneCompleto) {
          next = TODOS_SIN_COMPLETO.filter((e) => e !== select);
        } else {
          next = estaSeleccionado ? next.filter((e) => e !== select) : [...next, select];
          const todosSeleccionados = TODOS_SIN_COMPLETO.every((e) => next.includes(e));
          if (todosSeleccionados) next = ["COMPLETO"];
        }
      }

      setField("enfoque", next);
    },
    [setField, usuario?.enfoque]
  );

  const selectedList: Enfoque[] = Array.isArray(usuario?.enfoque)
    ? (usuario!.enfoque as Enfoque[])
    : [];

  return (
    <>
      {/* Botón fijo abajo a la IZQUIERDA, sólo si hay selección */}
      {selectedList.length > 0 && <BtnAprobe step="Nivel" placement="left" />}

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
            ¿Tienes algún enfoque?
          </Text>

          <Text
            className={`text-center p-1 pb-4 text-sm ${
              isDark ? "text-neutral-300" : "text-neutral-600"
            }`}
          >
            Si quieres mejorar uno o varios músculos en específico, indícalo y nos
            enfocaremos.
          </Text>
        </View>

        <View className="flex-row justify-center items-end h-full gap-5">
          {/* Solo la imagen — SIN puntos/marcadores */}
          <View className="relative">
            {usuario?.sexo === "MASCULINO" ? (
              <Image
                source={require("../../../../assets/register/enfoque/enfoque.png")}
                resizeMode="contain"
                style={{ width: 250, height: 600 }}
              />
            ) : (
              <Image
                source={require("../../../../assets/register/enfoque/enfoque-mujer.png")}
                resizeMode="contain"
                style={{ width: 250, height: 600 }}
              />
            )}
          </View>

          {/* Columna de botones */}
          <View className="flex-col pb-20 pr-5 h-full justify-center gap-2">
            {opciones.map((i: any) => {
              const isActive =
                selectedList.includes(i.id) || selectedList.includes("COMPLETO");
              return (
                <Pressable
                  key={`btn-${i.id}`}
                  onPress={() => handleSelect(i.id as Enfoque)}
                  className={[
                    "font-semibold shadow",
                    "w-[120px] h-[44px] rounded-2xl items-center justify-center mb-3",
                    isActive ? "bg-neon-400" : "bg-neutral-100",
                  ].join(" ")}
                >
                  <Text className={isActive ? "text-white" : "text-black"}>
                    {i.nombre}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </>
  );
}
