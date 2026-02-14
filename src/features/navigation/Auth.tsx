// navigation/AuthNavigator.tsx
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar, View } from "react-native";
import { useColorScheme } from "nativewind";
import ThemeToggle from "@/shared/components/ui/ThemeToggle";
import React from "react";

// Screens SOLO del registro (wizard)
import Objetivo from "../screens/auth/Objetivo";
import Sexo from "../screens/auth/Sexo";
import Enfoque from "../screens/auth/Enfoque";
import Nivel from "../screens/auth/Nivel";
import Actividad from "../screens/auth/Actividad";
import Lugar from "../screens/auth/Lugar";
import Equipamiento from "../screens/auth/Equipamiento";
import Altura from "../screens/auth/Altura";
import Peso from "../screens/auth/Peso";
import PesoObjetivo from "../screens/auth/PesoObjetivo";
import Edad from "../screens/auth/Edad";
import Dias from "../screens/auth/Dias";
import Duracion from "../screens/auth/Duracion";
import Limitaciones from "../screens/auth/Limitaciones";
import Registrar from "../screens/auth/Registrar";

import WizardProgressBar from "@/shared/components/ui/WizardProgressBar";
import { useRegistroStore } from "../store/useRegistroStore";

export type AuthStackParamList = {
  Objetivo: undefined;
  Sexo: undefined;
  Enfoque: undefined;
  Nivel: undefined;
  Actividad: undefined;
  Lugar: undefined;
  Equipamiento: undefined;
  Altura: undefined;
  Peso: undefined;
  PesoObjetivo: undefined;
  Edad: undefined;
  Dias: undefined;
  Duracion: undefined;
  Limitaciones: undefined;
  Registrar: undefined;
  FinalRegistro: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const showWizard = useRegistroStore((s) => s.showWizard);

  return (
    <View style={{ flex: 1 }}>

      {/* Toggle de tema flotante */}
      <View className="absolute right-5 top-10 z-10 mt-14">
        <ThemeToggle />
      </View>
      <WizardProgressBar isDark={isDark} height={12} visible={showWizard} />

      {/* Barra de progreso del wizard, solo en registro */}

      <Stack.Navigator
        initialRouteName="Objetivo"
        screenOptions={{
          headerShown: false,
          presentation: "card",
          animation: "slide_from_right",
          gestureEnabled: true,
          contentStyle: {
            backgroundColor: isDark ? "#0b1220" : "#f6f7fb",
            // padding fijo para no tapar contenido con la barra
            paddingTop: 100,
          },
        }}
      >
        <Stack.Screen name="Objetivo" component={Objetivo} />
        <Stack.Screen name="Sexo" component={Sexo} />
        <Stack.Screen name="Enfoque" component={Enfoque} />
        <Stack.Screen name="Nivel" component={Nivel} />
        <Stack.Screen name="Actividad" component={Actividad} />
        <Stack.Screen name="Lugar" component={Lugar} />
        <Stack.Screen name="Equipamiento" component={Equipamiento} />
        <Stack.Screen name="Altura" component={Altura} />
        <Stack.Screen name="Peso" component={Peso} />
        <Stack.Screen name="PesoObjetivo" component={PesoObjetivo} />
        <Stack.Screen name="Edad" component={Edad} />
        <Stack.Screen name="Dias" component={Dias} />
        <Stack.Screen name="Duracion" component={Duracion} />
        <Stack.Screen name="Limitaciones" component={Limitaciones} />
        <Stack.Screen name="Registrar" component={Registrar} />
      </Stack.Navigator>
    </View>
  );
}
