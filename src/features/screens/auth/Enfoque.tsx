// app/features/registro/EnfoqueScreen.tsx
import React, { useMemo, useCallback } from "react";
import { View, Text, ScrollView } from "react-native";
import { useColorScheme } from "nativewind";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { enfoque as ENFOQUES } from "@/shared/constants/register/enfoque";
import { useRegistroStore } from "@/features/store/useRegistroStore";
import BtnAprobe from "@/shared/components/ui/BtnAprobe";
import CardMultipleSelection from "@/shared/components/ui/CardMultipleSelection";

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

/**
 * Images generated previously (PNG with transparent background)
 */
const MUSCLE_IMAGES: Record<Exclude<Enfoque, "COMPLETO">, any> = {
  ESPALDA: require("../../../../assets/register/enfoque/espalda.webp"),
  HOMBROS: require("../../../../assets/register/enfoque/hombro.webp"),
  PECHOS: require("../../../../assets/register/enfoque/pecho.webp"),
  BRAZOS: require("../../../../assets/register/enfoque/brazos.webp"),
  ABS: require("../../../../assets/register/enfoque/abs.webp"),
  GLUTEOS: require("../../../../assets/register/enfoque/gluteos.webp"),
  PIERNAS: require("../../../../assets/register/enfoque/piernas.webp"),
};

// ✅ add an image for COMPLETO (use your preferred asset)
const COMPLETO_IMAGE = require("../../../../assets/register/enfoque/completo.webp");

type CardItem = {
  id: Enfoque;
  nombre: string;
  imagen: any;
};

export default function EnfoqueScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const navigation =
    useNavigation<NativeStackNavigationProp<RegistroStackParamList>>();

  const usuario = useRegistroStore((s) => s.usuario);
  const setField = useRegistroStore((s) => s.setField);

  const handleSelect = useCallback(
    (select: Enfoque) => {
      let next = Array.isArray(usuario?.enfoque) ? [...usuario.enfoque] : [];
      const tieneCompleto = next.includes("COMPLETO");
      const estaSeleccionado = next.includes(select);

      if (select === "COMPLETO") {
        next = tieneCompleto ? [] : ["COMPLETO"];
      } else {
        if (tieneCompleto) {
          next = TODOS_SIN_COMPLETO.filter((e) => e !== select);
        } else {
          next = estaSeleccionado
            ? next.filter((e) => e !== select)
            : [...next, select];

          const todosSeleccionados = TODOS_SIN_COMPLETO.every((e) =>
            next.includes(e)
          );
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

  /**
   * ✅ Build cards INCLUDING COMPLETO as an option
   * Keep order from ENFOQUES (so COMPLETO appears where your constants define it)
   */
  const cards: CardItem[] = useMemo(() => {
    return ENFOQUES.map((o: any) => {
      if (o.id === "COMPLETO") {
        return {
          id: "COMPLETO" as Enfoque,
          nombre: o.nombre,
          imagen: COMPLETO_IMAGE,
        };
      }

      const id = o.id as Exclude<Enfoque, "COMPLETO">;
      return {
        id: id as Enfoque,
        nombre: o.nombre,
        imagen: MUSCLE_IMAGES[id],
      };
    });
  }, []);

  return (
    <>
      {selectedList.length > 0 && <BtnAprobe step="Nivel" placement="left" />}

      <ScrollView
        className={isDark ? "bg-[#0b1220]" : "bg-[#f6f7fb]"}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 24,
          paddingBottom: 32,
        }}
      >
        <View className="items-center mb-4">
          <Text
            className={`text-center text-lg font-semibold p-2 ${isDark ? "text-white" : "text-neutral-900"
              }`}
          >
            ¿Tienes algún enfoque?
          </Text>

          <Text
            className={`text-center text-sm ${isDark ? "text-neutral-300" : "text-neutral-600"
              }`}
          >
            Selecciona uno o varios músculos que quieras priorizar.
          </Text>
        </View>

        <CardMultipleSelection
          Usuario={cards}
          multiple
          image
          select={selectedList}
          onClic={(id) => handleSelect(id as Enfoque)}
        />
      </ScrollView>
    </>
  );
}
