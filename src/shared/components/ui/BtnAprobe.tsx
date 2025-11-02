// src/shared/components/ui/BtnAprobe.tsx
import React from "react";
import { Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RegistroStackParamList = {
  Objetivo: undefined;
  Sexo: undefined;
  Enfoque: undefined;
  Nivel: undefined;
  Actividad: undefined;
  Lugar: undefined;
  Equipamiento: undefined;
  Peso: undefined;
  PesoObjetivo: undefined;
  Edad: undefined;
  Dias: undefined;
  Duracion: undefined;
  Limitaciones: undefined;
  Registrar: undefined;
};

type Props = {
  step: keyof RegistroStackParamList;
  placement?: "left" | "right"; // ← nuevo: permite elegir esquina
};

export default function BtnAprobe({ step, placement = "right" }: Props) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RegistroStackParamList>>();

  const handleNext = () => {
    setTimeout(() => navigation.navigate(step), 500);
  };

  return (
    <Pressable
      onPress={handleNext}
      className="absolute z-20 rounded-full"
      style={{
        bottom: 60, // fixed abajo
        [placement]: 40 as number, // izquierda o derecha
        backgroundColor: "#39FF14",
        padding: 20,
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 5,
      }}
    >
      <View style={{ alignItems: "center", justifyContent: "center" }}>
        <Feather name="check" size={28} color="#fff" />
      </View>
    </Pressable>
  );
}
