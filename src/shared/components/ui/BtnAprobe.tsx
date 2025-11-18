// src/shared/components/ui/BtnAprobe.tsx
import React from "react";
import { Pressable, Vibration } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";

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
  placement?: "left" | "right"; // permite elegir esquina
};

export default function BtnAprobe({ step, placement = "right" }: Props) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RegistroStackParamList>>();

  const handleNext = () => {
    // vibración corta al pulsar
    Vibration.vibrate(40);
    setTimeout(() => navigation.navigate(step), 300);
  };

  return (
    <Pressable
      onPress={handleNext}
      className="absolute z-20 rounded-full active:opacity-80"
      style={{
        bottom: 60, // misma posición
        ...(placement === "right" ? { right: 40 } : { left: 40 }),

        // sombra más suave y elegante
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
      }}
    >
      <LinearGradient
        colors={["#4ade80", "rgb(178, 0, 255)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          borderRadius: 999,
          padding: 14,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* icono un poco más pequeño */}
        <Feather name="check" size={22} color="#fff" />
      </LinearGradient>
    </Pressable>
  );
}
