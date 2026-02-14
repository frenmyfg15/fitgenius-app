// src/shared/components/ui/BtnAprobe.tsx
import React, { useCallback } from "react";
import { Pressable, Vibration } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
  placement?: "left" | "right";

  /**
   * ✅ Recomendado: evita depender del contexto de navegación dentro del botón.
   * Pásalo desde la pantalla: onPress={() => navigation.navigate(step)}
   */
  onPress?: () => void;
};

export default function BtnAprobe({ step, placement = "right", onPress }: Props) {
  // OJO: useNavigation puede no existir si el componente se monta fuera del container.
  // Por eso lo usamos en try/catch y NO dependemos de él si nos pasan onPress.
  let navigation: NativeStackNavigationProp<RegistroStackParamList> | null = null;

  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    navigation = useNavigation<NativeStackNavigationProp<RegistroStackParamList>>();
  } catch {
    navigation = null;
  }

  const handleNext = useCallback(() => {
    Vibration.vibrate(40);

    // si te pasan onPress, úsalo siempre (modo seguro)
    if (onPress) {
      setTimeout(onPress, 300);
      return;
    }

    // fallback: navegar si hay contexto
    if (navigation) {
      setTimeout(() => navigation?.navigate(step), 300);
    }
  }, [onPress, navigation, step]);

  return (
    <Pressable
      onPress={handleNext}
      className="absolute z-20 rounded-full active:opacity-80"
      style={{
        bottom: 60,
        ...(placement === "right" ? { right: 40 } : { left: 40 }),

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
        <Feather name="check" size={22} color="#fff" />
      </LinearGradient>
    </Pressable>
  );
}
